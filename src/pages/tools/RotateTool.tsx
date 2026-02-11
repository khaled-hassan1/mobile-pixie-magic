import { useState, useCallback } from "react";
import ImageUpload from "@/components/shared/ImageUpload";
import ResultPreview from "@/components/shared/ResultPreview";
import { Button } from "@/components/ui/button";
import {
  type ImageFile,
  loadImage,
  canvasToBlob,
  downloadBlob,
} from "@/lib/image-utils";
import { RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";

const RotateTool = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcess = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    try {
      const img = await loadImage(image.preview);
      const rad = (rotation * Math.PI) / 180;
      const swap = rotation === 90 || rotation === 270;
      const cw = swap ? img.naturalHeight : img.naturalWidth;
      const ch = swap ? img.naturalWidth : img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      const blob = await canvasToBlob(canvas, "image/png", 1);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setProcessing(false);
    }
  }, [image, rotation, flipH, flipV]);

  const reset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setImage(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const previewStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    transition: "transform 0.2s",
  };

  return (
    <div className="container max-w-lg py-8 space-y-6">
      <div className="text-center">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3"
          style={{ backgroundColor: "hsl(var(--tool-rotate) / 0.12)", color: "hsl(var(--tool-rotate))" }}
        >
          <RotateCw className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Rotate & Flip</h1>
        <p className="text-muted-foreground text-sm mt-1">Rotate or mirror your images instantly</p>
      </div>

      {!result ? (
        <>
          <ImageUpload image={image} onImageLoad={setImage} onClear={() => setImage(null)} />
          {image && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted overflow-hidden flex items-center justify-center p-4">
                <img
                  src={image.preview}
                  alt="Preview"
                  className="max-h-48 object-contain"
                  style={previewStyle}
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
                  <RotateCw className="h-4 w-4 mr-1" /> 90°
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 180) % 360)}>
                  180°
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFlipH((f) => !f)}>
                  <FlipHorizontal className="h-4 w-4 mr-1" /> Flip H
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFlipV((f) => !f)}>
                  <FlipVertical className="h-4 w-4 mr-1" /> Flip V
                </Button>
              </div>
              <Button onClick={handleProcess} disabled={processing} className="w-full h-12 text-base">
                {processing ? "Processing…" : "Apply Changes"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ResultPreview
          originalSize={image!.file.size}
          resultSize={result.blob.size}
          resultUrl={result.url}
          onDownload={() => downloadBlob(result.blob, `rotated-${image!.file.name}`)}
          onReset={reset}
        />
      )}
    </div>
  );
};

export default RotateTool;
