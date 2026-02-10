import { LeaveTypesPage } from "@/components/leave-types";
import { Suspense } from "react";

export default function LeaveTypes() {
    return (
        <Suspense fallback={<div>Loading leave types...</div>}>
            <LeaveTypesPage />
        </Suspense>
    );
}
