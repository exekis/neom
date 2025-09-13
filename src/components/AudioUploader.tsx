'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export default function AudioUploader({ onFileSelect, className = '' }: AudioUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={className}
    >
      <Card className="relative">
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
            ${dragActive ? 'border-violet-500 bg-violet-50/50' : 'border-gray-300 hover:border-violet-400'}
            ${selectedFile ? 'bg-green-50/50 border-green-400' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-upload"
          />
          
          {selectedFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center space-x-3">
                <File className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-green-600">Ready to transform</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.div
                animate={{ y: dragActive ? -5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              </motion.div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop your audio file here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse (MP3, WAV, M4A)
                </p>
              </div>
              <Button variant="outline" className="mt-4">
                Choose File
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
