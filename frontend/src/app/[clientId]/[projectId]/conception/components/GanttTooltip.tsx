import React from 'react';
import { Task } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getAssignees } from '../utils/taskUtils';

interface GanttTooltipProps {
  hoveredTask: Task | null;
  tooltipPos: { x: number; y: number };
  tasks: Task[];
  data: {
    users: { id: number; label: string }[];
  };
}

export const GanttTooltip: React.FC<GanttTooltipProps> = ({
  hoveredTask,
  tooltipPos,
  tasks,
  data,
}) => {
  if (!hoveredTask) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: tooltipPos.x + 15,
        top: tooltipPos.y + 15
      }}
    >
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-2xl max-w-xs">
        <div className="mb-2">
          <span className="font-semibold text-blue-400">Type:</span>
          <span className="ml-2 text-white">{hoveredTask.type}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-blue-400">Details:</span>
          <span className="ml-2 text-slate-300">{hoveredTask.details}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-blue-400">Assigned to:</span>
          <span className="ml-2 text-slate-300">{getAssignees(hoveredTask, data.users) || 'N/A'}</span>
        </div>
        <div className="mb-2">
          <span className="font-semibold text-blue-400">Start:</span>
          <span className="ml-2 text-slate-300">{formatDate(tasks.find(t => t.id === hoveredTask.id)?.start || hoveredTask.start)}</span>
        </div>
        {hoveredTask.end && hoveredTask.type !== 'milestone' && (
          <div>
            <span className="font-semibold text-blue-400">End:</span>
            <span className="ml-2 text-slate-300">{formatDate(tasks.find(t => t.id === hoveredTask.id)?.end || hoveredTask.end)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
