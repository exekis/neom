import { Metadata, Viewport } from "next";
import LandingPage from "../components/page/LandingPage";

export const metadata: Metadata = {
  title: "NEOM Audio - Transform Audio with AI",
  description: "Transform your audio with natural language. No technical skills required - just describe what you want your track to sound like.",
  keywords: ["AI audio editing", "audio processing", "music production", "sound design", "audio effects"],
  authors: [{ name: "NEOM Audio" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function Home() {
  return <LandingPage />;
}
