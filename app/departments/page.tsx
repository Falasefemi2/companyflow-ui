import { Suspense } from "react";
import { DepartmentsPage } from "@/components/departments";

export default function Departments() {
  return (
    <Suspense fallback={<div>Loading departments...</div>}>
      <DepartmentsPage />
    </Suspense>
  );
}
