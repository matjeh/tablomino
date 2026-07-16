'use client';

// Current-profile selection, persisted to localStorage so the app reopens on
// the last player. Profile records themselves live in IndexedDB.

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createProfile, deleteProfile, listProfiles, updateProfileAvatar } from './repo';
import { Profile } from './types';

const STORAGE_KEY = 'tablomino.currentProfileId';

interface ProfileValue {
  profiles: Profile[];
  current: Profile | null;
  loading: boolean;
  select: (id: number) => void;
  clearSelection: () => void;
  addProfile: (name: string, avatar: string) => Promise<number>;
  removeProfile: (id: number) => Promise<void>;
  updateAvatar: (id: number, avatar: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await listProfiles();
    setProfiles(list);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCurrentId(Number(stored));
      setLoading(false);
    })();
  }, [refresh]);

  const select = useCallback((id: number) => {
    setCurrentId(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  const clearSelection = useCallback(() => {
    setCurrentId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addProfile = useCallback(
    async (name: string, avatar: string) => {
      const id = await createProfile(name, avatar);
      await refresh();
      return id;
    },
    [refresh],
  );

  const removeProfile = useCallback(
    async (id: number) => {
      await deleteProfile(id);
      if (id === currentId) clearSelection();
      await refresh();
    },
    [currentId, clearSelection, refresh],
  );

  const updateAvatar = useCallback(
    async (id: number, avatar: string) => {
      await updateProfileAvatar(id, avatar);
      await refresh();
    },
    [refresh],
  );

  const current = profiles.find((p) => p.id === currentId) ?? null;

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        current,
        loading,
        select,
        clearSelection,
        addProfile,
        removeProfile,
        updateAvatar,
        refresh,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfiles(): ProfileValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfiles must be used within ProfileProvider');
  return ctx;
}
