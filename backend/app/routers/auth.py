from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, OperatorProfile, Notification, UserActivity
from ..schemas import UserRegister, OperatorRegister, UserLogin, Token, UserOut
from ..auth import verify_password, get_password_hash, create_access_token
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_normal_user(req: UserRegister, db: Session = Depends(get_db)):
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    new_user = User(
        full_name=req.full_name,
        email=req.email.lower(),
        phone=req.phone,
        hashed_password=get_password_hash(req.password),
        city=req.city,
        role="user",
        approval_status="approved",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Activity log
    log = UserActivity(
        user_id=new_user.id,
        action="USER_REGISTERED",
        details="User registered self account."
    )
    db.add(log)

    # Welcome notification
    notif = Notification(
        user_id=new_user.id,
        title="Welcome to SmartCharge AI",
        message="Your account is active. Explore EV charging stations and live demand forecasts.",
        type="info"
    )
    db.add(notif)
    db.commit()

    return new_user

@router.post("/operator-register", status_code=status.HTTP_201_CREATED)
def register_operator(req: OperatorRegister, db: Session = Depends(get_db)):
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    new_operator = User(
        full_name=req.full_name,
        email=req.email.lower(),
        phone=req.phone,
        hashed_password=get_password_hash(req.password),
        city=req.city,
        role="operator",
        approval_status="pending",
        is_active=False  # MUST NOT be active until approved
    )
    db.add(new_operator)
    db.commit()
    db.refresh(new_operator)

    profile = OperatorProfile(
        user_id=new_operator.id,
        organization_name=req.organization_name,
        company_details=req.company_details,
        city=req.city or req.state,
        address=req.address,
        state=req.state,
        business_reg_info=req.business_reg_info
    )
    db.add(profile)

    # Activity log
    log = UserActivity(
        user_id=new_operator.id,
        action="OPERATOR_REGISTRATION_SUBMITTED",
        details=f"Operator requested registration for organization '{req.organization_name}'."
    )
    db.add(log)
    db.commit()

    return {
        "message": "Registration submitted successfully. Your account is waiting for administrator approval.",
        "status": "pending",
        "email": new_operator.email
    }

@router.post("/login", response_model=Token)
def login(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Check operator approval status strictly
    if user.role == "operator":
        if user.approval_status == "pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your operator account is awaiting admin approval."
            )
        elif user.approval_status == "rejected":
            reason = ""
            if user.operator_profile and user.operator_profile.rejection_reason:
                reason = f" Reason: {user.operator_profile.rejection_reason}"
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Your operator registration has been rejected. Please contact the administrator.{reason}"
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact administrator."
        )

    # Log login activity
    log = UserActivity(
        user_id=user.id,
        action="LOGIN",
        details="User logged in successfully."
    )
    db.add(log)
    db.commit()

    token_data = {
        "sub": user.email,
        "role": user.role,
        "user_id": user.id,
        "name": user.full_name
    }
    access_token = create_access_token(data=token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "approval_status": user.approval_status
    }

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = UserActivity(
        user_id=current_user.id,
        action="LOGOUT",
        details="User logged out."
    )
    db.add(log)
    db.commit()
    return {"message": "Logged out successfully."}
