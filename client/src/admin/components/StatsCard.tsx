import React from 'react';
import { IconType } from 'react-icons';

interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: IconType;
  colorClass: 'amber' | 'blue' | 'emerald' | 'rose' | 'indigo';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  colorClass 
}) => {
  const themeMap = {
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      iconBg: 'bg-amber-500/15 text-amber-500',
      glow: 'shadow-amber-500/5'
    },
    blue: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      iconBg: 'bg-blue-500/15 text-blue-500',
      glow: 'shadow-blue-500/5'
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      iconBg: 'bg-emerald-500/15 text-emerald-500',
      glow: 'shadow-emerald-500/5'
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
      iconBg: 'bg-rose-500/15 text-rose-500',
      glow: 'shadow-rose-500/5'
    },
    indigo: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
      iconBg: 'bg-indigo-500/15 text-indigo-500',
      glow: 'shadow-indigo-500/5'
    }
  };

  const theme = themeMap[colorClass];

  return (
    <div className={`bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm ${theme.glow} flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 group`}>
      
      {/* Text Metrics */}
      <div className="flex flex-col gap-2">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          {title}
        </span>
        <strong className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none tabular-nums">
          {value}
        </strong>
        <span className="text-slate-500 text-[11px] font-semibold">
          {description}
        </span>
      </div>

      {/* Visual Accent Icon */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-inner ${theme.iconBg}`}>
        <Icon className="text-xl" />
      </div>

    </div>
  );
};

export default StatsCard;
