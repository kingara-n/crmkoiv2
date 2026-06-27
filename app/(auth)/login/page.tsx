"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError || !authData.user) {
      setLoading(false);
      setError(authError?.message || "Failed to log in.");
      return;
    }

    // 2. Fetch the user's profile status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", authData.user.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      setError("Could not retrieve user profile.");
      return;
    }

    // 3. Route based on status
    if (profile.status === "awaiting_approval") {
      router.push("/pending");
    } else if (profile.status === "active") {
      router.push("/dashboard"); // or "/" depending on the home route
    } else if (profile.status === "rejected") {
      // User is rejected, sign them out and show error
      await supabase.auth.signOut();
      setError("Your account access was not approved. Contact an administrator.");
    } else {
      setError(`Unknown account status: ${profile.status}`);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 sm:p-10 flex flex-col">
      {/* Brand Logo */}
      <div className="flex justify-center mb-8">
        <Image
          src="/images/koi-crm-logo.png"
          alt="Koi CRM"
          width={180}
          height={64}
          className="object-contain"
          priority
        />
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Welcome back</h1>
        <p className="text-sm text-neutral-500 mt-2">Enter your credentials to access your account</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
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

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              id="password"
              type="password"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 mt-2 rounded-xl bg-black text-white font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all disabled:opacity-70 flex items-center justify-center"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link href="/reset-password" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">
          Forgot your password?
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
        <p className="text-sm text-neutral-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-black hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-400">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-neutral-500">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-neutral-500">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
