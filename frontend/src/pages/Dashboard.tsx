import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderKanban, Plus, Star, CheckCircle2, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { cn } from '../lib/utils';
import api from '../lib/api';
import type { Project } from '../types';

export default function DashboardPage() {
  const { user, workspace } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workspace) {
      api.get(`/projects?workspaceId=${workspace.id}`)
        .then(r => { setProjects(r.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [workspace]);

  // Demo stats
  const stats = [
    { label: 'Total Tasks', value: projects.reduce((s, p) => s + (p._count?.tasks || 0), 0), icon: FolderKanban, color: 'text-brand-400 bg-brand-500/10' },
    { label: 'Completed', value: 24, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' },
    { label: 'Due Today', value: 5, icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Overdue', value: 2, icon: AlertTriangle, color: 'text-red-400 bg-red-500/10' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Here's what's happening in your workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-4"
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', s.color)}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-zinc-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-300">Projects</h2>
          <button className="btn-primary text-xs h-8 px-3 flex items-center gap-1">
            <Plus className="w-3 h-3" />
            New Project
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/project/${project.id}`}
                className="card p-4 block hover:border-zinc-700 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{project.icon}</span>
                    <h3 className="font-medium text-sm group-hover:text-brand-400 transition">{project.name}</h3>
                  </div>
                  {project.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                </div>
                {project.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{project.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">{project._count?.tasks || 0} tasks</span>
                  <div className="flex -space-x-1.5">
                    {['JD', 'SM', 'AC'].slice(0, 3).map((initials, j) => (
                      <div key={j} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-zinc-400">{initials}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Empty state */}
          {projects.length === 0 && !loading && (
            <div className="card p-8 text-center col-span-full">
              <FolderKanban className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No projects yet. Create your first one!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { action: 'moved', task: 'Design landing page', from: 'To Do', to: 'In Progress', time: '5m ago', user: 'Sarah M.' },
            { action: 'completed', task: 'Fix mobile responsive', from: '', to: '', time: '15m ago', user: 'Alex C.' },
            { action: 'commented on', task: 'Implement auth', from: '', to: '', time: '1h ago', user: 'John D.' },
            { action: 'created', task: 'Email notifications', from: '', to: '', time: '2h ago', user: 'Sarah M.' },
          ].map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-3 text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-bold text-zinc-400">{a.user.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <p className="flex-1 text-zinc-400">
                <span className="text-zinc-300 font-medium">{a.user}</span> {a.action}{' '}
                <span className="text-zinc-300">{a.task}</span>
                {a.from && <> from <span className="text-zinc-500">{a.from}</span> to <span className="text-zinc-300">{a.to}</span></>}
              </p>
              <span className="text-zinc-600">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
