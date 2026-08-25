import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays, addDays, startOfDay } from 'date-fns';
import { useProjectStore } from '../../stores/project';
import { cn, priorityColors, getInitials } from '../../lib/utils';

export default function TimelineView() {
  const { project, setSelectedTask } = useProjectStore();
  if (!project) return null;

  const allTasks = project.columns.flatMap(c =>
    c.tasks.filter(t => t.dueDate || t.startDate).map(t => ({
      ...t,
      columnName: c.name,
      columnColor: c.color,
    }))
  );

  // Build a 30-day timeline from today
  const today = startOfDay(new Date());
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i - 7));
  const timelineStart = days[0];
  const totalDays = days.length;

  function getBarPosition(task: typeof allTasks[0]) {
    const start = task.startDate ? startOfDay(new Date(task.startDate)) : (task.dueDate ? startOfDay(new Date(task.dueDate)) : today);
    const end = task.dueDate ? startOfDay(new Date(task.dueDate)) : addDays(start, 2);
    const startOffset = Math.max(0, differenceInDays(start, timelineStart));
    const duration = Math.max(1, differenceInDays(end, start) + 1);
    return { left: `${(startOffset / totalDays) * 100}%`, width: `${(duration / totalDays) * 100}%` };
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header — day labels */}
        <div className="flex border-b border-zinc-800 mb-2">
          <div className="w-48 flex-shrink-0" />
          <div className="flex-1 flex">
            {days.map((day, i) => {
              const isToday = differenceInDays(day, today) === 0;
              return (
                <div key={i} className={cn('flex-1 text-center text-[10px] py-1', isToday ? 'text-brand-400 font-bold' : 'text-zinc-600')}>
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {allTasks.map((task, i) => {
            const pos = getBarPosition(task);
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center h-8 group"
              >
                {/* Task label */}
                <div className="w-48 flex-shrink-0 flex items-center gap-2 pr-3 truncate">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: task.columnColor }} />
                  <span className="text-xs truncate text-zinc-300">{task.title}</span>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 relative h-full">
                  <div
                    onClick={() => setSelectedTask(task as any)}
                    className={cn(
                      'absolute top-1 h-6 rounded-lg cursor-pointer transition hover:brightness-125',
                      task.isCompleted ? 'bg-green-500/30 border border-green-500/30' : 'bg-brand-500/30 border border-brand-500/30'
                    )}
                    style={{ left: pos.left, width: pos.width, minWidth: '20px' }}
                  >
                    <div className="flex items-center h-full px-2 gap-1">
                      <span className="text-[10px] text-zinc-300 truncate">{task.title}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {allTasks.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-sm">No tasks with dates</div>
        )}
      </div>
    </div>
  );
}
