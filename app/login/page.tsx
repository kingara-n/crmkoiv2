"use client";

import { useRouter } from "next/navigation";
import { DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

export default function LoginPage() {
  const router = useRouter();

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
            <DollarSign className="h-7 w-7 text-black" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Koi Travel</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleContinue} className="rounded-card border border-ink-700 bg-ink-900 p-6 space-y-4">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" defaultValue="john.doe@koitravel.com" />
          </div>
          <div>
            <Label htmlFor="login-pass">Password</Label>
            <Input id="login-pass" type="password" defaultValue="demo" />
          </div>
          <Button fullWidth icon={<ArrowRight className="h-4 w-4" />} type="submit">
            Continue
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Demo mode — any credentials work. Wire to Supabase Auth via the README.
        </p>
      </div>
    </div>
  );
}
