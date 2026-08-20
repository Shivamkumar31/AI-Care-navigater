"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "../../lib/api";
import Disclaimer from "../../components/Disclaimer";

const SCHEME_TYPES = ["ESI", "PM-JAY", "Arogya-Karnataka", "Yeshaswini", "Private", "Employer", "Other"];
const ROOM_OPTIONS = ["General Ward", "Semi-Private", "Private", "ICU-only", "Any"];

const emptyForm = {
  schemeType: "PM-JAY",
  insurerName: "",
  policyNumber: "",
  policyType: "Individual",
  coverageLimit: "",
  roomEligibility: "General Ward",
  networkType: "Both",
  exclusions: "",
  copayPercentage: 0,
};

export default function InsurancePage() {
  const router = useRouter();
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!getUser()) {
      router.push("/login");
      return;
    }
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setFetching(true);
    try {
      const data = await api.listPolicies();
      setPolicies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        coverageLimit: Number(form.coverageLimit),
        copayPercentage: Number(form.copayPercentage) || 0,
        exclusions: form.exclusions
          ? form.exclusions.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      await api.createPolicy(payload);
      setForm(emptyForm);
      await loadPolicies();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await api.deletePolicy(id);
    loadPolicies();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Add insurance policy</h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter your government scheme or private insurance details. Use synthetic/mock data for testing.
        </p>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Scheme / Insurance type</label>
              <select className="input-field" name="schemeType" value={form.schemeType} onChange={handleChange}>
                {SCHEME_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Insurer name</label>
              <input className="input-field" name="insurerName" value={form.insurerName} onChange={handleChange} placeholder="e.g. Star Health / Govt of Karnataka" required />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Policy number (optional)</label>
              <input className="input-field" name="policyNumber" value={form.policyNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Policy type</label>
              <select className="input-field" name="policyType" value={form.policyType} onChange={handleChange}>
                <option>Individual</option>
                <option>Family Floater</option>
                <option>Group</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Coverage limit (₹)</label>
              <input className="input-field" type="number" name="coverageLimit" value={form.coverageLimit} onChange={handleChange} required min={0} />
            </div>
            <div>
              <label className="label">Room eligibility</label>
              <select className="input-field" name="roomEligibility" value={form.roomEligibility} onChange={handleChange}>
                {ROOM_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Network type</label>
              <select className="input-field" name="networkType" value={form.networkType} onChange={handleChange}>
                <option value="Cashless-Network">Cashless-Network</option>
                <option value="Reimbursement-Only">Reimbursement-Only</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div>
              <label className="label">Co-pay %</label>
              <input className="input-field" type="number" name="copayPercentage" value={form.copayPercentage} onChange={handleChange} min={0} max={100} />
            </div>
          </div>

          <div>
            <label className="label">Exclusions (comma separated)</label>
            <input className="input-field" name="exclusions" value={form.exclusions} onChange={handleChange} placeholder="e.g. cosmetic surgery, dental" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Saving..." : "Save policy"}
          </button>
        </form>

        <Disclaimer text="Insurance details entered here are used only for eligibility matching within this app and are not a verified claim submission." />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Your policies</h2>
        {fetching ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : policies.length === 0 ? (
          <p className="text-slate-500 text-sm">No policies added yet.</p>
        ) : (
          <div className="space-y-4">
            {policies.map((p) => (
              <div key={p._id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">{p.insurerName}</p>
                    <p className="text-xs text-brand-600 font-medium">{p.schemeType}</p>
                  </div>
                  <button onClick={() => handleDelete(p._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mt-3">
                  <p>Coverage: ₹{p.coverageLimit?.toLocaleString("en-IN")}</p>
                  <p>Room: {p.roomEligibility}</p>
                  <p>Co-pay: {p.copayPercentage}%</p>
                  <p>Type: {p.policyType}</p>
                </div>
                {p.exclusions?.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2">Exclusions: {p.exclusions.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
