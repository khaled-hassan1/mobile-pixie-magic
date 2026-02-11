import { useState, useCallback } from "react";
import ImageUpload from "@/components/shared/ImageUpload";
import ResultPreview from "@/components/shared/ResultPreview";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  type ImageFile,
  loadImage,
  canvasToBlob,
  drawImageToCanvas,
  downloadBlob,
  formatFileSize,
} from "@/lib/image-utils";
import { SlidersHorizontal } from "lucide-react";

const QualityTool = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [quality, setQuality] = useState(80);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const estimate = useCallback(
    async (q: number) => {
      if (!image) return;
      const img = await loadImage(image.preview);
      const canvas = drawImageToCanvas(img, img.naturalWidth, img.naturalHeight);
      const blob = await canvasToBlob(canvas, "image/jpeg", q / 100);
      setEstimatedSize(blob.size);
    },
    [image]
  );

  const onQualityChange = (v: number) => {
    setQuality(v);
    estimate(v);
  };

  const handleProcess = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    try {
      const img = await loadImage(image.preview);
      const canvas = drawImageToCanvas(img, img.naturalWidth, img.naturalHeight);
      const blob = await canvasToBlob(canvas, "image/jpeg", quality / 100);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setProcessing(false);
    }
  }, [image, quality]);

  const reset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setImage(null);
    setEstimatedSize(null);
  };

  return (
    <div className="container max-w-lg py-8 space-y-6">
      <div className="text-center">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3"
          style={{ backgroundColor: "hsl(var(--tool-quality) / 0.12)", color: "hsl(var(--tool-quality))" }}
        >
          <SlidersHorizontal className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Change Quality</h1>
        <p className="text-muted-foreground text-sm mt-1">Fine-tune image quality and file size</p>
      </div>

      {!result ? (
        <>
          <ImageUpload image={image} onImageLoad={(img) => { setImage(img); }} onClear={() => { setImage(null); setEstimatedSize(null); }} />
          {image && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quality</span>
                  <span className="font-medium">{quality}%</span>
                </div>
                <Slider value={[quality]} onValueChange={([v]) => onQualityChange(v)} min={1} max={100} step={1} />
              </div>
              {estimatedSize !== null && (
                <p className="text-sm text-muted-foreground">
                  Estimated size: <span className="font-medium text-foreground">{formatFileSize(estimatedSize)}</span>
                  {" "}(original: {formatFileSize(image.file.size)})
                </p>
              )}
              <Button onClick={handleProcess} disabled={processing} className="w-full h-12 text-base">
                {processing ? "Processing…" : "Apply Quality"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ResultPreview
          originalSize={image!.file.size}
          resultSize={result.blob.size}
          resultUrl={result.url}
          onDownload={() => downloadBlob(result.blob, `quality-${image!.file.name.split(".")[0]}.jpg`)}
          onReset={reset}
        />
      )}
    </div>
  );
};

export default QualityTool;
