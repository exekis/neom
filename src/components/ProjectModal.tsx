"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SavedProject } from "../types/Project";
import { X, Save, FolderOpen, Trash2, Plus, Clock, Calendar } from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: (projectName: string) => Promise<void>;
  onLoadProject: (projectId: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onNewProject: () => void;
  savedProjects: SavedProject[];
  currentProjectName: string;
  isLoading: boolean;
}

type ModalTab = 'save' | 'load';

export function ProjectModal({
  isOpen,
  onClose,
  onSaveProject,
  onLoadProject,
  onDeleteProject,
  onNewProject,
  savedProjects,
  currentProjectName,
  isLoading
}: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('save');
  const [projectName, setProjectName] = useState(currentProjectName);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    setProjectName(currentProjectName);
  }, [currentProjectName]);

  const handleSave = async () => {
    if (!projectName.trim()) return;

    setIsSaving(true);
    try {
      await onSaveProject(projectName.trim());
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (projectId: string) => {
    try {
      await onLoadProject(projectId);
      onClose();
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const handleDelete = async (projectId: string) => {
    setIsDeleting(projectId);
    try {
      await onDeleteProject(projectId);
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleNewProject = () => {
    onNewProject();
    onClose();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-4xl w-full max-h-[80vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white">Project Manager</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('save')}
              className={`flex-1 p-4 text-sm font-medium transition-colors ${
                activeTab === 'save'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save Project
            </button>
            <button
              onClick={() => setActiveTab('load')}
              className={`flex-1 p-4 text-sm font-medium transition-colors ${
                activeTab === 'load'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Load Project
            </button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'save' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-slate-400"
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={!projectName.trim() || isSaving}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 inline mr-2" />
                        Save Project
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleNewProject}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    New Project
                  </button>
                </div>

                <div className="text-sm text-slate-400">
                  <p>💡 Projects are saved locally in your browser.</p>
                  <p>Your current project will be automatically saved with this name.</p>
                </div>
              </div>
            )}

            {activeTab === 'load' && (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full"></div>
                  </div>
                ) : savedProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No Saved Projects</h3>
                    <p className="text-slate-400">Save your current project to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedProjects
                      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                      .map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">{project.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Created: {formatDate(project.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated: {formatDate(project.updatedAt)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleLoad(project.id)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              disabled={isDeleting === project.id}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isDeleting === project.id ? (
                                <div className="animate-spin w-3 h-3 border border-white/30 border-t-white rounded-full"></div>
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}