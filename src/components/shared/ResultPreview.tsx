import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { formatFileSize } from "@/lib/image-utils";

interface ResultPreviewProps {
  originalSize: number;
  resultSize: number;
  resultUrl: string;
  onDownload: () => void;
  onReset: () => void;
  label?: string;
}

const ResultPreview = ({
  originalSize,
  resultSize,
  resultUrl,
  onDownload,
  onReset,
  label = "Result",
}: ResultPreviewProps) => {
  const saved = originalSize - resultSize;
  const pct = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card overflow-hidden">
        <img src={resultUrl} alt={label} className="w-full max-h-64 object-contain bg-muted" />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Original: {formatFileSize(originalSize)}</p>
          <p className="font-medium">Result: {formatFileSize(resultSize)}</p>
        </div>
        {saved > 0 && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {pct}% smaller
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={onDownload} className="flex-1 h-12 text-base">
          <Download className="h-5 w-5 mr-2" />
          Download
        </Button>
        <Button variant="outline" onClick={onReset} className="h-12">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ResultPreview;
