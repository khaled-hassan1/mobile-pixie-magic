import { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ImageFile, loadImageFile, formatFileSize } from "@/lib/image-utils";

interface ImageUploadProps {
  image: ImageFile | null;
  onImageLoad: (img: ImageFile) => void;
  onClear: () => void;
  maxSizeMB?: number;
  className?: string;
}

const MAX_DEFAULT = 10;

const ImageUpload = ({
  image,
  onImageLoad,
  onClear,
  maxSizeMB = MAX_DEFAULT,
  className,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Max ${maxSizeMB}MB.`);
        return;
      }
      try {
        const loaded = await loadImageFile(file);
        onImageLoad(loaded);
      } catch {
        setError("Failed to load image.");
      }
    },
    [maxSizeMB, onImageLoad]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (image) {
    return (
      <div className={cn("relative rounded-xl border bg-card overflow-hidden", className)}>
        <img
          src={image.preview}
          alt="Uploaded preview"
          className="w-full max-h-64 object-contain bg-muted"
        />
        <div className="flex items-center justify-between gap-2 p-3 text-xs text-muted-foreground">
          <span className="truncate font-medium">{image.file.name}</span>
          <span>{formatFileSize(image.file.size)} · {image.width}×{image.height}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 md:p-12 cursor-pointer transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        {dragOver ? (
          <ImageIcon className="h-7 w-7 text-primary" />
        ) : (
          <Upload className="h-7 w-7 text-primary" />
        )}
      </div>
      <div className="text-center">
        <p className="font-medium text-sm">Tap to upload or drag & drop</p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · Max {maxSizeMB}MB</p>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
};

export default ImageUpload;
