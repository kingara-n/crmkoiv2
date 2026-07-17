"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    
    setLoading(false);
    
    if (authError) {
      setError(authError.message);
      return;
    }

    if (authData.user) {
      // The trigger created the profile as pending. Route to pending.
      router.push("/pending");
    }
  }

  return (
    <div className="w-full max-w-md bg-ink-900/60 backdrop-blur-xl border border-ink-700/50 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-8 sm:p-10 flex flex-col my-8">
      {/* Brand Logo */}
      <div className="flex justify-center mb-6">
        <Image 
          src="/images/koi-new-logo.png" 
          alt="Koi Travel Logo" 
          width={100} 
          height={100} 
          className="object-contain hover:scale-105 transition-transform duration-300"
          priority
        />
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
        <p className="text-sm text-neutral-400 mt-2">Sign up to get access to the Koi Travel CRM</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-sm text-red-200 text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="full_name" className="block text-sm font-medium text-neutral-300">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              id="full_name"
              type="text"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-700 bg-ink-950/80 text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-ink-700 bg-ink-950/80 text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-700 bg-ink-950/80 text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="confirm_password" className="block text-sm font-medium text-neutral-300">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              id="confirm_password"
              type="password"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink-700 bg-ink-950/80 text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 mt-2 rounded-xl bg-accent-500 text-black font-semibold hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-all disabled:opacity-70 flex items-center justify-center"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-ink-700/50 text-center">
        <p className="text-sm text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-neutral-400">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-neutral-400">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
