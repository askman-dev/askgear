import { Bookmark, Folder, MoreVertical } from 'lucide-react';
import { IngestCard } from './IngestCard';
import { useState } from 'react';
import { TextExtractSheet } from './TextExtractSheet';
import { WebExtractSheet } from './WebExtractSheet';
import { ImageExtractSheet } from './ImageExtractSheet';

interface InsightTabProps {
  onStartChat?: (opts?: { prefill?: string }) => void;
}

export function InsightTab({ onStartChat }: InsightTabProps) {
  const [openTextSheet, setOpenTextSheet] = useState(false);
  const [openWebSheet, setOpenWebSheet] = useState(false);
  const [openImageSheet, setOpenImageSheet] = useState(false);
  return (
    <div className="h-full overflow-y-auto bg-violet-50">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 bg-violet-50/80 backdrop-blur border-b border-violet-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Folder className="w-6 h-6 text-gray-800" />
            <h1 className="text-2xl font-bold text-gray-900">Insight</h1>
          </div>
          <div className="flex items-center gap-4 text-gray-700">
            <Bookmark className="w-6 h-6" />
            <MoreVertical className="w-6 h-6" />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Section: I have data */}
        <div>
          <div className="text-gray-800 font-semibold mb-3">我已经有数据 ...</div>
          <div className="space-y-3">
            <IngestCard
              title="从文本提取"
              description="粘贴 ChatGPT的输出（或 Markdown格式的文本），提取其中的数据并导出为表格"
              onClick={() => setOpenTextSheet(true)}
            />
            <IngestCard
              title="从网页提取"
              description="输入网址，从页面中提取数据"
              onClick={() => setOpenWebSheet(true)}
            />
            <IngestCard
              title="从图片提取"
              description="上传图片，识别图中信息并提取出数据"
              onClick={() => setOpenImageSheet(true)}
            />
          </div>
        </div>

        {/* Section: AI research */}
        <div className="pt-2">
          <div className="text-gray-800 font-semibold mb-3">AI 深度研究 ...</div>

          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
            <div className="w-28 h-28 rounded-2xl bg-gray-200 flex items-center justify-center shrink-0">
              <div className="w-14 h-14 bg-gray-300 rounded-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-semibold text-gray-900">
                聊一聊你希望探讨的话题
              </div>
              <div className="text-gray-600 mt-1">supporting text</div>
              <div className="mt-4">
                <button
                  onClick={() => onStartChat?.()}
                  className="px-5 py-2.5 rounded-full bg-violet-600 text-white shadow-sm active:scale-[0.98]"
                >
                  聊一聊
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <TextExtractSheet
        open={openTextSheet}
        onClose={() => setOpenTextSheet(false)}
        onContinue={(txt) => onStartChat?.({ prefill: `请从以下文本中提取结构化数据，并以 Markdown 表格返回。\n\n${txt}` })}
      />
      <WebExtractSheet
        open={openWebSheet}
        onClose={() => setOpenWebSheet(false)}
        onContinue={(url) => onStartChat?.({ prefill: `请访问以下网页并提取结构化数据，返回 Markdown 表格：\n${url}` })}
      />
      <ImageExtractSheet
        open={openImageSheet}
        onClose={() => setOpenImageSheet(false)}
        onContinue={() => onStartChat?.({ prefill: '我将上传一张图片，请识别图中信息（如表格/票据/表单）并提取为结构化数据。' })}
      />
    </div>
  );
}
