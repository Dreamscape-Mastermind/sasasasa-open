
import { SearchContent } from "@/components/search/SearchContent";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-center py-20">Loading...</p>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
