import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../services/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/dashboard')
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  const cards = [
    { label: 'Total JSA', value: summary?.total_jsa ?? 0 },
    { label: 'Total Risks', value: summary?.total_risks ?? 0 },
    { label: 'Total PTW', value: summary?.total_ptw ?? 0 },
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Dashboard</h1>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
