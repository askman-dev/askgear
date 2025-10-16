import { useState } from 'react';
import { FileText } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';

interface TextExtractSheetProps {
  open: boolean;
  onClose: () => void;
  onContinue?: (text: string) => void;
}

const PRESET_CONTENT = `好的！下面是近两年常见的半画幅（APS-C）相机对比（覆盖你常聊的品牌与机型）：

型号      机身类型    传感器/像素  机身防抖    镜头类型 / 焦段       重量（含电池） 上市时间    USB 接口  关键参考
Ricoh GR IV     便携定焦    APS-C / 25.74MP 5 轴     固定 18.3 mm F2.8（等效 28 mm）       ≈262 g  2025-08 公布      USB-C（DP Alt 模式视频输出）    官方规格页、发布页（含 DP Alt/IBIS/像素）与重量报道。  ￼
Fujifilm X-E5   可换镜     APS-C / 40.2MP  有       X 卡口，可换镜头       ≈445 g  2024-01 USB-C（10 Gbps）  富士官方规格页（像素/重量/接口/快门等）。  ￼
Fujifilm X-M5   可换镜     APS-C / 26.1MP  无（机内为电子防抖/视频）   X 卡口，可换镜头       ≈355 g  2024-late       USB-C（10 Gbps）  富士官方规格页（重量/接口/防抖说明）。  ￼
Fujifilm X-S20  可换镜     APS-C / 26.1MP  有（最高 7 档）       X 卡口，可换镜头       ≈491 g  2023-05 USB-C   富士官网产品/规格与新闻稿（IBIS 7 档、重量）。  ￼
Fujifilm X-T50  可换镜     APS-C / 40MP    有（IBIS） X 卡口，可换镜头       —       2024-05 USB-C   规格综述/评测页面。  ￼
Fujifilm X100VI 便携定焦    APS-C / 40MP    有（IBIS） 固定 23 mm F2（等效 35 mm）   —       2024-02 USB-C   DPR 全规格与多家评测（APS-C/IBIS）。  ￼
Sony ZV-E10 II  可换镜（视频向）        APS-C / 26MP    机身无（电子增稳/视频）    E 卡口，可换镜头       377 g   2024-07 USB-C（PD 供电）    DPR/B&H 与索尼规格（重量/尺寸/USB）。  ￼
Sony a6700      可换镜     APS-C / 26MP    有（5 轴）  E 卡口，可换镜头       493 g   2023-07 USB-C（PD）       索尼官方规格与 DPR/B&H（重量/防抖）。  ￼
Canon EOS R50   可换镜（入门） APS-C / 24.2MP  无       RF-S 卡口，可换镜头    375 g   2023-02 USB-C   佳能官网规格（传感器/重量/尺寸）。  ￼

说明与取舍
        •       表中优先收录 2023–2025 的主流 APS-C 机型，覆盖你最近常对比的 GR 系、富士 X 系、索尼 ZV/a 系与佳能入门 RF-S。
        •       若你只想看「便携固定镜头」或「带 IBIS」或「≤400 g」等子集，我可以马上按条件再出一版筛选表。
        •       需要我把这张表导出为 Excel / CSV / PDF 吗？我可以直接生成文件。`;

export function TextExtractSheet({ open, onClose, onContinue }: TextExtractSheetProps) {
  const [text, setText] = useState('');

  const handleContinue = () => {
    onContinue?.(text.trim());
    onClose();
  };

  const fillPresetContent = () => {
    setText(PRESET_CONTENT);
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold text-gray-900">从文本提取</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fillPresetContent}
            className="px-4 h-10 rounded-full bg-gray-100 text-gray-800 shadow-sm active:scale-[0.98] hover:bg-gray-200 transition-colors flex items-center gap-2"
            title="填充相机对比表格示例"
          >
            <FileText className="w-4 h-4" />
            预设内容
          </button>
          <button
            onClick={handleContinue}
            className="px-5 h-10 rounded-full bg-gray-900 text-white shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!text.trim()}
          >
            继续
          </button>
        </div>
      </div>
      <div className="mb-4">
        <div className="rounded-xl border border-gray-300 bg-gray-50">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="支持 Markdown 格式的文本"
            rows={10}
            className="w-full p-4 bg-transparent outline-none resize-none text-gray-900"
          />
        </div>
      </div>
    </BottomSheet>
  );
}
