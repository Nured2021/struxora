import { useState } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import { apiRequest } from '../services/api';

export default function AiPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const data = await apiRequest('/ai/risk-analysis', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setResult(data);
      setText('');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">AI Risk Analysis</h1>
        <p className="mt-2 text-sm text-slate-600">DeepSeek R1 via local Ollama.</p>

        <form onSubmit={handleSubmit} className="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <FormInput
            label="Hazard or task text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="working at height without harness"
          />
          {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
          <button className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Analyze
          </button>
        </form>

        {result ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ResultList title="Hazards" items={result.hazards} />
            <ResultList title="Risks" items={result.risks} />
            <ResultList title="Controls" items={result.controls} />
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ResultList({ title, items = [] }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
        {items.length ? items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>) : <li>No items returned.</li>}
      </ul>
    </div>
  );
}
