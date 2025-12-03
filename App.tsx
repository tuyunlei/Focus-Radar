import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PlanView } from './components/PlanView';
import { ReviewView } from './components/ReviewView';
import { StatsView } from './components/StatsView';
import { Task } from './types';
import { loadTasks, saveTasks } from './services/storage';
import { translations, Language } from './services/i18n';

export type ThemeMode = 'light' | 'dark' | 'system';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<'plan' | 'review' | 'stats'>('plan');
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings State
  const [language, setLanguage] = useState<Language>(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('focusRadar_lang');
    if (saved === 'en' || saved === 'zh') return saved;

    // 2. Check system language
    const systemLang = navigator.language.toLowerCase();
    if (systemLang.startsWith('zh')) {
      return 'zh';
    }
    
    // 3. Default to English
    return 'en';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('focusRadar_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved as ThemeMode;
    return 'system';
  });

  const t = translations[language];

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = theme === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('focusRadar_theme', theme);

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  // Language Effect
  useEffect(() => {
    localStorage.setItem('focusRadar_lang', language);
  }, [language]);

  // Load Tasks
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
    setIsLoading(false);
  }, []);

  // Save Tasks
  useEffect(() => {
    if (!isLoading) {
      saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const applyUpdates = (updates: { taskId?: string; task?: Task }[]) => {
    setTasks(prev => {
      let nextTasks = [...prev];
      updates.forEach(update => {
        if (update.taskId && update.task) {
          nextTasks = nextTasks.map(t => t.id === update.taskId ? update.task! : t);
        } else if (update.task) {
          nextTasks.push(update.task);
        }
      });
      return nextTasks;
    });
    setCurrentView('plan');
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900">{t.common.loading}</div>;

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView}
      language={language}
      setLanguage={setLanguage}
      theme={theme}
      setTheme={setTheme}
    >
      {currentView === 'plan' && (
        <PlanView 
          tasks={tasks}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          lang={language}
        />
      )}
      {currentView === 'review' && (
        <ReviewView 
          tasks={tasks}
          onApplyUpdates={applyUpdates}
          lang={language}
        />
      )}
      {currentView === 'stats' && (
        <StatsView tasks={tasks} lang={language} />
      )}
    </Layout>
  );
}