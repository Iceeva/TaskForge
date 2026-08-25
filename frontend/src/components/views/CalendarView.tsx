import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { useProjectStore } from '../../stores/project';
import { cn, priorityColors } from '../../lib/utils';

export default function CalendarView() {
  const { project, setSelectedTask } = useProjectStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const allTasks = project?.columns.flatMap(c => c.tasks) || [];

  function getTasksForDay(day: Date) {
    return allTasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-xs rounded-lg hover:bg-zinc-800 text-zinc-400 transition">
            Today
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px mb-px">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-[10px] text-zinc-500 font-semibold uppercase tracking-wider py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
        {days.map((day, i) => {
          const dayTasks = getTasksForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={i}
              className={cn(
                'bg-zinc-900 min-h-[100px] p-1.5',
                !inMonth && 'bg-zinc-950/60'
              )}
            >
              <div className={cn(
                'text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                today && 'bg-brand-500 text-white',
                !today && inMonth && 'text-zinc-300',
                !today && !inMonth && 'text-zinc-600'
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map(task => (
                  <motion.div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-md truncate cursor-pointer hover:brightness-125 transition',
                      task.isCompleted ? 'bg-green-500/10 text-green-400 line-through' : 'bg-brand-500/10 text-brand-300'
                    )}
                  >
                    {task.title}
                  </motion.div>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-[10px] text-zinc-500 px-1">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
