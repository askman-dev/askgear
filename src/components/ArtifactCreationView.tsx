import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ArtifactChatOverlay } from './ArtifactChatOverlay';
import { ComponentPreview } from './ComponentPreview';

interface ArtifactCreationViewProps {
  initialText?: string;
  onBack: () => void;
}

export function ArtifactCreationView({ initialText, onBack }: ArtifactCreationViewProps) {
  const [showChat, setShowChat] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  // Handle preview update from chat
  const handlePreviewUpdate = () => {
    setPreviewKey(prev => prev + 1);
  };

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
        <div className="max-w-4xl w-full h-full p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 h-full overflow-auto">
            <ComponentPreview key={previewKey} className="h-full" />
          </div>
        </div>
      </div>

      {/* Floating Chat Overlay */}
      {showChat && (
        <ArtifactChatOverlay
          initialText={initialText}
          onClose={() => setShowChat(false)}
          onBack={onBack}
          onPreviewUpdate={handlePreviewUpdate}
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
