import React, { useMemo } from 'react';
import { Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Trophy } from 'lucide-react';
import { translations, Language } from '../services/i18n';

interface StatsViewProps {
  tasks: Task[];
  lang: Language;
}

export const StatsView: React.FC<StatsViewProps> = ({ tasks, lang }) => {
  const t = translations[lang].stats;

  // Simple stats logic: Last 7 days
  const statsData = useMemo(() => {
    const today = new Date();
    const data = [];
    let totalEst = 0;
    let totalAct = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date === dateStr && t.status !== 'dropped');

      const est = dayTasks.reduce((acc, t) => acc + t.estimateHours, 0);
      const act = dayTasks.reduce((acc, t) => acc + t.actualHours, 0);

      totalEst += est;
      totalAct += act;

      data.push({
        name: d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' }),
        date: dateStr,
        Estimated: est,
        Actual: act,
      });
    }

    return { data, totalEst, totalAct };
  }, [tasks, lang]);

  const errorFactor = statsData.totalEst > 0 
    ? (statsData.totalAct / statsData.totalEst).toFixed(2) 
    : '0.00';

  const isOverestimating = Number(errorFactor) < 1 && statsData.totalEst > 0;

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Metric Card */}
        <div className={`p-6 rounded-2xl text-white shadow-xl flex flex-col justify-between ${
          Number(errorFactor) > 1.2 ? 'bg-gradient-to-br from-rose-500 to-orange-600 dark:from-rose-600 dark:to-orange-700' :
          Number(errorFactor) < 0.8 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700' :
          'bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700'
        }`}>
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">{t.errorFactor}</p>
                <h3 className="text-4xl font-bold tracking-tight">{errorFactor}x</h3>
              </div>
              {Number(errorFactor) > 1.2 ? <AlertTriangle className="w-8 h-8 text-white/90" /> : <Trophy className="w-8 h-8 text-white/90" />}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20 flex gap-8">
                <div>
                    <p className="text-xs text-white/70">{t.planned}</p>
                    <p className="font-semibold text-lg">{statsData.totalEst}h</p>
                </div>
                <div>
                    <p className="text-xs text-white/70">{t.actual}</p>
                    <p className="font-semibold text-lg">{statsData.totalAct}h</p>
                </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs bg-white/20 p-2 rounded text-center">
              {Number(errorFactor) > 1.2 ? t.underestimate : 
              Number(errorFactor) < 0.8 ? t.cautious : t.realistic}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm h-64 lg:h-auto min-h-[16rem]">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{t.last7Days}</h4>
          <ResponsiveContainer width="100%" height="90%">
              <BarChart data={statsData.data}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#9CA3AF'}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.05)'}}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#1f2937'
                  }}
                />
                <Bar dataKey="Estimated" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {statsData.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Actual > entry.Estimated ? '#f43f5e' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">{t.legend}</h4>
        <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded-sm"></div>
                <span>{t.legendEst}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                <span>{t.legendUnder}</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
                <span>{t.legendOver}</span>
            </div>
        </div>
      </div>
    </div>
  );
};