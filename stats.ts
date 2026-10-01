export type VarKey = 'marks' | 'att' | 'study' | 'sleep' | 'commute';
export type Method = 'srs' | 'strat';
export type Conf = 0.9 | 0.95 | 0.99;
export interface Student { id: string; dept: string; year: number; att: number; study: number; marks: number; sleep: number; commute: number }
export interface Stats { n: number; sum: number; mean: number; s: number; se: number; df: number; t: number; margin: number; lo: number; hi: number }
export interface Alloc { d: string; size: number; k: number }
export interface Analysis { v: VarKey; n: number; method: Method; conf: Conf; alloc: Alloc[] | null; st: Stats; mu: number }
export interface Experiment { v: VarKey; n: number; k: number; means: number[]; mu: number; sigma: number; mm: number; se: number; theo: number; within: number }

export const VARS: Record<VarKey, { name: string; noun: string; unit: string; d: number }> = {
  marks: { name: 'Exam Marks', noun: 'exam marks', unit: '', d: 1 },
  att: { name: 'Attendance', noun: 'attendance', unit: '%', d: 1 },
  study: { name: 'Study Hours', noun: 'study hours', unit: ' hrs', d: 2 },
  sleep: { name: 'Sleep Hours', noun: 'sleep hours', unit: ' hrs', d: 2 },
  commute: { name: 'Commute Time', noun: 'commute time', unit: ' min', d: 1 },
};
export const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH'];
const Z: Record<number, number> = { 0.9: 1.6449, 0.95: 1.96, 0.99: 2.5758 };

export const fmt = (x: number, d = 2) => x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fv = (x: number, v: VarKey, d?: number) => fmt(x, d ?? VARS[v].d) + VARS[v].unit;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
function gauss() { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); }

export function generatePopulation(N: number): Student[] {
  const off: Record<string, number> = { CSE: 2, ECE: 0, EEE: -1, MECH: -2 }, w = [0.35, 0.25, 0.2, 0.2], out: Student[] = [];
  for (let i = 0; i < N; i++) {
    let r = Math.random(), k = 0; while (r > w[k] && k < 3) { r -= w[k]; k++; }
    const dept = DEPTS[k], year = 1 + Math.floor(Math.random() * 4), g = gauss(), study = clamp(5 + 1.5 * g + gauss() * 0.8, 1, 10);
    out.push({ id: 'S' + String(i + 1).padStart(4, '0'), dept, year,
      att: +clamp(78 + 7 * g - (year - 2.5) * 1.2 + 5 * gauss(), 50, 100).toFixed(1), study: +study.toFixed(1),
      marks: +clamp(64 + off[dept] + 6 * g + 1.2 * (study - 5) + 6 * gauss(), 35, 100).toFixed(1),
      sleep: +clamp(6.6 - 0.3 * g + 0.9 * gauss(), 4, 9).toFixed(1), commute: Math.round(clamp(Math.exp(3.3 + 0.6 * gauss()), 5, 120)) });
  }
  return out;
}
function draw<T>(arr: T[], n: number): T[] {
  const a = arr.slice();
  for (let i = 0; i < n; i++) { const j = i + Math.floor(Math.random() * (a.length - i)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
export const simpleRandomSample = (pop: Student[], n: number) => ({ sample: draw(pop, n), alloc: null as Alloc[] | null });
export function stratifiedSample(pop: Student[], n: number) {
  const q = DEPTS.map((d) => { const g = pop.filter((p) => p.dept === d); const exact = (n * g.length) / pop.length; return { d, g, size: g.length, exact, k: Math.floor(exact) }; });
  const left = n - q.reduce((s, x) => s + x.k, 0);
  [...q].sort((a, b) => b.exact - b.k - (a.exact - a.k)).slice(0, left).forEach((x) => x.k++);
  return { sample: q.flatMap((x) => draw(x.g, x.k)), alloc: q.map(({ d, size, k }) => ({ d, size, k })) as Alloc[] | null };
}
export const calculateMean = (x: number[]) => x.reduce((a, b) => a + b, 0) / x.length;
export const calculateStandardDeviation = (x: number[], m = calculateMean(x)) => Math.sqrt(x.reduce((a, b) => a + (b - m) ** 2, 0) / (x.length - 1));
export const calculateStandardError = (s: number, n: number) => s / Math.sqrt(n);
/** t quantile via Cornish-Fisher expansion of the normal quantile (accurate for df >= 29). */
export function calculateTValue(conf: Conf, df: number) {
  const z = Z[conf], z3 = z ** 3, z5 = z ** 5, z7 = z ** 7;
  return z + (z3 + z) / (4 * df) + (5 * z5 + 16 * z3 + 3 * z) / (96 * df ** 2) + (3 * z7 + 19 * z5 + 17 * z3 - 15 * z) / (384 * df ** 3);
}
export function calculateConfidenceInterval(x: number[], conf: Conf): Stats {
  const n = x.length; if (n < 2) throw new Error('Sample too small for a confidence interval.');
  const mean = calculateMean(x), s = calculateStandardDeviation(x, mean), se = calculateStandardError(s, n), df = n - 1, t = calculateTValue(conf, df), margin = t * se;
  return { n, sum: x.reduce((a, b) => a + b, 0), mean, s, se, df, t, margin, lo: mean - margin, hi: mean + margin };
}
export function runAnalysis(pop: Student[], v: VarKey, n: number, method: Method, conf: Conf): Analysis {
  if (!pop.length) throw new Error('The population is empty. Generate college data first.');
  if (n > pop.length) throw new Error(`Sample size (${n}) cannot exceed the population size (${pop.length}).`);
  const { sample, alloc } = (method === 'srs' ? simpleRandomSample : stratifiedSample)(pop, n);
  if (sample.length < 2) throw new Error('Invalid sample.');
  return { v, n, method, conf, alloc, st: calculateConfidenceInterval(sample.map((p) => p[v]), conf), mu: calculateMean(pop.map((p) => p[v])) };
}
export function runSamplingExperiment(pop: Student[], v: VarKey, n: number, k: number): Experiment {
  if (n > pop.length) throw new Error('Sample size cannot exceed the population size.');
  const means = Array.from({ length: k }, () => calculateMean(draw(pop, n).map((p) => p[v])));
  const vals = pop.map((p) => p[v]), mu = calculateMean(vals), sigma = Math.sqrt(vals.reduce((a, b) => a + (b - mu) ** 2, 0) / vals.length);
  const mm = calculateMean(means), se = calculateStandardDeviation(means, mm);
  return { v, n, k, means, mu, sigma, mm, se, theo: sigma / Math.sqrt(n), within: means.filter((m) => Math.abs(m - mu) <= 2 * se).length / k };
}
export function generateInterpretation(r: Analysis) {
  const { v, mu, st, n, conf, method } = r, N = VARS[v].noun, diff = st.mean - mu, ad = Math.abs(diff), c = Math.round(conf * 100);
  const closeness = ad <= st.se ? 'very close to' : ad <= 2 * st.se ? 'reasonably close to' : 'noticeably different from';
  const inside = mu >= st.lo && mu <= st.hi;
  return `The selected sample of ${n} students has an average of ${fv(st.mean, v)} for ${N}, while the population average is ${fv(mu, v)}. The sample mean is ${closeness} the population mean (${fv(ad, v)} ${diff > 0 ? 'above' : 'below'} it, compared with a standard error of ${fv(st.se, v)}). ` +
    (inside ? `The ${c}% confidence interval (${fv(st.lo, v)} to ${fv(st.hi, v)}) does contain the true population mean, so this interval worked as intended. ` : `The ${c}% confidence interval (${fv(st.lo, v)} to ${fv(st.hi, v)}) happens to miss the true population mean. This is expected in roughly ${100 - c}% of samples, which is exactly what a ${c}% level means. `) +
    `The interval is ${fv(2 * st.margin, v)} wide; a larger sample or a lower confidence level would make it narrower. ` +
    (method === 'strat' ? 'Stratified sampling guaranteed every department was represented in proportion to its size.' : 'Simple random sampling gave every student the same chance of selection.');
}
export const generateConclusion = (r: Analysis) =>
  `Based on the selected sample, the estimated average ${VARS[r.v].noun} is ${fv(r.st.mean, r.v)}. At the ${Math.round(r.conf * 100)}% confidence level, the population mean is estimated to lie between ${fv(r.st.lo, r.v)} and ${fv(r.st.hi, r.v)}.`;
export function experimentInterpretation(r: Experiment) {
  const ratio = r.se / r.theo;
  return `${r.k} samples of size ${r.n} were drawn. The mean of the sample means is ${fv(r.mm, r.v)}, very close to the population mean of ${fv(r.mu, r.v)} (difference ${fv(Math.abs(r.mm - r.mu), r.v)}). The observed standard error of ${fv(r.se, r.v, 3)} is ${ratio > 0.9 && ratio < 1.1 ? 'almost identical to' : 'near'} the theoretical value σ/√n = ${fv(r.theo, r.v, 3)}. ${fmt(r.within * 100, 0)}% of the sample means fall within 2 standard errors of the population mean. Try a different sample size and run again: a larger n makes the histogram for ${VARS[r.v].noun} narrower, since SE shrinks as √n grows.`;
}
