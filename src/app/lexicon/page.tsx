import { Suspense } from 'react';
import { LexiconPage } from '@/components/lexicon-page';

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LexiconPage />
    </Suspense>
  );
}
