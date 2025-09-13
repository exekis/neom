import { useState, useCallback } from 'react';
import { AudioTrack } from '../types/AudioTrack';

interface TrackState {
  id: string;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
}

export function useAudioExporter() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportToWAV = useCallback(async (
    tracks: AudioTrack[],
    trackStates: { [trackId: string]: TrackState },
    masterVolume: number,
    audioContext: AudioContext
  ): Promise<Blob> => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Calculate total duration
      const totalDuration = Math.max(...tracks.map(track => track.startTime + track.duration), 10);
      const sampleRate = audioContext.sampleRate;
      const numberOfChannels = 2; // Stereo output
      const length = Math.floor(totalDuration * sampleRate);

      // Create output buffer
      const outputBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
      const leftChannel = outputBuffer.getChannelData(0);
      const rightChannel = outputBuffer.getChannelData(1);

      // Check which tracks should be played (not muted and handle solo)
      const hasSoloTracks = tracks.some(track => {
        const state = trackStates[track.id];
        return state?.isSolo === true;
      });

      const audibleTracks = tracks.filter(track => {
        const state = trackStates[track.id] || { isMuted: false, isSolo: false, volume: 100 };

        if (hasSoloTracks) {
          return state.isSolo && !state.isMuted;
        } else {
          return !state.isMuted;
        }
      });

      // Process each audible track
      for (let trackIndex = 0; trackIndex < audibleTracks.length; trackIndex++) {
        const track = audibleTracks[trackIndex];
        const state = trackStates[track.id] || { volume: 100 };
        const trackVolumeMultiplier = (state.volume / 100) * (masterVolume / 100);

        const startSample = Math.floor(track.startTime * sampleRate);
        const trackLength = Math.min(track.audioBuffer.length, length - startSample);

        // Mix this track into the output buffer
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const outputChannel = channel === 0 ? leftChannel : rightChannel;
          const trackChannelIndex = Math.min(channel, track.audioBuffer.numberOfChannels - 1);
          const trackChannelData = track.audioBuffer.getChannelData(trackChannelIndex);

          for (let i = 0; i < trackLength && (startSample + i) < length; i++) {
            const outputIndex = startSample + i;
            const trackSample = trackChannelData[i] * trackVolumeMultiplier;
            outputChannel[outputIndex] += trackSample;
          }
        }

        // Update progress
        setExportProgress(Math.floor(((trackIndex + 1) / audibleTracks.length) * 80));
      }

      setExportProgress(85);

      // Apply master volume limiting to prevent clipping
      const maxAmplitude = Math.max(
        Math.max(...leftChannel.map(Math.abs)),
        Math.max(...rightChannel.map(Math.abs))
      );

      if (maxAmplitude > 1) {
        const limiterRatio = 0.95 / maxAmplitude;
        for (let i = 0; i < length; i++) {
          leftChannel[i] *= limiterRatio;
          rightChannel[i] *= limiterRatio;
        }
      }

      setExportProgress(90);

      // Convert to WAV format
      const wavBuffer = audioBufferToWav(outputBuffer);
      setExportProgress(100);

      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      return blob;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const downloadWAV = useCallback(async (
    tracks: AudioTrack[],
    trackStates: { [trackId: string]: TrackState },
    masterVolume: number,
    audioContext: AudioContext,
    filename: string = 'export.wav'
  ) => {
    try {
      const blob = await exportToWAV(tracks, trackStates, masterVolume, audioContext);

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }, [exportToWAV]);

  return {
    isExporting,
    exportProgress,
    exportToWAV,
    downloadWAV
  };
}

// Utility function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const result = interleave(buffer);
  const length = result.length;

  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * bitDepth / 8, true);
  view.setUint16(32, numberOfChannels * bitDepth / 8, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);

  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, result[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return arrayBuffer;
}

// Interleave multiple channels into a single array
function interleave(buffer: AudioBuffer): Float32Array {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numberOfChannels;
  const result = new Float32Array(length);

  let offset = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      result[offset++] = buffer.getChannelData(channel)[i];
    }
  }

  return result;
}