import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, GripVertical, Calendar, Plus, ChevronDown, ZoomIn, Edit3, Users, History, Link2, Percent, Zap, Star, Target, ArrowLeft } from 'lucide-react';

interface GanttTipsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  content: string;
  action?: string;
  icon: React.ReactNode;
  targetId?: string;
}

// Custom icons defined before use
const HomeIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const KeyboardIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
    <line x1="6" y1="8" x2="6" y2="8"/>
    <line x1="10" y1="8" x2="10" y2="8"/>
    <line x1="14" y1="8" x2="14" y2="8"/>
    <line x1="18" y1="8" x2="18" y2="8"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
);

const TrophyIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const tutorialSteps: TutorialStep[] = [
  {
    title: "BIENVENUE DANS LE DIAGRAMME DE GANTT",
    content: "Ce guide interactif va vous montrer comment utiliser toutes les fonctionnalités. Suivez les indications et appuyez sur Suivant pour continuer.",
    action: "Appuyez sur Suivant pour commencer",
    icon: React.createElement(Star, { className: "w-6 h-6" }),
    targetId: "tutorial-overlay"
  },
  {
    title: "AJOUTER UNE TÂCHE",
    content: "Cliquez sur ce bouton pour créer une nouvelle tâche. Vous pouvez aussi faire un clic droit sur la timeline.",
    action: "Located: Bouton bleu en haut à droite",
    icon: React.createElement(Plus, { className: "w-6 h-6" }),
    targetId: "add-task-btn"
  },
  {
    title: "MODIFIER UNE TÂCHE",
    content: "Double-cliquez sur une tâche pour ouvrir l'éditeur complet. Changez le nom, les dates, les assignés et plus encore.",
    action: "Double-cliquez sur n'importe quelle tâche",
    icon: React.createElement(Edit3, { className: "w-6 h-6" }),
    targetId: "task-bar"
  },
  {
    title: "DÉPLACER UNE TÂCHE",
    content: "Cliquez et maintenez sur le centre d'une tâche, puis glissez pour changer ses dates. La durée reste inchangée.",
    action: "Glissez horizontalement",
    icon: React.createElement(GripVertical, { className: "w-6 h-6" }),
    targetId: "task-bar"
  },
  {
    title: "REDIMENSIONNER",
    content: "Pointez sur les bords gauche ou droit d'une tâche et faites glisser pour ajuster la durée.",
    action: "Les bords deviennent bleus au survol",
    icon: React.createElement(ArrowLeft, { className: "w-6 h-6" }),
    targetId: "task-bar"
  },
  {
    title: "VUE TEMPORELLE",
    content: "Basculez entre les vues Jour, Semaine et Mois pour adapter l'affichage à vos besoins.",
    action: "Located: Centre de la barre d'outils",
    icon: React.createElement(Calendar, { className: "w-6 h-6" }),
    targetId: "view-mode"
  },
  {
    title: "ZOOM",
    content: "Utilisez + et - pour zoomer sur la timeline et voir plus ou moins de détails.",
    action: "Located: À côté des boutons de vue",
    icon: React.createElement(ZoomIn, { className: "w-6 h-6" }),
    targetId: "zoom-controls"
  },
  {
    title: "AUJOURD'HUI",
    content: "Cliquez ici pour revenir instantanément à la date du jour. Une ligne rouge marque la position actuelle.",
    action: "Timestamp: Bouton avec l'icône maison",
    icon: React.createElement(HomeIcon, { className: "w-6 h-6" }),
    targetId: "today-btn"
  },
  {
    title: "ANNULER / RÉTABLIR",
    content: "Utilisez ces boutons ou les raccourcis Ctrl+Z et Ctrl+Y pour annuler ou rétablir des actions.",
    action: "Located: À gauche de la barre d'outils",
    icon: React.createElement(History, { className: "w-6 h-6" }),
    targetId: "undo-redo"
  },
  {
    title: "PROGRESSION",
    content: "La barre bleue montre l'avancement. Cliquez sur l'éditeur pour modifier le pourcentage (0-100%).",
    action: "Visible sur chaque tâche",
    icon: React.createElement(Percent, { className: "w-6 h-6" }),
    targetId: "task-bar"
  },
  {
    title: "SOUS-TÂCHES",
    content: "Utilisez le menu contextuel (clic droit) pour créer des sous-tâches. Jusqu'à 5 niveaux de profondeur.",
    action: "Located: Flèche à côté du nom de la tâche",
    icon: React.createElement(ChevronDown, { className: "w-6 h-6" }),
    targetId: "task-list"
  },
  {
    title: "ASSIGNER L'ÉQUIPE",
    content: "Dans l'éditeur, allez dans l'onglet 'Assigné(s)' pour sélectionner les membres de l'équipe.",
    action: "Les initiales apparaissent sur la tâche",
    icon: React.createElement(Users, { className: "w-6 h-6" }),
    targetId: "task-summary"
  },
  {
    title: "DÉPENDANCES",
    content: "Créez des liens entre tâches via le menu contextuel. Les tâches liées sont connectées par une flèche.",
    action: "Les tâches s'affichent dans l'ordre de dépendance",
    icon: React.createElement(Link2, { className: "w-6 h-6" }),
    targetId: "task-bar"
  },
  {
    title: "RACCOURCIS CLAVIER",
    content: "N = Nouvelle tâche | E = Éditer | Suppr = Supprimer | Ctrl+Z = Annuler | Ctrl+Y = Rétablir",
    action: "Gagnez du temps avec ces raccourcis",
    icon: React.createElement(KeyboardIcon, { className: "w-6 h-6" }),
    targetId: "tutorial-overlay"
  },
  {
    title: "FÉLICITATIONS !",
    content: "Vous connaissez maintenant toutes les fonctionnalités du diagramme de Gantt. Bonne planification !",
    action: "Vous êtes prêt à commencer !",
    icon: React.createElement(TrophyIcon, { className: "w-6 h-6" }),
    targetId: "tutorial-overlay"
  }
];


// Find element position with data attributes
const findElementByDataId = (id: string): DOMRect | null => {
  const element = document.querySelector(`[data-tutorial-id="${id}"]`) as HTMLElement;
  if (element) {
    return element.getBoundingClientRect();
  }
  return null;
};

export const GanttTips: React.FC<GanttTipsProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [showHighlight, setShowHighlight] = useState(false);
  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  
  useEffect(() => {
    if (!isOpen) return;
    
    const updatePosition = () => {
      if (step.targetId && step.targetId !== 'tutorial-overlay') {
        const rect = findElementByDataId(step.targetId);
        setHighlightRect(rect);
        setShowHighlight(!!rect);
      } else {
        setHighlightRect(null);
        setShowHighlight(false);
      }
    };
    
    const timer = setTimeout(updatePosition, 100);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, currentStep, step]);
  
  if (!isOpen) return null;
  
  const goToNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  
  // Calculate modal position based on highlighted element
  const getModalPosition = () => {
    if (!highlightRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    
    const modalWidth = 640; // max-w-2xl = 1024px but we'll use 640 for safety
    const modalHeight = 400; // Approximate modal height
    const padding = 20;
    
    // Center horizontally on the highlighted element
    let left = highlightRect.left + highlightRect.width / 2;
    
    // Keep modal within viewport horizontally
    if (left - modalWidth / 2 < padding) {
      left = modalWidth / 2 + padding;
    } else if (left + modalWidth / 2 > window.innerWidth - padding) {
      left = window.innerWidth - modalWidth / 2 - padding;
    }
    
    // Position modal below or above the highlighted element
    let top = highlightRect.bottom + 20;
    
    // If modal would go off bottom, position it above the element
    if (top + modalHeight > window.innerHeight - padding) {
      top = highlightRect.top - modalHeight - 20;
    }
    
    // Keep modal within viewport vertically
    if (top < padding) {
      top = padding;
    }
    
    return { top: `${top}px`, left: `${left}px`, transform: 'translateX(-50%)' };
  };
  
  const modalStyle = getModalPosition();
  
  return (
    <>
      <div className="fixed inset-0 bg-black/80" style={{ zIndex: 9998 }} />
      
      {showHighlight && highlightRect && (
        <>
          <div 
            className="fixed inset-0 pointer-events-none"
            style={{ 
              zIndex: 9999,
              background: `radial-gradient(circle at ${highlightRect.left + highlightRect.width/2}px ${highlightRect.top + highlightRect.height/2}px, transparent ${Math.max(highlightRect.width, highlightRect.height) * 0.8}px, rgba(0,0,0,0.85) ${Math.max(highlightRect.width, highlightRect.height)}px)`
            }}
          />
          
          <div 
            className="fixed pointer-events-none"
            style={{ 
              zIndex: 10000,
              left: highlightRect.left - 4,
              top: highlightRect.top - 4,
              width: highlightRect.width + 8,
              height: highlightRect.height + 8,
            }}
          >
            <div className="absolute inset-0 rounded-lg border-2 border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8),0_0_40px_rgba(96,165,250,0.4)]" 
                 style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div className="absolute inset-0 rounded-lg border-2 border-blue-300" 
                 style={{ animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.5s' }} />
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full" 
                 style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
          </div>
        </>
      )}
      
      <div 
        className="fixed z-50 w-full max-w-2xl mx-4"
        style={{ ...modalStyle, zIndex: 10001 }}
      >        <div className="bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600/20 via-purple-600/10 to-blue-600/20 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-blue-400 tracking-wider">NIVEAU {currentStep + 1}</h2>
                  <p className="text-xs text-slate-500">{currentStep + 1}/{tutorialSteps.length}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
  
          <div className="p-5">
            <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{step.content}</p>
            
            {step.action && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">{step.action}</span>
              </div>
            )}
          </div>
  
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50 bg-slate-800/50">
            <button
              onClick={goToPrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                currentStep === 0 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
  
            <div className="flex items-center gap-1">
              {tutorialSteps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'bg-blue-400 w-4' 
                      : index < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
  
            <button
              onClick={isLastStep ? onClose : goToNext}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
            >
              {isLastStep ? (
                <>
                  <Zap className="w-4 h-4" />
                  TERMINER
                </>
              ) : (
                <>
                  SUIVANT
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <KeyboardIcon className="w-3 h-3" />
            Utilisez les flèches
          </span>
          <span className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">ESC</span>
            pour fermer
          </span>
        </div>
      </div>
    </>
  );
};

export default GanttTips;
