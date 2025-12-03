import React, { useState } from 'react';
import { Task, TaskCategory, TaskStatus } from '../types';
import { generateId, getTodayDateString } from '../services/storage';
import { Plus, Trash2, Clock, CheckCircle2, Circle, XCircle, PlayCircle } from 'lucide-react';
import { translations, Language } from '../services/i18n';

interface PlanViewProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  lang: Language;
}

export const PlanView: React.FC<PlanViewProps> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, lang }) => {
  const [isAdding, setIsAdding] = useState(false);
  const t = translations[lang].plan;
  const tCommon = translations[lang].common;
  
  // New Task State
  const [newTitle, setNewTitle] = useState('');
  const [newEstimate, setNewEstimate] = useState<number>(1);
  const [newCategory, setNewCategory] = useState<TaskCategory>(TaskCategory.Project);

  const todayStr = getTodayDateString();
  const todaysTasks = tasks.filter(t => t.date === todayStr);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task: Task = {
      id: generateId(),
      title: newTitle,
      date: todayStr,
      category: newCategory,
      estimateHours: newEstimate,
      actualHours: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddTask(task);
    setNewTitle('');
    setNewEstimate(1);
    setIsAdding(false);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch(status) {
      case 'done': return <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case 'in_progress': return <PlayCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'dropped': return <XCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
      default: return <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />;
    }
  };

  const cycleStatus = (task: Task) => {
    const map: Record<TaskStatus, TaskStatus> = {
      'todo': 'in_progress',
      'in_progress': 'done',
      'done': 'dropped',
      'dropped': 'todo'
    };
    onUpdateTask({ ...task, status: map[task.status], updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.title}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}</span>
      </div>

      {todaysTasks.length === 0 && !isAdding && (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">{t.noTasks}</p>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            {t.startPlanning}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {todaysTasks.map(task => (
          <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-3 group transition-colors">
            <button onClick={() => cycleStatus(task)} className="mt-1 flex-shrink-0 hover:scale-110 transition">
              {getStatusIcon(task.status)}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate transition-colors ${task.status === 'done' || task.status === 'dropped' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className={`px-2 py-0.5 rounded-full ${
                  task.category === 'project' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-300' : 
                  task.category === 'communication' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/40 dark:text-orange-300' :
                  task.category === 'learning' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-300' : 
                  'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {t.categories[task.category]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.estimateHours}h
                </span>
                {task.actualHours > 0 && (
                   <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                   {task.actualHours}h
                 </span>
                )}
              </div>
            </div>

            <button 
              onClick={() => onDeleteTask(task.id)}
              className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t.taskTitle}</label>
            <input 
              type="text" 
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder={t.newTaskPlaceholder}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t.estimate}</label>
              <select 
                value={newEstimate}
                onChange={e => setNewEstimate(Number(e.target.value))}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={0.5}>0.5 h</option>
                <option value={1}>1.0 h</option>
                <option value={2}>2.0 h</option>
                <option value={3}>3.0 h</option>
                <option value={4}>4.0 h</option>
                <option value={6}>6.0 h</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t.category}</label>
              <select 
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={TaskCategory.Project}>{t.categories.project}</option>
                <option value={TaskCategory.Communication}>{t.categories.communication}</option>
                <option value={TaskCategory.Learning}>{t.categories.learning}</option>
                <option value={TaskCategory.Misc}>{t.categories.misc}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              {t.addTask}
            </button>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {tCommon.cancel}
            </button>
          </div>
        </form>
      )}

      {!isAdding && todaysTasks.length > 0 && (
         <button 
         onClick={() => setIsAdding(true)}
         className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
       >
         <Plus className="w-5 h-5" />
         <span>{t.addAnother}</span>
       </button>
      )}
    </div>
  );
};