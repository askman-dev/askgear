import { useEffect, useRef } from 'react';
import clsx from 'clsx';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto w-full max-w-2xl">
          <div
            ref={sheetRef}
            className={clsx(
              'bg-white rounded-t-3xl shadow-2xl',
              'max-h-[86vh] overflow-hidden'
            )}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-14 h-1.5 rounded-full bg-gray-300" />
            </div>
            <div className="px-4 pb-4 relative">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
