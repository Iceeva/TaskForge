import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, FolderKanban, MessageSquare, CornerDownLeft } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/auth';
import type { SearchResults } from '../types';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ tasks: [], projects: [], comments: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { workspace } = useAuthStore();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setResults({ tasks: [], projects: [], comments: [] }); }
  }, [open]);

  useEffect(() => {
    if (!workspace || query.trim().length < 2) {
      setResults({ tasks: [], projects: [], comments: [] });
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      api.get('/search', { params: { workspaceId: workspace.id, q: query } })
        .then((r) => setResults(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, workspace]);

  const hasResults = results.tasks.length + results.projects.length + results.comments.length > 0;

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-24 px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-glow overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 border-b border-zinc-800">
              <Search className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des tâches, projets, commentaires..."
                className="w-full h-12 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
              />
              <kbd className="hidden sm:block text-[10px] text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">Esc</kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="p-6 text-center text-xs text-zinc-500">Recherche en cours...</div>
              )}

              {!loading && query.trim().length >= 2 && !hasResults && (
                <div className="p-6 text-center text-xs text-zinc-500">Aucun résultat pour "{query}"</div>
              )}

              {!loading && query.trim().length < 2 && (
                <div className="p-6 text-center text-xs text-zinc-500">Tapez au moins 2 caractères pour rechercher</div>
              )}

              {results.projects.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Projets</p>
                  {results.projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => go(`/project/${p.id}`)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left hover:bg-zinc-800 transition group"
                    >
                      <FolderKanban className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <span className="truncate flex-1">{p.icon} {p.name}</span>
                      <CornerDownLeft className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition" />
                    </button>
                  ))}
                </div>
              )}

              {results.tasks.length > 0 && (
                <div className="p-2 border-t border-zinc-800/60">
                  <p className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Tâches</p>
                  {results.tasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => go(`/project/${t.projectId}`)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left hover:bg-zinc-800 transition group"
                    >
                      <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <span className="truncate flex-1">{t.title}</span>
                      <span className="text-[10px] text-zinc-600 flex-shrink-0">{t.project?.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.comments.length > 0 && (
                <div className="p-2 border-t border-zinc-800/60">
                  <p className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Commentaires</p>
                  {results.comments.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => go(`/project/${c.task.projectId}`)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left hover:bg-zinc-800 transition"
                    >
                      <MessageSquare className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <span className="truncate flex-1 text-zinc-400">{c.body}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
