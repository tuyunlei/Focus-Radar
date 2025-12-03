import { Task } from '../types';

const STORAGE_KEY = 'focusRadarTasks_v0';

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load tasks", e);
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks", e);
  }
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const generateId = (): string => {
  return crypto.randomUUID();
};
