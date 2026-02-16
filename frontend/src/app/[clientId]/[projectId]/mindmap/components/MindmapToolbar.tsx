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
  canUndo,
  canRedo,
  hasSelection,
  selectedNodeType,
  onNodeTypeChange,
  className = '',
}) => {
  // Node types configuration
  const nodeTypes = [
    { id: 'action', label: 'Action', color: '#ef4444' },
    { id: 'sous_action', label: 'Sous Action', color: '#8b5cf6' },
    { id: 'objectif', label: 'Objectif', color: '#ffffff' },
    { id: 'livrable', label: 'Livrable', color: '#22c55e' },
  ];

  const currentType = nodeTypes.find((t) => t.id === selectedNodeType) || nodeTypes[0];
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);

  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: '12px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'rgba(71, 85, 105, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    color: '#e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '8px',
    backgroundColor: 'rgba(30, 41, 59, 0.98)',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
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
    color: '#e2e8f0',
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
          title="Undo"
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
          title="Redo"
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
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={onZoomOut}
          style={{ ...buttonStyle }}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={onFitView}
          style={{ ...buttonStyle }}
          title="Fit View"
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
          title="Add Node"
        >
          <Plus size={18} />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Add</span>
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
        title="Delete Selected"
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
        title="Save as Pre-project"
      >
        <Save size={18} />
        <span style={{ fontSize: '13px', fontWeight: 500 }}>Save</span>
      </button>
    </div>
  );
};
