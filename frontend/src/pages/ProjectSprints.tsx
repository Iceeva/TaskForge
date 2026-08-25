import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plus, X, Target, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { cn, formatDate, getInitials } from '../lib/utils';
import type { Sprint } from '../types';

export default function ProjectSprints() {
  const { id } = useParams<{ id: string }>();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selected, setSelected] = useState<Sprint | null>(null);
  const [burndown, setBurndown] = useState<{ date: string; remaining: number }[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);

  function load() {
    if (!id) return;
    setLoading(true);
    api.get('/sprints', { params: { projectId: id } })
      .then((r) => setSprints(r.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  useEffect(() => {
    if (!selected) { setBurndown([]); return; }
    api.get(`/sprints/${selected.id}/burndown`).then((r) => setBurndown(r.data.days));
  }, [selected]);

  async function createSprint(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    await api.post('/sprints', { projectId: id, ...form });
    setShowCreate(false);
    setForm({ name: '', goal: '', startDate: '', endDate: '' });
    load();
  }

  async function activate(sprintId: string) {
    await api.patch(`/sprints/${sprintId}`, { isActive: true });
    load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Sprints</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-xs h-8 px-3 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nouveau sprint
        </button>
      </div>

      {sprints.length === 0 && (
        <div className="card p-10 text-center">
          <Target className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Aucun sprint pour ce projet pour l'instant.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sprint list */}
        <div className="space-y-3">
          {sprints.map((s) => {
            const total = s.tasks?.length || (s as any)._count?.tasks || 0;
            const completed = s.tasks?.filter((t) => t.isCompleted).length || 0;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={cn(
                  'w-full text-left card p-4 transition',
                  selected?.id === s.id ? 'border-brand-500/60 bg-brand-500/5' : 'hover:border-zinc-700',
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{s.name}</span>
                    {s.isActive && <span className="badge bg-brand-500/10 text-brand-400 border-brand-500/30">Actif</span>}
                    {s.isCompleted && <span className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Terminé</span>}
                  </div>
                  {!s.isActive && !s.isCompleted && (
                    <button
                      onClick={(e) => { e.stopPropagation(); activate(s.id); }}
                      className="text-[10px] text-brand-400 hover:underline"
                    >
                      Activer
                    </button>
                  )}
                </div>
                {s.goal && <p className="text-xs text-zinc-500 mb-2">{s.goal}</p>}
                <div className="flex items-center gap-3 text-[11px] text-zinc-600">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(s.startDate)} → {formatDate(s.endDate)}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {completed}/{total}</span>
                </div>
                {total > 0 && (
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(completed / total) * 100}%` }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Burndown */}
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">
            {selected ? `Burndown — ${selected.name}` : 'Sélectionnez un sprint pour voir son burndown'}
          </p>
          {selected && burndown.length > 0 && (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={burndown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="remaining" stroke="#7c5cff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Create sprint modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={createSprint} className="w-full max-w-sm card p-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold">Nouveau sprint</h2>
              <button type="button" onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <input required placeholder="Nom du sprint" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Objectif (optionnel)" className="input" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input required type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <input required type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary w-full h-9 text-sm">Créer</button>
          </form>
        </div>
      )}
    </div>
  );
}
