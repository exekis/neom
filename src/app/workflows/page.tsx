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
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        backgroundSize: "400% 400%"
      }}
    >
      <motion.div 
        className="container mx-auto px-6 py-12"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-5xl font-bold text-white mb-4"
            animate={{
              scale: [1, 1.02, 1],
              textShadow: [
                "0 0 20px rgba(255, 255, 255, 0.1)",
                "0 0 30px rgba(255, 255, 255, 0.2)",
                "0 0 20px rgba(255, 255, 255, 0.1)"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Choose Your Creative Path
          </motion.h1>
          <motion.p 
            className="text-xl text-slate-400 max-w-2xl mx-auto"
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Start with a guided workflow or jump straight into the studio
          </motion.p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center gap-4 mb-12"
        >
          <motion.button
            onClick={handleSkipToDAW}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
              y: -2
            }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl border border-slate-600 hover:border-slate-500"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Play className="w-5 h-5" />
            </motion.div>
            <span className="font-medium">Start Blank Project</span>
            <motion.div
              className="w-0 h-0 border-l-4 border-l-white/70 border-y-2 border-y-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.button>
          
          <motion.button
            onClick={() => setShowProjectModal(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
              y: -2
            }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl border border-blue-500 hover:border-blue-400"
          >
            <motion.div
              animate={{ 
                rotateY: [0, 180, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FolderOpen className="w-5 h-5" />
            </motion.div>
            <span className="font-medium">Open Existing Project</span>
            <motion.div
              className="w-0 h-0 border-l-4 border-l-white/70 border-y-2 border-y-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.button>
        </motion.div>

        {/* Workflow Options */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {workflowOptions.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
              }}
              transition={{ 
                delay: 0.7 + index * 0.15,
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }}
              onClick={() => handleWorkflowSelect(workflow.id)}
              className="group cursor-pointer"
              whileHover={{
                scale: 1.02,
                y: -8,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className={`p-8 rounded-2xl bg-gradient-to-br ${workflow.color} transition-all duration-500 transform border border-white/10 hover:border-white/20 relative overflow-hidden`}
                animate={{
                  boxShadow: [
                    "0 4px 20px rgba(0, 0, 0, 0.1)",
                    "0 8px 40px rgba(0, 0, 0, 0.15)",
                    "0 4px 20px rgba(0, 0, 0, 0.1)"
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Animated background overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <motion.div 
                    className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                    whileHover={{
                      scale: 1.1,
                      rotate: 10,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <workflow.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h3 
                      className="text-2xl font-bold text-white mb-2"
                      animate={{
                        y: [0, -2, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                    >
                      {workflow.title}
                    </motion.h3>
                    <motion.p 
                      className="text-white/80 leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {workflow.description}
                    </motion.p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-white/60 relative z-10">
                  <motion.span 
                    className="text-sm group-hover:text-white transition-colors duration-300"
                    animate={{
                      x: [0, 5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Get Started →
                  </motion.span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

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
      </motion.div>
    </motion.div>
  );
}