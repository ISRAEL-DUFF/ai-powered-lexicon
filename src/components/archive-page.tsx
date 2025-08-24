
'use client';

import { ArrowLeft, BookText } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ArchivePageProps {
  groupedLemmas: Record<string, string[]>;
}

export function ArchivePage({ groupedLemmas }: ArchivePageProps) {
  const sortedKeys = Object.keys(groupedLemmas).sort();

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
           <BookText className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight font-headline text-primary/90 sm:text-5xl">
              Lexicon Archive
            </h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2" />
            Back to Generator
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        {sortedKeys.map((letter) => (
          <Card key={letter}>
            <CardHeader>
              <CardTitle className="font-headline text-3xl text-primary/80">{letter}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {groupedLemmas[letter].map((lemma) => (
                   <Link href={`/word/${lemma}`} key={lemma}>
                    <Badge variant="secondary" className="text-base font-normal px-4 py-1.5 hover:bg-primary/20 cursor-pointer">
                      {lemma}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {sortedKeys.length === 0 && (
             <div className="text-center py-16 px-4 rounded-lg border-2 border-dashed">
                <h3 className="text-lg font-medium text-muted-foreground">The archive is empty.</h3>
                <p className="mt-1 text-sm text-muted-foreground">Generate some dictionary entries to see them here.</p>
            </div>
        )}
      </div>
    </main>
  );
}
