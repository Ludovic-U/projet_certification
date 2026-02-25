"use client";

/**
 * Conception Page with Tabs
 * This page provides access to Pre-projet, Decision, Impact, and Gantt chart
 */

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui';
import { useGanttState } from './hooks/useGanttState';
import { useGanttHandlers } from './hooks/useGanttHandlers';
import { useGanttExportImport } from './hooks/useGanttExportImport';
import { GanttToolbar } from './components/GanttToolbar';
import { GanttTaskList } from './components/GanttTaskList';
import { GanttTimeline } from './components/GanttTimeline';
import { GanttTaskEditor } from './components/GanttTaskEditor';
import { GanttTaskSummary } from './components/GanttTaskSummary';
import { GanttTooltip } from './components/GanttTooltip';
import { GanttContextMenu } from './components/GanttContextMenu';
import { GanttTutorial } from './components/GanttTutorial';
import { BudgetOverview } from './components/BudgetOverview';
import { generateColumns, getBaseStart } from './utils/timelineUtils';
import { startOfDay } from './utils/dateUtils';
import { DAY_MS } from './constants';
import { toUTC } from './utils/dateUtils';
import { MIN_PX_PER_DAY, MAX_PX_PER_DAY } from './constants';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { useParams } from 'next/navigation';
import { useLocalStorage } from '@/context/LocalStorageContext';
import dynamic from 'next/dynamic';

// Dynamic imports for panels to avoid SSR issues
const PreProjectPanel = dynamic(
  () => import('./tabs/PreProjectPanel'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div> }
);

const DecisionPanel = dynamic(
  () => import('./tabs/DecisionPanel'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div> }
);

const ImpactPanel = dynamic(
  () => import('./tabs/ImpactPanel'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div> }
);

// Import the Gantt chart component
import GanttChartComponent from './GanttChartComponent';

type TabKey = 'preprojet' | 'decision' | 'impact' | 'gantt';

export default function ConceptionPage() {
  const { data } = useLocalStorage();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('gantt');
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const clientId = Array.isArray(params.clientId)
    ? params.clientId[0]
    : params.clientId;

  if (!projectId || !clientId) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="relative overflow-hidden flex items-center justify-between gap-4 rounded-xl mb-6">
        <div className="relative z-10 flex-1">
          <PageHeader
            title={"Projet " + (data?.projectName ?? "") + " - CONCEPTION"}
            description="Planification et gestion du projet"
          />
        </div>
      </div>
      <section className="w-full mb-6">
        <div className="grid w-full grid-cols-4 overflow-hidden rounded-xl border border-dark/10 bg-white">
          <button
            type="button"
            className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === 'preprojet'
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => setActiveTab('preprojet')}
          >
            Pre-projet
          </button>
          <button
            type="button"
            className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === 'decision'
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => setActiveTab('decision')}
          >
            Decision
          </button>
          <button
            type="button"
            className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === 'impact'
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => setActiveTab('impact')}
          >
            Impact
          </button>
          <button
            type="button"
            className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wide ${
              activeTab === 'gantt'
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => setActiveTab('gantt')}
          >
            Gantt
          </button>
        </div>
      </section>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preprojet' && <PreProjectPanel />}
        {activeTab === 'decision' && <DecisionPanel />}
        {activeTab === 'impact' && <ImpactPanel />}
        {activeTab === 'gantt' && <GanttChartComponent />}
      </div>
    </div>
  );
}
