import { RolesPage } from "@/components/roles";
import { Suspense } from "react";

export default function Roles() {
  return (
    <Suspense fallback={<div>Loaiding roles..</div>}>
      <RolesPage />
    </Suspense>
  );
}
