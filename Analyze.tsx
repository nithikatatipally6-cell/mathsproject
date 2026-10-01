import { useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ErrorBar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Analysis, Conf, Method, Student, VARS, VarKey, fmt, fv, generateConclusion, generateInterpretation, runAnalysis } from '../lib/stats';
import { Btn, Card, Learn, Math_, Select, Stat, Uses } from './Shared';

export default function Analyze({ pop }: { pop: Student[] }) {
  const [v, setV] = useState<VarKey>('marks'), [n, setN] = useState(50), [m, setM] = useState<Method>('srs'), [c, setC] = useState<Conf>(0.95);
  const [res, setRes] = useState<Analysis | null>(null), [err, setErr] = useState('');
  const out = useRef<HTMLDivElement>(null);
  const take = () => {
    try { setRes(runAnalysis(pop, v, n, m, c)); setErr(''); } catch (e) { setRes(null); setErr((e as Error).message); }
    setTimeout(() => out.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };
  const reset = () => { setV('marks'); setN(50); setM('srs'); setC(0.95); setRes(null); setErr(''); };
  const vk = Object.keys(VARS) as VarKey[];
  return (
    <div className="fade">
      <h1 className="mb-4 text-3xl font-bold">Analyze a Student Population</h1>
      <Card>
        <h2 className="mb-3 text-xl font-semibold">What do you want to analyze?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Variable" value={v} onChange={setV} options={vk.map((k) => [k, VARS[k].name])} />
          <Select label="Sample Size" value={n} onChange={setN} options={[30, 50, 100, 200, 300].map((x) => [x, String(x)])} />
          <Select label="Sampling Method" value={m} onChange={setM} options={[['srs', 'Simple Random Sampling'], ['strat', 'Stratified Sampling']]} />
          <Select label="Confidence Level" value={c} onChange={setC} options={[[0.9, '90%'], [0.95, '95%'], [0.99, '99%']]} />
        </div>
        <div className="mt-4 flex gap-3"><Btn onClick={take}>Take Sample</Btn><Btn secondary onClick={reset}>Reset</Btn></div>
      </Card>
      <div ref={out}>
        {err && <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">{err}</div>}
        {res && <Results r={res} popSize={pop.length} />}
      </div>
    </div>
  );
}

function Results({ r, popSize }: { r: Analysis; popSize: number }) {
  const { st, v } = r, cp = Math.round(r.conf * 100);
  const data = [{ name: 'Population Mean', value: r.mu, err: [0, 0], fill: '#8b8bf5' }, { name: 'Sample Mean', value: st.mean, err: [st.margin, st.margin], fill: '#3b82f6' }];
  const lo = Math.min(r.mu, st.lo) * 0.9, hi = Math.max(r.mu, st.hi) * 1.05;
  return (
    <div className="fade">
      <h2 className="mb-3 text-2xl font-semibold">Analysis Results</h2>
      <Card>
        <h3 className="font-semibold">1 · Objective</h3>
        <p className="mb-4">Estimate the average {VARS[v].noun} of the college student population using a sample.</p>
        <h3 className="font-semibold">2 · Your Selection</h3>
        <table className="text-sm"><tbody>
          {[['Population', `${popSize.toLocaleString()} students`], ['Sample Size', r.n], ['Variable', VARS[v].name], ['Sampling Method', r.method === 'srs' ? 'Simple Random Sampling' : 'Stratified Sampling'], ['Confidence Level', `${cp}%`]].map(([a, b]) => <tr key={a as string}><td className="py-1 pr-6 text-slate-500">{a}</td><td>{b}</td></tr>)}
        </tbody></table>
      </Card>
      <Card>
        <h3 className="mb-2 font-semibold">3 · What happened?</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Box>Population ({popSize.toLocaleString()})</Box>→
          {r.alloc ? <><Box>Departments: {r.alloc.map((x) => `${x.d} ${x.size}`).join(' · ')}</Box>→<Box>Selected: {r.alloc.map((x) => `${x.d} ${x.k}`).join(' · ')}</Box></> : <><Box>Random draw (no replacement)</Box>→<Box>{r.n} students selected</Box></>}
          →<Box><b>Final Sample ({r.n})</b></Box>
        </div>
      </Card>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Population Mean" value={fv(r.mu, v)} /><Stat label="Sample Mean" value={fv(st.mean, v)} />
        <Stat label="Standard Error" value={fv(st.se, v, 3)} /><Stat label={`${cp}% Confidence Interval`} value={`${fmt(st.lo)} – ${fmt(st.hi)}${VARS[v].unit}`} />
      </div>
      <Card>
        <h2 className="mb-3 text-xl font-semibold">4 · How Was This Calculated?</h2>
        <h3 className="font-semibold">Sample Mean</h3><Math_>{`x̄ = Σx / n\nx̄ = ${fmt(st.sum, 1)} / ${st.n}\nx̄ = ${fmt(st.mean, 3)}`}</Math_>
        <h3 className="font-semibold">Sample Standard Deviation &amp; Degrees of Freedom</h3><Math_>{`s = √[Σ(x − x̄)² / (n − 1)] = ${fmt(st.s, 3)}\ndf = n − 1 = ${st.n} − 1 = ${st.df}`}</Math_>
        <h3 className="font-semibold">Standard Error</h3><Math_>{`SE = s / √n\nSE = ${fmt(st.s, 3)} / √${st.n}\nSE = ${fmt(st.se, 3)}`}</Math_>
        <h3 className="font-semibold">Confidence Interval</h3><Math_>{`CI = x̄ ± t × s/√n\nCI = ${fmt(st.mean, 3)} ± ${fmt(st.t, 3)}(${fmt(st.s, 3)}/√${st.n})\nCI = ${fmt(st.mean, 3)} ± ${fmt(st.margin, 3)}\nCI = ${fmt(st.lo)} – ${fmt(st.hi)}`}</Math_>
        <p className="rounded-lg bg-indigo-50 p-3 text-sm text-slate-600"><b>Why t-distribution?</b> Because the population standard deviation is unknown, the t-distribution is used to estimate the population mean from the sample. (t-critical for {cp}% with df = {st.df} is {fmt(st.t, 3)}.)</p>
      </Card>
      <Card>
        <h2 className="mb-3 text-xl font-semibold">5 · Population Mean vs Sample Mean</h2>
        <div className="h-72 w-full"><ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis domain={[Math.floor(lo), Math.ceil(hi)]} allowDataOverflow />
            <Tooltip formatter={(x: number) => fmt(x, 2)} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={110} label={{ position: 'top', formatter: (x: number) => fmt(x, 2), dy: -14 }}>
              {data.map((d) => <Cell key={d.name} fill={d.fill} />)}<ErrorBar dataKey="err" stroke="#1e293b" width={8} />
            </Bar>
          </BarChart></ResponsiveContainer></div>
        <p className="text-xs text-slate-500">Black whisker = {cp}% confidence interval around the sample mean.</p>
      </Card>
      <Card><h2 className="mb-2 text-xl font-semibold">6 · What Does This Result Mean?</h2><p>{generateInterpretation(r)}</p></Card>
      <Card className="border-l-4 !border-l-green-600"><h2 className="mb-2 text-xl font-semibold">7 · Conclusion</h2><p className="text-lg">{generateConclusion(r)}</p></Card>
      <Learn text="Sampling allows us to study a smaller group and use it to estimate characteristics of a larger population. The sample mean provides a point estimate, while the confidence interval provides a range of plausible values for the population mean. Because σ is unknown, the t-distribution is used." />
      <Uses />
    </div>
  );
}
const Box = ({ children }: { children: React.ReactNode }) => <div className="rounded-lg bg-indigo-50 px-3 py-2">{children}</div>;
