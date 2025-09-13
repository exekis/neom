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

  const serializeAudioBuffer = useCallback((buffer: AudioBuffer) => {
    const channels = [];
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(Array.from(buffer.getChannelData(i)));
    }
    return {
      numberOfChannels: buffer.numberOfChannels,
      sampleRate: buffer.sampleRate,
      length: buffer.length,
      duration: buffer.duration,
      channels
    };
  }, []);

  const deserializeAudioBuffer = useCallback((serializedBuffer: any, audioContext: AudioContext): AudioBuffer => {
    const buffer = audioContext.createBuffer(
      serializedBuffer.numberOfChannels,
      serializedBuffer.length,
      serializedBuffer.sampleRate
    );

    for (let i = 0; i < serializedBuffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      channelData.set(serializedBuffer.channels[i]);
    }

    return buffer;
  }, []);

  const saveProject = useCallback(async (
    projectName: string,
    tracks: AudioTrack[],
    trackStates: { [trackId: string]: TrackState },
    masterVolume: number,
    bpm: number = 120,
    audioContext: AudioContext
  ): Promise<string> => {
    try {
      const projectId = currentProjectId || `project_${Date.now()}`;
      const now = new Date();

      // Serialize audio buffers
      const serializedTracks = await Promise.all(
        tracks.map(async (track) => ({
          ...track,
          audioBuffer: serializeAudioBuffer(track.audioBuffer)
        }))
      );

      const projectData: ProjectData = {
        id: projectId,
        name: projectName,
        tracks: serializedTracks as any, // We'll handle the type conversion during deserialization
        trackStates,
        masterVolume,
        bpm,
        createdAt: currentProjectId ? savedProjects.find(p => p.id === projectId)?.createdAt || now : now,
        updatedAt: now,
        version: '1.0'
      };

      // Save to localStorage
      localStorage.setItem(`daw_project_${projectId}`, JSON.stringify(projectData));

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
  }, [currentProjectId, savedProjects, serializeAudioBuffer, options]);

  const loadProject = useCallback(async (
    projectId: string,
    audioContext: AudioContext
  ): Promise<ProjectData | null> => {
    try {
      const projectDataString = localStorage.getItem(`daw_project_${projectId}`);
      if (!projectDataString) {
        throw new Error('Project not found');
      }

      const savedData = JSON.parse(projectDataString);

      // Deserialize audio buffers
      const deserializedTracks = savedData.tracks.map((track: any) => ({
        ...track,
        audioBuffer: deserializeAudioBuffer(track.audioBuffer, audioContext)
      }));

      const projectData: ProjectData = {
        ...savedData,
        tracks: deserializedTracks,
        createdAt: new Date(savedData.createdAt),
        updatedAt: new Date(savedData.updatedAt)
      };

      setCurrentProjectId(projectId);
      options.onProjectLoad?.(projectData);

      return projectData;
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  }, [deserializeAudioBuffer, options]);

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
      const projectsList = JSON.parse(localStorage.getItem('daw_projects_list') || '[]');
      const projects: SavedProject[] = projectsList.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
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