export interface LexiconEntry {
    id: number;
    created_at: string;
    word: string;
    lemma: string;
    part_of_speech: string;
    definition: string;
    examples: string[];
    related: string[];
  }
  