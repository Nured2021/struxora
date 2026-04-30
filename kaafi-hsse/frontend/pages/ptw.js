import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import { apiRequest } from '../services/api';

export default function PtwPage() {
  const [form, setForm] = useState({
    jsa_id: '',
    risk_id: '',
    permit_type: 'hot_work',
    description: '',
    start_time: '',
    end_time: '',
  });
  const [permits, setPermits] = useState([]);
  const [message, setMessage] = useState('');

  async function loadPermits() {
    try {
      const data = await apiRequest('/ptw');
      setPermits(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadPermits();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submitPermit(event) {
    event.preventDefault();
    setMessage('');

    try {
      await apiRequest('/ptw', {
        method: 'POST',
        body: form,
      });
      setForm({
        jsa_id: '',
        risk_id: '',
        permit_type: 'hot_work',
        description: '',
        start_time: '',
        end_time: '',
      });
      setMessage('Permit created.');
      await loadPermits();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Permit to Work</h1>
        <p className="mt-2 text-sm text-slate-600">Create basic permits linked to JSA and risk assessment records.</p>

        <form onSubmit={submitPermit} className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="JSA ID" name="jsa_id" value={form.jsa_id} onChange={updateField} required />
            <FormInput label="Risk ID" name="risk_id" value={form.risk_id} onChange={updateField} required />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Permit Type</span>
              <select
                name="permit_type"
                value={form.permit_type}
                onChange={updateField}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="hot_work">Hot Work</option>
                <option value="confined_space">Confined Space</option>
                <option value="electrical">Electrical</option>
                <option value="work_at_height">Work at Height</option>
                <option value="excavation">Excavation</option>
                <option value="general">General</option>
              </select>
            </label>
            <FormInput
              label="Start Time"
              name="start_time"
              type="datetime-local"
              value={form.start_time}
              onChange={updateField}
              required
            />
            <FormInput
              label="End Time"
              name="end_time"
              type="datetime-local"
              value={form.end_time}
              onChange={updateField}
              required
            />
            <div className="md:col-span-2">
              <FormInput label="Description" name="description" value={form.description} onChange={updateField} required />
            </div>
          </div>
          <button className="mt-4 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
            Create Permit
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">PTW List</h2>
          <div className="mt-3 grid gap-3">
            {permits.map((permit) => (
              <div key={permit.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">
                  #{permit.id} - {permit.permit_type}
                </p>
                <p className="text-sm text-slate-600">{permit.description}</p>
                <p className="text-xs text-slate-500">
                  JSA #{permit.jsa_id} | Risk #{permit.risk_id} | Status: {permit.status}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
