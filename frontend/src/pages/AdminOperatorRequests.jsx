import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  MapPin,
  Calendar,
  X,
  Send,
  Eye
} from 'lucide-react';

const AdminOperatorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOp, setSelectedOp] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/operators/pending');
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id, name) => {
    setActionLoading(true);
    setAlertMsg('');
    try {
      await api.post(`/admin/operators/${id}/approve`);
      setAlertMsg(`Operator ${name} approved successfully!`);
      setRequests(requests.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (op) => {
    setSelectedOp(op);
    setRejectionReason('Registration documents or company verification criteria not met.');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOp) return;

    setActionLoading(true);
    try {
      await api.post(`/admin/operators/${selectedOp.id}/reject`, {
        action: 'reject',
        rejection_reason: rejectionReason
      });
      setAlertMsg(`Operator ${selectedOp.full_name} rejected.`);
      setRequests(requests.filter((r) => r.id !== selectedOp.id));
      setRejectModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operator Registration Requests</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review, approve, or reject station charging operator credentials before granting platform access.
        </p>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Pending Operator Requests</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All operator registration applications have been reviewed. New submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Operator Name</th>
                  <th className="px-6 py-3.5">Organization / CPO</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Registration Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{req.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{req.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        {req.organization_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {req.city}, {req.state}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {new Date(req.registration_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        PENDING
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedOp(req);
                          setDetailsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="View Submission Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleApprove(req.id, req.full_name)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => openRejectModal(req)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && selectedOp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Operator Application Details</h3>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Representative</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedOp.full_name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Organization</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedOp.organization_name}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Business Email</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block truncate">{selectedOp.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedOp.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Physical Address & Location</span>
                <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                  {selectedOp.address || 'N/A'}, {selectedOp.city}, {selectedOp.state}
                </span>
              </div>
              {selectedOp.company_details && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Fleet Overview</span>
                  <span className="font-normal text-slate-700 text-xs mt-0.5 block">{selectedOp.company_details}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleApprove(selectedOp.id, selectedOp.full_name);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
              >
                Approve Operator
              </button>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  openRejectModal(selectedOp);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedOp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Reject Operator Application</h3>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Provide a formal reason for rejecting <strong>{selectedOp.full_name}</strong> ({selectedOp.organization_name}). This reason will be stored and notified to the applicant.
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rejection Reason</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this operator registration is being rejected..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOperatorRequests;
