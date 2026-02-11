import { Suspense } from "react";
import ApprovalWorkflowsClient from "@/components/approval-workflows";

export default function ApprovalWorkflowsPage() {
  return (
    <Suspense fallback={<div>Loading approval workflows...</div>}>
      <ApprovalWorkflowsClient />
    </Suspense>
  );
}
