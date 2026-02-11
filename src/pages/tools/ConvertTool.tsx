import { useState, useCallback } from "react";
import ImageUpload from "@/components/shared/ImageUpload";
import ResultPreview from "@/components/shared/ResultPreview";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  type ImageFile,
  loadImage,
  canvasToBlob,
  drawImageToCanvas,
  downloadBlob,
} from "@/lib/image-utils";
import { RefreshCw } from "lucide-react";

const formats = [
  { label: "JPG", mime: "image/jpeg", ext: "jpg" },
  { label: "PNG", mime: "image/png", ext: "png" },
  { label: "WEBP", mime: "image/webp", ext: "webp" },
];

const ConvertTool = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [format, setFormat] = useState(formats[0]);
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const isLossy = format.mime !== "image/png";

  const handleConvert = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    try {
      const img = await loadImage(image.preview);
      const canvas = drawImageToCanvas(img, img.naturalWidth, img.naturalHeight);
      const blob = await canvasToBlob(canvas, format.mime, isLossy ? quality / 100 : 1);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setProcessing(false);
    }
  }, [image, format, quality, isLossy]);

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
          style={{ backgroundColor: "hsl(var(--tool-convert) / 0.12)", color: "hsl(var(--tool-convert))" }}
        >
          <RefreshCw className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Convert Image</h1>
        <p className="text-muted-foreground text-sm mt-1">Switch between JPG, PNG, and WEBP</p>
      </div>

      {!result ? (
        <>
          <ImageUpload image={image} onImageLoad={setImage} onClear={() => setImage(null)} />
          {image && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs mb-2 block">Output Format</Label>
                <div className="flex gap-2">
                  {formats.map((f) => (
                    <Button
                      key={f.label}
                      size="sm"
                      variant={format.mime === f.mime ? "default" : "outline"}
                      onClick={() => setFormat(f)}
                    >
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>
              {isLossy && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quality</span>
                    <span className="font-medium">{quality}%</span>
                  </div>
                  <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={1} max={100} step={1} />
                </div>
              )}
              <Button onClick={handleConvert} disabled={processing} className="w-full h-12 text-base">
                {processing ? "Converting…" : `Convert to ${format.label}`}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ResultPreview
          originalSize={image!.file.size}
          resultSize={result.blob.size}
          resultUrl={result.url}
          onDownload={() => downloadBlob(result.blob, `converted-${image!.file.name.split(".")[0]}.${format.ext}`)}
          onReset={reset}
        />
      )}
    </div>
  );
};

export default ConvertTool;
