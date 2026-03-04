import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-secondary">The page you’re looking for doesn’t exist. Let’s get you back to LensLight.</p>
        <Button asChild variant="primary">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
