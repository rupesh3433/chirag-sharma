import { Loader2 } from "lucide-react";

const FullScreenLoader = () => {
  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-background
      "
    >
      <div className="flex flex-col items-center justify-center">
        {/* BIG STRONG RED CIRCLE LOADER */}
        <div
          className="
            flex items-center justify-center
            h-40 w-40
            rounded-full
            border-8 border-red-600/20
            border-t-red-600
            animate-spin
          "
        >
          <Loader2 className="h-16 w-16 text-red-600" />
        </div>

        {/* TEXT */}
        <h2
          className="
            mt-8
            text-2xl font-bold tracking-wide
            text-foreground
          "
        >
          
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-muted-foreground
          "
        >
          Please wait a moment…
        </p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
