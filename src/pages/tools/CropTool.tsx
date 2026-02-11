import { useState, useCallback, useRef, useEffect } from "react";
import ImageUpload from "@/components/shared/ImageUpload";
import ResultPreview from "@/components/shared/ResultPreview";
import { Button } from "@/components/ui/button";
import {
  type ImageFile,
  loadImage,
  canvasToBlob,
  downloadBlob,
} from "@/lib/image-utils";
import { Crop as CropIcon } from "lucide-react";

const ratios = [
  { label: "Free", value: 0 },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

const CropTool = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ratio, setRatio] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Crop box state (relative 0-1)
  const [cropBox, setCropBox] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const dragging = useRef<{ type: string; startX: number; startY: number; startBox: typeof cropBox } | null>(null);

  useEffect(() => {
    if (image && ratio > 0) {
      const imgAspect = image.width / image.height;
      const cropAspect = ratio;
      let w = 0.8, h = 0.8;
      if (cropAspect > imgAspect) {
        w = 0.8;
        h = (w * imgAspect) / cropAspect;
      } else {
        h = 0.8;
        w = (h * cropAspect) / imgAspect;
      }
      setCropBox({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
    } else if (image) {
      setCropBox({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
    }
  }, [image, ratio]);

  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getEventPos(e);
    dragging.current = { type: "move", startX: pos.x, startY: pos.y, startBox: { ...cropBox } };
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    const pos = getEventPos(e);
    const dx = pos.x - dragging.current.startX;
    const dy = pos.y - dragging.current.startY;
    const b = dragging.current.startBox;
    setCropBox({
      ...b,
      x: Math.max(0, Math.min(1 - b.w, b.x + dx)),
      y: Math.max(0, Math.min(1 - b.h, b.y + dy)),
    });
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  const handleCrop = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    try {
      const img = await loadImage(image.preview);
      const sx = Math.round(cropBox.x * img.naturalWidth);
      const sy = Math.round(cropBox.y * img.naturalHeight);
      const sw = Math.round(cropBox.w * img.naturalWidth);
      const sh = Math.round(cropBox.h * img.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const blob = await canvasToBlob(canvas, "image/png", 1);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setProcessing(false);
    }
  }, [image, cropBox]);

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
          style={{ backgroundColor: "hsl(var(--tool-crop) / 0.12)", color: "hsl(var(--tool-crop))" }}
        >
          <CropIcon className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Crop Image</h1>
        <p className="text-muted-foreground text-sm mt-1">Cut and frame your images perfectly</p>
      </div>

      {!result ? (
        <>
          <ImageUpload image={!image ? null : image} onImageLoad={setImage} onClear={() => setImage(null)} />
          {image && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {ratios.map((r) => (
                  <Button
                    key={r.label}
                    size="sm"
                    variant={ratio === r.value ? "default" : "outline"}
                    onClick={() => setRatio(r.value)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>

              <div
                ref={containerRef}
                className="relative select-none touch-none rounded-lg overflow-hidden bg-muted"
                onMouseMove={onPointerMove}
                onMouseUp={onPointerUp}
                onMouseLeave={onPointerUp}
                onTouchMove={onPointerMove}
                onTouchEnd={onPointerUp}
              >
                <img src={image.preview} alt="Crop" className="w-full block" draggable={false} />
                {/* Overlay */}
                <div className="absolute inset-0 bg-foreground/40" />
                {/* Crop window */}
                <div
                  className="absolute border-2 border-primary-foreground cursor-move"
                  style={{
                    left: `${cropBox.x * 100}%`,
                    top: `${cropBox.y * 100}%`,
                    width: `${cropBox.w * 100}%`,
                    height: `${cropBox.h * 100}%`,
                    boxShadow: "0 0 0 9999px hsl(var(--foreground) / 0.5)",
                  }}
                  onMouseDown={onPointerDown}
                  onTouchStart={onPointerDown}
                />
              </div>

              <Button onClick={handleCrop} disabled={processing} className="w-full h-12 text-base">
                {processing ? "Cropping…" : "Crop Image"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ResultPreview
          originalSize={image!.file.size}
          resultSize={result.blob.size}
          resultUrl={result.url}
          onDownload={() => downloadBlob(result.blob, `cropped-${image!.file.name}`)}
          onReset={reset}
        />
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CropTool;
