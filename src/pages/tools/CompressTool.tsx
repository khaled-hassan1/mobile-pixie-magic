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
import { FileDown } from "lucide-react";

const CompressTool = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [quality, setQuality] = useState(75);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCompress = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    try {
      const img = await loadImage(image.preview);
      const canvas = drawImageToCanvas(img, img.naturalWidth, img.naturalHeight);
      const blob = await canvasToBlob(canvas, "image/webp", quality / 100);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch {
      // handle error
    } finally {
      setProcessing(false);
    }
  }, [image, quality]);

  const reset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setImage(null);
  };

  return (
    <div className="container max-w-lg py-8 space-y-6">
      <div className="text-center">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3"
          style={{ backgroundColor: "hsl(var(--tool-compress) / 0.12)", color: "hsl(var(--tool-compress))" }}
        >
          <FileDown className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Compress Image</h1>
        <p className="text-muted-foreground text-sm mt-1">Reduce file size while keeping quality</p>
      </div>

      {!result ? (
        <>
          <ImageUpload image={image} onImageLoad={setImage} onClear={() => setImage(null)} />

          {image && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quality</span>
                  <span className="font-medium">{quality}%</span>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={([v]) => setQuality(v)}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
              <Button onClick={handleCompress} disabled={processing} className="w-full h-12 text-base">
                {processing ? "Compressing…" : "Compress Image"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ResultPreview
          originalSize={image!.file.size}
          resultSize={result.blob.size}
          resultUrl={result.url}
          onDownload={() => downloadBlob(result.blob, `compressed-${image!.file.name.split(".")[0]}.webp`)}
          onReset={reset}
        />
      )}
    </div>
  );
};

export default CompressTool;
