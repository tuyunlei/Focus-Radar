import React, { useState } from 'react';
import { Task, TaskCategory, LLMUpdateSuggestion, TaskUpdateAction } from '../types';
import { analyzeDailyReview } from '../services/geminiService';
import { generateId, getTodayDateString } from '../services/storage';
import { Sparkles, ArrowRight, Save, RotateCcw } from 'lucide-react';
import { translations, Language } from '../services/i18n';

interface ReviewViewProps {
  tasks: Task[];
  onApplyUpdates: (updates: { taskId?: string; task?: Task }[]) => void;
  lang: Language;
}

export const ReviewView: React.FC<ReviewViewProps> = ({ tasks, onApplyUpdates, lang }) => {
  const [reflection, setReflection] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<LLMUpdateSuggestion | null>(null);
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang].review;
  const tCommon = translations[lang].common;

  const todayStr = getTodayDateString();
  const todaysTasks = tasks.filter(t => t.date === todayStr || t.status === 'in_progress');

  const handleAnalyze = async () => {
    if (!reflection.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeDailyReview(todaysTasks, reflection, lang);
      setSuggestion(result);
      // Default select all
      if (result) {
        setAcceptedIndices(new Set(result.actions.map((_, i) => i)));
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleAccept = (index: number) => {
    const next = new Set(acceptedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setAcceptedIndices(next);
  };

  const handleApply = () => {
    if (!suggestion) return;

    const updatesToApply: { taskId?: string; task?: Task }[] = [];

    suggestion.actions.forEach((action, index) => {
      if (!acceptedIndices.has(index)) return;

      if (action.type === 'update_existing' && action.taskId) {
        const existingTask = tasks.find(t => t.id === action.taskId);
        if (existingTask) {
          const updatedTask = { ...existingTask };
          if (action.statusChange) updatedTask.status = action.statusChange;
          if (action.addActualHours) updatedTask.actualHours += action.addActualHours;
          updatedTask.updatedAt = new Date().toISOString();
          updatesToApply.push({ taskId: existingTask.id, task: updatedTask });
        }
      } else if (action.type === 'create_new') {
        const newTask: Task = {
          id: generateId(),
          title: action.title || 'Untitled Task',
          date: todayStr,
          category: action.category || TaskCategory.Misc,
          status: action.statusChange || 'done',
          estimateHours: action.estimateHours || 1,
          actualHours: action.initialActualHours || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updatesToApply.push({ task: newTask });
      }
    });

    onApplyUpdates(updatesToApply);
    setSuggestion(null);
    setReflection('');
    alert(t.dayUpdated);
  };

  if (suggestion) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-semibold">
            <Sparkles className="w-5 h-5" />
            <span>{t.aiSuggestionTitle}</span>
          </div>
          <p className="text-sm text-indigo-900 dark:text-indigo-100 mb-2 italic">"{suggestion.summary}"</p>
        </div>

        <div className="space-y-3">
          {suggestion.actions.map((action, idx) => {
            const isSelected = acceptedIndices.has(idx);
            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-white dark:bg-gray-800 border-indigo-500 shadow-sm ring-1 ring-indigo-500' 
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
                }`}
                onClick={() => toggleAccept(idx)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}>
                    {isSelected && <ArrowRight className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    {action.type === 'update_existing' ? (
                      <div>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">{t.updateLabel}</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                            Task: {tasks.find(t => t.id === action.taskId)?.title || "Unknown Task"}
                        </p>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex gap-2">
                           {action.addActualHours ? <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-1.5 rounded">+ {action.addActualHours}h {t.actualLabel}</span> : null}
                           {action.statusChange ? <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 rounded">{t.statusLabel}: {action.statusChange}</span> : null}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">{t.newTaskLabel}</span>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{action.title}</p>
                         <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex gap-2">
                           {action.initialActualHours ? <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 px-1.5 rounded">{action.initialActualHours}h {t.actualLabel}</span> : null}
                           <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 rounded">{t.statusLabel}: {action.statusChange || 'done'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t dark:border-gray-700 sticky bottom-20 md:bottom-0 bg-gray-50 dark:bg-gray-900 z-10">
            <button 
                onClick={() => setSuggestion(null)}
                className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <RotateCcw className="w-5 h-5" />
            </button>
            <button 
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:scale-[1.02] transition"
            >
                <Save className="w-5 h-5" />
                {t.applyUpdates}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.title}</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.promptLabel}
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          {t.promptPlaceholder}
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="w-full h-40 p-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 leading-relaxed resize-none"
          placeholder="..."
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !reflection.trim()}
        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
          isAnalyzing || !reflection.trim() 
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed' 
            : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-indigo-200 dark:shadow-indigo-900/40 hover:scale-[1.02]'
        }`}
      >
        {isAnalyzing ? (
            <>{t.thinking}</>
        ) : (
            <>
                <Sparkles className="w-5 h-5" />
                {t.analyzeButton}
            </>
        )}
      </button>
      
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">{t.contextTitle}</h3>
        <div className="space-y-2 opacity-70">
            {todaysTasks.length === 0 ? <p className="text-sm italic text-gray-400 dark:text-gray-500">{t.noTasksContext}</p> : 
            todaysTasks.map(t => (
                <div key={t.id} className="text-sm flex justify-between bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-800 dark:text-gray-200">{t.title}</span>
                    <span className="text-gray-400">{t.actualHours}/{t.estimateHours}h</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};