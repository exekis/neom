"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ChevronDown, User, Download, Save, Settings, LogOut } from "lucide-react";

interface VegasUserProfileProps {
  onExportWAV: () => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export function VegasUserProfile({
  onExportWAV,
  projectName,
  onProjectNameChange
}: VegasUserProfileProps) {
  const { user, isLoaded } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isLoaded) {
    return <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
      >
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt="Profile"
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-300" />
          </div>
        )}
        <span className="text-sm text-white">
          {user?.firstName || 'User'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute top-full right-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            {/* Project Info */}
            <div className="p-3 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Current Project</div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Project name..."
              />
            </div>

            {/* Actions */}
            <div className="p-1">
              <button
                onClick={() => {
                  onExportWAV();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                Export WAV
              </button>

              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Project
              </button>

              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <div className="border-t border-gray-700 my-1" />

              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* User Info */}
            <div className="p-3 border-t border-gray-700 bg-gray-700">
              <div className="flex items-center gap-2">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                )}
                <div>
                  <div className="text-sm text-white font-medium">
                    {user?.fullName || 'User'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user?.primaryEmailAddress?.emailAddress || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}