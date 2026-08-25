export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  defaultView: 'KANBAN' | 'LIST' | 'CALENDAR' | 'TIMELINE' | 'GANTT';
  isFavorite: boolean;
  columns: Column[];
  _count?: { tasks: number };
}

export interface Column {
  id: string;
  name: string;
  color: string;
  position: number;
  tasks: Task[];
}export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  position: number;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  isCompleted: boolean;
  completedAt?: string;
  columnId: string;
  projectId: string;
  parentId?: string;
  sprintId?: string;
  milestoneId?: string;
  column?: Column;
  assignments: { user: User }[];
  labels: { label: Label }[];
  subtasks: { id: string; isCompleted: boolean }[];
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
  activities: Activity[];
  timeEntries?: TimeEntry[];
  blocking?: { id: string; type: string; task: { id: string; title: string; isCompleted: boolean } }[];
  blockedBy?: { id: string; type: string; dependsOn: { id: string; title: string; isCompleted: boolean } }[];
  _count?: { comments: number; attachments: number; subtasks: number };
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  position: number;
}

export interface Comment {
  id: string;
  body: string;
  author: User;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface Activity {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  projectId: string;
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  color: string;
  isCompleted: boolean;
  projectId: string;
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface TimeEntry {
  id: string;
  minutes: number;
  note?: string;
  date: string;
  taskId: string;
  user: User;
}

export interface AnalyticsOverview {
  total: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  completionRate: number;
  byPriority: Record<string, number>;
  byColumn: { columnId: string; name: string; color: string; count: number }[];
  byAssignee: { user: User; total: number; completed: number }[];
  trend: { date: string; completed: number }[];
  totalEstimatedHours: number;
}

export interface SearchResults {
  tasks: (Task & { project: { id: string; name: string; icon: string; color: string } })[];
  projects: Pick<Project, 'id' | 'name' | 'icon' | 'color'>[];
  comments: (Comment & { task: { id: string; title: string; projectId: string } })[];
}
