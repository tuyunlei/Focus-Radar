export type TaskStatus = "todo" | "in_progress" | "done" | "dropped";

export enum TaskCategory {
  Project = "project",
  Learning = "learning",
  Communication = "communication",
  Misc = "misc",
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  category: TaskCategory;
  status: TaskStatus;
  estimateHours: number;
  actualHours: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// LLM Related Types
export type UpdateType = "update_existing" | "create_new";

export interface TaskUpdateAction {
  type: UpdateType;
  taskId?: string; // Required if type is update_existing
  title?: string; // Required if type is create_new
  statusChange?: TaskStatus;
  addActualHours?: number; // How much *additional* time to add
  initialActualHours?: number; // Used for new tasks
  category?: TaskCategory;
  estimateHours?: number;
}

export interface LLMUpdateSuggestion {
  date: string;
  summary?: string;
  actions: TaskUpdateAction[];
}
