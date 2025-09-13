import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const isProtectedRoute = createRouteMatcher([
  '/daw(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!hasClerkKey) return; // Skip auth enforcement when Clerk is not configured
  if (isProtectedRoute(req)) await auth.protect();
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}