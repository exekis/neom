"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SignInButton, useUser } from '@clerk/nextjs';
import { Music, Activity, Zap, Play, Pause, Volume2, VolumeX, ChevronDown, Layers, Mic, FileText, Shuffle, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

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

export function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [showStartingPointModal, setShowStartingPointModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const handleStartingPointSelect = (option: string) => {
    // Navigate to DAW with the selected starting point
    window.location.href = `/daw?start=${option}`;
  };

  const handleCloseModal = () => {
    setShowStartingPointModal(false);
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      setShowStartingPointModal(true);
      return;
    }

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
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <ParticlesBackground />

        <div className="relative z-10 text-center">
          {/* Custom Loading Animation */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-12 bg-slate-300 rounded-full"
                  animate={{
                    scaleY: [0.3, 1, 0.3],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-black mb-4 text-white"
          >
            NOEM
          </motion.h1>

          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-slate-400 text-lg"
          >
            Initializing Audio Engine...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showStartingPointModal && (
        <StartingPointModal
          onClose={handleCloseModal}
          onSelect={handleStartingPointSelect}
        />
      )}

      {!isSignedIn && (
    <div ref={containerRef} className="bg-slate-950 text-white relative">
      <AudioPlayer />
      <ParticlesBackground />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 to-slate-950/80" />

        <div ref={heroRef} className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <WaveformVisualizer className="mb-8 justify-center" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-7xl md:text-9xl font-black mb-6 leading-none tracking-tight text-white"
          >
            NOEM
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="w-32 h-1 bg-slate-300 mx-auto mb-8 rounded-full"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-2xl md:text-3xl mb-4 font-light text-slate-300"
          >
            AI Audio Co-Pilot
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-lg md:text-xl text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed"
          >
            Professional audio production powered by artificial intelligence
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{ delay: 1.5, duration: 0.5, y: { duration: 2, repeat: Infinity } }}
            className="cursor-pointer"
          >
            <ChevronDown className="w-8 h-8 mx-auto text-slate-400 hover:text-white transition-colors" />
          </motion.div>
        </div>
      </section>

      {/* Journey Map Section */}
      <section ref={mapRef} className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">Your Creative Journey</h2>

          <div className="relative">
            {/* Path Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-slate-700 to-slate-800 rounded-full" />

            <div className="space-y-32">
              {[
                {
                  title: "Upload",
                  desc: "Drop your audio files into the studio",
                  icon: Music,
                  position: "left"
                },
                {
                  title: "Create",
                  desc: "AI understands your natural language commands",
                  icon: Activity,
                  position: "right"
                },
                {
                  title: "Perfect",
                  desc: "Professional-grade effects and mastering",
                  icon: Zap,
                  position: "left"
                }
              ].map((step, i) => (
                <div key={i} className={`flex items-center ${step.position === 'right' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-1/2 ${step.position === 'right' ? 'pl-16' : 'pr-16 text-right'}`}>
                    <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-slate-400 text-lg">{step.desc}</p>
                  </div>

                  <div className="map-point w-16 h-16 bg-slate-800 rounded-full border-4 border-slate-700
                                  flex items-center justify-center z-10 relative">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">Studio Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Music,
                title: "AI-Powered Effects",
                desc: "Professional audio effects controlled by natural language commands",
              },
              {
                icon: Zap,
                title: "Real-time Processing",
                desc: "Instant audio manipulation with zero-latency feedback loops",
              },
              {
                icon: Activity,
                title: "Studio Quality",
                desc: "Broadcast-ready output with precision audio engineering",
              }
            ].map((feature, i) => (
              <div key={i} className="feature-card text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">Ready to Create?</h2>
          <p className="text-xl text-slate-400 mb-16 max-w-2xl mx-auto">
            Join thousands of creators using AI to enhance their audio production workflow
          </p>

          <SignInButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="group px-16 py-6 bg-white text-slate-950 text-xl font-semibold rounded-2xl
                         hover:bg-slate-100 transition-all duration-300 cursor-pointer
                         shadow-2xl hover:shadow-white/10"
            >
              Enter Studio
            </motion.button>
          </SignInButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">© 2025 NOEM. Built for creators, powered by AI.</p>
        </div>
      </footer>
    </div>
      )}
    </>
  );
}