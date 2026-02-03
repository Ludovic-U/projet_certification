'use client';

import React from 'react';
import ReactDOM from 'react-dom';

interface PortalMenuProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
}

export const PortalMenu = ({ children, isOpen, onClose, position }: PortalMenuProps) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-[70] min-w-[140px]"
        style={{ top: position.top, left: position.left }}
      >
        {children}
      </div>
    </>,
    document.body
  );
};
