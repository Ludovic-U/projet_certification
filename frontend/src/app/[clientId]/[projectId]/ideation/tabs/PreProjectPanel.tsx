"use client";

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the MindmapPage to avoid SSR issues with ReactFlow
const MindmapPage = dynamic(
  () => import('@/app/[clientId]/[projectId]/mindmap/page'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading mindmap...</div> }
);

export default function PreProjectPanel() {
  const params = useParams();
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
    <div className="w-full" style={{ height: 'calc(100vh - 250px)' }}>
      <MindmapPage />
    </div>
  );
}
