import { Suspense } from 'react';
import ApprovalsClient from '@/components/approvals';

export default function ApprovalsPage() {
    return (
        <Suspense fallback={<div>Loading approvals...</div>}>
            <ApprovalsClient />
        </Suspense>
    );
}
