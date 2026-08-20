import Link from "next/link";

const FEATURES = [
  {
    title: "Insurance Intake",
    desc: "Enter or upload your policy — ESI, PM-JAY, Arogya Karnataka, Yeshaswini, or private insurance — normalized into one clear profile.",
    icon: "📋",
  },
  {
    title: "Hospital & Room Matching",
    desc: "See which hospitals accept your coverage, what room categories you're eligible for, and indicative costs — explained in plain language.",
    icon: "🏥",
  },
  {
    title: "Care Journey Tracking",
    desc: "Follow admission → investigation → procedure → recovery → discharge, with insurance-aware guidance surfaced at every stage.",
    icon: "🗺️",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="text-center py-16">
        <span className="inline-block bg-brand-50 text-brand-700 text-xs font-semibold rounded-full px-4 py-1.5 mb-6">
          Precision Care Challenge 2026 · Team Hospitality
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight max-w-3xl mx-auto">
          Navigate hospital care with your insurance as your guide.
        </h1>
        <p className="text-lg text-slate-600 mt-5 max-w-2xl mx-auto">
          A unified, India-specific decision-support platform that maps your insurance to eligible hospitals,
          room categories, and care pathways — so you're never guessing during an emergency.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-base">Get Started Free</Link>
          <Link href="/login" className="btn-secondary text-base">I already have an account</Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-6 mt-8">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="font-semibold text-slate-800 mt-3">{f.title}</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="card mt-10 bg-slate-50">
        <h3 className="font-semibold text-slate-800">Important</h3>
        <p className="text-sm text-slate-600 mt-2">
          AI Care Navigator is a decision-support and information platform. It does not provide medical
          diagnoses, clinical treatment recommendations, or binding insurance advice. Always confirm
          final decisions with your insurer, doctor, and hospital.
        </p>
      </section>
    </div>
  );
}
