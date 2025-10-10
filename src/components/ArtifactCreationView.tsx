import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ArtifactChatOverlay } from './ArtifactChatOverlay';

interface ArtifactCreationViewProps {
  initialText?: string;
  onBack: () => void;
}

export function ArtifactCreationView({ initialText, onBack }: ArtifactCreationViewProps) {
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="relative h-full w-full bg-gray-100">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="返回首页"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h1 className="text-lg font-semibold text-gray-900">创建组件</h1>
          </div>
        </div>
      </div>

      {/* Bottom Layer: Component Preview - adjusted padding for header */}
      <div className="absolute inset-0 pt-16 flex items-center justify-center">
        <div className="max-w-4xl w-full p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[400px]">
            {/* Placeholder for React component preview */}
            <div className="text-center text-gray-500">
              <div className="inline-block p-6 bg-gray-50 rounded-xl mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-400 to-purple-400 rounded-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                组件预览区域
              </h3>
              <p className="text-sm text-gray-600">
                通过对话创建的 React 组件将在此处实时渲染预览
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Overlay */}
      {showChat && (
        <ArtifactChatOverlay
          initialText={initialText}
          onClose={() => setShowChat(false)}
          onBack={onBack}
        />
      )}

      {/* Toggle Chat Button (when chat is hidden) */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 px-6 py-3 rounded-full bg-violet-600 text-white shadow-lg active:scale-[0.98]"
        >
          打开对话
        </button>
      )}
    </div>
  );
}
