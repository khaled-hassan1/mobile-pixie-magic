import { useState } from "react";
import ImageUpload from "@/components/shared/ImageUpload";
import ResultPreview from "@/components/shared/ResultPreview";
import { Button } from "@/components/ui/button";
import { type ImageFile, downloadBlob } from "@/lib/image-utils";
import { Eraser } from "lucide-react";

const RemoveBgTool = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!image) return;
    setProcessing(true);
    setError(null);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(image.preview, {
        progress: () => {},
      });
      setResult({ blob: blob as Blob, url: URL.createObjectURL(blob as Blob) });
    } catch (e) {
      setError("Background removal failed. Try a different image or try again later.");
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setImage(null);
    setError(null);
  };

  return (
    <div className="container max-w-lg py-8 space-y-6">
      <div className="text-center">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-3"
          style={{ backgroundColor: "hsl(var(--tool-removebg) / 0.12)", color: "hsl(var(--tool-removebg))" }}
        >
          <Eraser className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Remove Background</h1>
        <p className="text-muted-foreground text-sm mt-1">Erase backgrounds with AI precision</p>
      </div>

      {!result ? (
        <>
          <ImageUpload image={image} onImageLoad={setImage} onClear={() => setImage(null)} />
          {image && (
            <div className="space-y-4">
              {processing && (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Processing with AI… This may take a moment.</p>
                </div>
              )}
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              {!processing && (
                <Button onClick={handleRemove} className="w-full h-12 text-base">
                  Remove Background
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <ResultPreview
          originalSize={image!.file.size}
          resultSize={result.blob.size}
          resultUrl={result.url}
          onDownload={() => downloadBlob(result.blob, `nobg-${image!.file.name.split(".")[0]}.png`)}
          onReset={reset}
        />
      )}
    </div>
  );
};

export default RemoveBgTool;
