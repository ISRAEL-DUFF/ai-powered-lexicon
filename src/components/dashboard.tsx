
import { createClient } from "@/lib/supabase";
import { BookUp, Library, MessageSquareQuote } from "lucide-react";
import { StatCards } from "./stat-cards";
import Link from "next/link";
import { Button } from "./ui/button";
import { BookText, ArrowRight } from "lucide-react";


export async function Dashboard() {
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
    // Log errors but don't block the UI. The client component will handle the null state.
    console.error(totalWordsError || latestWordsError || mostFrequentError);
  }
  
  const stats = [
    {
      title: "Total Words in Lexicon",
      value: totalWords ?? 0,
      iconName: "Library" as const,
      description: "The total number of unique dictionary entries.",
    },
    {
      title: "Most Common Part of Speech",
      value: mostFrequent?.part_of_speech_val || 'N/A',
      iconName: "BookUp" as const,
      description: "The most frequently occurring grammatical category.",
    },
    {
        title: "Latest Additions",
        value: latestWords?.map(w => w.lemma).join(', ') || 'N/A',
        iconName: "MessageSquareQuote" as const,
        description: "The most recently added words to the lexicon.",
    }
  ];
  
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-4xl font-bold tracking-tight font-headline text-primary/90 sm:text-5xl">
              Dashboard
            </h1>
             <div className="flex gap-2">
                <Button asChild>
                    <Link href="/lexicon">
                        Go to Lexicon
                        <ArrowRight className="mr-2" />
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/archive">
                        <BookText className="mr-2" />
                        View Archive
                    </Link>
                </Button>
            </div>
        </div>
      <StatCards stats={stats} />
      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>This dashboard provides a real-time overview of your LexiconGraphikos database.</p>
        <p>If you see errors or 'N/A', ensure you've run the SQL setup in your Supabase project.</p>
        <div className="mt-4 p-4 bg-muted rounded-md text-left font-mono text-xs overflow-x-auto">
          <p className="font-bold mb-2">SQL for `lexicon` table:</p>
          <pre>{`CREATE TABLE lexicon (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  word TEXT NOT NULL,
  lemma TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  definition TEXT NOT NULL,
  examples TEXT[] NOT NULL,
  related TEXT[] NOT NULL
);`}</pre>
          <p className="font-bold mt-4 mb-2">SQL for `get_most_frequent_pos` function:</p>
          <pre>{`CREATE OR REPLACE FUNCTION get_most_frequent_pos()
RETURNS TABLE(part_of_speech_val text, frequency bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT part_of_speech, COUNT(*) AS frequency
    FROM lexicon
    GROUP BY part_of_speech
    ORDER BY frequency DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;`}</pre>
        </div>
      </div>
    </main>
  );
}
