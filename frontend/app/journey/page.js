"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "../../lib/api";
import StageStepper from "../../components/StageStepper";
import Disclaimer from "../../components/Disclaimer";

export default function JourneyPage() {
  const router = useRouter();
  const [journeys, setJourneys] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [stages, setStages] = useState([]);
  const [form, setForm] = useState({ patientName: "", insurancePolicy: "", hospital: "", selectedRoomCategory: "" });
  const [active, setActive] = useState(null);
  const [guidance, setGuidance] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getUser()) {
      router.push("/login");
      return;
    }
    Promise.all([api.listJourneys(), api.listPolicies(), api.listHospitals(), api.getStages()])
      .then(([j, p, h, s]) => {
        setJourneys(j);
        setPolicies(p);
        setHospitals(h);
        setStages(s);
        if (p.length) setForm((f) => ({ ...f, insurancePolicy: p[0]._id }));
        if (h.length) setForm((f) => ({ ...f, hospital: h[0]._id }));
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const journey = await api.createJourney(form);
      setJourneys((j) => [journey, ...j]);
      openJourney(journey._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openJourney = async (id) => {
    const data = await api.getJourney(id);
    setActive(data.journey);
    setGuidance(data.guidance);
  };

  const advanceStage = async (stage) => {
    if (!active) return;
    const data = await api.updateStage(active._id, { stage, notes: `Moved to ${stage}` });
    setActive(data.journey);
    setGuidance(data.guidance);
    setJourneys((js) => js.map((j) => (j._id === data.journey._id ? data.journey : j)));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Care journey</h1>
        <p className="text-sm text-slate-500 mb-6">Track admission through discharge with insurance-aware guidance.</p>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

        {(policies.length === 0 || hospitals.length === 0) ? (
          <div className="card text-sm text-slate-600">
            Add an insurance policy first to start a care journey. <a href="/insurance" className="text-brand-600 font-medium">Add policy →</a>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="card space-y-4">
            <div>
              <label className="label">Patient name</label>
              <input className="input-field" name="patientName" value={form.patientName} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Insurance policy</label>
              <select className="input-field" name="insurancePolicy" value={form.insurancePolicy} onChange={handleChange}>
                {policies.map((p) => <option key={p._id} value={p._id}>{p.insurerName} — {p.schemeType}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Hospital</label>
              <select className="input-field" name="hospital" value={form.hospital} onChange={handleChange}>
                {hospitals.map((h) => <option key={h._id} value={h._id}>{h.name} ({h.city})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Room category</label>
              <select className="input-field" name="selectedRoomCategory" value={form.selectedRoomCategory} onChange={handleChange}>
                <option value="">Select...</option>
                <option>General Ward</option>
                <option>Semi-Private</option>
                <option>Private</option>
                <option>ICU-only</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Starting..." : "Start new journey"}
            </button>
          </form>
        )}

        <h2 className="text-sm font-semibold text-slate-700 mt-8 mb-3">Your journeys</h2>
        <div className="space-y-2">
          {journeys.map((j) => (
            <button
              key={j._id}
              onClick={() => openJourney(j._id)}
              className={`w-full text-left text-sm rounded-xl px-4 py-3 border ${active?._id === j._id ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"}`}
            >
              <p className="font-medium text-slate-800">{j.patientName || "Unnamed patient"}</p>
              <p className="text-xs text-slate-500">{j.currentStage}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {active ? (
          <div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{active.patientName}</h2>
                  <p className="text-sm text-slate-500">
                    {active.hospital?.name} · {active.selectedRoomCategory || "Room not set"}
                  </p>
                </div>
                {active.closed && <span className="text-xs bg-green-100 text-green-700 rounded-full px-3 py-1">Discharged</span>}
              </div>
              <StageStepper stages={stages} currentStage={active.currentStage} onSelect={advanceStage} />
              <p className="text-xs text-slate-400 mt-3">Click a stage to move the journey forward and refresh guidance.</p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-800 mb-3">Guidance for: {active.currentStage}</h3>
              <div className="space-y-3">
                {guidance.map((g, i) => (
                  <div key={i} className="card py-3 px-4 text-sm text-slate-700 leading-relaxed">
                    {g}
                  </div>
                ))}
              </div>
              <Disclaimer />
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-800 mb-3">Stage history</h3>
              <div className="card">
                <ul className="text-sm text-slate-600 space-y-2">
                  {active.stageHistory?.slice().reverse().map((s, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{s.stage}</span>
                      <span className="text-slate-400">{new Date(s.enteredAt).toLocaleString("en-IN")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="card text-sm text-slate-500">Select or start a care journey to see the timeline and guidance.</div>
        )}
      </div>
    </div>
  );
}
