import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Calendar, MessageSquare, Paperclip, ChevronRight } from 'lucide-react';
import { useProjectStore } from '../../stores/project';
import { cn, priorityColors, priorityIcons, formatDate, getInitials } from '../../lib/utils';

export default function ListView() {
  const { project, setSelectedTask, searchQuery, filterPriority } = useProjectStore();
  if (!project) return null;

  const allTasks = project.columns.flatMap(c =>
    c.tasks.map(t => ({ ...t, columnName: c.name, columnColor: c.color }))
  ).filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_100px_80px_80px] gap-2 px-4 py-2 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-800">
        <span>Task</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Due</span>
        <span>Assignee</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-800/50">
        {allTasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => setSelectedTask(task as any)}
            className="grid grid-cols-[1fr_100px_100px_80px_80px] gap-2 items-center px-4 py-2.5 hover:bg-zinc-800/30 cursor-pointer transition group"
          >
            {/* Task */}
            <div className="flex items-center gap-2 min-w-0">
              {task.isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              )}
              <span className={cn('text-sm truncate', task.isCompleted && 'line-through text-zinc-500')}>{task.title}</span>
              {task.labels?.length > 0 && (
                <div className="flex gap-0.5 flex-shrink-0">
                  {task.labels.map(({ label }) => (
                    <span key={label.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }} />
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1 flex-shrink-0 text-zinc-600">
                {(task._count?.comments || 0) > 0 && <span className="text-[10px] flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5" />{task._count!.comments}</span>}
                {(task._count?.attachments || 0) > 0 && <span className="text-[10px] flex items-center gap-0.5"><Paperclip className="w-2.5 h-2.5" />{task._count!.attachments}</span>}
              </div>
            </div>

            {/* Status */}
            <span className="text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.columnColor }} />
              <span className="text-zinc-400 truncate">{task.columnName}</span>
            </span>

            {/* Priority */}
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-medium w-fit', priorityColors[task.priority])}>
              {priorityIcons[task.priority]} {task.priority}
            </span>

            {/* Due */}
            <span className={cn(
              'text-[10px]',
              task.dueDate && new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-zinc-500'
            )}>
              {task.dueDate ? formatDate(task.dueDate) : '-'}
            </span>

            {/* Assignee */}
            <div className="flex -space-x-1">
              {task.assignments?.slice(0, 2).map(({ user }) => (
                <div key={user.id} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-zinc-400">{getInitials(user.name || '?')}</span>
                </div>
              ))}
              {(!task.assignments || task.assignments.length === 0) && <span className="text-zinc-700 text-[10px]">-</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {allTasks.length === 0 && (
        <div className="text-center py-12 text-zinc-600 text-sm">No tasks found</div>
      )}
    </div>
  );
}
