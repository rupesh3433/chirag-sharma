import { Loader2, Sparkles } from "lucide-react";

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Animated Icon */}
      <div className="relative mb-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <Sparkles className="absolute -right-3 -top-3 h-6 w-6 animate-pulse text-primary/70" />
      </div>

      {/* Text */}
      <h2 className="text-xl font-semibold tracking-wide text-foreground">
        Loading Application
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Please wait a moment…
      </p>
    </div>
  );
};

export default FullScreenLoader;
