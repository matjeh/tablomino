'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfiles } from '@/lib/profile-context';
import { useT } from '@/lib/i18n';
import { getProfile } from '@/lib/repo';
import { Profile } from '@/lib/types';
import { AvatarPicker } from '@/components/AvatarPicker';
import { ProgressionPanel } from '@/components/ProgressionPanel';
import { Button } from '@/components/Button';
import { LoadingScreen } from '@/components/LoadingScreen';

// Query-param route (?id=123) rather than a dynamic [id] path segment: a
// static export needs every dynamic route enumerable via
// generateStaticParams(), which is structurally impossible here -- profile
// IDs are runtime-generated SQLite autoincrement integers, unknowable at
// build time. useSearchParams() requires a Suspense boundary when the page
// is statically prerendered, hence the wrapper below.
function ProfileEditor() {
  const searchParams = useSearchParams();
  const profileId = Number(searchParams.get('id'));
  const router = useRouter();
  const t = useT();
  const { removeProfile, updateAvatar } = useProfiles();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (!Number.isFinite(profileId)) {
      router.replace('/');
      return;
    }
    let cancelled = false;
    getProfile(profileId).then((p) => {
      if (cancelled) return;
      if (!p) {
        router.replace('/');
        return;
      }
      setProfile(p);
      setAvatar(p.avatar);
    });
    return () => {
      cancelled = true;
    };
  }, [profileId, router]);

  const changeAvatar = async (next: string) => {
    setAvatar(next);
    await updateAvatar(profileId, next);
  };

  const handleDelete = async () => {
    if (!confirm(t('profile.select.deleteConfirm'))) return;
    await removeProfile(profileId);
    router.push('/');
  };

  if (!profile) {
    return <LoadingScreen />;
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-5 py-8">
      <button
        onClick={() => router.push('/')}
        className="self-start text-sm font-semibold text-slate-400 hover:text-slate-600"
      >
        ← {t('common.back')}
      </button>

      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden>
          {avatar}
        </span>
        <h1 className="text-2xl font-black text-slate-700">{profile.name}</h1>
      </div>

      <ProgressionPanel profileId={profileId} />

      <section className="flex flex-col gap-2">
        <span className="font-bold text-slate-600">{t('profile.edit.avatarLabel')}</span>
        <AvatarPicker value={avatar} onChange={changeAvatar} />
      </section>

      <Button
        variant="ghost"
        onClick={handleDelete}
        className="mt-2 w-full text-rose-500 hover:text-rose-600"
      >
        {t('profile.edit.delete')}
      </Button>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProfileEditor />
    </Suspense>
  );
}
