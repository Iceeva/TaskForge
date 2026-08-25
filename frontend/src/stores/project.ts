import { create } from 'zustand';
import type { Project, Task, Column } from '../types';

interface ProjectState {
  project: Project | null;
  activeView: 'KANBAN' | 'LIST' | 'CALENDAR' | 'TIMELINE' | 'GANTT';
  selectedTask: Task | null;
  searchQuery: string;
  filterPriority: string | null;
  filterAssignee: string | null;
  setProject: (project: Project) => void;
  setActiveView: (view: ProjectState['activeView']) => void;
  setSelectedTask: (task: Task | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterPriority: (priority: string | null) => void;
  setFilterAssignee: (assignee: string | null) => void;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, newPosition: number) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  activeView: 'KANBAN',
  selectedTask: null,
  searchQuery: '',
  filterPriority: null,
  filterAssignee: null,
  setProject: (project) => set({ project, activeView: project.defaultView }),
  setActiveView: (activeView) => set({ activeView }),
  setSelectedTask: (selectedTask) => set({ selectedTask }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterPriority: (filterPriority) => set({ filterPriority }),
  setFilterAssignee: (filterAssignee) => set({ filterAssignee }),
  moveTask: (taskId, fromColumnId, toColumnId, newPosition) => {
    const project = get().project;
    if (!project) return;

    const columns = project.columns.map(col => ({
      ...col,
      tasks: col.tasks.map(t => ({ ...t })),
    }));

    // Remove from source
    const fromCol = columns.find(c => c.id === fromColumnId);
    if (!fromCol) return;
    const taskIndex = fromCol.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    const [task] = fromCol.tasks.splice(taskIndex, 1);

    // Insert into target
    const toCol = columns.find(c => c.id === toColumnId);
    if (!toCol) return;
    task.columnId = toColumnId;
    task.position = newPosition;
    toCol.tasks.splice(newPosition, 0, task);

    set({ project: { ...project, columns } });
  },
  addTask: (task) => {
    const project = get().project;
    if (!project) return;
    const columns = project.columns.map(col =>
      col.id === task.columnId ? { ...col, tasks: [...col.tasks, task] } : col,
    );
    set({ project: { ...project, columns } });
  },
  updateTask: (taskId, updates) => {
    const project = get().project;
    if (!project) return;
    const columns = project.columns.map(col => ({
      ...col,
      tasks: col.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
    set({ project: { ...project, columns } });
    const selected = get().selectedTask;
    if (selected?.id === taskId) set({ selectedTask: { ...selected, ...updates } });
  },
  removeTask: (taskId) => {
    const project = get().project;
    if (!project) return;
    const columns = project.columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => t.id !== taskId),
    }));
    set({ project: { ...project, columns } });
    if (get().selectedTask?.id === taskId) set({ selectedTask: null });
  },
}));
