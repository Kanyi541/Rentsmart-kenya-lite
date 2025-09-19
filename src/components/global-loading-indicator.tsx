
'use client'

import { useLoading } from '@/hooks/use-loading';
import { LoadingAnimation } from './loading';

export function GlobalLoadingIndicator() {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingAnimation />
    </div>
  );
}
