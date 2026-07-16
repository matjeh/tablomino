'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfiles } from '@/lib/profile-context';
import { useT } from '@/lib/i18n';
import { AVATARS } from '@/lib/ui';
import { AvatarPicker } from '@/components/AvatarPicker';
import { Button } from '@/components/Button';

export default function NewProfilePage() {
  const router = useRouter();
  const t = useT();
  const { addProfile, select } = useProfiles();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    const id = await addProfile(trimmed, avatar);
    select(id);
    router.push('/config');
  };

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-5 py-10">
      <button
        onClick={() => router.push('/')}
        className="self-start text-sm font-semibold text-slate-400 hover:text-slate-600"
      >
        ← {t('common.back')}
      </button>

      <h1 className="text-3xl font-black text-slate-700">{t('profile.new.title')}</h1>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="font-bold text-slate-600">{t('profile.new.nameLabel')}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('profile.new.namePlaceholder')}
            maxLength={16}
            autoFocus
            className="rounded-2xl bg-white px-5 py-4 text-xl font-bold text-slate-700 ring-2 ring-slate-200 outline-none focus:ring-violet-400"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-600">{t('profile.new.avatarLabel')}</span>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>

        <Button type="submit" disabled={!name.trim() || busy} className="w-full">
          {t('profile.new.create')}
        </Button>
      </form>
    </main>
  );
}
