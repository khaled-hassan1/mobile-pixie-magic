import { Link } from "react-router-dom";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container py-12 md:py-20 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Edit Images <span className="text-primary">Instantly</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8">
          Compress, resize, crop, convert, and more — all free, fast, and works right on your phone.
        </p>
        <Link
          to="/compress"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Start Editing
        </Link>
      </section>

      {/* Tool Grid */}
      <section className="container pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className={cn(
                "group flex flex-col items-center gap-3 rounded-xl border bg-card p-5 md:p-6 text-center transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
              )}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `hsl(var(--${tool.colorVar}) / 0.12)`, color: `hsl(var(--${tool.colorVar}))` }}
              >
                <tool.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">{tool.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
