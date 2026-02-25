"use client";

import { ReactFlowProvider } from '@xyflow/react';
import { MindmapInner } from './components/MindmapContent';

const MindmapPage = () => {
  return (
    <ReactFlowProvider>
      <MindmapInner />
    </ReactFlowProvider>
  );
};

export default MindmapPage;
