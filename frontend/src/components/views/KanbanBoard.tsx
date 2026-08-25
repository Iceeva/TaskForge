import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react';
import { useProjectStore } from '../../stores/project';
import TaskCard from '../TaskCard';
import api from '../../lib/api';
import type { Task, Column } from '../../types';

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex gap-1 items-start group">
        <div {...listeners} className="mt-3 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition">
          <GripVertical className="w-3 h-3 text-zinc-600" />
        </div>
        <div className="flex-1">
          <TaskCard task={task} />
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column }: { column: Column }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const { addTask } = useProjectStore();

  async function handleAdd() {
    if (!newTitle.trim()) return;
    try {
      const { data } = await api.post('/tasks', {
        title: newTitle,
        projectId: column.tasks[0]?.projectId || '',
        columnId: column.id,
      });
      addTask(data);
      setNewTitle('');
      setShowAdd(false);
    } catch {}
  }

  return (
    <div className="w-72 flex-shrink-0 flex flex-col max-h-full">
      {/* Column header */}
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex-1">{column.name}</h3>
        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">{column.tasks.length}</span>
        <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-zinc-800 text-zinc-600 transition">
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1 pb-2">
        <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map(task => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {/* Add task */}
        <AnimatePresence>
          {showAdd ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-zinc-700 bg-zinc-900 p-2"
            >
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Task title..."
                className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none mb-2"
              />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="btn-primary text-[10px] h-6 px-2">Add</button>
                <button onClick={() => setShowAdd(false)} className="text-[10px] text-zinc-500 hover:text-zinc-300">Cancel</button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center gap-1 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg transition"
            >
              <Plus className="w-3 h-3" />
              Add task
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const { project, moveTask } = useProjectStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  if (!project) return null;

  const allTasks = project.columns.flatMap(c => c.tasks);
  const activeTask = allTasks.find(t => t.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine target column
    let targetColumnId = task.columnId;
    let newPos = 0;

    // Check if dropped on a column or another task
    const overTask = allTasks.find(t => t.id === over.id);
    if (overTask) {
      targetColumnId = overTask.columnId;
      const targetCol = project?.columns.find(c => c.id === targetColumnId);
      newPos = targetCol?.tasks.findIndex(t => t.id === over.id) || 0;
    }

    if (task.columnId !== targetColumnId || task.position !== newPos) {
      moveTask(taskId, task.columnId, targetColumnId, newPos);
      api.post(`/tasks/${taskId}/move`, { columnId: targetColumnId, position: newPos }).catch(() => {});
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {project.columns.map(column => (
          <KanbanColumn key={column.id} column={column} />
        ))}

        {/* Add column button */}
        <div className="w-72 flex-shrink-0">
          <button className="w-full flex items-center gap-1 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-800 transition">
            <Plus className="w-3 h-3" />
            Add Column
          </button>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
