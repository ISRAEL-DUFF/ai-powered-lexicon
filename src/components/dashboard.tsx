
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface Stat {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
}

interface DashboardProps {
  stats: Stat[];
}

export function Dashboard({ stats }: DashboardProps) {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold tracking-tight font-headline text-primary/90 sm:text-5xl">
              Dashboard
            </h1>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2" />
                    Back to Lexicon
                </Link>
            </Button>
        </div>
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-2">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>This dashboard provides a real-time overview of your LexiconGraphikos database.</p>
        <p>You need to create the table and function in your Supabase project.</p>
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
