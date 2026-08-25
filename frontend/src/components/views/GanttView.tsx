import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays, addDays, startOfDay, startOfWeek, eachWeekOfInterval } from 'date-fns';
import { useProjectStore } from '../../stores/project';
import { cn, priorityColors, priorityIcons, getInitials } from '../../lib/utils';

export default function GanttView() {
  const { project, setSelectedTask } = useProjectStore();
  if (!project) return null;

  const today = startOfDay(new Date());
  const rangeStart = addDays(today, -14);
  const rangeEnd = addDays(today, 42);
  const totalDays = differenceInDays(rangeEnd, rangeStart);

  const weeks = useMemo(() => {
    return eachWeekOfInterval({ start: rangeStart, end: rangeEnd }, { weekStartsOn: 1 });
  }, []);

  const tasksByColumn = project.columns.map(col => ({
    ...col,
    tasks: col.tasks.filter(t => t.dueDate || t.startDate),
  })).filter(col => col.tasks.length > 0);

  function getBar(task: any) {
    const s = task.startDate ? startOfDay(new Date(task.startDate)) : task.dueDate ? startOfDay(new Date(task.dueDate)) : today;
    const e = task.dueDate ? startOfDay(new Date(task.dueDate)) : addDays(s, 3);
    const leftDays = differenceInDays(s, rangeStart);
    const widthDays = Math.max(1, differenceInDays(e, s) + 1);
    return {
      left: `${(leftDays / totalDays) * 100}%`,
      width: `${(widthDays / totalDays) * 100}%`,
    };
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Week header */}
        <div className="flex border-b border-zinc-800">
          <div className="w-56 flex-shrink-0 px-3 py-2 text-[10px] text-zinc-500 font-semibold uppercase">Task</div>
          <div className="flex-1 flex">
            {weeks.map((week, i) => (
              <div
                key={i}
                className="text-[10px] text-zinc-500 text-center py-2 border-l border-zinc-800/50"
                style={{ width: `${(7 / totalDays) * 100}%` }}
              >
                {format(week, 'MMM d')}
              </div>
            ))}
          </div>
        </div>

        {/* Grouped by column */}
        {tasksByColumn.map(col => (
          <div key={col.id}>
            {/* Column header */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/30">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-[10px] font-semibold text-zinc-400 uppercase">{col.name}</span>
              <span className="text-[10px] text-zinc-600">({col.tasks.length})</span>
            </div>

            {/* Tasks */}
            {col.tasks.map((task, i) => {
              const bar = getBar(task);
              const isOverdue = task.dueDate && new Date(task.dueDate) < today && !task.isCompleted;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center h-9 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition"
                >
                  {/* Label */}
                  <div className="w-56 flex-shrink-0 flex items-center gap-2 px-3 truncate">
                    <span className="text-[10px]">{priorityIcons[task.priority]}</span>
                    <span className={cn('text-xs truncate', task.isCompleted && 'line-through text-zinc-500')}>{task.title}</span>
                  </div>

                  {/* Gantt bar */}
                  <div className="flex-1 relative h-full">
                    {/* Today indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-brand-500/50"
                      style={{ left: `${(differenceInDays(today, rangeStart) / totalDays) * 100}%` }}
                    />

                    <div
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        'absolute top-1.5 h-6 rounded-md cursor-pointer transition hover:brightness-125',
                        task.isCompleted ? 'bg-green-500/40' : isOverdue ? 'bg-red-500/40' : 'bg-brand-500/40'
                      )}
                      style={{ left: bar.left, width: bar.width, minWidth: '12px' }}
                    >
                      {/* Progress fill */}
                      {task.isCompleted && (
                        <div className="h-full bg-green-500/60 rounded-md" style={{ width: '100%' }} />
                      )}

                      {/* Assignee avatar */}
                      {task.assignments?.[0] && (
                        <div className="absolute -right-2 top-0.5 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center">
                          <span className="text-[7px] font-bold text-zinc-400">{getInitials(task.assignments[0].user.name || '?')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}

        {tasksByColumn.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-sm">Add dates to tasks to see them on the Gantt chart</div>
        )}
      </div>
    </div>
  );
}
