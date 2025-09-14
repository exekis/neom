"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Layers, Mic, FileText, Shuffle, Play, FolderOpen, Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  trackCount: number;
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [showProjectModal, setShowProjectModal] = useState(false);
  
  // Mock projects data - replace with actual API call
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'My First Track',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      trackCount: 3
    },
    {
      id: '2', 
      name: 'Jazz Fusion Experiment',
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-06'),
      trackCount: 5
    }
  ]);

  const workflowOptions = [
    {
      id: 'layers',
      title: 'Layers',
      description: 'Build your track layer by layer with instruments and sounds',
      icon: Layers,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'vocals',
      title: 'Vocals',
      description: 'Start with vocal recordings and build around them',
      icon: Mic,
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'describe',
      title: 'Describe',
      description: 'Tell AI what you want and let it create the foundation',
      icon: FileText,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'remix',
      title: 'Remix',
      description: 'Transform existing tracks with AI-powered remixing',
      icon: Shuffle,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleWorkflowSelect = (workflowId: string) => {
    router.push(`/workflows/${workflowId}`);
  };

  const handleSkipToDAW = () => {
    router.push('/daw');
  };

  const handleOpenProject = (projectId: string) => {
    // Load the project and go to DAW
    router.push(`/daw?project=${projectId}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Creative Path
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start with a guided workflow or jump straight into the studio
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4 mb-12">
          <motion.button
            onClick={handleSkipToDAW}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Blank Project
          </motion.button>
          
          <motion.button
            onClick={() => setShowProjectModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
            Open Existing Project
          </motion.button>
        </div>

        {/* Workflow Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {workflowOptions.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleWorkflowSelect(workflow.id)}
              className="group cursor-pointer"
            >
              <div className={`p-8 rounded-2xl bg-gradient-to-br ${workflow.color} hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <workflow.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {workflow.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {workflow.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-white/60">
                  <span className="text-sm">Get Started →</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project Modal */}
        {showProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">Your Projects</h2>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Plus className="w-6 h-6 text-slate-400 rotate-45" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No projects yet</p>
                    <button
                      onClick={handleSkipToDAW}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects
                      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                      .map((project) => (
                        <div
                          key={project.id}
                          onClick={() => handleOpenProject(project.id)}
                          className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                {project.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                <span>{project.trackCount} tracks</span>
                                <span>•</span>
                                <span>Modified {formatDate(project.updatedAt)}</span>
                              </div>
                            </div>
                            <Play className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}