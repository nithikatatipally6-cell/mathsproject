import { useState } from 'react';
import { Diamond } from 'lucide-react';
import { Student, generatePopulation } from './lib/stats';
import { PopBar } from './components/Shared';
import Home from './components/Home';
import Analyze from './components/Analyze';
import Experiment from './components/Experiment';
import About from './components/About';

type Page = 'home' | 'analyze' | 'exp' | 'about';
const NAV: [Page, string][] = [['home', 'Home'], ['analyze', 'Analyze'], ['exp', 'Sampling Experiment'], ['about', 'About']];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [N, setN] = useState(1000);
  const [pop, setPop] = useState<Student[]>(() => generatePopulation(1000));
  const [ver, setVer] = useState(0); // remounts pages so old results clear when data changes
  const regen = (n = N) => { setN(n); setPop(generatePopulation(n)); setVer((x) => x + 1); };
  const go = (p: Page) => { setPage(p); window.scrollTo(0, 0); };
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 flex items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2">
        <b className="mr-auto flex items-center gap-1 whitespace-nowrap text-lg text-brand"><Diamond size={18} />SmartSample</b>
        {NAV.map(([p, l]) => <button key={p} onClick={() => go(p)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${page === p ? 'bg-indigo-50 text-brand' : 'text-slate-500 hover:text-slate-800'}`}>{l}</button>)}
      </nav>
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        {(page === 'analyze' || page === 'exp') && <PopBar n={N} onN={regen} onRegen={() => regen()} />}
        {page === 'home' && <Home go={go} />}
        {page === 'analyze' && <Analyze key={ver} pop={pop} />}
        {page === 'exp' && <Experiment key={ver} pop={pop} />}
        {page === 'about' && <About />}
      </main>
    </div>
  );
}
