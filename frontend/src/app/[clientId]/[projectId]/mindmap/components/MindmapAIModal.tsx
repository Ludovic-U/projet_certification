"use client";

import React, { useState } from 'react';
import { X, Brain } from 'lucide-react';
import { generateMindmapFromResponses, AIMindmapNode } from '@/api/mindmapApi';
import { Node, Edge } from '@xyflow/react';

interface MindmapAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onImport: (nodes: Node[], edges: Edge[]) => void;
}

export const MindmapAIModal: React.FC<MindmapAIModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onImport,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateMindmapFromResponses(projectId);
      console.log('Mindmap generated:', response);
      
      // Check if the response contains an error
      if (response && response.error) {
        setError(response.error);
        setResult(null);
      } else {
        setResult(response);
      }
    } catch (err: any) {
      console.error('Error generating mindmap:', err);
      setError(err.message || 'Error generating mindmap');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    // Parse the result if it's a string first
    let nodesData = result;
    if (typeof result === 'string') {
      try {
        nodesData = JSON.parse(result);
      } catch (e) {
        alert('Failed to parse mindmap data');
        return;
      }
    }

    if (!nodesData || !nodesData.nodes) {
      alert('No mindmap data to import');
      return;
    }

      const aiNodes: AIMindmapNode[] = nodesData.nodes || [];
      
      if (aiNodes.length === 0) {
        alert('No nodes found in the generated mindmap');
        return;
      }

      // Color mapping for node types
      const typeColors: Record<string, string> = {
        root: '#3b82f6',
        action: '#96776e',
        sous_action: '#698063',
        objectif: '#ffffff',
        livrable: '#22c55e',
      };

      // Create ReactFlow nodes with positions
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      const nodeMap: Record<string, string> = {}; // Maps old IDs to new IDs

      // First pass: create nodes
      let nodeIndex = 0;
      for (const aiNode of aiNodes) {
        const newId = aiNode.id || `node-${Date.now()}-${nodeIndex}`;
        nodeMap[aiNode.id] = newId;

        // Calculate position based on hierarchy
        let position = { x: 0, y: 0 };
        
        if (aiNode.id === 'root') {
          position = { x: 0, y: 0 };
        } else if (aiNode.parentId && nodeMap[aiNode.parentId]) {
          // Find parent node position
          const parentNode = nodes.find(n => n.id === nodeMap[aiNode.parentId!]);
          if (parentNode) {
            const siblingCount = aiNodes.filter(n => n.parentId === aiNode.parentId).length;
            const siblingIndex = aiNodes.filter(n => n.parentId === aiNode.parentId && 
              aiNodes.indexOf(n) < aiNodes.indexOf(aiNode)).length;
            position = {
              x: parentNode.position.x + 200,
              y: parentNode.position.y + (siblingIndex * 120) - ((siblingCount - 1) * 60),
            };
          }
        }

        nodes.push({
          id: newId,
          type: 'mindmapNode',
          position,
          data: {
            label: aiNode.label || 'Untitled',
            color: aiNode.color || typeColors[aiNode.nodeType] || '#3b82f6',
            fontSize: 14,
            nodeType: aiNode.nodeType || 'action',
            isRoot: aiNode.id === 'root',
          },
        });

        nodeIndex++;
      }

      // Second pass: create edges
      for (const aiNode of aiNodes) {
        if (aiNode.parentId && nodeMap[aiNode.parentId]) {
          edges.push({
            id: `edge-${nodeMap[aiNode.parentId]}-${nodeMap[aiNode.id]}`,
            source: nodeMap[aiNode.parentId],
            target: nodeMap[aiNode.id],
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: 'arrowclosed' as const },
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          });
        }
      }

      onImport(nodes, edges);
      handleClose();
      alert(`${nodes.length} nodes imported successfully!`);
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Générer une carte mentale avec IA
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-slate-700 rounded-lg p-6 mb-6">
            <p className="text-gray-300 mb-4">
              Cette fonctionnalité va analyser les réponses aux questions de votre projet 
              et générer automatiquement une carte mentale hiérarchique avec Mistral AI.
            </p>
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Ce qui sera généré :</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Un nœud racine représentant le projet</li>
                <li>• Des catégories basées sur les questions</li>
                <li>• Des sous-catégories basées sur les réponses</li>
                <li>• Une organisation hiérarchique automatique</li>
              </ul>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Résultat généré</h3>
              <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-48">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            {result && !loading && (
              <button
                type="button"
                onClick={handleImport}
                className="px-6 py-2 rounded-lg font-semibold text-white flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-colors"
              >
                📥 Importer dans la carte mentale
              </button>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-semibold text-white flex items-center gap-2
                ${loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'} 
                transition-colors`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Générer avec Mistral AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
