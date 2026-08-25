import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CheckCircle2, AlertTriangle, Clock3, TrendingUp, Download } from 'lucide-react';
import api from '../lib/api';
import { getInitials } from '../lib/utils';
import type { AnalyticsOverview } from '../types';

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#fb7185', HIGH: '#fbbf24', MEDIUM: '#38bdf8', LOW: '#a1a1aa', NONE: '#52525b',
};

export default function ProjectAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get('/analytics/project', { params: { projectId: id } })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  function exportCsv() {
    if (!id) return;
    api.get('/tasks/export', { params: { projectId: id }, responseType: 'blob' }).then((r) => {
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tasks-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const priorityData = Object.entries(data.byPriority).map(([name, value]) => ({ name, value }));

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Analytics</h1>
        <button onClick={exportCsv} className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" /> Exporter en CSV
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-zinc-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Taux de complétion</p>
          <p className="text-2xl font-bold">{data.completionRate}%</p>
          <p className="text-[11px] text-zinc-600">{data.completed}/{data.total} tâches</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-zinc-500 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /> En retard</p>
          <p className="text-2xl font-bold text-red-400">{data.overdue}</p>
          <p className="text-[11px] text-zinc-600">tâches en dépassement</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-zinc-500 flex items-center gap-1"><Clock3 className="w-3.5 h-3.5 text-amber-400" /> À échéance proche</p>
          <p className="text-2xl font-bold text-amber-400">{data.dueSoon}</p>
          <p className="text-[11px] text-zinc-600">dans les 3 prochains jours</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-zinc-500 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Charge estimée</p>
          <p className="text-2xl font-bold">{data.totalEstimatedHours}h</p>
          <p className="text-[11px] text-zinc-600">sur l'ensemble du projet</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Trend chart */}
        <div className="card p-4 md:col-span-2">
          <p className="text-sm font-semibold mb-3">Tâches complétées (14 derniers jours)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.trend}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="completed" stroke="#7c5cff" strokeWidth={2} fill="url(#trendGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority pie */}
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Répartition par priorité</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#71717a'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {priorityData.map((p) => (
              <span key={p.name} className="flex items-center gap-1 text-[10px] text-zinc-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p.name] }} />
                {p.name} ({p.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By column */}
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Tâches par colonne</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.byColumn} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} width={90} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.byColumn.map((c) => <Cell key={c.columnId} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By assignee */}
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Charge par membre</p>
          <div className="space-y-3 mt-2">
            {data.byAssignee.length === 0 && <p className="text-xs text-zinc-600 italic">Aucune tâche assignée</p>}
            {data.byAssignee.map(({ user, total, completed }) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-brand-400">{getInitials(user.name || '?')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="truncate">{user.name}</span>
                    <span className="text-zinc-500">{completed}/{total}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
