import { AudioTrack } from "./AudioTrack";

export interface ProjectData {
  id: string;
  name: string;
  tracks: AudioTrack[];
  trackStates: { [trackId: string]: TrackState };
  masterVolume: number;
  bpm: number;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface TrackState {
  id: string;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
}

export interface SavedProject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
}