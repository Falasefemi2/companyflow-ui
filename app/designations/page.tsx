import { DesignationsPage } from "@/components/designations";
import { Suspense } from "react";

export default function Designations() {
  return (
    <Suspense fallback={<div>loading designations...</div>}>
      <DesignationsPage />
    </Suspense>
  );
}
