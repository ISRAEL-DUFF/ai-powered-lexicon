
import { createClient, createBuildTimeClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { DictionaryEntryDisplay } from '@/components/dictionary-entry-display';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface WordPageProps {
  params: {
    lemma: string;
  };
}

export default async function WordPage({ params }: WordPageProps) {
  const supabase = createClient();
  const decodedLemma = decodeURIComponent(params.lemma);

  const { data: entry, error } = await supabase
    .from('lexicon')
    .select('*')
    .eq('lemma', decodedLemma)
    .limit(1)
    .single();

  if (error || !entry) {
    console.error('Error fetching word:', error);
    notFound();
  }

  const dictionaryEntry = {
    lemma: entry.lemma,
    part_of_speech: entry.part_of_speech,
    definition: entry.definition,
    examples: entry.examples,
    related: entry.related,
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-8">
            <Button asChild variant="outline">
                <Link href="/archive">
                    <ArrowLeft className="mr-2" />
                    Back to Archive
                </Link>
            </Button>
        </div>
      <DictionaryEntryDisplay data={dictionaryEntry} />
    </main>
  );
}

export async function generateStaticParams() {
    // Use the build-time client here as cookies are not available.
    const supabase = createBuildTimeClient();
    const { data: lexicon } = await supabase.from('lexicon').select('lemma');
    
    if (!lexicon) {
        return [];
    }

    const uniqueLemmas = Array.from(new Set(lexicon.map(item => item.lemma)));

    return uniqueLemmas.map((lemma) => ({
        lemma: encodeURIComponent(lemma),
    }));
}
