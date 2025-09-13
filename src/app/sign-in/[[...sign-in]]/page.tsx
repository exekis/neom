import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-600 to-emerald-500 flex items-center justify-center">
      <SignIn
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
    </div>
  )
}