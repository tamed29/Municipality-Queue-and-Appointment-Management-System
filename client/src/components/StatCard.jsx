import React from 'react';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
  };

  return (
    <div className="bg-card rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] flex items-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[color]} mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-secondary">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
