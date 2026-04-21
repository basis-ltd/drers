import { useCallback, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type MutationFn<T> = (args: { id: string; data: T }) => Promise<unknown>;

export function useAutoSave<T>(mutationFn: MutationFn<T>, applicationId: string) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (data: T) => {
      if (!applicationId) return;
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);

      setSaveStatus('saving');
      try {
        await mutationFn({ id: applicationId, data });
        setSaveStatus('saved');
        savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2500);
      } catch {
        setSaveStatus('error');
        savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
      }
    },
    [applicationId, mutationFn],
  );

  return { saveStatus, save };
}
