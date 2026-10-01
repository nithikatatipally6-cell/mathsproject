import { Card, Tags } from './Shared';
export default function About() {
  return (
    <Card className="fade"><h2 className="mb-3 text-2xl font-semibold">About SmartSample</h2>
      <h3 className="font-semibold">Problem</h3><p className="mb-3">Studying every member of a large population can be difficult and expensive.</p>
      <h3 className="font-semibold">Solution</h3><p className="mb-3">Statistical sampling allows researchers to study a smaller group and use the results to estimate population characteristics.</p>
      <h3 className="font-semibold">Module VI Concepts Demonstrated</h3>
      <Tags items={['Sampling', 'Sampling Methods', 'Sampling Distribution', 'Central Limit Theorem', 'Point Estimation', 'Standard Error', 't-Distribution', 'Confidence Intervals']} />
      <p className="mt-4 rounded-lg bg-indigo-50 p-3 text-sm text-slate-600">The student data used in this application is simulated for educational purposes.</p></Card>
  );
}
