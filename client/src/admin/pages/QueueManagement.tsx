import React, { useState } from 'react';
import QueueBoard from '../components/QueueBoard';
import { FiUsers, FiTag, FiFolder } from 'react-icons/fi';

const QueueManagement: React.FC = () => {
  const departments = [
    { value: 'Civil Reg', label: 'Civil Reg', desc: 'IDs & Birth Certs', icon: '🪪' },
    { value: 'Residence', label: 'Residence', desc: 'Living Certificates', icon: '🏘️' },
    { value: 'Business', label: 'Business', desc: 'Trade & Licenses', icon: '🏪' },
    { value: 'Land', label: 'Land', desc: 'Deeds & Surveys', icon: '🏗️' },
    { value: 'Tax', label: 'Tax', desc: 'Municipal Finances', icon: '💰' },
    { value: 'Construction', label: 'Construction', desc: 'Zoning & Permits', icon: '👷' },
    { value: 'Public', label: 'Public', desc: 'General Utilities', icon: '📞' }
  ];

  const [activeDept, setActiveDept] = useState('Civil Reg');

  return (
    <div className="space-y-6 md:space-y-8 font-sans">
      
      {/* Department Tabs Bar Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 shrink-0">
        
        <div className="border-b border-slate-100 pb-3">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Department Counter Selectors</span>
          <h3 className="text-slate-900 font-extrabold text-base mt-0.5">Counter Command Center</h3>
        </div>

        {/* Tab Buttons row */}
        <div className="flex items-center overflow-x-auto pb-2 gap-3.5 scrollbar-hide snap-x select-none">
          {departments.map(dept => {
            const isActive = activeDept === dept.value;
            return (
              <button
                key={dept.value}
                onClick={() => setActiveDept(dept.value)}
                className={`snap-start px-5 py-3.5 rounded-2xl border text-left shrink-0 transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-3.5 ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500 min-w-[170px]'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-600 min-w-[170px]'
                }`}
              >
                <span className="text-2xl shrink-0">{dept.icon}</span>
                <div className="flex flex-col min-w-0">
                  <strong className={`text-xs font-extrabold truncate uppercase tracking-wider leading-none ${isActive ? 'text-amber-500' : 'text-slate-900'}`}>
                    {dept.label}
                  </strong>
                  <span className="text-[10px] text-slate-400 truncate mt-1 leading-none font-semibold">
                    {dept.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Live Queue Board Grid matching active department */}
      <QueueBoard deptName={activeDept} />

    </div>
  );
};

export default QueueManagement;
