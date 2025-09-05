
'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { type LexiconEntry } from '@/lib/types';
import { updateEntry } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookCopy, Quote, Link2, Pencil, Save, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CopyWordsButton } from './copy-words-button';

interface EditableDictionaryEntryProps {
  entry: LexiconEntry;
}

function EditSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2" />}
            Save Changes
        </Button>
    );
}

export function EditableDictionaryEntry({ entry }: EditableDictionaryEntryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFormAction = (formData: FormData) => {
    startTransition(async () => {
        const result = await updateEntry(formData);
        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: result.error,
            });
        } else {
            toast({
                title: 'Update Successful',
                description: `Entry for "${entry.lemma}" has been updated.`,
            });
            setIsEditing(false);
        }
    });
  };

  if (isEditing) {
    return (
      <form action={handleFormAction}>
        <input type="hidden" name="id" value={entry.id} />
        <Card className="shadow-lg animate-in fade-in duration-500">
            <CardHeader className="flex flex-row justify-between items-start text-center">
                <div>
                    <CardTitle className="font-headline text-5xl text-primary">{entry.lemma}</CardTitle>
                    <CardDescription className="text-accent-foreground font-semibold text-lg">{entry.part_of_speech}</CardDescription>
                </div>
                <div className="flex gap-2">
                    <EditSubmitButton />
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isPending}>
                        <X className="mr-2" />
                        Cancel
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Separator />
                <div className="space-y-2">
                    <h3 className="flex items-center text-xl font-headline font-semibold text-primary/90">
                        <BookCopy className="mr-3 h-6 w-6 text-accent" />
                        <span>Ορισμός (Definition)</span>
                    </h3>
                    <Textarea name="definition" defaultValue={entry.definition} className="text-lg" rows={5} />
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="flex items-center text-xl font-headline font-semibold text-primary/90">
                        <Quote className="mr-3 h-6 w-6 text-accent" />
                        <span>Παραδείγματα (Examples)</span>
                    </h3>
                    <Textarea name="examples" defaultValue={entry.examples.join('\n')} className="text-lg" rows={5} />
                     <p className="text-sm text-muted-foreground">Enter each example on a new line.</p>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="flex items-center text-xl font-headline font-semibold text-primary/90">
                        <Link2 className="mr-3 h-6 w-6 text-accent" />
                        <span>Συγγενῆ (Related)</span>
                    </h3>
                    <Input name="related" defaultValue={entry.related.join(', ')} className="text-lg" />
                     <p className="text-sm text-muted-foreground">Enter related words separated by commas.</p>
                </div>
            </CardContent>
        </Card>
      </form>
    );
  }

  return (
    <Card className="shadow-lg animate-in fade-in duration-500">
        <CardHeader className="flex flex-row justify-between items-start text-center">
            <div>
                <CardTitle className="font-headline text-5xl text-primary">{entry.lemma}</CardTitle>
                <CardDescription className="text-accent-foreground font-semibold text-lg">{entry.part_of_speech}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <CopyWordsButton lemma={entry.lemma} related={entry.related} />
                <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Pencil className="mr-2" />
                    Edit
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <Separator />
            <div className="space-y-4">
                <h3 className="flex items-center text-xl font-headline font-semibold text-primary/90">
                    <BookCopy className="mr-3 h-6 w-6 text-accent" />
                    <span>Ορισμός (Definition)</span>
                </h3>
                <p className="pl-9 text-lg leading-relaxed whitespace-pre-line">{entry.definition}</p>
            </div>
            <Separator />
            <div className="space-y-4">
                <h3 className="flex items-center text-xl font-headline font-semibold text-primary/90">
                    <Quote className="mr-3 h-6 w-6 text-accent" />
                    <span>Παραδείγματα (Examples)</span>
                </h3>
                <ul className="list-disc space-y-2 pl-14 text-lg">
                    {entry.examples.map((example, index) => (
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
                    {entry.related.map((word, index) => (
                        <Link href={`/lexicon?word=${encodeURIComponent(word)}`} key={index}>
                            <Badge variant="secondary" className="text-base px-3 py-1 hover:bg-primary/20 cursor-pointer">
                                {word}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </div>
      </CardContent>
    </Card>
  );
}
