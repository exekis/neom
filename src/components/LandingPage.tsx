"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import NextDynamic from 'next/dynamic';
import Link from 'next/link';
import { Music, Activity, Zap, Play, Pause, Volume2, VolumeX, ChevronDown, Layers, Mic, FileText, Shuffle, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import TrebleClefEpicycles from './TrebleClefEpicycles';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="absolute inset-0 z-0"
      options={{
        background: {
          color: { value: "transparent" }
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: { enable: true, mode: "push" },
            onHover: { enable: true, mode: "repulse" },
            resize: true
          },
          modes: {
            push: { quantity: 2 },
            repulse: {
              distance: 200,
              duration: 0.4,
              factor: 100,
              speed: 1
            },
            attract: {
              distance: 200,
              duration: 0.4,
              factor: 5,
              speed: 1
            }
          }
        },
        particles: {
          color: { value: ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"] },
          links: {
            color: "#3b82f6",
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
            triangles: {
              enable: false
            }
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
              top: "bounce",
              bottom: "bounce",
              left: "bounce",
              right: "bounce"
            },
            random: true,
            speed: 2,
            straight: false,
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200
            }
          },
          number: {
            density: { enable: true, area: 800 },
            value: 80,
            max: 150
          },
          opacity: {
            value: 0.6,
            random: true,
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
              sync: false
            }
          },
          shape: { type: "circle" },
          size: {
            value: { min: 1, max: 5 },
            random: true,
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 0.5,
              sync: false
            }
          }
        },
        detectRetina: true
      }}
    />
  );
};

// Subtle floating musical notes for extra flair (non-interactive)
const FloatingNotes = () => {
  const notes = [
    { Icon: Music, x: '10%', y: '20%', delay: 0 },
    { Icon: Mic, x: '85%', y: '30%', delay: 0.8 },
    { Icon: Music, x: '20%', y: '70%', delay: 0.4 },
    { Icon: Mic, x: '70%', y: '75%', delay: 1.2 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {notes.map(({ Icon, x, y, delay }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: [0, 1, 1, 0], y: [12, -8, -8, 12] }}
          transition={{ duration: 6 + i, repeat: Infinity, delay, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: x, top: y }}
        >
          <Icon className="w-5 h-5 text-slate-400/40" />
        </motion.div>
      ))}
    </div>
  );
};

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.5;
    audio.loop = true;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Audio autoplay blocked');
        setIsPlaying(false);
      }
    };

    // Start playing immediately on page load
    playAudio();

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src="/audio/intro_jazz.mp3" type="audio/mpeg" />
      </audio>
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <button
          onClick={togglePlay}
          className="p-3 bg-slate-800/90 backdrop-blur-sm rounded-full border border-slate-700/50
                     hover:bg-slate-700/90 transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
        <button
          onClick={toggleMute}
          className="p-3 bg-slate-800/90 backdrop-blur-sm rounded-full border border-slate-700/50
                     hover:bg-slate-700/90 transition-colors cursor-pointer"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-slate-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </>
  );
};

const WaveformVisualizer = ({ className = "" }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bars = container.children;

    const animate = () => {
      Array.from(bars).forEach((bar, i) => {
        const height = Math.random() * 40 + 8;
        gsap.to(bar, {
          height: `${height}px`,
          duration: 0.3,
          delay: i * 0.1,
          ease: "power2.out"
        });
      });
    };

    const interval = setInterval(animate, 1000);
    animate();

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className={`flex items-end gap-1 ${className}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="w-1 bg-slate-300 rounded-full transition-all duration-300"
          style={{ height: '8px' }}
        />
      ))}
    </div>
  );
};

const StartingPointModal = ({ onClose, onSelect }: { onClose: () => void; onSelect: (option: string) => void }) => {
  const startingOptions = [
    {
      id: 'layers',
      title: 'Layers',
      description: 'Build your track layer by layer with instruments and sounds',
      icon: Layers
    },
    {
      id: 'vocals',
      title: 'Vocals',
      description: 'Start with vocal recordings and build around them',
      icon: Mic
    },
    {
      id: 'describe',
      title: 'Describe',
      description: 'Tell AI what you want and let it create the foundation',
      icon: FileText
    },
    {
      id: 'remix',
      title: 'Remix',
      description: 'Transform existing tracks with AI-powered remixing',
      icon: Shuffle
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg" />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 bg-slate-900/90 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8 max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4 text-white"
          >
            Choose Your Starting Point
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 text-lg"
          >
            How would you like to begin creating your audio masterpiece?
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {startingOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => onSelect(option.id)}
              className="group relative p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/30
                         hover:bg-slate-700/50 hover:border-slate-600/50 transition-all duration-300
                         hover:scale-105 hover:shadow-2xl cursor-pointer text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-slate-700 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-slate-100 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                    {option.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
type SignInBtnProps = { children: React.ReactNode; mode?: 'modal' | 'redirect'; afterSignInUrl?: string; afterSignUpUrl?: string; redirectUrl?: string };
const SignInButtonDyn: React.ComponentType<SignInBtnProps> = hasClerk
  ? NextDynamic(() => import('@clerk/nextjs').then(m => m.SignInButton), { ssr: false })
  : function FallbackSignIn({ children }: { children: React.ReactNode }) { return <Link href="/workflows">{children}</Link>; };
const SignedInDyn: React.ComponentType<{ children: React.ReactNode }> = hasClerk
  ? NextDynamic(() => import('@clerk/nextjs').then(m => m.SignedIn), { ssr: false })
  : () => null;
const SignedOutDyn: React.ComponentType<{ children: React.ReactNode }> = hasClerk
  ? NextDynamic(() => import('@clerk/nextjs').then(m => m.SignedOut), { ssr: false })
  : ({ children }) => <>{children}</>;

export function LandingPage() {
  const [showStartingPointModal, setShowStartingPointModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const handleStartingPointSelect = (option: string) => {
    // Navigate to the specific workflow page
    window.location.href = `/workflows/${option}`;
  };

  const handleCloseModal = () => {
    setShowStartingPointModal(false);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {

      ScrollTrigger.create({
        trigger: mapRef.current,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          gsap.fromTo(".map-point",
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, stagger: 0.2, ease: "back.out(1.7)" }
          );
        }
      });

      ScrollTrigger.create({
        trigger: featuresRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(".feature-card",
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out" }
          );
        }
      });

      ScrollTrigger.create({
        trigger: ctaRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(ctaRef.current,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.2)" }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {showStartingPointModal && (
        <StartingPointModal
          onClose={handleCloseModal}
          onSelect={handleStartingPointSelect}
        />
      )}

    <div ref={containerRef} className="bg-slate-950 text-white relative">
      <AudioPlayer />
      <ParticlesBackground />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 to-slate-950/80" />
        <FloatingNotes />

        <div ref={heroRef} className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            <div className="text-center md:text-left">
                <div className="inline-block w-full md:w-auto rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 px-6 py-6 md:px-8 md:py-8">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0, backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                transition={{ delay: 0.3, duration: 1, backgroundPosition: { duration: 8, repeat: Infinity, ease: 'linear' } }}
                className="text-7xl md:text-9xl font-black mb-6 leading-none tracking-tight bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #e2e8f0, #a78bfa, #22d3ee, #e2e8f0)',
                  backgroundSize: '200% 100%'
                }}
              >
                NEOM
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="w-32 h-1 bg-slate-300 md:mx-0 mx-auto mb-8 rounded-full"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-2xl md:text-3xl mb-4 font-light text-slate-300"
              >
                AI Audio Co-Pilot
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="text-lg md:text-xl text-slate-400 mb-12 md:mb-0 max-w-2xl md:mx-0 mx-auto leading-relaxed"
              >
                Professional audio production powered by artificial intelligence
              </motion.p>
              </div>

              {/* Primary CTA just below the panel */}
              <div className="mt-6 md:mt-8">
                <div className="inline-flex w-full md:w-auto flex-col md:flex-row items-center gap-4 md:gap-6 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 px-5 py-4 md:px-6 md:py-5">
                  <p className="text-slate-300 m-0">Jump right in and start creating.</p>
                  <div className="flex items-center gap-4">
                    <SignedInDyn>
                      <Link href="/workflows">
                        <ClerkButtonChild>
                          Enter Studio
                        </ClerkButtonChild>
                      </Link>
                    </SignedInDyn>
                    <SignedOutDyn>
                      <SignInButtonDyn mode="modal" afterSignInUrl="/workflows" afterSignUpUrl="/workflows">
                        <ClerkButtonChild>
                          Enter Studio
                        </ClerkButtonChild>
                      </SignInButtonDyn>
                    </SignedOutDyn>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative md:justify-self-end"
            >
              {/* Soft glow behind the epicycles */}
              <div
                className="pointer-events-none absolute -inset-6 -z-10 blur-3xl opacity-60"
                style={{
                  background:
                    'radial-gradient(40% 40% at 50% 50%, rgba(139,92,246,0.35) 0%, rgba(34,211,238,0.22) 35%, rgba(15,23,42,0.0) 70%)'
                }}
              />
              <TrebleClefEpicycles className="max-w-5xl" height={480} maxCircles={500} speed={0.3} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{ delay: 1.4, duration: 0.5, y: { duration: 2, repeat: Infinity } }}
            className="cursor-pointer mt-16"
          >
            <ChevronDown className="w-8 h-8 mx-auto text-slate-400 hover:text-white transition-colors" />
          </motion.div>
        </div>
      </section>

      {/* Removed lower marketing sections; CTA moved into hero */}

      {/* Footer removed per request */}
    </div>
    </>
  );
}

function ClerkButtonChild({ onClick, children }: { onClick?: React.MouseEventHandler; children: React.ReactNode }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="group px-12 py-5 bg-white/85 text-slate-900 text-lg font-semibold rounded-2xl
                 hover:bg-white/70 transition-colors duration-200 cursor-pointer
                 shadow-lg ring-1 ring-white/30"
    >
      {children}
    </motion.button>
  );
}