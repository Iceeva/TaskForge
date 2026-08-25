import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Search, Bell, Plus, Filter, LayoutGrid, List, Calendar, Clock, BarChart3, Rocket, PieChart } from 'lucide-react';
import { useProjectStore } from '../../stores/project';
import { cn } from '../../lib/utils';

const viewOptions = [
  { id: 'KANBAN' as const, icon: LayoutGrid, label: 'Kanban' },
  { id: 'LIST' as const, icon: List, label: 'List' },
  { id: 'CALENDAR' as const, icon: Calendar, label: 'Calendar' },
  { id: 'TIMELINE' as const, icon: Clock, label: 'Timeline' },
  { id: 'GANTT' as const, icon: BarChart3, label: 'Gantt' },
];

export default function Header() {
  const { project, activeView, setActiveView, searchQuery, setSearchQuery } = useProjectStore();
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const onBoard = id && location.pathname === `/project/${id}`;

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center gap-3">
      {/* Project info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {project && (
          <>
            <span className="text-lg">{project.icon}</span>
            <h1 className="text-sm font-semibold truncate">{project.name}</h1>
          </>
        )}
        {!project && <h1 className="text-sm font-semibold">TaskForge</h1>}
      </div>

      {/* View switcher */}
      {project && onBoard && (
        <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
          {viewOptions.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition',
                activeView === v.id ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              )}
              title={v.label}
            >
              <v.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sprints / Analytics */}
      {project && (
        <div className="hidden lg:flex items-center gap-1">
          <Link
            to={`/project/${project.id}/sprints`}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition',
              location.pathname.endsWith('/sprints') ? 'bg-brand-500/10 text-brand-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            )}
          >
            <Rocket className="w-3.5 h-3.5" /> Sprints
          </Link>
          <Link
            to={`/project/${project.id}/analytics`}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition',
              location.pathname.endsWith('/analytics') ? 'bg-brand-500/10 text-brand-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            )}
          >
            <PieChart className="w-3.5 h-3.5" /> Analytics
          </Link>
        </div>
      )}

      {/* Global search trigger (Cmd+K) */}
      <button
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition text-xs"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Rechercher...</span>
        <kbd className="ml-2 text-[10px] border border-zinc-700 rounded px-1">⌘K</kbd>
      </button>

      {/* In-project search */}
      <div className="relative">
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => !searchQuery && setShowSearch(false)}
                placeholder="Search tasks..."
                className="w-full h-8 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:ring-1 focus:ring-brand-500"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {!showSearch && (
          <button onClick={() => setShowSearch(true)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400 transition">
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Actions */}
      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 text-zinc-400 transition relative">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500" />
      </button>

      {project && (
        <button className="btn-primary text-xs h-8 px-3 flex items-center gap-1">
          <Plus className="w-3 h-3" />
          New Task
        </button>
      )}
    </header>
  );
}
