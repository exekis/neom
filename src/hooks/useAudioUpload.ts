'use client';

import { useState } from 'react';

interface AudioUploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadedUrl: string | null;
  error: string | null;
}

export function useAudioUpload() {
  const [state, setState] = useState<AudioUploadState>({
    isUploading: false,
    uploadProgress: 0,
    uploadedUrl: null,
    error: null
  });

  const uploadAudio = async (audioFile: File | Blob, fileName?: string): Promise<string | null> => {
    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null,
      uploadedUrl: null
    }));

    try {
      // Convert Blob to File if necessary
      let fileToUpload: File;
      if (audioFile instanceof Blob && !(audioFile instanceof File)) {
        fileToUpload = new File([audioFile], fileName || `recorded-audio-${Date.now()}.wav`, {
          type: audioFile.type || 'audio/wav'
        });
      } else {
        fileToUpload = audioFile as File;
      }

      // Create FormData for UploadThing
      const formData = new FormData();
      formData.append('files', fileToUpload);

      // Upload to UploadThing
      const response = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.data && result.data[0] && result.data[0].url) {
        const uploadedUrl = result.data[0].url;
        
        setState(prev => ({
          ...prev,
          isUploading: false,
          uploadProgress: 100,
          uploadedUrl,
          error: null
        }));

        return uploadedUrl;
      } else {
        throw new Error('Invalid upload response');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        error: errorMessage
      }));

      console.error('Audio upload failed:', error);
      return null;
    }
  };

  const reset = () => {
    setState({
      isUploading: false,
      uploadProgress: 0,
      uploadedUrl: null,
      error: null
    });
  };

  return {
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    uploadedUrl: state.uploadedUrl,
    error: state.error,
    uploadAudio,
    reset
  };
}