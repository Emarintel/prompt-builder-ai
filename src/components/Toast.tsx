import { Check } from 'lucide-react';

interface Props { message: string | null; }

export function Toast({ message }: Props) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2
        px-4 py-2.5 rounded-full bg-gray-900 dark:bg-white
        text-white dark:text-gray-900 text-sm font-medium
        shadow-2xl shadow-black/20 pointer-events-none select-none whitespace-nowrap
        animate-slide-up"
    >
      <Check size={13} strokeWidth={2.5} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
      {message}
    </div>
  );
}
