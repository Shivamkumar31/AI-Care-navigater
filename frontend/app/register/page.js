"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setToken, setUser } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "caregiver", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.register(form);
      setToken(data.token);
      setUser(data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Create your account</h1>
      <p className="text-sm text-slate-500 mb-6">Start navigating your care journey with confidence.</p>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input-field" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input-field" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input-field" type="password" name="password" value={form.password} onChange={handleChange} minLength={6} required />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input-field" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label className="label">I am a</label>
          <select className="input-field" name="role" value={form.role} onChange={handleChange}>
            <option value="caregiver">Caregiver</option>
            <option value="patient">Patient</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-slate-500 mt-5 text-center">
        Already have an account? <Link href="/login" className="text-brand-600 font-medium">Log in</Link>
      </p>
    </div>
  );
}
