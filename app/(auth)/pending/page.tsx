"use client";

import { useRouter } from "next/navigation";
import { Clock, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PendingPage() {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 sm:p-10 flex flex-col my-8">
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <Clock className="h-8 w-8 text-amber-500" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Account Pending</h1>
          <p className="text-neutral-500 mt-2">
            Your account is currently awaiting approval from an administrator.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
          <p className="text-sm text-neutral-600 mb-2">
            We will notify you once your access has been granted.
          </p>
          <button 
            onClick={handleSignOut}
            className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-900 font-medium hover:bg-neutral-200 focus:outline-none transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out / Switch account
          </button>
        </div>
      </div>
    </div>
  );
}
