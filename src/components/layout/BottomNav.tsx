import { Link, useLocation } from "react-router-dom";
import { Home, FileDown, Crop, Eraser, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tools } from "@/lib/tools";

const mainTabs = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FileDown, label: "Compress", path: "/compress" },
  { icon: Crop, label: "Crop", path: "/crop" },
  { icon: Eraser, label: "Remove BG", path: "/remove-bg" },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around h-16">
        {mainTabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors min-w-[56px]",
              pathname === tab.path
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </Link>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs text-muted-foreground min-w-[56px]">
              <MoreHorizontal className="h-5 w-5" />
              More
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52 mb-2">
            {tools
              .filter((t) => !mainTabs.some((mt) => mt.path === t.path))
              .map((tool) => (
                <DropdownMenuItem key={tool.id} asChild>
                  <Link to={tool.path} className="flex items-center gap-2 cursor-pointer">
                    <tool.icon className="h-4 w-4" />
                    {tool.name}
                  </Link>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default BottomNav;
