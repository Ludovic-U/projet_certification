import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ChevronRight, ChevronLeft, GripVertical, Calendar, Plus, ChevronDown, 
  ZoomIn, Edit3, Users, History, Link2, Percent, Zap, Star, Target, 
  Sparkles, MousePointer2, Clock, CheckCircle2, GripHorizontal, Layers
} from 'lucide-react';

interface GanttTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  content: React.ReactNode;
  action: string;
  icon: React.ReactNode;
  targetId: string;
  tipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

// Animated visual step content
const StepVisual: React.FC<{ step: TutorialStep }> = ({ step }) => (
  <div className="relative">
    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
      <div className="flex items-center gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-400"
            style={{
              animation: `pulse-dot 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
    <div className="text-slate-300 text-sm leading-relaxed">{step.content}</div>
  </div>
);

// Pulsating circle animation keyframes
const pulseAnimation = `
@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.5);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

@keyframes draw-line {
  to {
    stroke-dashoffset: 0;
  }
}

`;

// Tutorial steps with rich visual content - defined outside component for performance
const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'BIENVENUE DANS LE DIAGRAMME DE GANTT',
    content: (
      <div className="space-y-3">
        <p>Ce guide interactif va vous montrer toutes les fonctionnalités puissantes du diagramme de Gantt.</p>
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <MousePointer2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Interactif</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Visuel</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">Appuyez sur <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">→</kbd> ou Suivant pour continuer</p>
      </div>
    ),
    action: "Commençons l'aventure !",
    icon: <Sparkles className="w-6 h-6" />,
    targetId: 'tutorial-overlay',
    tipPosition: 'bottom'
  },
  {
    id: 'add-task',
    title: 'AJOUTER UNE TÂCHE',
    content: (
      <div className="space-y-3">
        <p>Cliquez sur ce bouton pour créer une nouvelle tâche. Vous pouvez également faire un clic droit sur la timeline.</p>
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
          <Plus className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-blue-300">Nouveau !</span>
        </div>
        <p className="text-xs text-slate-500">Astuce: Utilisez la touche <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">N</kbd> pour aller plus vite</p>
      </div>
    ),
    action: "Cliquez sur le bouton +",
    icon: <Plus className="w-6 h-6" />,
    targetId: 'add-task-btn',
    tipPosition: 'bottom'
  },
  {
    id: 'edit-task',
    title: 'MODIFIER UNE TÂCHE',
    content: (
      <div className="space-y-3">
        <p>Double-cliquez sur n&apos;importe quelle tâche pour ouvrir l&apos;éditeur complet.</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
            <Edit3 className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">Nom & Dates</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Assignés</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
            <Percent className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300">Progression</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Livrables</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">Astuce: Utilisez la touche <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">E</kbd> pour éditer</p>
      </div>
    ),
    action: "Double-cliquez sur une tâche",
    icon: <Edit3 className="w-6 h-6" />,
    targetId: 'task-bar',
    tipPosition: 'right'
  },
  {
    id: 'move-task',
    title: 'DÉPLACER UNE TÂCHE',
    content: (
      <div className="space-y-3">
        <p>Cliquez et maintenez sur le centre d&apos;une tâche, puis glissez pour changer ses dates de début et fin.</p>
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="relative">
            <div className="w-24 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-lg">
              Tâche
            </div>
            <div className="absolute inset-0 rounded-lg border-2 border-blue-400 animate-pulse" />
          </div>
          <GripHorizontal className="w-5 h-5 text-slate-500" />
          <div className="px-3 py-1 bg-slate-700 rounded text-slate-300 text-xs">→</div>
        </div>
        <p className="text-xs text-slate-500">La durée de la tâche reste inchangée</p>
      </div>
    ),
    action: "Glissez horizontalement",
    icon: <GripVertical className="w-6 h-6" />,
    targetId: 'task-bar',
    tipPosition: 'top'
  },
  {
    id: 'resize-task',
    title: 'REDIMENSIONNER',
    content: (
      <div className="space-y-3">
        <p>Pointez sur les bords gauche ou droit d&apos;une tâche et faites glisser pour ajuster la durée.</p>
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="relative w-28 h-8">
            <div className="w-full h-full bg-blue-500 rounded-lg" />
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-white/30 cursor-ew-resize rounded-l-lg" />
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 cursor-ew-resize rounded-r-lg" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">Start</span>
          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">End</span>
        </div>
      </div>
    ),
    action: "Les bords deviennent bleus au survol",
    icon: <GripHorizontal className="w-6 h-6" />,
    targetId: 'task-bar',
    tipPosition: 'top'
  },
  {
    id: 'view-mode',
    title: 'VUE TEMPORELLE',
    content: (
      <div className="space-y-3">
        <p>Basculez entre les vues Jour, Semaine et Mois pour adapter l&apos;affichage à vos besoins.</p>
        <div className="flex items-center justify-center gap-1 p-1 bg-slate-700/50 rounded-lg">
          <button className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded">Jour</button>
          <button className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded">Semaine</button>
          <button className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded">Mois</button>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400">Changez la granularité du temps</span>
        </div>
      </div>
    ),
    action: "Situé: Centre de la toolbar",
    icon: <Calendar className="w-6 h-6" />,
    targetId: 'view-mode',
    tipPosition: 'bottom'
  },
  {
    id: 'zoom',
    title: 'ZOOM AVANCÉ',
    content: (
      <div className="space-y-3">
        <p>Utilisez + et - pour zoomer sur la timeline et voir plus ou moins de détails.</p>
        <div className="flex items-center justify-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg text-slate-300 hover:bg-slate-600">−</button>
          <div className="w-16 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
            <ZoomIn className="w-4 h-4 text-blue-400" />
          </div>
          <button className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg text-slate-300 hover:bg-slate-600">+</button>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <MousePointer2 className="w-3 h-3" />
          <span>Molette: Ctrl + Zoom</span>
        </div>
      </div>
    ),
    action: "À côté des boutons de vue",
    icon: <ZoomIn className="w-6 h-6" />,
    targetId: 'zoom-controls',
    tipPosition: 'bottom'
  },
  {
    id: 'today',
    title: 'AUJOURD\'HUI',
    content: (
      <div className="space-y-3">
        <p>Cliquez ici pour revenir instantanément à la date du jour.</p>
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-xs text-slate-500">Une ligne rouge marque la position actuelle</p>
      </div>
    ),
    action: "Bouton avec l'icône maison/clock",
    icon: <Clock className="w-6 h-6" />,
    targetId: 'today-btn',
    tipPosition: 'bottom'
  },
  {
    id: 'history',
    title: 'ANNULER / RÉTABLIR',
    content: (
      <div className="space-y-3">
        <p>Utilisez ces boutons ou les raccourcis clavier pour annuler ou rétablir des actions.</p>
        <div className="flex items-center justify-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 rounded text-slate-300 text-sm">
            <History className="w-4 h-4" />
            <span>Ctrl+Z</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 rounded text-slate-300 text-sm">
            <History className="w-4 h-4" />
            <span>Ctrl+Y</span>
          </button>
        </div>
        <p className="text-xs text-slate-500">Tous vos changements sont historisés</p>
      </div>
    ),
    action: "À gauche de la toolbar",
    icon: <History className="w-6 h-6" />,
    targetId: 'undo-redo',
    tipPosition: 'right'
  },
  {
    id: 'progress',
    title: 'PROGRESSION',
    content: (
      <div className="space-y-3">
        <p>La barre bleue montre l&apos;avancement. Cliquez sur l&apos;éditeur pour modifier le pourcentage (0-100%).</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progression</span>
            <span className="text-blue-400 font-bold">75%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: '75%' }}>
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
            </div>
          </div>
        </div>
      </div>
    ),
    action: "Visible sur chaque tâche",
    icon: <Percent className="w-6 h-6" />,
    targetId: 'task-progress',
    tipPosition: 'top'
  },
  {
    id: 'subtasks',
    title: 'SOUS-TÂCHES',
    content: (
      <div className="space-y-3">
        <p>Utilisez le menu contextuel (clic droit) pour créer des sous-tâches hiérarchiques.</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
            <ChevronDown className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Tâche principale</span>
          </div>
          <div className="flex items-center gap-2 p-2 pl-6 bg-slate-800/50 rounded">
            <span className="text-xs text-slate-500">└</span>
            <span className="text-sm text-slate-400">Sous-tâche 1</span>
          </div>
          <div className="flex items-center gap-2 p-2 pl-6 bg-slate-800/50 rounded">
            <span className="text-xs text-slate-500">└</span>
            <span className="text-sm text-slate-400">Sous-tâche 2</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">Jusqu&apos;à 5 niveaux de profondeur</p>
      </div>
    ),
    action: "Flèche à côté du nom",
    icon: <ChevronDown className="w-6 h-6" />,
    targetId: 'task-list',
    tipPosition: 'right'
  },
  {
    id: 'assignees',
    title: 'ASSIGNER L\'ÉQUIPE',
    content: (
      <div className="space-y-3">
        <p>Dans l&apos;éditeur, allez dans l&apos;onglet &apos;Assigné(s)&apos; pour sélectionner les membres de l&apos;équipe.</p>
        <div className="flex items-center justify-center gap-1">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800">JD</div>
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800 -ml-2">AB</div>
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800 -ml-2">MK</div>
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800 -ml-2">+2</div>
        </div>
        <p className="text-xs text-slate-500">Les initiales apparaissent sur la tâche</p>
      </div>
    ),
    action: "Clic droit → Ajouter sous-tâche",
    icon: <Users className="w-6 h-6" />,
    targetId: 'task-summary',
    tipPosition: 'left'
  },
  {
    id: 'dependencies',
    title: 'DÉPENDANCES',
    content: (
      <div className="space-y-3">
        <p>Créez des liens entre tâches via le menu contextuel. Les tâches liées sont connectées par des flèches.</p>
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="px-3 py-1.5 bg-blue-500/20 rounded text-blue-300 text-xs">Tâche A</div>
          <Link2 className="w-4 h-4 text-slate-500" />
          <div className="px-3 py-1.5 bg-emerald-500/20 rounded text-emerald-300 text-xs">Tâche B</div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <Target className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-300">Les tâches s&apos;affichent dans l&apos;ordre de dépendance</span>
        </div>
      </div>
    ),
    action: "Clic droit → Créer un lien",
    icon: <Link2 className="w-6 h-6" />,
    targetId: 'task-dependencies',
    tipPosition: 'top'
  },
  {
    id: 'milestones',
    title: 'MILES',
    content: (
      <div className="space-y-3">
        <p>Les jalons (milestones) marquent des points importants dans votre projet.</p>
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="relative">
            <div className="w-6 h-6 bg-purple-500 transform rotate-45" />
            <CheckCircle2 className="w-4 h-4 text-white absolute top-1 left-1" />
          </div>
          <span className="text-xs text-purple-400">Milestone</span>
        </div>
        <p className="text-xs text-slate-500">Un jalon a une date butoir, pas de durée</p>
      </div>
    ),
    action: "Type de tâche = Jalon",
    icon: <Star className="w-6 h-6" />,
    targetId: 'task-milestone',
    tipPosition: 'top'
  },
  {
    id: 'keyboard',
    title: 'RACCOURCIS CLAVIER',
    content: (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
            <span className="text-slate-400">Nouvelle tâche</span>
            <kbd className="px-2 py-0.5 bg-slate-600 rounded text-white">N</kbd>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
            <span className="text-slate-400">Éditer</span>
            <kbd className="px-2 py-0.5 bg-slate-600 rounded text-white">E</kbd>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
            <span className="text-slate-400">Supprimer</span>
            <kbd className="px-2 py-0.5 bg-slate-600 rounded text-white">Del</kbd>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
            <span className="text-slate-400">Annuler</span>
            <kbd className="px-2 py-0.5 bg-slate-600 rounded text-white">Ctrl+Z</kbd>
          </div>
        </div>
      </div>
    ),
    action: "Gagnez du temps !",
    icon: <Target className="w-6 h-6" />,
    targetId: 'tutorial-overlay',
    tipPosition: 'bottom'
  },
  {
    id: 'complete',
    title: 'FÉLICITATIONS ! 🎉',
    content: (
      <div className="space-y-4">
        <p>Vous connaissez maintenant toutes les fonctionnalités du diagramme de Gantt.</p>
        <div className="flex items-center justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="text-2xl"
              style={{ animation: `float 1s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }}
            >
              ⭐
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-400">Bonne planification de vos projets !</p>
      </div>
    ),
    action: "Vous êtes prêt à commencer !",
    icon: <Zap className="w-6 h-6" />,
    targetId: 'tutorial-overlay',
    tipPosition: 'bottom'
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

export const GanttTutorial: React.FC<GanttTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [showHighlight, setShowHighlight] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Progress persistence - restore last position from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedProgress = localStorage.getItem('gantt_tutorial_progress');
      if (savedProgress) {
        const step = parseInt(savedProgress, 10);
        if (!isNaN(step) && step >= 0 && step < TUTORIAL_STEPS.length) {
          setCurrentStep(step);
        }
      }
    }
  }, [isOpen]);
  
  // Save progress to localStorage
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('gantt_tutorial_progress', currentStep.toString());
    }
  }, [currentStep, isOpen]);
  
  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  // Update highlight position - optimized with useCallback
  const updateHighlightPosition = useCallback(() => {
    if (!isOpen || !step) return;
    
    if (step.targetId && step.targetId !== 'tutorial-overlay') {
      const rect = findElementByDataId(step.targetId);
      if (rect) {
        setHighlightRect(rect);
        setShowHighlight(true);
        
        // Calculate modal position based on highlighted element
        const modalWidth = 480;
        const modalHeight = 400;
        const padding = 20;
        
        // Position modal based on tipPosition
        let targetTop = rect.bottom + 20;
        let targetLeft = rect.left + rect.width / 2;
        
        // Adjust based on preferred position
        switch (step.tipPosition) {
          case 'top':
            targetTop = rect.top - modalHeight - 20;
            break;
          case 'left':
            targetLeft = rect.left - modalWidth - 20;
            targetTop = rect.top + rect.height / 2 - modalHeight / 2;
            break;
          case 'right':
            targetLeft = rect.right + 20;
            targetTop = rect.top + rect.height / 2 - modalHeight / 2;
            break;
          case 'bottom':
          default:
            targetTop = rect.bottom + 20;
            break;
        }
        
        // Keep modal within viewport
        targetLeft = Math.max(padding, Math.min(targetLeft, window.innerWidth - modalWidth - padding));
        targetTop = Math.max(padding, Math.min(targetTop, window.innerHeight - modalHeight - padding));
        
        setModalPosition({ top: targetTop, left: targetLeft });
      } else {
        setShowHighlight(false);
        // Center modal - use CSS transform instead of layout
        setModalPosition({
          top: window.innerHeight / 2 - 200,
          left: window.innerWidth / 2 - 240
        });
      }
    } else {
      setHighlightRect(null);
      setShowHighlight(false);
      // Center modal - use CSS transform instead of layout
      setModalPosition({
        top: window.innerHeight / 2 - 200,
        left: window.innerWidth / 2 - 240
      });
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Debounced position update to reduce lag
    let resizeTimer: NodeJS.Timeout;
    let scrollTimer: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateHighlightPosition, 100);
    };
    
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateHighlightPosition, 100);
    };
    
    // Small delay to allow DOM to update
    const timer = setTimeout(updateHighlightPosition, 50);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updateHighlightPosition]);

  const goToNext = useCallback(() => {
    if (!isLastStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [isLastStep, currentStep]);

  const goToPrevious = useCallback(() => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [isFirstStep, currentStep]);

  const goToStep = useCallback((index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      setIsAnimating(false);
    }, 150);
  }, []);

  // Keyboard navigation with useCallback for performance
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevious();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [goToNext, goToPrevious, onClose]);

  // Add useEffect for keyboard event listener
  useEffect(() => {
    if (!isOpen) return;
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="tutorial-wrapper">
      <style>{pulseAnimation}</style>
      
      {/* Animated spotlight effect */}
      {showHighlight && highlightRect && (
        <React.Fragment>
          {/* Spotlight gradient */}
          <div 
            className="fixed inset-0 pointer-events-none transition-all duration-300"
            style={{ 
              zIndex: 9999,
              background: `radial-gradient(circle at ${highlightRect.left + highlightRect.width/2}px ${highlightRect.top + highlightRect.height/2}px, transparent ${Math.max(highlightRect.width, highlightRect.height) * 0.7}px, rgba(0,0,0,0.9) ${Math.max(highlightRect.width, highlightRect.height) * 0.85}px)`
            }}
          />
          
          {/* Pulsating highlight border */}
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
            {/* Outer glow - using transform instead of box-shadow for better performance */}
            <div 
              className="absolute inset-0 rounded-lg"
              style={{ 
                animation: 'pulse-glow 2s ease-in-out infinite',
                transform: 'scale(1.02)',
                background: 'rgba(59, 130, 246, 0.3)',
                border: '2px solid rgba(59, 130, 246, 0.6)'
              }} 
            />
            
            {/* Main border */}
            <div className="absolute inset-0 rounded-lg border-2 border-blue-400" />
            
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
            
            {/* Pulsating dot */}
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full"
              style={{ animation: 'pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} 
            />
          </div>
          
          {/* Connecting line from highlight to modal */}
          <svg
            className="fixed pointer-events-none"
            style={{ 
              zIndex: 10001,
              overflow: 'visible'
            }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1={highlightRect.left + highlightRect.width / 2}
              y1={step.tipPosition === 'bottom' ? highlightRect.bottom + 4 : highlightRect.top - 4}
              x2={modalPosition.left + 240}
              y2={step.tipPosition === 'bottom' ? modalPosition.top : modalPosition.top + 320}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        </React.Fragment>
      )}
      
      {/* Tutorial modal */}
      <div 
        ref={modalRef}
        className="fixed z-50 transition-all duration-300 ease-out"
        style={{ 
          top: modalPosition.top,
          left: modalPosition.left,
          zIndex: 10001,
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
          opacity: isAnimating ? 0.8 : 1
        }}
      >
        <div 
          className="w-[480px] bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="h-1 bg-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
            </div>
          </div>
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600/20 via-purple-600/10 to-blue-600/20 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-400/20 animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
                  <div className="relative">{step.icon}</div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-blue-400 tracking-wider">
                    NIVEAU {currentStep + 1}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {currentStep + 1} / {TUTORIAL_STEPS.length} étapes
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                title="Fermer le tutoriel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
  
          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
            <StepVisual step={step} />
            
            {/* Action hint */}
            {step.action && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg">
                <MousePointer2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">{step.action}</span>
              </div>
            )}
          </div>
  
          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50 bg-slate-800/50">
            <button
              onClick={goToPrevious}
              disabled={isFirstStep}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                isFirstStep 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </button>
  
            {/* Step indicators */}
            <div className="flex items-center gap-1">
            {TUTORIAL_STEPS.map((s, index) => (
                <button
                  key={s.id}
                  onClick={() => goToStep(index)}
                  className={`relative transition-all ${
                    index === currentStep 
                      ? 'w-8 h-2' 
                      : 'w-2 h-2'
                  } rounded-full overflow-hidden`}
                  style={{
                    backgroundColor: index === currentStep ? undefined : 'transparent'
                  }}
                >
                  <div 
                    className={`absolute inset-0 rounded-full transition-all ${
                      index === currentStep 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400' 
                        : index < currentStep 
                          ? 'bg-green-500' 
                          : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                  {index === currentStep && (
                    <div 
                      className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"
                      style={{ backgroundSize: '200% 100%' }}
                    />
                  )}
                </button>
              ))}
            </div>
  
            <button
              onClick={isLastStep ? onClose : goToNext}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
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
        
        {/* Keyboard shortcuts hint */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            Suivant
          </span>
          <span className="flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" />
            Précédent
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">ESC</kbd>
            Fermer
          </span>
        </div>
      </div>
    </div>
  );
};

export default GanttTutorial;
