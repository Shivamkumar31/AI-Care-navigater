"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUserState] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUserState(u);
    Promise.all([api.listPolicies(), api.listJourneys()])
      .then(([p, j]) => {
        setPolicies(p);
        setJourneys(j);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500 text-sm">Loading dashboard...</p>;

  const activeJourney = journeys.find((j) => !j.closed);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back, {user?.name?.split(" ")[0]}</h1>
      <p className="text-sm text-slate-500 mb-8">Here's a snapshot of your insurance and care journeys.</p>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-3xl font-bold text-brand-600">{policies.length}</p>
          <p className="text-sm text-slate-500 mt-1">Insurance policies on file</p>
        </div>
        <div className="card">
          <p className="text-3xl font-bold text-brand-600">{journeys.length}</p>
          <p className="text-sm text-slate-500 mt-1">Care journeys tracked</p>
        </div>
        <div className="card">
          <p className="text-3xl font-bold text-brand-600">{journeys.filter((j) => j.closed).length}</p>
          <p className="text-sm text-slate-500 mt-1">Completed journeys</p>
        </div>
      </div>

      {activeJourney && (
        <div className="card mb-8 border-brand-200 bg-brand-50">
          <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Active journey</p>
          <p className="font-semibold text-slate-800 mt-1">{activeJourney.patientName} — {activeJourney.currentStage}</p>
          <Link href="/journey" className="text-sm text-brand-600 font-medium mt-2 inline-block">Continue tracking →</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-6">
        <Link href="/insurance" className="card hover:shadow-md transition-shadow">
          <p className="font-semibold text-slate-800">📋 Manage insurance</p>
          <p className="text-sm text-slate-500 mt-1">Add or review your policies.</p>
        </Link>
        <Link href="/hospitals" className="card hover:shadow-md transition-shadow">
          <p className="font-semibold text-slate-800">🏥 Find hospitals</p>
          <p className="text-sm text-slate-500 mt-1">Match hospitals to your coverage.</p>
        </Link>
        <Link href="/journey" className="card hover:shadow-md transition-shadow">
          <p className="font-semibold text-slate-800">🗺️ Track care journey</p>
          <p className="text-sm text-slate-500 mt-1">Start or continue a journey.</p>
        </Link>
      </div>
    </div>
  );
}
