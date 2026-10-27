import React from 'react';

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="h-7 bg-slate-200 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 rounded w-4/5"></div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
      <div className="divide-y divide-slate-100 p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/5"></div>
            <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MapSkeleton = () => {
  return (
    <div className="w-full h-96 bg-slate-200 rounded-2xl animate-pulse flex items-center justify-center text-slate-400">
      <span className="text-sm font-medium">Loading interactive station map...</span>
    </div>
  );
};
