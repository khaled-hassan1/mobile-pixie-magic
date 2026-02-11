import { useState, useCallback } from "react";
import ImageUpload from "@/components/shared/ImageUpload";
import ResultPreview from "@/components/shared/ResultPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ImageFile,
  loadImage,
  canvasToBlob,
  drawImageToCanvas,
  downloadBlob,
} from "@/lib/image-utils";
import { Droplets } from "lucide-react";

const positions = [
  { label: "Center", x: 0.5, y: 0.5 },
  { label: "Top-Left", x: 0.15, y: 0.15 },
  { label: "Top-Right", x: 0.85, y: 0.15 },
  { label: "Bottom-Left", x: 0.15, y: 0.85 },
  { label: "Bottom-Right", x: 0.85, y: 0.85 },
];

const WatermarkTool = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  // Text watermark
  const [text, setText] = useState("Sample Watermark");
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState(positions[0]);
  const [diagonal, setDiagonal] = useState(false);

  const handleTextWatermark = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    try {
      const img = await loadImage(image.preview);
      const canvas = drawImageToCanvas(img, img.naturalWidth, img.naturalHeight);
      const ctx = canvas.getContext("2d")!;
      ctx.globalAlpha = opacity / 100;
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (diagonal) {
        const step = fontSize * 3;
        ctx.save();
        ctx.rotate(-Math.PI / 6);
        for (let y = -canvas.height; y < canvas.height * 2; y += step) {
          for (let x = -canvas.width; x < canvas.width * 2; x += step) {
            ctx.fillText(text, x, y);
          }
        }
        ctx.restore();
      } else {
        ctx.fillText(text, canvas.width * position.x, canvas.height * position.y);
      }

      const blob = await canvasToBlob(canvas, "image/png", 1);
      setResult({ blob, url: URL.createObjectURL(blob) });
    } finally {
      setProcessing(false);
    }
  }, [image, text, fontSize, color, opacity, position, diagonal]);

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
          style={{ backgroundColor: "hsl(var(--tool-watermark) / 0.12)", color: "hsl(var(--tool-watermark))" }}
        >
          <Droplets className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Add Watermark</h1>
        <p className="text-muted-foreground text-sm mt-1">Protect images with text or logo overlays</p>
      </div>

      {!result ? (
        <>
          <ImageUpload image={image} onImageLoad={setImage} onClear={() => setImage(null)} />
          {image && (
            <Tabs defaultValue="text">
              <TabsList className="w-full">
                <TabsTrigger value="text" className="flex-1">Text</TabsTrigger>
                <TabsTrigger value="image" className="flex-1" disabled>Image (soon)</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs">Watermark Text</Label>
                  <Input value={text} onChange={(e) => setText(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Font Size</Label>
                    <Input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} min={8} />
                  </div>
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Opacity</span>
                    <span>{opacity}%</span>
                  </div>
                  <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={5} max={100} step={1} />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Position</Label>
                  <div className="flex flex-wrap gap-2">
                    {positions.map((p) => (
                      <Button
                        key={p.label}
                        size="sm"
                        variant={position.label === p.label && !diagonal ? "default" : "outline"}
                        onClick={() => { setPosition(p); setDiagonal(false); }}
                      >
                        {p.label}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant={diagonal ? "default" : "outline"}
                      onClick={() => setDiagonal(true)}
                    >
                      Diagonal Repeat
                    </Button>
                  </div>
                </div>
                <Button onClick={handleTextWatermark} disabled={processing} className="w-full h-12 text-base">
                  {processing ? "Applying…" : "Add Watermark"}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </>
      ) : (
        <ResultPreview
          originalSize={image!.file.size}
          resultSize={result.blob.size}
          resultUrl={result.url}
          onDownload={() => downloadBlob(result.blob, `watermarked-${image!.file.name}`)}
          onReset={reset}
        />
      )}
    </div>
  );
};

export default WatermarkTool;
