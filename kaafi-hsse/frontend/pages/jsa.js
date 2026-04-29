import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import { apiRequest } from '../services/api';

export default function JsaPage() {
  const [form, setForm] = useState({ title: '', description: '', location: '' });
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadJsa() {
    try {
      const data = await apiRequest('/jsa');
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadJsa();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await apiRequest('/jsa', {
        method: 'POST',
        body: form,
      });
      setForm({ title: '', description: '', location: '' });
      setMessage('JSA created.');
      await loadJsa();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">Job Safety Analysis</h1>
        <p className="mt-2 text-sm text-slate-600">Create and list JSA documents.</p>

        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <FormInput
            label="Title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
          <FormInput
            label="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
          <FormInput
            label="Location"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Create JSA'}
          </button>
          {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}
        </form>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">JSA List</h2>
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-medium text-slate-900">#{item.id} - {item.title}</p>
                <p className="text-sm text-slate-600">{item.description}</p>
                <p className="text-xs text-slate-500">Location: {item.location} | Status: {item.status}</p>
              </div>
            ))}
            {!items.length && <p className="text-sm text-slate-500">No JSA documents yet.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
