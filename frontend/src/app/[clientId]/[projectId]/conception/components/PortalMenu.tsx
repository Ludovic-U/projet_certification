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
        className="fixed bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-[70] min-w-[180px]"
        style={{ 
          top: position.top, 
          left: position.left,
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {children}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>,
    document.body
  );
};
