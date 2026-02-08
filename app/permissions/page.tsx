import { Suspense } from 'react';
import PermissionsClient from './permissions-client';

export default function PermissionsPage() {
  return (
    <Suspense fallback={<div>Loading permissions...</div>}>
      <PermissionsClient />
    </Suspense>
  );
}