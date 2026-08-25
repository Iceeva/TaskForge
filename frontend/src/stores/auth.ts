import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Workspace } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setWorkspace: (workspace: Workspace) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  login: (user: User, token: string, refreshToken: string, workspaces: Workspace[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      workspace: null,
      workspaces: [],
      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      setWorkspace: (workspace) => set({ workspace }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      login: (user, token, refreshToken, workspaces) =>
        set({ user, token, refreshToken, workspaces, workspace: workspaces[0] || null }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, workspace: null, workspaces: [] }),
    }),
    { name: 'taskforge-auth' },
  ),
);
