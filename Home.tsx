import { Target, Ruler, LineChart } from 'lucide-react';
import { Card, Btn } from './Shared';
export default function Home({ go }: { go: (p: 'analyze' | 'exp') => void }) {
  const cards = [[Target, 'Sampling', 'Select a sample from a large student population.'], [Ruler, 'Estimation', 'Estimate population characteristics using sample statistics.'], [LineChart, 'Understand', 'Visualize sampling distributions and confidence intervals.']] as const;
  return (
    <div className="fade">
      <div className="px-3 py-10 text-center">
        <h1 className="text-5xl font-bold">Smart<span className="bg-gradient-to-r from-brand to-blue-500 bg-clip-text text-transparent">Sample</span></h1>
        <h2 className="mt-2 text-2xl">Understand a Population Using a Sample</h2>
        <p className="mx-auto mb-5 mt-3 max-w-2xl text-slate-500">An interactive statistical platform for exploring sampling, sampling distributions, the Central Limit Theorem and statistical estimation using simulated college student data.</p>
        <div className="flex flex-wrap justify-center gap-3"><Btn onClick={() => go('analyze')}>Start Analysis</Btn><Btn secondary onClick={() => go('exp')}>Explore Sampling</Btn></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(([I, t, d]) => <Card key={t} className="!mb-0"><I className="mb-2 text-brand" size={22} /><h3 className="font-semibold">{t}</h3><p className="text-sm text-slate-500">{d}</p></Card>)}
      </div>
      <Card className="mt-5"><h2 className="mb-2 text-xl font-semibold">Why Sampling?</h2>
        <p>A college may have thousands of students, making it difficult to study every student. Statistical sampling allows researchers to study a smaller group and use it to estimate characteristics of the larger population.</p></Card>
    </div>
  );
}
