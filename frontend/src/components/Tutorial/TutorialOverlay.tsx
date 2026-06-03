import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui';
import { FontAwesomeIcon, Icons } from '@/lib/icons';

export interface Tutorial {
  tutorialId: number;
  pageName: string;
  title: string;
  description?: string;
  content: string; // HTML string
  shouldShow: boolean;
  isFirstTime: boolean;
}

interface TutorialOverlayProps {
  tutorial: Tutorial | null;
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ tutorial, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (tutorial?.shouldShow && tutorial?.isFirstTime) {
      setIsVisible(true);
    }
  }, [tutorial]);

  if (!isVisible || !tutorial) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const overlayContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-light rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
        <Button
          className="absolute top-4 right-4 z-10"
          size="iconS"
          variant="secondary"
          onClick={handleClose}
        >
          <FontAwesomeIcon icon={Icons.xmark} />
        </Button>

        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-oswald uppercase font-bold text-dark mb-2">
              {tutorial.title}
            </h2>
            {tutorial.description && (
              <p className="text-gray-600 text-lg">{tutorial.description}</p>
            )}
          </div>

          {/* Content */}
          <div
            className="prose prose-invert max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: tutorial.content }}
          />

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button variant="secondary" onClick={handleClose}>
              Sauter
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Compris !
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
};

export default TutorialOverlay;
