import React from 'react';

export const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm text-slate-500 font-medium">{label}</p>
    </div>
  );
};
