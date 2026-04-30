import { useState } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import { apiRequest } from '../services/api';

export default function RiskPage() {
  const [form, setForm] = useState({
    jsa_id: '',
    hazard: '',
    likelihood: '1',
    severity: '1',
  });
  const [createdRisk, setCreatedRisk] = useState(null);
  const [message, setMessage] = useState('');

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function createRisk(event) {
    event.preventDefault();
    setMessage('');
    setCreatedRisk(null);

    try {
      const result = await apiRequest('/risk', {
        method: 'POST',
        body: {
          jsa_id: Number(form.jsa_id),
          hazard: form.hazard,
          likelihood: Number(form.likelihood),
          severity: Number(form.severity),
        },
      });
      setCreatedRisk(result);
      setMessage('Risk assessment created.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Risk Assessment</h1>
        <p className="mt-2 text-slate-600">Create a risk assessment linked to a JSA.</p>

        <form onSubmit={createRisk} className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
          <FormInput label="JSA ID" name="jsa_id" type="number" value={form.jsa_id} onChange={updateField} />
          <FormInput label="Hazard" name="hazard" value={form.hazard} onChange={updateField} />
          <FormInput label="Likelihood (1-5)" name="likelihood" type="number" value={form.likelihood} onChange={updateField} />
          <FormInput label="Severity (1-5)" name="severity" type="number" value={form.severity} onChange={updateField} />
          <button className="rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">
            Create Risk
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}

        {createdRisk && (
          <section className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Calculated Risk</h2>
            <p className="mt-2 text-slate-700">Risk Score: {createdRisk.risk_score}</p>
            <p className="text-slate-700">Hazard: {createdRisk.hazard}</p>
            <RiskList title="AI Risks" items={createdRisk.risks} />
            <RiskList title="AI Controls" items={createdRisk.controls} />
          </section>
        )}
      </section>
    </main>
  );
}

function RiskList({ title, items = [] }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.length ? items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>) : <li>No items returned.</li>}
      </ul>
    </div>
  );
}
