import { Loader2 } from "lucide-react";

const FullScreenLoader = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="bg-background"
    >
      <div className="flex flex-col items-center justify-center">
        {/* BIG STRONG RED CIRCLE LOADER */}
        <div
          style={{
            height: 160,
            width: 160,
            borderRadius: "50%",
            borderWidth: 8,
            borderStyle: "solid",
            borderColor: "rgba(220,38,38,0.2)",
            borderTopColor: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "spin 1s linear infinite",
          }}
        >
          <Loader2 size={64} color="#dc2626" />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Please wait a moment…
        </p>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FullScreenLoader;
