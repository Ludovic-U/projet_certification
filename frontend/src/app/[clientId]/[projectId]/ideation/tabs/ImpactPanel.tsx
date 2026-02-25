"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button, LoadingSpinner } from "@/components/ui";
import api_backend from "@/api/axiosInstance";

// Column headers
const COLUMN_HEADERS = [
  "Résultats Attendus",
  "Critères",
  "Indicateurs",
  "Situation de Départ",
  "Objectif"
];

// Impact row interface
interface ImpactRow {
  id: number;
  impactId?: number;
  resultatsAttendus: string;
  criteres: string;
  indicateurs: string;
  situationDepart: string;
  objectif: string;
  isNew?: boolean;
}

export default function ImpactPanel() {
  const params = useParams();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const clientId = Array.isArray(params.clientId)
    ? params.clientId[0]
    : params.clientId;

  const [rows, setRows] = useState<ImpactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const rowsRef = useRef<ImpactRow[]>([]);
  const saveTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    if (!projectId) return;

    const fetchImpactData = async () => {
      try {
        const response = await api_backend.get(`/project/${projectId}/impact`);
        const impactData = response.data;
        
        if (impactData && Array.isArray(impactData) && impactData.length > 0) {
          const mappedRows = impactData.map((row: any, index: number) => ({
            id: index + 1,
            impactId: row.impactId,
            resultatsAttendus: row.resultatsAttendus || "",
            criteres: row.criteres || "",
            indicateurs: row.indicateurs || "",
            situationDepart: row.situationDepart || "",
            objectif: row.objectif || "",
            isNew: false
          }));
          setRows(mappedRows);
        } else {
          setRows([createEmptyRow(1)]);
        }
      } catch (error) {
        console.error("Error fetching impact data:", error);
        setRows([createEmptyRow(1)]);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, [projectId]);

  const createEmptyRow = (id: number): ImpactRow => ({
    id,
    impactId: undefined,
    resultatsAttendus: "",
    criteres: "",
    indicateurs: "",
    situationDepart: "",
    objectif: "",
    isNew: true
  });

  const handleAddRow = useCallback(() => {
    setRows(prev => {
      const maxId = prev.length > 0 ? Math.max(...prev.map(r => r.id)) : 0;
      return [...prev, createEmptyRow(maxId + 1)];
    });
  }, []);

  const handleRemoveRow = useCallback(async (id: number) => {
    const rowToRemove = rowsRef.current.find(r => r.id === id);
    if (!rowToRemove) return;

    if (rowToRemove.isNew || !rowToRemove.impactId) {
      setRows(prev => prev.filter(row => row.id !== id));
      return;
    }

    try {
      await api_backend.delete(`/project/${projectId}/impact/${rowToRemove.impactId}`);
      setRows(prev => prev.filter(row => row.id !== id));
    } catch (error) {
      console.error("Error removing row:", error);
      setRows(prev => prev.filter(row => row.id !== id));
    }
  }, [projectId]);

  const saveRow = useCallback(async (row: ImpactRow) => {
    if (!projectId) return;
    
    if (row.isNew && !row.resultatsAttendus && !row.criteres && !row.indicateurs && !row.situationDepart && !row.objectif) {
      return;
    }

    try {
      const response = await api_backend.post(`/project/${projectId}/impact`, {
        id: row.impactId,
        rowOrder: row.id,
        resultatsAttendus: row.resultatsAttendus,
        criteres: row.criteres,
        indicateurs: row.indicateurs,
        situationDepart: row.situationDepart,
        objectif: row.objectif,
      });
      
      const savedRow = response.data;
      setRows(prev => prev.map(r => 
        r.id === row.id 
          ? { ...r, impactId: savedRow.impactId, isNew: false }
          : r
      ));
    } catch (error) {
      console.error("Error saving impact data:", error);
    }
  }, [projectId]);

  const handleFieldChange = useCallback((id: number, field: keyof ImpactRow, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));

    const existingTimeout = saveTimeouts.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      const rowToSave = rowsRef.current.find(r => r.id === id);
      if (rowToSave) {
        saveRow(rowToSave);
      }
      saveTimeouts.current.delete(id);
    }, 500);

    saveTimeouts.current.set(id, timeout);
  }, [saveRow]);

  useEffect(() => {
    return () => {
      saveTimeouts.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      rowsRef.current.forEach(row => {
        if (row.isNew || row.impactId) {
          saveRow(row);
        }
      });
    };
  }, [saveRow]);

  if (!projectId || !clientId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="flex flex-1 min-h-0 overflow-y-auto">
      <div className="flex flex-col w-full gap-6 p-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-dark mb-2">Tableau d'Impact</h2>
          <p className="text-sm text-dark/60">
            Définissez les impacts attendus de votre projet. Ajoutez autant de lignes que nécessaire.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark text-white">
                  {COLUMN_HEADERS.map((header, index) => (
                    <th 
                      key={index} 
                      className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide border-r border-white/20"
                      style={{ width: index === COLUMN_HEADERS.length - 1 ? '100px' : '20%' }}
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr 
                    key={row.id} 
                    className={`border-b border-dark/10 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-dark/5'}`}
                  >
                    <td className="p-2 border-r border-dark/10">
                      <textarea
                        className="w-full px-3 py-2 border border-dark/20 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-dark/20 min-h-[80px]"
                        placeholder="Décrivez les résultats attendus..."
                        value={row.resultatsAttendus}
                        onChange={(e) => handleFieldChange(row.id, 'resultatsAttendus', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r border-dark/10">
                      <textarea
                        className="w-full px-3 py-2 border border-dark/20 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-dark/20 min-h-[80px]"
                        placeholder="Définissez les critères..."
                        value={row.criteres}
                        onChange={(e) => handleFieldChange(row.id, 'criteres', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r border-dark/10">
                      <textarea
                        className="w-full px-3 py-2 border border-dark/20 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-dark/20 min-h-[80px]"
                        placeholder="Listez les indicateurs..."
                        value={row.indicateurs}
                        onChange={(e) => handleFieldChange(row.id, 'indicateurs', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r border-dark/10">
                      <textarea
                        className="w-full px-3 py-2 border border-dark/20 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-dark/20 min-h-[80px]"
                        placeholder="Décrivez la situation de départ..."
                        value={row.situationDepart}
                        onChange={(e) => handleFieldChange(row.id, 'situationDepart', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r border-dark/10">
                      <textarea
                        className="w-full px-3 py-2 border border-dark/20 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-dark/20 min-h-[80px]"
                        placeholder="Définissez l'objectif..."
                        value={row.objectif}
                        onChange={(e) => handleFieldChange(row.id, 'objectif', e.target.value)}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        variant="primaryBorder"
                        className="text-red-600 border-red-600 hover:bg-red-50 px-2 py-1 text-xs"
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={rows.length <= 1}
                        title="Supprimer la ligne"
                      >
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={handleAddRow}
          >
            <span>+</span>
            Ajouter une ligne
          </Button>
        </div>

        <div className="bg-dark/5 rounded-xl p-4">
          <p className="text-sm text-dark/70 text-center">
            Remplissez chaque colonne pour définir l'impact de votre projet. 
            Cliquez sur "Ajouter une ligne" pour ajouter de nouveaux impacts.
          </p>
        </div>
      </div>
    </section>
  );
}
