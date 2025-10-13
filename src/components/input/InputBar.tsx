import { Camera, Loader2, Send } from 'lucide-react';
import clsx from 'clsx';

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function InputBar({ value, onChange, onSubmit, placeholder = '请输入…', disabled }: InputBarProps) {
  const hasText = value.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full">
      <div
        className={clsx(
          'flex items-center gap-2 rounded-full px-3 py-2',
          'shadow-[0_10px_30px_rgba(15,23,42,0.12)] bg-white/90',
          disabled && 'opacity-80'
        )}
      >
        <div className="flex items-center">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 transition active:scale-95"
            aria-label="选择图片"
            disabled={disabled}
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={clsx(
            'flex-1 bg-transparent border-none outline-none text-sm',
            'text-gray-900 placeholder:text-gray-500'
          )}
        />
        <button
          type="button"
          onClick={() => hasText && onSubmit()}
          disabled={disabled || !hasText}
          className={clsx(
            'flex items-center justify-center w-12 h-12 rounded-full transition-all',
            hasText
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.45)] active:scale-95'
              : 'bg-gray-100 text-gray-400 shadow-inner cursor-not-allowed'
          )}
          aria-label="发送"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
