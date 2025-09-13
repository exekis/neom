"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring, useTransform, PanInfo } from "framer-motion";
import gsap from "gsap";

interface Props {
  originalAudio: HTMLAudioElement | null;
  modifiedAudio: HTMLAudioElement | null;
  selectedRegion: { start: number; end: number } | null;
  onRegionSelect: (region: { start: number; end: number } | null) => void;
  onClearSelection?: () => void;
}

export default function Timeline({
  originalAudio,
  modifiedAudio,
  selectedRegion,
  onRegionSelect,
  onClearSelection
}: Props) {
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const progressX = useSpring(0);
  const regionScale = useSpring(1);
  const progressLeft = useTransform(progressX, (v) => `${v}%`);

  useEffect(() => {
    const duration = originalAudio?.duration || modifiedAudio?.duration || 0;
    if (duration) {
      setTotalDuration(duration);
    }
  }, [originalAudio, modifiedAudio]);

  useEffect(() => {
    const handleSeek = () => {
      const time = (originalAudio?.currentTime ?? modifiedAudio?.currentTime ?? 0);
      setCurrentTime(time);

      // Animate the progress line
      gsap.to(progressX, {
        value: (time / totalDuration) * 100,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    if (originalAudio && modifiedAudio) {
      originalAudio.addEventListener('timeupdate', handleSeek);
      modifiedAudio.addEventListener('timeupdate', handleSeek);

      const duration = originalAudio?.duration || modifiedAudio?.duration || 0;
      setTotalDuration(duration);

      return () => {
        originalAudio.removeEventListener('timeupdate', handleSeek);
        modifiedAudio.removeEventListener('timeupdate', handleSeek);
      };
    }
  }, [originalAudio, modifiedAudio, totalDuration, progressX]);

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!timelineRef.current || totalDuration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * totalDuration;

    // Seek both audio elements to the new time
    if (originalAudio) originalAudio.currentTime = newTime;
    if (modifiedAudio) modifiedAudio.currentTime = newTime;

    setCurrentTime(newTime);
    progressX.set(percentage * 100);
  };

  const handleRegionDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, type: 'start' | 'end') => {
    if (!timelineRef.current || totalDuration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const width = timelineRef.current.clientWidth;
    const x = info.point.x - rect.left;
    const percentage = Math.max(0, Math.min(1, x / width));
    const newTime = percentage * totalDuration;

    if (type === 'start') {
      setDragStart(newTime);
      if (selectedRegion) {
        onRegionSelect({ start: newTime, end: selectedRegion.end });
      } else if (dragEnd !== null) {
        onRegionSelect({ start: newTime, end: dragEnd });
      }
    } else if (type === 'end') {
      setDragEnd(newTime);
      if (selectedRegion) {
        onRegionSelect({ start: selectedRegion.start, end: newTime });
      } else if (dragStart !== null) {
        onRegionSelect({ start: dragStart, end: newTime });
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const timeMarks = Array.from({ length: 6 }, (_, i) => (i / 5) * totalDuration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Timeline</h3>
        <div className="flex items-center space-x-4">
          {selectedRegion && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearSelection}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Clear Selection
            </motion.button>
          )}
          <div className="text-white/60 text-sm">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>
      </div>

      {/* Timeline Scale with Selection */}
      <div className="relative mb-4">
        <motion.div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="h-24 bg-white/5 rounded-lg cursor-pointer overflow-hidden relative"
          whileHover={{ scale: 1.01 }}
        >
          {/* Time Scale */}
          <div className="flex justify-between px-3 py-2 text-xs text-white/60">
            {timeMarks.map((time, index) => (
              <span key={index}>{formatTime(time)}</span>
            ))}
          </div>

          {/* Timeline Grid */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                className="flex-1 border-l border-white/10"
                animate={{
                  opacity: currentTime === 0 ? 0.3 : 0.6,
                  scaleX: currentTime === 0 ? 1 : 1.1
                }}
              />
            ))}
          </div>

          {/* Selected Region */}
          {selectedRegion && (
            <motion.div
              className="absolute top-6 bottom-6 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-lg selected-region"
              style={{
                left: `${(selectedRegion.start / totalDuration) * 100}%`,
                width: `${((selectedRegion.end - selectedRegion.start) / totalDuration) * 100}%`,
              }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
            >
              {/* Region Start Handle */}
              <motion.div
                className="absolute -left-2 top-0 bottom-0 w-4 bg-purple-500 rounded-md cursor-ew-resize flex items-center justify-center shadow-lg"
                drag="x"
                dragConstraints={{
                  left: 0,
                  right: timelineRef.current ? (selectedRegion.end / totalDuration) * timelineRef.current.clientWidth : 0
                }}
                onDragEnd={(event, info) => handleRegionDrag(event, info, 'start')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.div>

              {/* Region End Handle */}
              <motion.div
                className="absolute -right-2 top-0 bottom-0 w-4 bg-pink-500 rounded-md cursor-ew-resize flex items-center justify-center shadow-lg"
                drag="x"
                dragConstraints={{
                  left: (selectedRegion.start / totalDuration) * (timelineRef.current?.clientWidth || 0),
                  right: timelineRef.current?.clientWidth || 0
                }}
                onDragEnd={(event, info) => handleRegionDrag(event, info, 'end')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.div>

              {/* Region Label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-purple-300 text-xs font-medium whitespace-nowrap">
                Selected: {formatTime(selectedRegion.start)} - {formatTime(selectedRegion.end)}
              </div>
            </motion.div>
          )}

          {/* Progress Line */}
          <motion.div
            className="absolute top-8 bottom-8 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full shadow-lg pulsing-line"
            style={{ left: progressLeft }}
          />
        </motion.div>
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center justify-between">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
            onClick={() => regionScale.set(Math.max(0.5, regionScale.get() - 0.2))}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h7m0 0v7m0-7l-8 8-4-4-6 6" />
            </svg>
          </motion.button>
          <span className="text-white/60 text-sm">Zoom</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
            onClick={() => regionScale.set(Math.min(2, regionScale.get() + 0.2))}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h3m0 0v3m0-3-9-9" />
            </svg>
          </motion.button>
        </div>

        {/* Selection Mode Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-white/60 text-sm">Selection Mode</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
              isDragging
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
            }`}
            onClick={() => setIsDragging(!isDragging)}
          >
            {isDragging ? 'Active' : 'Off'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
