'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import AudioUploader from '../AudioUploader';
import AudioPlayer from '../AudioPlayer';
import Timeline from '../Timeline';
import ChatInterface from '../ChatInterface';
import { useChat } from '@/hooks/useChat';

interface ProjectState {
  projectId?: string;
  originalUrl?: string | null;
  modifiedUrl?: string | null;
}

export default function Demo() {
  const [project, setProject] = useState<ProjectState>({});
  const [selectedRegion, setSelectedRegion] = useState<{ start: number; end: number } | null>(null);
  const [processing, setProcessing] = useState(false);

  const { messages, setMessages, isTyping, sendMessage } = useChat({
    onProcessStart: () => setProcessing(true),
    onProcessEnd: () => setProcessing(false),
  });

  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const modifiedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Keep both players in sync (simple sync on play/pause via refs)
  useEffect(() => {
    const o = originalAudioRef.current;
    const m = modifiedAudioRef.current;
    if (!o || !m) return;

    const sync = () => {
      try { m.currentTime = o.currentTime; } catch {}
    };

    o.addEventListener('timeupdate', sync);
    return () => { o.removeEventListener('timeupdate', sync); };
  }, [project.originalUrl, project.modifiedUrl]);

  const handleUpload = (data: { projectId: string; originalUrl: string; modifiedUrl: string | null; }) => {
    setProject({ projectId: data.projectId, originalUrl: data.originalUrl, modifiedUrl: data.modifiedUrl });
  };

  return (
    <section id="demo" className="py-24">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-white text-center mb-10"
        >
          Try the Demo
        </motion.h2>

        {/* Uploader */}
        <div className="card p-6 mb-10">
          <AudioUploader onUpload={handleUpload} />
        </div>

        {/* Players */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="card p-6">
            <AudioPlayer
              title="Original"
              url={project.originalUrl || null}
              onAudioLoad={(audio) => (originalAudioRef.current = audio)}
              disabled={!project.originalUrl}
            />
          </div>
          <div className="card p-6">
            <AudioPlayer
              title="Modified"
              url={project.modifiedUrl || project.originalUrl || null}
              onAudioLoad={(audio) => (modifiedAudioRef.current = audio)}
              disabled={!project.originalUrl}
            />
          </div>
        </div>

        {/* Timeline */}
        <Timeline
          originalAudio={originalAudioRef.current}
          modifiedAudio={modifiedAudioRef.current}
          selectedRegion={selectedRegion}
          onRegionSelect={setSelectedRegion}
          onClearSelection={() => setSelectedRegion(null)}
        />

        {/* Chat */}
        <div className="card overflow-hidden min-h-[420px] grid md:grid-cols-2">
          <div className="hidden md:block p-6 border-r border-white/10">
            <h3 className="text-white font-semibold mb-4">Selection</h3>
            <p className="text-white/70 text-sm">
              Choose a region on the timeline and describe the operation in chat. We’ll apply AI-powered
              audio edits to your track and return a preview.
            </p>
            {processing && (
              <div className="mt-4 inline-flex items-center gap-2 text-white/70 text-sm">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Processing...
              </div>
            )}
          </div>
          <div className="min-h-[420px]">
            <ChatInterface
              messages={messages}
              setMessages={setMessages}
              isTyping={isTyping}
              sendMessage={sendMessage}
              selectedRegion={selectedRegion}
              projectId={project.projectId}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
