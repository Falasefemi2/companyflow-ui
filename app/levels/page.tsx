import { LevelsPage } from "@/components/levels";
import { Suspense } from "react";

export default function Levels() {
  return (
    <Suspense fallback={<div>Loading levels...</div>}>
      <LevelsPage />
    </Suspense>
  );
}
