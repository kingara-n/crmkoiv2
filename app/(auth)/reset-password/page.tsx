"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password-confirm`,
    });
    
    setLoading(false);
    
    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 sm:p-10 flex flex-col my-8">
      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Reset Password</h1>
        <p className="text-sm text-neutral-500 mt-2">Enter your email and we'll send a link to reset your password</p>
      </div>

      {/* Form */}
      {success ? (
        <div className="text-center space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
            Check your email for the reset link!
          </div>
          <Link href="/login" className="inline-block mt-4 text-sm font-semibold text-black hover:underline">
            ← Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-xl bg-black text-white font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send reset link"}
          </button>
        </form>
      )}

      {!success && (
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
          <Link href="/login" className="text-sm font-semibold text-black hover:underline">
            ← Back to log in
          </Link>
        </div>
      )}
    </div>
  );
}
