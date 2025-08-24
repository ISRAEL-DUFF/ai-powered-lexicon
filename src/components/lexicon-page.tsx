
'use client';

import { useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { getDictionaryEntry, type FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DictionaryEntryDisplay } from '@/components/dictionary-entry-display';
import { EntrySkeleton } from '@/components/entry-skeleton';
import { Loader2, ScrollText, Sparkles, BookText } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      <span>Generate Entry</span>
    </Button>
  );
}

const initialState: FormState = {
  data: null,
  error: null,
  timestamp: Date.now(),
};

export function LexiconPage() {
  const [state, formAction] = useActionState(getDictionaryEntry, initialState);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  // This effect handles the query parameter lookup
  useEffect(() => {
    const wordFromQuery = searchParams.get('word');
    if (wordFromQuery) {
        // Create a new FormData object and append the word
        const formData = new FormData();
        formData.append('word', wordFromQuery);
        // Directly call the form action
        formAction(formData);
    }
  }, [searchParams, formAction]);


  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
  }, [state.error, state.timestamp, toast]);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center">
        <ScrollText className="h-16 w-16 text-primary" />
        <h1 className="mt-4 text-4xl font-bold tracking-tight font-headline text-primary/90 sm:text-5xl">
          LexiconGraphikos
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-foreground/80">
          An AI-powered lexicon for the study of Ancient Greek. Enter a word to generate its dictionary entry, entirely in Greek.
        </p>
      </div>

      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Word Input</CardTitle>
          <CardDescription>Enter an Ancient Greek word (e.g., λόγοις, ἀγαθός, ἔλεγον) to begin.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <form ref={formRef} action={formAction} className="flex flex-grow gap-4 sm:flex-row">
                <Input
                  name="word"
                  placeholder="e.g., λόγοις"
                  className="flex-grow text-lg"
                  lang="grc"
                  autoFocus
                  // Use the query param as the default value
                  defaultValue={searchParams.get('word') || ''}
                />
                <SubmitButton />
              </form>
               <Button asChild variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                  <Link href="/archive">
                      <BookText className="mr-2" />
                      View Archive
                  </Link>
              </Button>
            </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <AnimatePresenceWrapper formState={state}>
          {state.data ? (
            <DictionaryEntryDisplay data={state.data} />
          ) : (
            <InitialState />
          )}
        </AnimatePresenceWrapper>
      </div>
    </main>
  );
}

function AnimatePresenceWrapper({ children, formState }: { children: React.ReactNode, formState: FormState }) {
  const { pending } = useFormStatus();

  if (pending) {
    return <EntrySkeleton />;
  }
  
  // The key ensures the component re-renders on new submissions, allowing for animations if desired.
  return <div key={formState.timestamp}>{children}</div>;
}


function InitialState() {
  return (
    <div className="text-center py-16 px-4 rounded-lg border-2 border-dashed">
        <h3 className="text-lg font-medium text-muted-foreground">Your generated dictionary entry will appear here.</h3>
        <p className="mt-1 text-sm text-muted-foreground">Start by typing a word above and clicking "Generate Entry".</p>
    </div>
  )
}
