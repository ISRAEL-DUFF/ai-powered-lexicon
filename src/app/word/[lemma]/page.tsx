
import { createClient, createBuildTimeClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { EditableDictionaryEntry } from '@/components/editable-dictionary-entry';
import type { LexiconEntry } from '@/lib/types';


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

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <EditableDictionaryEntry entry={entry as LexiconEntry} />
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
