import { useState } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import { apiRequest } from '../services/api';

const MODEL_OPTIONS = [
  { label: 'DeepSeek (Risk)', value: 'deepseek', endpoint: '/ai/deepseek' },
  { label: 'Mistral (JSA)', value: 'mistral', endpoint: '/ai/mistral' },
  { label: 'Gemma (Docs)', value: 'gemma', endpoint: '/ai/gemma' },
  { label: 'Phi-3 (Fast)', value: 'phi3', endpoint: '/ai/phi3' },
];

export default function AiPage() {
  const [model, setModel] = useState('deepseek');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    await sendRequest(false);
  }

  async function handleFullAnalysis() {
    await sendRequest(true);
  }

  async function sendRequest(fullAnalysis) {
    setMessage('');
    setLoading(true);

    try {
      const selected = MODEL_OPTIONS.find((option) => option.value === model) || MODEL_OPTIONS[0];
      const data = await apiRequest(fullAnalysis ? '/ai/full-analysis' : selected.endpoint, {
        method: 'POST',
        body: { text },
      });
      setResult(data);
      setText('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
        <p className="mt-2 text-sm text-slate-600">Select one local model and send one request.</p>

        <form onSubmit={handleSubmit} className="mt-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Model</span>
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-600"
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <FormInput
            label="Input text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="working at height without harness"
          />
          {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
          <button className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            {loading ? 'Running...' : 'Analyze'}
          </button>
          <button
            type="button"
            onClick={handleFullAnalysis}
            disabled={loading}
            className="ml-3 mt-4 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Run Full Analysis
          </button>
        </form>

        {result ? (
          <ResultBox result={result} />
        ) : null}
      </section>
    </main>
  );
}

function ResultBox({ result }) {
  if (result.hazard || result.risk || result.jsa || result.ptw || result.document_check || result.summary) {
    return (
      <div className="mt-6 grid gap-4">
        <Section title="Hazards" value={result.hazard} />
        <Section title="Risks" value={result.risk} />
        <Section title="Controls" value={result.controls} />
        <Section title="JSA" value={result.jsa} />
        <Section title="PTW" value={result.ptw} />
        <Section title="Document Check" value={result.document_check} />
        <Section title="Summary" value={result.summary} />
      </div>
    );
  }

  if (result.response) {
    return (
      <div className="mt-6 max-h-96 overflow-auto rounded-lg bg-white p-5 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200">
        <pre className="whitespace-pre-wrap font-sans">{result.response}</pre>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <ResultList title="Hazards" items={result.hazards} />
      <ResultList title="Risks" items={result.risks} />
      <ResultList title="Controls" items={result.controls} />
    </div>
  );
}

function Section({ title, value }) {
  return (
    <div className="max-h-72 overflow-auto rounded-lg bg-white p-5 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <pre className="mt-3 whitespace-pre-wrap font-sans">{formatValue(value)}</pre>
    </div>
  );
}

function formatValue(value) {
  if (value === undefined || value === null || value === '') return 'No result returned.';
  if (Array.isArray(value)) return value.length ? value.join('\n') : 'No result returned.';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
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
