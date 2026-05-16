import React from 'react';

const QueueBadge = ({ type }) => {
  const isPriority = type?.toLowerCase() === 'priority';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-badge)] text-xs font-medium uppercase whitespace-nowrap ${
      isPriority ? 'bg-accent text-white' : 'bg-primary text-white'
    }`}>
      {type}
    </span>
  );
};

export default QueueBadge;
