"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearToken } from "../lib/api";

export default function Navbar() {
  const [user, setUserState] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setUserState(getUser());
  }, []);

  const logout = () => {
    clearToken();
    if (typeof window !== "undefined") localStorage.removeItem("acn_user");
    setUserState(null);
    router.push("/");
  };

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-brand-700">
          🏥 AI Care Navigator
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-brand-600">Dashboard</Link>
              <Link href="/insurance" className="hover:text-brand-600">Insurance</Link>
              <Link href="/hospitals" className="hover:text-brand-600">Hospitals</Link>
              <Link href="/journey" className="hover:text-brand-600">Care Journey</Link>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">Hi, {user.name?.split(" ")[0]}</span>
              <button onClick={logout} className="btn-secondary py-1.5 px-3 text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand-600">Login</Link>
              <Link href="/register" className="btn-primary py-1.5 px-4 text-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
