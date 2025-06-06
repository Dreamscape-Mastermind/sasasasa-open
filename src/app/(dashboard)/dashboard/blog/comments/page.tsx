"use client";

import { CommentsManagement } from "@/components/blog/CommentsManagement";
import Spinner from "@/components/ui/spinner";
import { Suspense } from "react";

export default function CommentsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CommentsManagement />
    </Suspense>
  );
}
