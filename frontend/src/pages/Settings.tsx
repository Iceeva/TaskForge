import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Shield, Bell, Palette, Save, Camera, Lock, Key, Trash2 } from 'lucide-react';
import { useAuthStore } from '../stores/auth';
import { cn, getInitials } from '../lib/utils';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const;

export default function SettingsPage() {
  const { user, workspace } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('profile');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex gap-6">
        <div className="w-44 space-y-0.5 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition',
                activeTab === tab.id ? 'bg-brand-500/10 text-brand-400 font-medium' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 max-w-xl">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Profile Information</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-brand-400">{getInitials(user?.name || 'U')}</span>
                    </div>
                    <button className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user?.name || 'User'}</p>
                    <p className="text-xs text-zinc-500">{user?.email}</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Name</label>
                    <input type="text" defaultValue={user?.name || ''} className="input" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Email</label>
                    <input type="email" defaultValue={user?.email || ''} className="input" />
                  </div>
                </div>
                <button className="btn-primary text-xs mt-4 flex items-center gap-1">
                  <Save className="w-3 h-3" /> Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'workspace' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Workspace Settings</h3>
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Workspace Name</label>
                    <input type="text" defaultValue={workspace?.name || ''} className="input" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Slug</label>
                    <input type="text" defaultValue={workspace?.slug || ''} className="input" />
                  </div>
                </div>
                <button className="btn-primary text-xs mt-4 flex items-center gap-1">
                  <Save className="w-3 h-3" /> Save
                </button>
              </div>
              <div className="card p-6 border-red-500/20">
                <h3 className="font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-xs text-zinc-500 mb-4">Deleting a workspace is permanent and cannot be undone.</p>
                <button className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete Workspace
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Task Assigned', desc: 'When a task is assigned to you', on: true },
                    { title: 'Comments', desc: 'When someone comments on your tasks', on: true },
                    { title: 'Due Dates', desc: 'Reminders for upcoming deadlines', on: true },
                    { title: 'Mentions', desc: 'When you are @mentioned', on: true },
                    { title: 'Weekly Digest', desc: 'Weekly summary of workspace activity', on: false },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-medium">{pref.title}</p>
                        <p className="text-[10px] text-zinc-500">{pref.desc}</p>
                      </div>
                      <button className={cn('w-9 h-5 rounded-full relative transition', pref.on ? 'bg-brand-500' : 'bg-zinc-700')}>
                        <div className={cn('w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all', pref.on ? 'left-[18px]' : 'left-0.5')} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="card p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Key className="w-4 h-4" /> Two-Factor Auth</h3>
                <p className="text-xs text-zinc-500 mb-4">Add extra security with TOTP-based 2FA.</p>
                <button className="btn-primary text-xs">Enable 2FA</button>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</h3>
                <div className="grid gap-3 max-w-xs">
                  <input type="password" placeholder="Current password" className="input" />
                  <input type="password" placeholder="New password" className="input" />
                  <input type="password" placeholder="Confirm new password" className="input" />
                  <button className="btn-primary text-xs w-full">Update Password</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['Light', 'Dark', 'System'].map(t => (
                    <button key={t} className={cn('p-3 rounded-xl border transition text-center', t === 'Dark' ? 'border-brand-500 bg-brand-500/10' : 'border-zinc-800 hover:border-zinc-600')}>
                      <div className={cn('w-full h-14 rounded-lg mb-2', t === 'Dark' ? 'bg-zinc-900' : t === 'Light' ? 'bg-white' : 'bg-gradient-to-r from-white to-zinc-900')} />
                      <span className="text-xs">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
