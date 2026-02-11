import { useState, useCallback, useEffect } from "react";
import ImageUpload from "@/components/shared/ImageUpload";
import ResultPreview from "@/components/shared/ResultPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    type ImageFile,
    loadImage,
    canvasToBlob,
    downloadBlob,
} from "@/lib/image-utils";
import { Palette } from "lucide-react";

const PREDEFINED_COLORS = [
    "#FFFFFF",
    "#000000",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
];

const BackgroundTool = () => {
    const [image, setImage] = useState<ImageFile | null>(null);
    const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
    const [padding, setPadding] = useState(20);
    const [mode, setMode] = useState<"color" | "blur">("color");
    const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleAddBackground = useCallback(async () => {
        if (!image) return;
        setProcessing(true);
        try {
            const img = await loadImage(image.preview);
            const canvas = document.createElement("canvas");

            // Calculate new dimensions with padding
            const newWidth = img.width + padding * 2;
            const newHeight = img.height + padding * 2;

            canvas.width = newWidth;
            canvas.height = newHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Could not get canvas context");

            if (mode === "color") {
                // Fill with solid color
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, newWidth, newHeight);
            } else if (mode === "blur") {
                // Draw original image to temp canvas
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const tempCtx = tempCanvas.getContext("2d");
                if (!tempCtx) throw new Error("Could not get temp canvas context");
                tempCtx.drawImage(img, 0, 0);

                // Create blurred background by scaling and drawing
                ctx.filter = "blur(20px)";
                ctx.drawImage(
                    tempCanvas,
                    -padding,
                    -padding,
                    newWidth + padding * 2,
                    newHeight + padding * 2
                );
                ctx.filter = "none";
            }

            // Draw original image on top
            ctx.drawImage(img, padding, padding);

            const blob = await canvasToBlob(canvas, "image/png", 1);
            setResult({ blob, url: URL.createObjectURL(blob) });
        } finally {
            setProcessing(false);
        }
    }, [image, backgroundColor, padding, mode]);

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
                    style={{
                        backgroundColor: "hsl(var(--tool-background) / 0.12)",
                        color: "hsl(var(--tool-background))",
                    }}
                >
                    <Palette className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">Change Background</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Add color or pattern background to your image
                </p>
            </div>

            {!result ? (
                <>
                    <ImageUpload
                        image={image}
                        onImageLoad={setImage}
                        onClear={() => setImage(null)}
                    />
                    {image && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-semibold mb-3 block">
                                    Padding (px)
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="range"
                                        min={0}
                                        max={200}
                                        value={padding}
                                        onChange={(e) => setPadding(Number(e.target.value))}
                                        className="flex-1"
                                    />
                                    <span className="text-sm font-medium min-w-12">{padding}px</span>
                                </div>
                            </div>

                            <Tabs value={mode} onValueChange={(v) => setMode(v as "color" | "blur")}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="color">Color</TabsTrigger>
                                    <TabsTrigger value="blur">Blur</TabsTrigger>
                                </TabsList>

                                <TabsContent value="color" className="space-y-3">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Choose Color</Label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                value={backgroundColor}
                                                onChange={(e) => setBackgroundColor(e.target.value)}
                                                className="h-12 w-16 rounded border border-input cursor-pointer"
                                            />
                                            <Input
                                                type="text"
                                                value={backgroundColor}
                                                onChange={(e) => setBackgroundColor(e.target.value)}
                                                placeholder="#FFFFFF"
                                                className="flex-1 font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Preset Colors</Label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {PREDEFINED_COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setBackgroundColor(color)}
                                                    className="h-10 rounded-lg border-2 transition-all hover:scale-110"
                                                    style={{
                                                        backgroundColor: color,
                                                        borderColor:
                                                            backgroundColor === color ? "#000" : "transparent",
                                                    }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="blur">
                                    <p className="text-sm text-muted-foreground py-3">
                                        The image background will be blurred to fill the padding area.
                                    </p>
                                </TabsContent>
                            </Tabs>

                            <Button
                                onClick={handleAddBackground}
                                disabled={processing}
                                className="w-full h-12 text-base"
                            >
                                {processing ? "Processing…" : "Add Background"}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <ResultPreview
                    originalSize={image!.file.size}
                    resultSize={result.blob.size}
                    resultUrl={result.url}
                    onDownload={() =>
                        downloadBlob(result.blob, `background-${image!.file.name}`)
                    }
                    onReset={reset}
                />
            )}
        </div>
    );
};

export default BackgroundTool;
