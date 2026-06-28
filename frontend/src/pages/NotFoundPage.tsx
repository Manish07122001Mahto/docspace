import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-5 rounded-full bg-secondary p-4">
            <FileQuestion className="size-10 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button asChild className="mt-6">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
