import React from 'react';
import { Target, ListTodo, BarChart2, Moon, Sun, Monitor, Languages } from 'lucide-react';
import { translations, Language } from '../services/i18n';
import { ThemeMode } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'plan' | 'review' | 'stats';
  onChangeView: (view: 'plan' | 'review' | 'stats') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView,
  language,
  setLanguage,
  theme,
  setTheme
}) => {
  const t = translations[language];

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-5 h-5" />;
      case 'dark': return <Moon className="w-5 h-5" />;
      case 'system': return <Monitor className="w-5 h-5" />;
    }
  };

  const getThemeLabel = () => {
    return t.common.theme[theme];
  };

  const NavItem = ({ view, icon: Icon, label }: { view: 'plan' | 'review' | 'stats', icon: any, label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`flex md:flex-row flex-col items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
        currentView === view 
          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-medium' 
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="w-6 h-6 md:w-5 md:h-5" />
      <span className="text-xs md:text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2 mb-8">
          <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="font-bold text-gray-800 dark:text-gray-100 text-xl">
            {t.common.appName} <span className="text-xs font-normal text-gray-400">{t.common.version}</span>
          </h1>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <NavItem view="plan" icon={ListTodo} label={t.nav.plan} />
          <NavItem view="review" icon={Target} label={t.nav.review} />
          <NavItem view="stats" icon={BarChart2} label={t.nav.stats} />
        </nav>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
            <button 
              onClick={cycleTheme}
              className="p-2 w-full flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm"
              title="Toggle Theme"
            >
              {getThemeIcon()}
              <span>{getThemeLabel()}</span>
            </button>
            <button 
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="p-2 w-full flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm"
              title="Switch Language"
            >
              <Languages className="w-5 h-5" />
              <span>{language === 'en' ? 'English' : '中文'}</span>
            </button>
        </div>
      </aside>

      {/* Header (Mobile) */}
      <header className="md:hidden bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h1 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
            {t.common.appName} <span className="text-xs font-normal text-gray-400">{t.common.version}</span>
          </h1>
        </div>
        <div className="flex gap-1">
          <button 
             onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
             className="p-2 text-gray-500 dark:text-gray-400"
          >
            <span className="font-bold text-xs border rounded px-1 py-0.5 border-current">{language.toUpperCase()}</span>
          </button>
          <button 
            onClick={cycleTheme}
            className="p-2 text-gray-500 dark:text-gray-400"
          >
            {getThemeIcon()}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 md:pb-8 md:p-8 overflow-y-auto">
        {/* Adjusted max-width for better desktop usage, ensuring it doesn't get too wide to read */}
        <div className="max-w-4xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around py-3 z-20 pb-safe">
        <button
          onClick={() => onChangeView('plan')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${
            currentView === 'plan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <ListTodo className="w-6 h-6" />
          {t.nav.plan}
        </button>
        <button
          onClick={() => onChangeView('review')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${
            currentView === 'review' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Target className="w-6 h-6" />
          {t.nav.review}
        </button>
        <button
          onClick={() => onChangeView('stats')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${
            currentView === 'stats' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <BarChart2 className="w-6 h-6" />
          {t.nav.stats}
        </button>
      </nav>
    </div>
  );
};