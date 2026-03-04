'use client';

import Button from '@/components/ui/Button';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-secondary">Please try again. If the issue persists, contact LensLight support.</p>
          <Button onClick={reset} variant="primary">Retry</Button>
        </div>
      </body>
    </html>
  );
}
