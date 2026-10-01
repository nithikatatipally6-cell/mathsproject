import { useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Experiment as Exp, Student, VARS, VarKey, experimentInterpretation, fmt, fv, runSamplingExperiment } from '../lib/stats';
import { Btn, Card, Learn, Select, Stat } from './Shared';

export default function Experiment({ pop }: { pop: Student[] }) {
  const [v, setV] = useState<VarKey>('marks'), [n, setN] = useState(30), [k, setK] = useState(100);
  const [res, setRes] = useState<Exp | null>(null), [err, setErr] = useState('');
  const out = useRef<HTMLDivElement>(null);
  const run = () => {
    try { setRes(runSamplingExperiment(pop, v, n, k)); setErr(''); } catch (e) { setRes(null); setErr((e as Error).message); }
    setTimeout(() => out.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };
  return (
    <div className="fade">
      <h1 className="text-3xl font-bold">Sampling Experiment</h1>
      <p className="mb-4 text-slate-500">Draw many samples, record each sample mean, and watch the sampling distribution form.</p>
      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Variable" value={v} onChange={setV} options={(Object.keys(VARS) as VarKey[]).map((x) => [x, VARS[x].name])} />
          <Select label="Sample Size" value={n} onChange={setN} options={[30, 50, 100, 200, 300].map((x) => [x, String(x)])} />
          <Select label="Number of Samples" value={k} onChange={setK} options={[50, 100, 500, 1000].map((x) => [x, String(x)])} />
        </div>
        <div className="mt-4"><Btn onClick={run}>Run Sampling Experiment</Btn></div>
      </Card>
      <div ref={out}>
        {err && <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">{err}</div>}
        {res && <Results r={res} />}
      </div>
    </div>
  );
}

function Results({ r }: { r: Exp }) {
  const B = 24;
  const { bins, muBin } = useMemo(() => {
    const half = (3.5 * r.sigma) / Math.sqrt(30), lo = r.mu - half, w = (2 * half) / B;
    const counts = Array(B).fill(0) as number[];
    r.means.forEach((m) => { counts[Math.min(B - 1, Math.max(0, Math.floor((m - lo) / w)))]++; });
    const label = (i: number) => fmt(lo + (i + 0.5) * w, 1);
    return { bins: counts.map((count, i) => ({ x: label(i), count })), muBin: label(Math.min(B - 1, Math.max(0, Math.floor((r.mu - lo) / w)))) };
  }, [r]);
  return (
    <div className="fade">
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Population Mean" value={fv(r.mu, r.v, 3)} /><Stat label="Mean of Sample Means" value={fv(r.mm, r.v, 3)} /><Stat label="Standard Error (SD of means)" value={fv(r.se, r.v, 3)} />
      </div>
      <Card>
        <h2 className="text-xl font-semibold">Sampling Distribution of the Mean</h2>
        <p className="mb-3 text-sm text-slate-500">n = {r.n}, {r.k} samples. The x-axis range is fixed (based on n = 30) so changes in spread are visible between runs.</p>
        <div className="h-72 w-full"><ResponsiveContainer>
          <BarChart data={bins} barCategoryGap={1} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="x" interval={3} label={{ value: `Sample mean (${VARS[r.v].name})`, position: 'insideBottom', offset: -12 }} />
            <YAxis allowDecimals={false} label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} /><Tooltip />
            <Bar dataKey="count" fill="#6b72e6" radius={[3, 3, 0, 0]} />
            <ReferenceLine x={muBin} stroke="#ef4444" strokeDasharray="5 4" label={{ value: `Population mean ${fv(r.mu, r.v)}`, position: 'top', fill: '#ef4444', fontSize: 12 }} />
          </BarChart></ResponsiveContainer></div>
      </Card>
      <Card><h2 className="mb-2 text-xl font-semibold">What Does This Graph Tell Us?</h2>
        <p className="mb-3">Each value in this distribution represents the mean of one sample. When many samples are taken, the sample means form a sampling distribution. As the sample size becomes larger, the distribution of sample means generally becomes more concentrated around the population mean.</p>
        <p className="rounded-lg bg-indigo-50 p-3 text-sm text-slate-600">Central Limit Theorem: even if the original {VARS[r.v].noun} data is not perfectly bell-shaped, the sample means tend toward a normal shape as n grows.</p></Card>
      <Card><h2 className="mb-2 text-xl font-semibold">What Does This Result Mean?</h2><p>{experimentInterpretation(r)}</p></Card>
      <Learn text="Repeated sampling produces a sampling distribution of sample means. Increasing sample size generally reduces standard error and makes the estimate more precise. By the Central Limit Theorem, these means cluster around the population mean in a bell shape." />
    </div>
  );
}
