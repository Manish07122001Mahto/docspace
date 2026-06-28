import { Link } from 'react-router-dom';
import { Clock, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Document } from '@/types/document';

type DocumentCardProps = {
  document: Document;
};

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Card className="transition hover:border-primary/30 hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText className="size-5" />
        </div>
        <CardTitle className="line-clamp-2">{document.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="size-4" />
          <span>{document.lastUpdated}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="size-4" />
          <span>{document.owner}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link to={`/documents/${document.id}`}>Open</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
