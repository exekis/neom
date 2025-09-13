'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NeomLogo from '../NeomLogo';
import AudioUploader from '../AudioUploader';
import { Button } from '../ui/button';
import { ArrowDown } from 'lucide-react';

export default function LandingPage() {
  const [showContent, setShowContent] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Start showing content after logo animation
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Hero Section with Logo Animation */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/20 via-transparent to-blue-50/20" />
        
        <div className="text-center z-10">
          <NeomLogo size="xl" className="mb-8" />
          
          {showContent && (
            <>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
              >
                Transform your audio with natural language.
                <br />
                No technical skills required.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  onClick={scrollToUpload}
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-8 py-4 text-lg"
                >
                  Get Started
                  <ArrowDown className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>

              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    className="w-1 h-3 bg-gray-400 rounded-full mt-2"
                  />
                </motion.div>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Drop. Transform. Done.
            </h2>
            <p className="text-lg text-gray-600">
              Simply upload your audio file and tell us what you want to change.
            </p>
          </motion.div>

          <AudioUploader onFileSelect={handleFileSelect} />

          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 text-center"
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4"
              >
                Start Transforming
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-gray-500 border-t border-gray-100">
        <p className="text-sm">
          © 2025 NEOM Audio. Transform your sound with AI.
        </p>
      </footer>
    </div>
  );
}
