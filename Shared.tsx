import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>
);
export const Stat = ({ label, value }: { label: string; value: string }) => (
  <Card className="!mb-0 border-l-4 !border-l-brand"><div className="text-xs text-slate-500">{label}</div><div className="text-2xl font-bold">{value}</div></Card>
);
export function Select<T extends string | number>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <label className="block text-xs font-semibold text-slate-500">{label}
      <select value={String(value)} onChange={(e) => { const o = options.find(([v]) => String(v) === e.target.value)!; onChange(o[0]); }}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm font-normal text-slate-800">
        {options.map(([v, l]) => <option key={String(v)} value={String(v)}>{l}</option>)}
      </select>
    </label>
  );
}
export const Btn = ({ children, onClick, secondary }: { children: ReactNode; onClick: () => void; secondary?: boolean }) => (
  <button onClick={onClick} className={`rounded-lg px-5 py-2 text-sm font-semibold transition active:scale-95 ${secondary ? 'bg-indigo-50 text-brand' : 'bg-gradient-to-r from-brand to-blue-500 text-white'}`}>{children}</button>
);
export const Math_ = ({ children }: { children: ReactNode }) => (
  <pre className="mb-4 mt-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm">{children}</pre>
);
export const Tags = ({ items }: { items: string[] }) => <>{items.map((x) => <span key={x} className="m-1 inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm text-brand">{x}</span>)}</>;
export const Learn = ({ text }: { text: string }) => (
  <Card className="!bg-indigo-50"><h2 className="mb-2 text-xl font-semibold">💡 What Did We Learn?</h2><p>{text}</p></Card>
);
export const Uses = () => (
  <Card><h2 className="mb-2 text-xl font-semibold">Where Can This Be Used?</h2>
    <Tags items={['College surveys', 'Educational research', 'Student satisfaction studies', 'Attendance studies', 'Academic research', 'Market research', 'Survey research']} />
    <p className="mt-2 text-sm text-slate-500">The same process applies to any large group that is too big to measure completely.</p></Card>
);
export const PopBar = ({ n, onN, onRegen }: { n: number; onN: (n: number) => void; onRegen: () => void }) => (
  <Card className="flex flex-wrap items-center justify-between gap-3">
    <div><b>Simulated Population: {n.toLocaleString()} Students</b>
      <div className="text-xs text-slate-500">This is simulated data created for educational purposes and does not represent real students.</div></div>
    <div className="flex gap-2">
      <select value={n} onChange={(e) => onN(+e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm">
        {[500, 1000, 2000, 5000].map((x) => <option key={x} value={x}>{x.toLocaleString()} students</option>)}</select>
      <button onClick={onRegen} className="flex items-center gap-1 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-semibold text-brand"><RefreshCw size={14} />Generate New College Data</button>
    </div>
  </Card>
);
