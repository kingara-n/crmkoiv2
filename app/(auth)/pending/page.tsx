import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

export default function PendingPage() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 sm:p-10 flex flex-col my-8">
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

        <div className="pt-4 border-t border-neutral-100">
          <p className="text-sm text-neutral-600 mb-6">
            We will notify you once your access has been granted.
          </p>
          <Link 
            href="/"
            className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-900 font-medium hover:bg-neutral-200 focus:outline-none transition-colors flex items-center justify-center"
          >
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}
