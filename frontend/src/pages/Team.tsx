import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Shield, MoreVertical, Crown, UserCheck, UserX } from 'lucide-react';
import { cn, getInitials } from '../lib/utils';

const demoMembers = [
  { id: '1', name: 'John Doe', email: 'john@taskforge.io', role: 'OWNER', joinedAt: '2024-01-15' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@taskforge.io', role: 'ADMIN', joinedAt: '2024-02-20' },
  { id: '3', name: 'Alex Chen', email: 'alex@taskforge.io', role: 'MEMBER', joinedAt: '2024-03-10' },
  { id: '4', name: 'Emily Park', email: 'emily@taskforge.io', role: 'MEMBER', joinedAt: '2024-04-05' },
  { id: '5', name: 'Mike Johnson', email: 'mike@taskforge.io', role: 'VIEWER', joinedAt: '2024-05-12' },
];

const pendingInvites = [
  { email: 'dev@taskforge.io', role: 'MEMBER', sentAt: '2024-06-20' },
  { email: 'designer@taskforge.io', role: 'VIEWER', sentAt: '2024-06-22' },
];

const roleColors: Record<string, string> = {
  OWNER: 'text-amber-400 bg-amber-500/10',
  ADMIN: 'text-purple-400 bg-purple-500/10',
  MEMBER: 'text-blue-400 bg-blue-500/10',
  VIEWER: 'text-zinc-400 bg-zinc-500/10',
};

const roleIcons: Record<string, any> = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: UserCheck,
  VIEWER: Users,
};

export default function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage workspace members and roles</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="btn-primary text-xs flex items-center gap-1">
          <Plus className="w-3 h-3" /> Invite Member
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card p-4 border-brand-500/30"
        >
          <h3 className="text-sm font-medium mb-3">Send an invitation</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="email" placeholder="email@company.com" className="input pl-10" />
            </div>
            <select className="input w-28">
              <option>Member</option>
              <option>Admin</option>
              <option>Viewer</option>
            </select>
            <button className="btn-primary text-xs">Send</button>
          </div>
        </motion.div>
      )}

      {/* Members */}
      <div className="card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-800/20">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Members ({demoMembers.length})</h3>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {demoMembers.map((member, i) => {
            const Icon = roleIcons[member.role] || Users;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/20 transition"
              >
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-brand-400">{getInitials(member.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-[10px] text-zinc-500">{member.email}</p>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1', roleColors[member.role])}>
                  <Icon className="w-3 h-3" /> {member.role}
                </span>
                <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-zinc-800 text-zinc-600 transition">
                  <MoreVertical className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pending */}
      <div className="card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-800/20">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending Invitations ({pendingInvites.length})</h3>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {pendingInvites.map((inv, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{inv.email}</p>
                <p className="text-[10px] text-zinc-600">Sent {inv.sentAt}</p>
              </div>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', roleColors[inv.role])}>
                {inv.role}
              </span>
              <button className="text-[10px] text-red-400 hover:underline">Revoke</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
