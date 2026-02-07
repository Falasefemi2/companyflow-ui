import { EmployeesPage } from "@/components/employees";
import { Suspense } from "react";

export default function Employees() {
  return (
    <Suspense fallback={<div>Loading employees...</div>}>
      <EmployeesPage />;
    </Suspense>
  );
}
