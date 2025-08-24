
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function EntrySkeleton() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="items-center">
        <Skeleton className="h-14 w-48" />
        <Skeleton className="mt-2 h-7 w-32" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        <div className="space-y-4 pl-9">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <Separator />
        <div className="space-y-4 pl-9">
          <Skeleton className="h-7 w-44" />
          <div className="space-y-2 pl-5">
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <Separator />
        <div className="space-y-4 pl-9">
          <Skeleton className="h-7 w-36" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
