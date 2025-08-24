import { ArchivePage } from '@/components/archive-page';
import { createClient } from '@/lib/supabase';
import { type LexiconEntry } from '@/lib/types';

export default async function Archive() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('lexicon')
    .select('lemma')
    .order('lemma', { ascending: true });

  if (error) {
    console.error('Error fetching lexicon:', error);
    // You could return an error component here
    return <p>Error loading lexicon.</p>;
  }

  // Deduplicate lemmas to avoid showing the same word multiple times
  const uniqueLemmas = Array.from(new Set(data.map(item => item.lemma)));

  // Group lemmas by the first letter
  const groupedLemmas = uniqueLemmas.reduce((acc, lemma) => {
    const firstLetter = lemma.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(lemma);
    return acc;
  }, {} as Record<string, string[]>);

  return <ArchivePage groupedLemmas={groupedLemmas} />;
}
