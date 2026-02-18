"use client";

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo,
  Redo,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  Brain,
} from 'lucide-react';

interface MindmapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAddNode: (type: string) => void;
  onDeleteSelected: () => void;
  onSave: () => void;
  onGenerateAI: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  selectedNodeType: string;
  onNodeTypeChange: (type: string) => void;
  className?: string;
}

export const MindmapToolbar: React.FC<MindmapToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  onAddNode,
  onDeleteSelected,
  onSave,
  onGenerateAI,
  canUndo,
  canRedo,
  hasSelection,
  selectedNodeType,
  onNodeTypeChange,
  className = '',
}) => {
  // Node types configuration
  const nodeTypes = [
    { id: 'action', label: 'Action', color: '#96776e' },
    { id: 'sous_action', label: 'Sous Action', color: '#698063' },
    { id: 'objectif', label: 'Objectif', color: '#ffffff' },
    { id: 'livrable', label: 'Livrable', color: '#22c55e' },
  ];

  const currentType = nodeTypes.find((t) => t.id === selectedNodeType) || nodeTypes[0];
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);

  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'rgba(105, 128, 99, 0.95)', // Dark green #698063
    borderRadius: '12px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(105, 128, 99, 0.4)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'rgba(159, 179, 154, 0.4)', // Light green #9fb39a
    border: '1px solid rgba(159, 179, 154, 0.4)',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '8px',
    backgroundColor: 'rgba(105, 128, 99, 0.98)', // Dark green #698063
    borderRadius: '8px',
    border: '1px solid rgba(105, 128, 99, 0.4)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    minWidth: '160px',
    zIndex: 100,
    overflow: 'hidden',
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: '10px 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background-color 0.15s ease',
    color: '#ffffff',
  };

  const colorDotStyle: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  };

  return (
    <div className={className} style={toolbarStyle}>
      <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            ...buttonStyle,
            opacity: canUndo ? 1 : 0.4,
            cursor: canUndo ? 'pointer' : 'not-allowed',
          }}
          title="Annuler"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            ...buttonStyle,
            opacity: canRedo ? 1 : 0.4,
            cursor: canRedo ? 'pointer' : 'not-allowed',
          }}
          title="Rétablir"
        >
          <Redo size={18} />
        </button>
      </div>

      <div
        style={{
          width: '1px',
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          margin: '0 4px',
        }}
      />

      <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
        <button
          onClick={onZoomIn}
          style={{ ...buttonStyle }}
          title="Zoom avant"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={onZoomOut}
          style={{ ...buttonStyle }}
          title="Zoom arrière"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={onFitView}
          style={{ ...buttonStyle }}
          title="Ajuster la vue"
        >
          <Maximize size={18} />
        </button>
      </div>

      <div
        style={{
          width: '1px',
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          margin: '0 4px',
        }}
      />

      <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
        <button
          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          style={{
            ...buttonStyle,
            width: 'auto',
            padding: '0 12px',
            gap: '8px',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
          }}
          title="Ajouter un nœud"
        >
          <Plus size={18} />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Ajouter</span>
          <ChevronDown size={14} />
        </button>

        {/* Type dropdown - integrated with Add button */}
        {showTypeDropdown && (
          <div style={dropdownStyle}>
            {nodeTypes.map((type) => (
              <div
                key={type.id}
                style={{
                  ...dropdownItemStyle,
                  backgroundColor:
                    selectedNodeType === type.id
                      ? 'rgba(71, 85, 105, 0.6)'
                      : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (selectedNodeType !== type.id) {
                    e.currentTarget.style.backgroundColor =
                      'rgba(71, 85, 105, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedNodeType !== type.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onClick={() => {
                  onNodeTypeChange(type.id);
                  onAddNode(type.id);
                  setShowTypeDropdown(false);
                }}
              >
                <span
                  style={{
                    ...colorDotStyle,
                    backgroundColor: type.color,
                  }}
                />
                <span style={{ fontSize: '13px' }}>{type.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        style={{
          ...buttonStyle,
          backgroundColor: hasSelection
            ? 'rgba(239, 68, 68, 0.2)'
            : undefined,
          borderColor: hasSelection ? 'rgba(239, 68, 68, 0.3)' : undefined,
          opacity: hasSelection ? 1 : 0.4,
          cursor: hasSelection ? 'pointer' : 'not-allowed',
        }}
        title="Supprimer la sélection"
      >
        <Trash2 size={18} />
      </button>

      <div
        style={{
          width: '1px',
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          margin: '0 4px',
        }}
      />

      <button
        onClick={onSave}
        style={{
          ...buttonStyle,
          width: 'auto',
          padding: '0 12px',
          gap: '6px',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          borderColor: 'rgba(59, 130, 246, 0.4)',
        }}
        title="Enregistrer en pré-projet"
      >
        <Save size={18} />
        <span style={{ fontSize: '13px', fontWeight: 500 }}>Enregistrer</span>
      </button>

      <button
        onClick={onGenerateAI}
        style={{
          ...buttonStyle,
          width: 'auto',
          padding: '0 12px',
          gap: '6px',
          backgroundColor: 'rgba(147, 51, 234, 0.3)',
          borderColor: 'rgba(147, 51, 234, 0.4)',
        }}
        title="Générer une carte mentale avec IA"
      >
        <Brain size={18} />
        <span style={{ fontSize: '13px', fontWeight: 500 }}>IA</span>
      </button>
    </div>
  );
};
