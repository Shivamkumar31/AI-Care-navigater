"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "../../lib/api";
import HospitalCard from "../../components/HospitalCard";
import Disclaimer from "../../components/Disclaimer";

export default function HospitalsPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({ policyId: "", procedureOrSpecialty: "", city: "" });
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getUser()) {
      router.push("/login");
      return;
    }
    api.listPolicies().then((data) => {
      setPolicies(data);
      if (data.length) setForm((f) => ({ ...f, policyId: data[0]._id }));
    }).catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.policyId) {
      setError("Please add an insurance policy first.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.matchHospitals(form);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Find eligible hospitals</h1>
      <p className="text-sm text-slate-500 mb-6">
        Matched against your insurance coverage — with room eligibility and indicative costs explained.
      </p>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

      {policies.length === 0 ? (
        <div className="card">
          <p className="text-slate-600 text-sm">
            You need to add an insurance policy before searching for hospitals.{" "}
            <a href="/insurance" className="text-brand-600 font-medium">Add one now →</a>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSearch} className="card grid sm:grid-cols-4 gap-4 items-end mb-8">
          <div className="sm:col-span-2">
            <label className="label">Insurance policy</label>
            <select className="input-field" name="policyId" value={form.policyId} onChange={handleChange}>
              {policies.map((p) => (
                <option key={p._id} value={p._id}>{p.insurerName} — {p.schemeType}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">City (optional)</label>
            <input className="input-field" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Bengaluru" />
          </div>
          <div>
            <label className="label">Specialty / procedure</label>
            <input className="input-field" name="procedureOrSpecialty" value={form.procedureOrSpecialty} onChange={handleChange} placeholder="e.g. Cardiology" />
          </div>
          <div className="sm:col-span-4">
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? "Searching..." : "Find hospitals"}
            </button>
          </div>
        </form>
      )}

      {results && (
        <div>
          <p className="text-sm text-slate-500 mb-4">{results.resultCount} matching hospitals found</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {results.suggestions.map((s) => (
              <HospitalCard key={s.hospital._id} suggestion={s} />
            ))}
          </div>
          {results.suggestions.length === 0 && (
            <p className="text-slate-500 text-sm">No in-network hospitals matched your criteria. Try removing the city or specialty filter.</p>
          )}
          <Disclaimer text={results.disclaimer} />
        </div>
      )}
    </div>
  );
}
