import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Users, MessageSquare, Paperclip, CheckSquare, Clock, Activity, Send, Flag, Trash2, Timer, Link2, Plus } from 'lucide-react';
import { cn, priorityColors, priorityIcons, formatDate, formatDateTime, timeAgo, getInitials } from '../lib/utils';
import api from '../lib/api';
import type { Task } from '../types';

interface Props {
  task: Task;
  onClose: () => void;
}

export default function TaskDetailModal({ task, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity' | 'time' | 'dependencies'>('details');
  const [commentText, setCommentText] = useState('');
  const [timeEntries, setTimeEntries] = useState(task.timeEntries || []);
  const [logMinutes, setLogMinutes] = useState('');
  const [logNote, setLogNote] = useState('');

  const completedChecklist = task.checklist?.filter(c => c.completed).length || 0;
  const totalChecklist = task.checklist?.length || 0;
  const totalMinutesLogged = timeEntries.reduce((sum, e) => sum + e.minutes, 0);

  async function logTime(e: React.FormEvent) {
    e.preventDefault();
    const minutes = parseInt(logMinutes, 10);
    if (!minutes || minutes <= 0) return;
    const res = await api.post(`/time-entries/task/${task.id}`, { minutes, note: logNote || undefined });
    setTimeEntries([res.data, ...timeEntries]);
    setLogMinutes('');
    setLogNote('');
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[70vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium', priorityColors[task.priority])}>
                {priorityIcons[task.priority]} {task.priority}
              </span>
              <span className="text-xs text-zinc-500">in {task.column?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 text-zinc-500 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-500 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {/* Title */}
            <h2 className="text-lg font-bold">{task.title}</h2>

            {/* Description */}
            <div>
              <p className="text-xs text-zinc-500 mb-1">Description</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{task.description || 'No description'}</p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Assignees */}
              <div>
                <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Assignees</p>
                <div className="flex flex-wrap gap-2">
                  {task.assignments?.map(({ user }) => (
                    <div key={user.id} className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-2 py-1">
                      <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-brand-400">{getInitials(user.name || '?')}</span>
                      </div>
                      <span className="text-xs">{user.name}</span>
                    </div>
                  )) || <span className="text-xs text-zinc-600">Unassigned</span>}
                </div>
              </div>

              {/* Due date */}
              <div>
                <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Due Date</p>
                <p className={cn('text-sm', task.dueDate && new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-zinc-300')}>
                  {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                </p>
              </div>

              {/* Labels */}
              <div>
                <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> Labels</p>
                <div className="flex flex-wrap gap-1">
                  {task.labels?.map(({ label }) => (
                    <span key={label.id} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: label.color + '20', color: label.color }}>
                      {label.name}
                    </span>
                  )) || <span className="text-xs text-zinc-600">No labels</span>}
                </div>
              </div>

              {/* Estimated time */}
              <div>
                <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Estimé / Réalisé</p>
                <p className="text-sm text-zinc-300">
                  {task.estimatedHours ? `${task.estimatedHours}h` : 'Non défini'}
                  {totalMinutesLogged > 0 && (
                    <span className="text-zinc-500"> · {(totalMinutesLogged / 60).toFixed(1)}h loguées</span>
                  )}
                </p>
              </div>
            </div>

            {/* Checklist */}
            {totalChecklist > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" /> Checklist ({completedChecklist}/{totalChecklist})
                </p>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 mb-2">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {task.checklist.map(item => (
                    <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer group">
                      <input type="checkbox" checked={item.completed} readOnly className="rounded" />
                      <span className={cn(item.completed && 'line-through text-zinc-500')}>{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-800 pb-px overflow-x-auto">
              {[
                { id: 'details' as const, icon: Flag, label: 'Sous-tâches' },
                { id: 'comments' as const, icon: MessageSquare, label: `Commentaires (${task.comments?.length || 0})` },
                { id: 'time' as const, icon: Timer, label: `Temps (${(totalMinutesLogged / 60).toFixed(1)}h)` },
                { id: 'dependencies' as const, icon: Link2, label: 'Dépendances' },
                { id: 'activity' as const, icon: Activity, label: 'Activité' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1 text-xs pb-2 border-b-2 transition whitespace-nowrap',
                    activeTab === tab.id ? 'border-brand-500 text-brand-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'comments' && (
              <div className="space-y-3">
                {task.comments?.map(comment => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[8px] font-bold text-zinc-400">{getInitials(comment.author.name || '?')}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{comment.author.name}</span>
                        <span className="text-[10px] text-zinc-600">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{comment.body}</p>
                    </div>
                  </div>
                ))}

                {/* Comment input */}
                <div className="flex gap-2 pt-2">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 input h-8 text-xs"
                  />
                  <button className="btn-primary h-8 px-3 text-xs flex items-center gap-1">
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-2">
                {task.activities?.map(a => (
                  <div key={a.id} className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-[7px] font-bold text-zinc-400">{getInitials(a.user.name || '?')}</span>
                    </div>
                    <p className="flex-1 text-zinc-400">
                      <span className="text-zinc-300">{a.user.name}</span>{' '}
                      {a.action.toLowerCase()}{a.field ? ` ${a.field}` : ''}
                      {a.oldValue && <> from <span className="text-zinc-500">{a.oldValue}</span></>}
                      {a.newValue && <> to <span className="text-zinc-300">{a.newValue}</span></>}
                    </p>
                    <span className="text-zinc-600">{timeAgo(a.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'time' && (
              <div className="space-y-3">
                <form onSubmit={logTime} className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={logMinutes}
                    onChange={e => setLogMinutes(e.target.value)}
                    placeholder="Minutes"
                    className="input h-8 text-xs w-24"
                  />
                  <input
                    value={logNote}
                    onChange={e => setLogNote(e.target.value)}
                    placeholder="Note (optionnel)"
                    className="input h-8 text-xs flex-1"
                  />
                  <button type="submit" className="btn-primary h-8 px-3 text-xs flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Loguer
                  </button>
                </form>
                <div className="space-y-2">
                  {timeEntries.length === 0 && <p className="text-xs text-zinc-600 italic">Aucun temps logué pour cette tâche</p>}
                  {timeEntries.map(entry => (
                    <div key={entry.id} className="flex items-center gap-2 text-xs bg-zinc-800/40 rounded-lg px-3 py-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-[7px] font-bold text-zinc-400">{getInitials(entry.user.name || '?')}</span>
                      </div>
                      <span className="text-zinc-300">{entry.user.name}</span>
                      <span className="text-brand-400 font-medium">{(entry.minutes / 60).toFixed(1)}h</span>
                      {entry.note && <span className="text-zinc-500 flex-1 truncate">-{entry.note}</span>}
                      <span className="text-zinc-600">{timeAgo(entry.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'dependencies' && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Bloque</p>
                  {task.blocking?.length ? (
                    <div className="space-y-1">
                      {task.blocking.map(dep => (
                        <div key={dep.id} className="flex items-center gap-2 text-sm bg-zinc-800/40 rounded-lg px-3 py-2">
                          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', dep.task.isCompleted ? 'bg-emerald-500' : 'bg-zinc-600')} />
                          <span className={cn(dep.task.isCompleted && 'line-through text-zinc-500')}>{dep.task.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-zinc-600 italic">Cette tâche ne bloque aucune autre tâche</p>}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Bloquée par</p>
                  {task.blockedBy?.length ? (
                    <div className="space-y-1">
                      {task.blockedBy.map(dep => (
                        <div key={dep.id} className="flex items-center gap-2 text-sm bg-zinc-800/40 rounded-lg px-3 py-2">
                          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', dep.dependsOn.isCompleted ? 'bg-emerald-500' : 'bg-amber-500')} />
                          <span className={cn(dep.dependsOn.isCompleted && 'line-through text-zinc-500')}>{dep.dependsOn.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-zinc-600 italic">Aucune dépendance bloquante</p>}
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-2">
                {task.subtasks?.length > 0 ? task.subtasks.map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <div className={cn('w-3 h-3 rounded border', s.isCompleted ? 'bg-brand-500 border-brand-500' : 'border-zinc-600')} />
                    <span className={cn(s.isCompleted && 'line-through text-zinc-500')}>Sub-task</span>
                  </div>
                )) : <p className="text-xs text-zinc-600">No subtasks</p>}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
