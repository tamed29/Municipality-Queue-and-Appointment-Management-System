import React from 'react';

const StatusBadge = ({ status }) => {
  const map = {
    pending: { bg: 'bg-warning/10', text: 'text-warning' },
    approved: { bg: 'bg-primary/10', text: 'text-primary' },
    completed: { bg: 'bg-success/10', text: 'text-success' },
    done: { bg: 'bg-success/10', text: 'text-success' },
    cancelled: { bg: 'bg-danger/10', text: 'text-danger' },
    skipped: { bg: 'bg-danger/10', text: 'text-danger' },
    waiting: { bg: 'bg-warning/10', text: 'text-warning' },
    serving: { bg: 'bg-accent/10', text: 'text-accent' }
  };

  const style = map[status?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-badge)] text-xs font-medium capitalize whitespace-nowrap ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
