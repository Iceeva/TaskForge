import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../stores/project';
import KanbanBoard from '../components/views/KanbanBoard';
import ListView from '../components/views/ListView';
import CalendarView from '../components/views/CalendarView';
import TimelineView from '../components/views/TimelineView';
import GanttView from '../components/views/GanttView';
import TaskDetailModal from '../components/TaskDetailModal';
import api from '../lib/api';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { project, setProject, activeView, selectedTask, setSelectedTask } = useProjectStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get(`/projects/${id}`)
        .then(r => { setProject(r.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {activeView === 'KANBAN' && <KanbanBoard />}
      {activeView === 'LIST' && <ListView />}
      {activeView === 'CALENDAR' && <CalendarView />}
      {activeView === 'TIMELINE' && <TimelineView />}
      {activeView === 'GANTT' && <GanttView />}

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
