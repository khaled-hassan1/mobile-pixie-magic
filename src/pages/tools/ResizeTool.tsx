import { useState, useCallback, useEffect } from "react";
import ImageUpload from "@/components/shared/ImageUpload";
import ResultPreview from "@/components/shared/ResultPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  type ImageFile,
  loadImage,
  canvasToBlob,
  drawImageToCanvas,
  downloadBlob,
} from "@/lib/image-utils";
import { Maximize } from "lucide-react";

const presets = [
  { label: "Instagram Post", w: 1080, h: 1080 },
  { label: "Instagram Story", w: 1080, h: 1920 },
  { label: "Facebook Cover", w: 820, h: 312 },
  { label: "Twitter Header", w: 1500, h: 500 },
];

const ResizeTool = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (image) {
      setWidth(image.width);
      setHeight(image.height);
    }
  }, [image]);

  const aspect = image ? image.width / image.height : 1;

  const onWidthChange = (v: number) => {
    setWidth(v);
    if (lockRatio) setHeight(Math.round(v / aspect));
  };

  const onHeightChange = (v: number) => {
    setHeight(v);
    if (lockRatio) setWidth(Math.round(v * aspect));
  };

  const handleResize = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    try {
      const img = await loadImage(image.preview);
      const canvas = drawImageToCanvas(img, width, height);
      const blob = await canvasToBlob(canvas, "image/png", 1);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setProcessing(false);
    }
  }, [image, width, height]);

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
          style={{ backgroundColor: "hsl(var(--tool-resize) / 0.12)", color: "hsl(var(--tool-resize))" }}
        >
          <Maximize className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Resize Image</h1>
        <p className="text-muted-foreground text-sm mt-1">Change dimensions with aspect ratio control</p>
      </div>

      {!result ? (
        <>
          <ImageUpload image={image} onImageLoad={setImage} onClear={() => setImage(null)} />
          {image && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Width (px)</Label>
                  <Input type="number" value={width} onChange={(e) => onWidthChange(Number(e.target.value))} min={1} />
                </div>
                <div>
                  <Label className="text-xs">Height (px)</Label>
                  <Input type="number" value={height} onChange={(e) => onHeightChange(Number(e.target.value))} min={1} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={lockRatio} onCheckedChange={setLockRatio} id="lock" />
                <Label htmlFor="lock" className="text-sm">Lock aspect ratio</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <Button
                    key={p.label}
                    variant="outline"
                    size="sm"
                    onClick={() => { setWidth(p.w); setHeight(p.h); }}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <Button onClick={handleResize} disabled={processing} className="w-full h-12 text-base">
                {processing ? "Resizing…" : "Resize Image"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ResultPreview
          originalSize={image!.file.size}
          resultSize={result.blob.size}
          resultUrl={result.url}
          onDownload={() => downloadBlob(result.blob, `resized-${image!.file.name}`)}
          onReset={reset}
        />
      )}
    </div>
  );
};

export default ResizeTool;
