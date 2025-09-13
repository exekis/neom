"use client";

import NextDynamic from 'next/dynamic';
import Link from 'next/link';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const SignInDyn = hasClerk
  ? NextDynamic(() => import('@clerk/nextjs').then(m => m.SignIn), { ssr: false })
  : function FallbackSignIn({ redirectUrl }: { redirectUrl?: string; appearance?: unknown }) {
      return (
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Authentication Unavailable
          </h1>
          <p className="text-slate-600 mb-6">Sign-in is disabled because no Clerk publishable key is configured.</p>
          <Link href={redirectUrl || '/daw'} className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
            Continue
          </Link>
        </div>
      );
    };

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-600 to-emerald-500 flex items-center justify-center p-4">
      {hasClerk ? (
        <ClerkSignInWithProvider />
      ) : (
        <SignInDyn redirectUrl="/" />
      )}
    </div>
  );
}

const ClerkProviderDyn = NextDynamic(() => import('@clerk/nextjs').then(m => m.ClerkProvider), { ssr: false });

function ClerkSignInWithProvider() {
  return (
    <ClerkProviderDyn>
      <SignInDyn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white/95 backdrop-blur-sm shadow-2xl border-0",
            headerTitle: "text-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent",
            headerSubtitle: "text-slate-600",
            socialButtonsBlockButton: "border border-slate-200 hover:bg-slate-50",
            formButtonPrimary: "bg-gradient-to-r from-purple-600 to-emerald-600 hover:opacity-90",
            footerActionLink: "text-purple-600 hover:text-purple-700"
          }
        }}
        redirectUrl="/daw"
      />
    </ClerkProviderDyn>
  );
}