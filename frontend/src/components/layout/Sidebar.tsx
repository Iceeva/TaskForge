import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, Settings, Users, Plus, Star, ChevronDown, LogOut, Hash, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/auth';
import { cn, getInitials } from '../../lib/utils';
import api from '../../lib/api';
import type { Project } from '../../types';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, workspace, logout } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (workspace) {
      api.get(`/projects?workspaceId=${workspace.id}`)
        .then(r => setProjects(r.data))
        .catch(() => {});
    }
  }, [workspace]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const favorites = projects.filter(p => p.isFavorite);
  const others = projects.filter(p => !p.isFavorite);

  return (
    <aside className={cn(
      'h-full border-r border-zinc-800 bg-zinc-950 flex flex-col transition-all duration-200',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Workspace header */}
      <div className="p-3 border-b border-zinc-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold truncate">{workspace?.name || 'TaskForge'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition',
                active ? 'bg-brand-500/10 text-brand-400 font-medium' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {!collapsed && (
          <>
            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="pt-4">
                <p className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Favorites</p>
                {favorites.map(p => (
                  <Link
                    key={p.id}
                    to={`/project/${p.id}`}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition',
                      location.pathname === `/project/${p.id}` ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50'
                    )}
                  >
                    <span>{p.icon}</span>
                    <span className="truncate flex-1">{p.name}</span>
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </Link>
                ))}
              </div>
            )}

            {/* Projects */}
            <div className="pt-4">
              <div className="flex items-center justify-between px-3 mb-1">
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Projects</p>
                <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {others.map(p => (
                <Link
                  key={p.id}
                  to={`/project/${p.id}`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition',
                    location.pathname === `/project/${p.id}` ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50'
                  )}
                >
                  <span>{p.icon}</span>
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="text-[10px] text-zinc-600">{p._count?.tasks || 0}</span>
                </Link>
              ))}
              {projects.length === 0 && (
                <p className="px-3 text-xs text-zinc-600 italic">No projects yet</p>
              )}
            </div>
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-2 border-t border-zinc-800">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
