import {
  FileDown,
  Maximize,
  Crop,
  RefreshCw,
  Eraser,
  RotateCw,
  SlidersHorizontal,
  Droplets,
  type LucideIcon,
} from "lucide-react";

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  colorVar: string;
}

export const tools: ToolConfig[] = [
  {
    id: "compress",
    name: "Compress Image",
    description: "Reduce file size while keeping quality",
    path: "/compress",
    icon: FileDown,
    colorVar: "tool-compress",
  },
  {
    id: "resize",
    name: "Resize Image",
    description: "Change dimensions with aspect ratio control",
    path: "/resize",
    icon: Maximize,
    colorVar: "tool-resize",
  },
  {
    id: "crop",
    name: "Crop Image",
    description: "Cut and frame your images perfectly",
    path: "/crop",
    icon: Crop,
    colorVar: "tool-crop",
  },
  {
    id: "convert",
    name: "Convert Image",
    description: "Switch between JPG, PNG, and WEBP",
    path: "/convert",
    icon: RefreshCw,
    colorVar: "tool-convert",
  },
  {
    id: "remove-bg",
    name: "Remove Background",
    description: "Erase backgrounds with AI precision",
    path: "/remove-bg",
    icon: Eraser,
    colorVar: "tool-removebg",
  },
  {
    id: "rotate",
    name: "Rotate & Flip",
    description: "Rotate or mirror your images instantly",
    path: "/rotate",
    icon: RotateCw,
    colorVar: "tool-rotate",
  },
  {
    id: "quality",
    name: "Change Quality",
    description: "Fine-tune image quality and size",
    path: "/quality",
    icon: SlidersHorizontal,
    colorVar: "tool-quality",
  },
  {
    id: "watermark",
    name: "Add Watermark",
    description: "Protect images with text or logo overlays",
    path: "/watermark",
    icon: Droplets,
    colorVar: "tool-watermark",
  },
];
