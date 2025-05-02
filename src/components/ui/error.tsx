"use client";

import { AlertCircle } from "lucide-react";

interface ErrorProps {
  message?: string;
}

export default function Error({
  message = "Something went wrong",
}: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
      {/* <div className="relative w-32 h-32 mb-4">
        <Image
          src="/error-illustration.svg"
          alt="Error illustration"
          fill
          className="object-contain"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFRUVFRUUiLz48L3N2Zz4="
        />
      </div> */}
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
      <p className="text-muted-foreground text-center">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
