"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

// Custom Mindmap Node Component
export type MindmapNodeData = {
  label: string;
  color?: string;
  fontSize?: number;
  isRoot?: boolean;
  nodeType?: string;
};

interface MindmapNodeProps extends NodeProps {
  data: MindmapNodeData;
  onDelete?: (id: string) => void;
}

const MindmapNode = ({ data, selected, id, onDelete }: MindmapNodeProps) => {
  const {
    label,
    color = '#3b82f6',
    fontSize = 14,
    isRoot = false,
  } = data;

  // Light colors that need dark text
  const lightColors = ['#ffffff', '#f0f9ff', '#f0fdf4', '#fefce8', '#fef7ed'];
  const needsDarkText = lightColors.some((c) => {
    const hex = color.toLowerCase();
    return hex === c || hex.startsWith(c);
  }) || color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#22c55e' || color.toLowerCase() === '#f59e0b';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  const nodeStyle: React.CSSProperties = {
    padding: isRoot ? '16px 24px' : '10px 16px',
    borderRadius: isRoot ? '12px' : '8px',
    backgroundColor: color,
    border: `2px solid ${selected ? (needsDarkText ? '#1e293b' : '#ffffff') : `${needsDarkText ? '#cbd5e1' : `${color}80`}`}`,
    color: needsDarkText ? '#1e293b' : '#ffffff',
    fontSize: `${fontSize}px`,
    fontWeight: isRoot ? 600 : 500,
    minWidth: isRoot ? 150 : 120,
    textAlign: 'center',
    boxShadow: selected
      ? `0 0 0 2px ${needsDarkText ? '#1e293b' : color}, 0 4px 12px rgba(0,0,0,0.3)`
      : '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    position: 'relative',
  };

  // Handle style - larger and more visible
  const handleStyle: React.CSSProperties = {
    backgroundColor: needsDarkText ? '#1e293b' : '#ffffff',
    border: `2px solid ${needsDarkText ? '#1e293b' : color}`,
    width: '16px',
    height: '16px',
    minWidth: '16px',
    minHeight: '16px',
    cursor: 'crosshair',
    transition: 'all 0.15s ease',
    opacity: 0.7,
  };

  return (
    <div
      className={clsx(
        'mindmap-node',
        selected && 'ring-2 ring-offset-1'
      )}
      style={nodeStyle}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={handleStyle}
        className="hover:opacity-100 hover:scale-125"
      />

      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
        }}
      >
        {label}
      </span>

      {/* Delete button appears on selected nodes (not for root) */}
      {selected && !isRoot && (
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            border: '2px solid #ffffff',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Delete node"
        >
          <X size={14} />
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={handleStyle}
        className="hover:opacity-100 hover:scale-125"
      />
    </div>
  );
};

export default memo(MindmapNode);
