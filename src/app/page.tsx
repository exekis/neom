"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { LandingPage } from "../components/LandingPage";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/workflows');
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render the landing page if user is signed in
  if (isLoaded && isSignedIn) {
    return null; // or a loading spinner
  }

  return <LandingPage />;
}
