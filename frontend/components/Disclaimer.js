export default function Disclaimer({ text }) {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 mt-4">
      <strong>Note:</strong> {text || "This is decision-support information only — not a medical diagnosis or a binding insurance approval. Always confirm final eligibility with your insurer and hospital."}
    </div>
  );
}
