import { Dashboard } from '@/components/dashboard';
import { createClient } from '@/lib/supabase';
import { BookUp, Library, MessageSquareQuote } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();

  const { count: totalWords, error: totalWordsError } = await supabase
    .from('lexicon')
    .select('*', { count: 'exact', head: true });

  const { data: latestWords, error: latestWordsError } = await supabase
    .from('lexicon')
    .select('lemma')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: mostFrequent, error: mostFrequentError } = await supabase
    .rpc('get_most_frequent_pos')
    .limit(1)
    .single();
    
  if (totalWordsError || latestWordsError || mostFrequentError) {
    console.error(totalWordsError || latestWordsError || mostFrequentError);
    // You can render an error state here
  }
  
  const stats = [
    {
      title: "Total Words in Lexicon",
      value: totalWords ?? 0,
      icon: Library,
      description: "The total number of unique dictionary entries.",
    },
    {
      title: "Most Common Part of Speech",
      value: mostFrequent?.part_of_speech_val || 'N/A',
      icon: BookUp,
      description: "The most frequently occurring grammatical category.",
    },
    {
        title: "Latest Additions",
        value: latestWords?.map(w => w.lemma).join(', ') || 'N/A',
        icon: MessageSquareQuote,
        description: "The most recently added words to the lexicon.",
    }
  ];

  return <Dashboard stats={stats} />;
}
