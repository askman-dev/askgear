import { Loader2, Send } from 'lucide-react';
import clsx from 'clsx';

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function InputBar({ value, onChange, onSubmit, placeholder = '请输入…', disabled }: InputBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          'flex-1 h-11 rounded-2xl border border-gray-300 bg-gray-50 px-4 outline-none',
          'text-gray-900 placeholder:text-gray-500'
        )}
      />
      <button
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        className="shrink-0 w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
      </button>
    </div>
  );
}
