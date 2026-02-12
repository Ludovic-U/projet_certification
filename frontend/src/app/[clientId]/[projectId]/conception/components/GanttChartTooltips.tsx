import React, { useState, useRef, useEffect } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Home,
  MousePointer
} from 'lucide-react';

// Tooltip content for different interactions
const tooltipContent: Record<string, { title: string; content: string; shortcuts?: string[] }> = {
  // Toolbar tooltips
  'add-task': {
    title: 'Ajouter une tâche',
    content: 'Créez une nouvelle tâche dans votre planning',
    shortcuts: ['N']
  },
  'undo': {
    title: 'Annuler',
    content: 'Revenez à l\'état précédent',
    shortcuts: ['Ctrl + Z']
  },
  'redo': {
    title: 'Rétablir',
    content: 'Restaurer l\'action annulée',
    shortcuts: ['Ctrl + Y']
  },
  'view-day': {
    title: 'Vue Jour',
    content: 'Affiche le planning jour par jour. Idéal pour la planification détaillée.'
  },
  'view-week': {
    title: 'Vue Semaine',
    content: 'Affiche le planning par semaine. Bon compromis pour le suivi.'
  },
  'view-month': {
    title: 'Vue Mois',
    content: 'Affiche le planning par mois. Parfait pour la vue d\'ensemble.'
  },
  'zoom-in': {
    title: 'Zoom avant',
    content: 'Agrandit la timeline pour voir plus de détails',
    shortcuts: ['+']
  },
  'zoom-out': {
    title: 'Zoom arrière',
    content: 'Réduit la timeline pour voir plus de période',
    shortcuts: ['-']
  },
  'today': {
    title: 'Aujourd\'hui',
    content: 'Revient à la date du jour. Une ligne rouge indique la position actuelle.'
  },
  'help': {
    title: 'Guide d\'utilisation',
    content: 'Ouvrez ce guide pour découvrir toutes les fonctionnalités du diagramme de Gantt.'
  },
  
  // Task interactions
  'task-drag': {
    title: 'Déplacer une tâche',
    content: 'Cliquez et faites glisser pour changer les dates. La durée reste inchangée.'
  },
  'task-resize-left': {
    title: 'Redimensionner le début',
    content: 'Glissez pour modifier la date de début. La date de fin s\'ajuste automatiquement.'
  },
  'task-resize-right': {
    title: 'Redimensionner la fin',
    content: 'Glissez pour modifier la date de fin. La date de début s\'ajuste automatiquement.'
  },
  'task-edit': {
    title: 'Éditer la tâche',
    content: 'Double-cliquez pour ouvrir l\'éditeur complet',
    shortcuts: ['E']
  },
  'task-delete': {
    title: 'Supprimer la tâche',
    content: 'Supprimez la tâche sélectionnée. Cette action est irréversible.'
  },
  'task-dependency': {
    title: 'Créer une dépendance',
    content: 'Liez cette tâche à une autre. Les tâches liées sont connectées par une flèche.'
  },
  'task-subtask': {
    title: 'Ajouter une sous-tâche',
    content: 'Créez une hiérarchie de tâches. Jusqu\'à 5 niveaux de profondeur sont autorisés.'
  },
  
  // Timeline
  'today-marker': {
    title: 'Aujourd\'hui',
    content: 'Cette ligne rouge indique la date du jour dans votre planning.'
  },
  'timeline-progress': {
    title: 'Progression',
    content: 'La barre bleue montre l\'avancement. Cliquez pour modifier le pourcentage.'
  },
  'milestone': {
    title: 'Jalon (Milestone)',
    content: 'Un jalon représente un point important dans le projet sans durée définie.'
  },
  
  // Editor
  'assignees': {
    title: 'Assigner des membres',
    content: 'Sélectionnez les membres de l\'équipe responsables de cette tâche.'
  },
  'deliverables': {
    title: 'Livrables',
    content: 'Définissez les résultats attendus. Une fois validés, la tâche passe à 100%.'
  },
  'objectives': {
    title: 'Objectifs',
    content: 'Définissez les objectifs à atteindre. Contribute à la progression automatique.'
  },
  'notes': {
    title: 'Notes et commentaires',
    content: 'Ajoutez des informations, décisions ou observations pour l\'équipe.'
  },
  'files': {
    title: 'Fichiers joints',
    content: 'Attacher des documents, images ou autres fichiers à la tâche.'
  },
  
  // Export/Import
  'export': {
    title: 'Exporter',
    content: 'Télécharge votre planning au format CSV, Excel, MS Project ou JSON.'
  },
  'import': {
    title: 'Importer',
    content: 'Chargez un planning existant depuis un fichier.'
  },
  
  // Shortcuts
  'shortcuts': {
    title: 'Raccourcis clavier',
    content: 'N = Nouvelle tâche | E = Éditer | Suppr = Supprimer | Ctrl+Z = Annuler | Ctrl+Y = Rétablir | ESC = Fermer'
  }
};

interface TooltipProps {
  children?: React.ReactNode;
  content?: string;
  contentKey?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  shortcuts?: string[];
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  contentKey,
  position = 'top',
  className = '',
  shortcuts = []
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const getTooltipContent = () => {
    if (content) return { title: '', content, shortcuts: [] as string[] };
    if (contentKey) return tooltipContent[contentKey] || { title: '', content: '', shortcuts: [] as string[] };
    return { title: '', content: '', shortcuts: [] as string[] };
  };

  const showTooltip = (e: React.MouseEvent) => {
    elementRef.current = e.currentTarget as HTMLElement;
    setIsVisible(true);
    updatePosition();
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const updatePosition = () => {
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 120;
    const gap = 12;

    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    let y = rect.top - gap - tooltipHeight;

    // Adjust horizontal position
    if (x < 10) x = 10;
    if (x + tooltipWidth > window.innerWidth - 10) {
      x = window.innerWidth - tooltipWidth - 10;
    }

    // Adjust vertical position for right/left tooltips
    if (position === 'right') {
      x = rect.right + gap;
      y = rect.top + rect.height / 2 - tooltipHeight / 2;
    } else if (position === 'left') {
      x = rect.left - gap - tooltipWidth;
      y = rect.top + rect.height / 2 - tooltipHeight / 2;
    } else if (position === 'bottom') {
      y = rect.bottom + gap;
    }

    setTooltipPos({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, position]);

  const tooltipData = getTooltipContent();
  const finalShortcuts = shortcuts.length > 0 ? shortcuts : tooltipData.shortcuts;
  const hasContent = tooltipData.title || tooltipData.content || finalShortcuts?.length;

  if (!hasContent && children) {
    return <>{children}</>;
  }

  if (!children) {
    return null;
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={(e) => {
        showTooltip(e);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }}
      onMouseLeave={hideTooltip}
      onMouseMove={updatePosition}
    >
      {children}
      
      {/* Tooltip */}
      <div
        className={`
          fixed z-[100] pointer-events-none
          transition-all duration-200 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
        style={{
          left: tooltipPos.x,
          top: tooltipPos.y,
        }}
      >
        <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl shadow-2xl p-4 max-w-xs">
          {/* Header with icon */}
          {tooltipData.title && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white">{tooltipData.title}</h4>
            </div>
          )}
          
          {/* Content */}
          {tooltipData.content && (
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              {tooltipData.content}
            </p>
          )}
          
          {/* Shortcuts */}
          {finalShortcuts && finalShortcuts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {finalShortcuts.map((shortcut, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-md text-xs text-blue-400 font-mono"
                >
                  {shortcut}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Arrow */}
        <div 
          className={`
            absolute w-3 h-3 bg-slate-900 border border-slate-700 rotate-45
            ${position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-t-0 border-l-0' : ''}
            ${position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0' : ''}
            ${position === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2 border-l-0 border-t-0' : ''}
            ${position === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2 border-r-0 border-b-0' : ''}
          `}
        />
      </div>
    </div>
  );
};

// Enhanced Toolbar Button with Tooltip
interface ToolbarTooltipButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  contentKey?: string;
  shortcuts?: string[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const ToolbarTooltipButton: React.FC<ToolbarTooltipButtonProps> = ({
  onClick,
  disabled,
  icon,
  contentKey,
  shortcuts,
  position = 'bottom',
  className = ''
}) => (
  <Tooltip contentKey={contentKey} shortcuts={shortcuts} position={position}>
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-9 h-9 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all ${className}`}
    >
      {icon}
    </button>
  </Tooltip>
);

// Task bar with enhanced tooltip
interface TaskTooltipProps {
  task: {
    id: number;
    text: string;
    progress: number;
    start: string;
    end?: string;
    type?: string;
    details?: string;
    assignees?: number[];
  };
  users: { id: number; label: string }[];
  children: React.ReactNode;
}

export const TaskTooltipWrapper: React.FC<TaskTooltipProps> = ({
  task,
  users,
  children
}) => {
  const getAssigneeNames = () => {
    if (!task.assignees?.length) return 'Non attribué';
    return task.assignees
      .map(id => users.find(u => u.id === id)?.label)
      .filter(Boolean)
      .join(', ');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const tooltipContentText = `
${task.type === 'milestone' ? 'Jalon' : 'Tâche'}: ${task.text}
Progression: ${task.progress}%
Assigné à: ${getAssigneeNames()}
Début: ${formatDate(task.start)}
${task.end && task.type !== 'milestone' ? `Fin: ${formatDate(task.end)}` : ''}
${task.details ? task.details : ''}
  `.trim();

  return (
    <Tooltip content={tooltipContentText} position="top">
      <div className="relative cursor-pointer">
        {children}
      </div>
    </Tooltip>
  );
};

// Help widget for Gantt Chart
export const GanttHelpWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Help Button */}
      <Tooltip contentKey="help" position="left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full shadow-lg transition-all duration-300
            flex items-center justify-center
            ${isOpen 
              ? 'bg-blue-600 text-white rotate-90' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-110'
            }
          `}
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </Tooltip>

      {/* Help Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700">
            <h3 className="font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              Guide rapide
            </h3>
          </div>
          
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Actions rapides
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Tooltip contentKey="add-task" position="top">
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Nouvelle tâche
                  </button>
                </Tooltip>
                <Tooltip contentKey="today" position="top">
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                    <Home className="w-4 h-4" />
                    Aujourd&apos;hui
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Shortcuts */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Raccourcis
              </h4>
              <div className="bg-slate-700/30 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Nouvelle tâche</span>
                  <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs text-blue-400 font-mono">N</kbd>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Éditer</span>
                  <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs text-blue-400 font-mono">E</kbd>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Annuler</span>
                  <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs text-blue-400 font-mono">Ctrl + Z</kbd>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Rétablir</span>
                  <kbd className="px-2 py-0.5 bg-slate-800 rounded text-xs text-blue-400 font-mono">Ctrl + Y</kbd>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Astuces
              </h4>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-slate-300">
                <MousePointer className="w-4 h-4 inline mr-1" />
                Glissez les bords des tâches pour ajuster la durée. Les dates s&apos;adaptent automatiquement !
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-700 bg-slate-800/50">
            <Tooltip contentKey="help" position="top">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Ouvrir le guide complet
              </button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
