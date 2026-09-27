import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = status.toUpperCase().replace(/_/g, ' ');

  let styleClasses = 'bg-gray-100 text-gray-700 border-gray-200';

  if (['HEALTHY', 'ACTIVE', 'APPROVED', 'COMPLETED', 'PASSED', 'ISSUED'].includes(norm)) {
    styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
  } else if (['LOW STOCK', 'PENDING', 'PENDING APPROVAL', 'DRAFT', 'IN PROGRESS', 'PARTIALLY RECEIVED'].includes(norm)) {
    styleClasses = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
  } else if (['CRITICAL', 'OUT OF STOCK', 'REJECTED', 'CANCELLED', 'SPOILAGE'].includes(norm)) {
    styleClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border font-bold ${styleClasses} ${className}`}
    >
      {norm}
    </span>
  );
};
