import { motion } from 'framer-motion';
import { MessageSquare, Paperclip, CheckSquare, Calendar } from 'lucide-react';
import { useProjectStore } from '../stores/project';
import { cn, priorityColors, formatDate, getInitials } from '../lib/utils';
import type { Task } from '../types';

interface Props {
  task: Task;
  isDragging?: boolean;
}

export default function TaskCard({ task, isDragging }: Props) {
  const { setSelectedTask } = useProjectStore();

  const completedSubtasks = task.subtasks?.filter(s => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <motion.div
      layout
      onClick={() => !isDragging && setSelectedTask(task)}
      className={cn(
        'rounded-xl border border-zinc-800 bg-zinc-900 p-3 cursor-pointer hover:border-zinc-700 transition group',
        isDragging && 'shadow-xl shadow-black/50 rotate-2 scale-105 border-brand-500/30'
      )}
    >
      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map(({ label }) => (
            <span key={label.id} className="h-1.5 w-6 rounded-full" style={{ backgroundColor: label.color }} />
          ))}
        </div>
      )}

      {/* Title */}
      <p className={cn('text-sm font-medium mb-2', task.isCompleted && 'line-through text-zinc-500')}>
        {task.title}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority */}
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md font-medium border', priorityColors[task.priority])}>
          {task.priority}
        </span>

        {/* Due date */}
        {task.dueDate && (
          <span className={cn(
            'text-[10px] flex items-center gap-0.5',
            new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-zinc-500'
          )}>
            <Calendar className="w-2.5 h-2.5" />
            {formatDate(task.dueDate)}
          </span>
        )}

        <div className="flex-1" />

        {/* Subtask progress */}
        {totalSubtasks > 0 && (
          <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
            <CheckSquare className="w-2.5 h-2.5" />
            {completedSubtasks}/{totalSubtasks}
          </span>
        )}

        {/* Comment count */}
        {(task._count?.comments || 0) > 0 && (
          <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
            <MessageSquare className="w-2.5 h-2.5" />
            {task._count!.comments}
          </span>
        )}

        {/* Attachments */}
        {(task._count?.attachments || 0) > 0 && (
          <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
            <Paperclip className="w-2.5 h-2.5" />
            {task._count!.attachments}
          </span>
        )}

        {/* Assignees */}
        {task.assignments?.length > 0 && (
          <div className="flex -space-x-1.5">
            {task.assignments.slice(0, 3).map(({ user }) => (
              <div key={user.id} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center" title={user.name || user.email}>
                <span className="text-[7px] font-bold text-zinc-400">{getInitials(user.name || user.email || '?')}</span>
              </div>
            ))}
            {task.assignments.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center">
                <span className="text-[7px] font-bold text-zinc-400">+{task.assignments.length - 3}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
