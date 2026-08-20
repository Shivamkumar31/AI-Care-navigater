export default function HospitalCard({ suggestion }) {
  const { hospital, recommendedRoom, eligibleRooms, explanation, score } = suggestion;
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{hospital.name}</h3>
          <p className="text-sm text-slate-500">{hospital.city}, {hospital.state}</p>
        </div>
        <span className="text-xs font-semibold bg-brand-50 text-brand-700 rounded-full px-3 py-1">
          Match {Math.round(score)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {hospital.specialties?.map((s) => (
          <span key={s} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">{s}</span>
        ))}
      </div>

      <p className="text-sm text-slate-600 mt-4 leading-relaxed">{explanation}</p>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700 mb-2">Eligible room categories:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {eligibleRooms.map((r) => (
            <div key={r.category} className={`text-xs rounded-lg px-2.5 py-2 border ${r.category === recommendedRoom.category ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}>
              <p className="font-medium text-slate-700">{r.category}</p>
              <p className="text-slate-500">₹{r.indicativeCostPerDay?.toLocaleString("en-IN")}/day</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
