import { useState, useCallback } from 'react';
import { AudioTrack } from '../types/AudioTrack';
import { ProjectData, SavedProject, TrackState } from '../types/Project';

interface ProjectManagerOptions {
  onProjectLoad?: (projectData: ProjectData) => void;
  onProjectSave?: (projectData: ProjectData) => void;
}

export function useProjectManager(options: ProjectManagerOptions = {}) {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // note: we intentionally avoid serializing full audiobuffer data to localstorage to prevent quota errors
  // instead we persist only lightweight track metadata and recreate silent buffers on load
  type SavedTrackMeta = {
    id: string;
    name: string;
    color: string;
    startTime: number;
    duration: number;
  };

  const saveProject = useCallback(async (
    projectName: string,
    tracks: AudioTrack[],
    trackStates: { [trackId: string]: TrackState },
    masterVolume: number,
    bpm: number = 120
  ): Promise<string> => {
    try {
      const projectId = currentProjectId || `project_${Date.now()}`;
      const now = new Date();

      // serialize only track metadata to keep storage small and avoid quota exceptions
      // do not persist raw audio samples
      const serializedTracks: SavedTrackMeta[] = tracks.map((track) => ({
        id: track.id,
        name: track.name,
        color: track.color,
        startTime: track.startTime,
        duration: track.duration
      }));

      const projectData: ProjectData = {
        id: projectId,
        name: projectName,
        // keep full tracks in callback payload, but do not store raw audio in localstorage
        tracks,
        trackStates,
        masterVolume,
        bpm,
        createdAt: currentProjectId ? savedProjects.find(p => p.id === projectId)?.createdAt || now : now,
        updatedAt: now,
        version: '1.0'
      };

      // save compact payload to localstorage
      const storagePayload = {
        ...projectData,
        tracks: serializedTracks,
        // serialize dates to iso strings
        createdAt: (projectData.createdAt as Date).toISOString(),
        updatedAt: (projectData.updatedAt as Date).toISOString()
      };
      localStorage.setItem(`daw_project_${projectId}`, JSON.stringify(storagePayload));

      // Update saved projects list
      setSavedProjects(prev => {
        const existing = prev.find(p => p.id === projectId);
        const projectSummary: SavedProject = {
          id: projectId,
          name: projectName,
          createdAt: existing?.createdAt || now,
          updatedAt: now
        };

        if (existing) {
          return prev.map(p => p.id === projectId ? projectSummary : p);
        } else {
          return [...prev, projectSummary];
        }
      });

      setCurrentProjectId(projectId);

      // Save projects list to localStorage
      const projectsList = JSON.parse(localStorage.getItem('daw_projects_list') || '[]');
      const updatedList = projectsList.filter((p: SavedProject) => p.id !== projectId);
      updatedList.push({
        id: projectId,
        name: projectName,
        createdAt: currentProjectId ? savedProjects.find(p => p.id === projectId)?.createdAt || now : now,
        updatedAt: now
      });
      localStorage.setItem('daw_projects_list', JSON.stringify(updatedList));

      options.onProjectSave?.(projectData);
      return projectId;
    } catch (error) {
      console.error('Error saving project:', error);
      throw new Error('Failed to save project');
    }
  }, [currentProjectId, savedProjects, options]);

  const loadProject = useCallback(async (
    projectId: string,
    audioContext: AudioContext
  ): Promise<ProjectData | null> => {
    try {
      const projectDataString = localStorage.getItem(`daw_project_${projectId}`);
      if (!projectDataString) {
        throw new Error('Project not found');
      }

      const savedData = JSON.parse(projectDataString) as {
        id: string;
        name: string;
        tracks: SavedTrackMeta[];
        trackStates: { [trackId: string]: TrackState };
        masterVolume: number;
        bpm: number;
        createdAt: string;
        updatedAt: string;
        version: string;
      };

      // recreate silent audio buffers using saved duration to satisfy the audiotrack shape
      const deserializedTracks: AudioTrack[] = savedData.tracks.map((track: SavedTrackMeta) => {
        const channels = 2; // default to stereo
        const sampleRate = audioContext.sampleRate;
        const length = Math.max(1, Math.floor(sampleRate * (track.duration || 0)));
        const buffer = audioContext.createBuffer(channels, length, sampleRate);
        // leave buffer silent by default
        return {
          ...track,
          audioBuffer: buffer
        };
      });

      const projectData: ProjectData = {
        id: savedData.id,
        name: savedData.name,
        tracks: deserializedTracks,
        trackStates: savedData.trackStates,
        masterVolume: savedData.masterVolume,
        bpm: savedData.bpm,
        createdAt: new Date(savedData.createdAt),
        updatedAt: new Date(savedData.updatedAt),
        version: savedData.version
      };

      setCurrentProjectId(projectId);
      options.onProjectLoad?.(projectData);

      return projectData;
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  }, [options]);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    try {
      // Remove from localStorage
      localStorage.removeItem(`daw_project_${projectId}`);

      // Update saved projects list
      setSavedProjects(prev => prev.filter(p => p.id !== projectId));

      // Update projects list in localStorage
      const projectsList = JSON.parse(localStorage.getItem('daw_projects_list') || '[]');
      const updatedList = projectsList.filter((p: SavedProject) => p.id !== projectId);
      localStorage.setItem('daw_projects_list', JSON.stringify(updatedList));

      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }, [currentProjectId]);

  const loadProjectsList = useCallback(async (): Promise<SavedProject[]> => {
    try {
      const projectsList = JSON.parse(localStorage.getItem('daw_projects_list') || '[]') as Array<{
        id: string;
        name: string;
        createdAt: string | Date;
        updatedAt: string | Date;
        thumbnail?: string;
      }>;
      const projects: SavedProject[] = projectsList.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        thumbnail: p.thumbnail
      }));

      setSavedProjects(projects);
      return projects;
    } catch (error) {
      console.error('Error loading projects list:', error);
      return [];
    }
  }, []);

  const createNewProject = useCallback(() => {
    setCurrentProjectId(null);
  }, []);

  return {
    savedProjects,
    currentProjectId,
    saveProject,
    loadProject,
    deleteProject,
    loadProjectsList,
    createNewProject
  };
}