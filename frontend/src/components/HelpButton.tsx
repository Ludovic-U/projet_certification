'use client';

import { useState } from 'react';
import { useAppConfig } from '@/hooks/useAppConfig';
import { HelpCircle, X } from 'lucide-react';

interface HelpButtonProps {
  headerKey: string;
  className?: string;
}

export function HelpButton({ headerKey, className = '' }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { config } = useAppConfig();
  
  const helpText = config.headers?.[headerKey] || '';
  
  if (!helpText) {
    return null;
  }

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
      
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-primary/10 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Aide - {getTitle(headerKey)}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {helpText}
              </p>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                type="button"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
