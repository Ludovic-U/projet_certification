'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppConfig } from '@/hooks/useAppConfig';
import { HelpCircle, X } from 'lucide-react';

interface HelpDictionaryEntry {
  term: string;
  definition: string;
}

interface HelpButtonProps {
  headerKey: string;
  className?: string;
}

export function HelpButton({ headerKey, className = '' }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { config } = useAppConfig();
  
  // Get a nicer title from the key
  const getTitle = (key: string) => {
    const titles: Record<string, string> = {
      projectList: 'Liste des Projets',
      overview: 'Vue d\'Ensemble',
      ideation: 'Idéation',
      conception: 'Conception',
      pilotage: 'Pilotage',
      evaluation: 'Évaluation',
      reporting: 'Reporting',
      gantt: 'Diagramme de Gantt',
      budget: 'Budget',
      questions: 'Questions',
      mindmap: 'Mindmap'
    };
    return titles[key] || key;
  };
  
  // Handle both old (string) and new (array) data formats
  const rawHeaders = config.headers?.[headerKey];
  let helpEntries: HelpDictionaryEntry[];
  
  if (Array.isArray(rawHeaders)) {
    helpEntries = rawHeaders;
  } else if (typeof rawHeaders === 'string' && rawHeaders) {
    // Convert old string format to array format for backward compatibility
    helpEntries = [{ term: getTitle(headerKey), definition: rawHeaders }];
  } else {
    helpEntries = [];
  }
  
  // Reset active tab when entries change
  useEffect(() => {
    setActiveTab(0);
  }, [helpEntries]);
  
  // Only show button if there are entries with content
  const hasContent = helpEntries.some(entry => entry.term || entry.definition);
  
  if (!hasContent) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`ml-2 text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center justify-center ${className}`}
        aria-label={`Aide pour ${headerKey}`}
        type="button"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dictionary Modal - Modern Style */}
          <div className="relative z-[100000] w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Dictionary Icon */}
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <HelpCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">
                      AIDE
                    </h2>
                    <p className="text-blue-100 text-sm font-medium">
                      {getTitle(headerKey)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                  type="button"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Content - Tabbed Layout */}
            <div className="px-6 py-4">
              {/* Tabs */}
              {helpEntries.length > 1 && (
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                  <span className="px-2 py-2 text-sm text-gray-500 font-medium self-center">Termes:</span>
                  {helpEntries.map((entry, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === index
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {entry.term || `Terme ${index + 1}`}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Tab Content */}
              {helpEntries.length > 0 && helpEntries[activeTab] && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider rounded">
                      Définition
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {helpEntries[activeTab].definition}
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                type="button"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
