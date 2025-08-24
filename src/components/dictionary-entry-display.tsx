
import type { LemmaConversionOutput } from '@/ai/flows/lemma-conversion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookCopy, Quote, Link2 } from 'lucide-react';

interface DictionaryEntryDisplayProps {
  data: LemmaConversionOutput;
}

export function DictionaryEntryDisplay({ data }: DictionaryEntryDisplayProps) {
  return (
    <Card className="shadow-lg animate-in fade-in duration-500">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-5xl text-primary">{data.lemma}</CardTitle>
        <CardDescription className="text-accent-foreground font-semibold text-lg">{data.part_of_speech}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        
        <div className="space-y-4">
          <h3 className="flex items-center text-xl font-headline font-semibold text-primary/90">
            <BookCopy className="mr-3 h-6 w-6 text-accent" />
            <span>Ορισμός (Definition)</span>
          </h3>
          <p className="pl-9 text-lg leading-relaxed">{data.definition}</p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="flex items-center text-xl font-headline font-semibold text-primary/90">
            <Quote className="mr-3 h-6 w-6 text-accent" />
            <span>Παραδείγματα (Examples)</span>
          </h3>
          <ul className="list-disc space-y-2 pl-14 text-lg">
            {data.examples.map((example, index) => (
              <li key={index} className="italic">{example}</li>
            ))}
          </ul>
        </div>
        
        <Separator />

        <div className="space-y-4">
          <h3 className="flex items-center text-xl font-headline font-semibold text-primary/90">
            <Link2 className="mr-3 h-6 w-6 text-accent" />
            <span>Συγγενῆ (Related)</span>
          </h3>
          <div className="pl-9 flex flex-wrap gap-2">
            {data.related.map((word, index) => (
              <Badge key={index} variant="secondary" className="text-base px-3 py-1">
                {word}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
