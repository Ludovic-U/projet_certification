'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import api_backend from '../../../api/axiosInstance';
import { Input } from '@/components/ui/Input';
import {Button} from '@/components/ui/Button/Button';
import helpDictionaryInitial from '@/config/help-dictionary.json';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

interface AppConfig {
  subtitles: {
    projectList: string;
    overview: string;
    ideation: string;
    conception: string;
    pilotage: string;
    evaluation: string;
    reporting: string;
  };
  labels: {
    todoList: string;
    actionList: string;
  };
  types: {
    secteur_clients: string[];
    juridiques_clients: string[];
  };
}

interface HelpDictionary {
  projectList: string;
  overview: string;
  ideation: string;
  conception: string;
  pilotage: string;
  evaluation: string;
  reporting: string;
  gantt: string;
  budget: string;
  questions: string;
  mindmap: string;
}

interface ProjectType {
  typeId: number;
  label: string;
}

interface QuestionCategory {
  questionCategoryId: number;
  label: string;
}

export default function AdminConfigPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [secteurClients, setSecteurClients] = useState<string[]>([]);
  const [projets, setProjets] = useState<ProjectType[]>([]);
  const [juridiquesClients, setJuridiquesClients] = useState<string[]>([]);
  const [questionCategories, setQuestionCategories] = useState<QuestionCategory[]>([]);
  const [helpDict, setHelpDict] = useState<HelpDictionary>(helpDictionaryInitial);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const { control, handleSubmit, reset, formState } = useForm<AppConfig>();

  // Check authorization on mount
  useEffect(() => {
    if (user && !user.roles?.includes("super_admin")) {
      router.push("/");
    } else if (user) {
      setIsAuthorized(true);
      setCheckingAuth(false);
    }
  }, [user]);

  useEffect(() => {
    // Don't fetch if not authorized
    if (!isAuthorized) return;
    
    const fetchConfig = async () => {
      try {
        const [configResponse, typesResponse, categoriesResponse] = await Promise.all([
          api_backend.get('/config'),
          api_backend.get('/type/get'),
          api_backend.get('/question/categories')
        ]);
        
        reset(configResponse.data);
        setSecteurClients(configResponse.data.types?.secteur_clients || []);
        setJuridiquesClients(configResponse.data.types?.juridiques_clients || []);
        setProjets(typesResponse.data || []);
        setQuestionCategories(categoriesResponse.data || []);
        
        // Charger les headers depuis le backend
        if (configResponse.data.headers) {
          setHelpDict(configResponse.data.headers);
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors du chargement de la configuration' });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [reset]);

  useEffect(() => {
    setHasUnsavedChanges(formState.isDirty);
  }, [formState.isDirty]);

  const onSubmit = async (data: AppConfig) => {
    setSaving(true);
    setMessage(null);
    
    try {
      const configData = {
        ...data,
        types: {
          secteur_clients: secteurClients,
          juridiques_clients: juridiquesClients,
        },
      };
      await api_backend.put('/config', configData);
      setMessage({ type: 'success', text: 'Configuration mise à jour avec succès' });
      setHasUnsavedChanges(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de la mise à jour';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const addItem = (list: string[], setList: (list: string[]) => void, item: string) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      setHasUnsavedChanges(true);
    }
  };

  const removeItem = (list: string[], setList: (list: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const addProjetType = async (label: string) => {
    if (!label.trim()) return;
    
    try {
      const response = await api_backend.post('/type/create', { label: label.trim() });
      setProjets([...projets, response.data]);
      setMessage({ type: 'success', text: 'Type de projet ajouté avec succès' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'ajout du type';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const removeProjetType = async (typeId: number) => {
    try {
      await api_backend.delete(`/type/delete/${typeId}`);
      setProjets(projets.filter(p => p.typeId !== typeId));
      setMessage({ type: 'success', text: 'Type de projet supprimé avec succès' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la suppression du type';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const addQuestionCategory = async (label: string) => {
    if (!label.trim()) return;
    
    try {
      const response = await api_backend.post('/question/categories', { label: label.trim() });
      setQuestionCategories([...questionCategories, response.data]);
      setMessage({ type: 'success', text: 'Catégorie de question ajoutée avec succès' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'ajout de la catégorie';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  const removeQuestionCategory = async (categoryId: number) => {
    try {
      await api_backend.delete(`/question/categories/${categoryId}`);
      setQuestionCategories(questionCategories.filter(c => c.questionCategoryId !== categoryId));
      setMessage({ type: 'success', text: 'Catégorie de question supprimée avec succès' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la suppression de la catégorie';
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  if (loading || checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Vérification des droits...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {hasUnsavedChanges && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-100 text-orange-700 px-6 py-3 rounded-full shadow-lg border border-orange-300 font-medium flex items-center gap-4">
          <span>● N'oubliez pas d'enregistrer les modifications !</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-orange-800 hover:text-orange-900 underline text-sm font-semibold cursor-pointer"
          >
            Annuler les modifications
          </button>
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-6">Configuration de l'Application</h1>
      
      {message && (
        <div
          className={`mb-6 p-4 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Subtitles Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Sous-titres</h2>
          <div className="space-y-4">
            <Controller
              name="subtitles.projectList"
              control={control}
              rules={{ required: 'Ce champ est requis' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Liste des projets"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="subtitles.overview"
              control={control}
              rules={{ required: 'Ce champ est requis' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Vue d'ensemble"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="subtitles.ideation"
              control={control}
              rules={{ required: 'Ce champ est requis' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Idéation"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="subtitles.conception"
              control={control}
              rules={{ required: 'Ce champ est requis' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Conception"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="subtitles.pilotage"
              control={control}
              rules={{ required: 'Ce champ est requis' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Pilotage"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="subtitles.evaluation"
              control={control}
              rules={{ required: 'Ce champ est requis' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Évaluation"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="subtitles.reporting"
              control={control}
              rules={{ required: 'Ce champ est requis' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Reporting"
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Labels Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Labels</h2>
          <div className="space-y-4">
            <Controller
              name="labels.todoList"
              control={control}
              rules={{ required: 'Ce champ est requis' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Liste des tâches"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="labels.actionList"
              control={control}
              rules={{ required: 'Ce champ est requis' }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Liste des actions"
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Textes d'Aide Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Dictionnaire d'Aide</h2>
          <p className="text-gray-600 mb-6">
            Définissez les textes d'aide pour chaque élément de l'application. Ces textes seront affichés dans une fenêtre d'aide.
          </p>
          
          <div className="grid gap-6">
            {/* Glossary-style entries */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">projectList</span>
                <span className="text-gray-500 text-sm">Liste des projets</span>
              </div>
              <textarea
                value={helpDict.projectList}
                onChange={(e) => setHelpDict({ ...helpDict, projectList: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">overview</span>
                <span className="text-gray-500 text-sm">Vue d'ensemble</span>
              </div>
              <textarea
                value={helpDict.overview}
                onChange={(e) => setHelpDict({ ...helpDict, overview: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">ideation</span>
                <span className="text-gray-500 text-sm">Idéation</span>
              </div>
              <textarea
                value={helpDict.ideation}
                onChange={(e) => setHelpDict({ ...helpDict, ideation: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">conception</span>
                <span className="text-gray-500 text-sm">Conception</span>
              </div>
              <textarea
                value={helpDict.conception}
                onChange={(e) => setHelpDict({ ...helpDict, conception: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">pilotage</span>
                <span className="text-gray-500 text-sm">Pilotage</span>
              </div>
              <textarea
                value={helpDict.pilotage}
                onChange={(e) => setHelpDict({ ...helpDict, pilotage: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">evaluation</span>
                <span className="text-gray-500 text-sm">Évaluation</span>
              </div>
              <textarea
                value={helpDict.evaluation}
                onChange={(e) => setHelpDict({ ...helpDict, evaluation: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">reporting</span>
                <span className="text-gray-500 text-sm">Reporting</span>
              </div>
              <textarea
                value={helpDict.reporting}
                onChange={(e) => setHelpDict({ ...helpDict, reporting: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">gantt</span>
                <span className="text-gray-500 text-sm">Diagramme de Gantt</span>
              </div>
              <textarea
                value={helpDict.gantt}
                onChange={(e) => setHelpDict({ ...helpDict, gantt: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">budget</span>
                <span className="text-gray-500 text-sm">Budget</span>
              </div>
              <textarea
                value={helpDict.budget}
                onChange={(e) => setHelpDict({ ...helpDict, budget: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">questions</span>
                <span className="text-gray-500 text-sm">Questions</span>
              </div>
              <textarea
                value={helpDict.questions}
                onChange={(e) => setHelpDict({ ...helpDict, questions: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-3">
                <span className="font-semibold text-gray-700 w-32">mindmap</span>
                <span className="text-gray-500 text-sm">Mindmap</span>
              </div>
              <textarea
                value={helpDict.mindmap}
                onChange={(e) => setHelpDict({ ...helpDict, mindmap: e.target.value })}
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[80px] font-mono text-sm"
                placeholder="Entrez la définition..."
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              onClick={async () => {
                setSaving(true);
                try {
                  await api_backend.post('/config/help-dictionary', helpDict);
                  setMessage({ type: 'success', text: 'Dictionnaire d\'aide enregistré avec succès' });
                } catch (err: unknown) {
                  const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement';
                  setMessage({ type: 'error', text: errorMsg });
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer le dictionnaire'}
            </Button>
          </div>
        </div>

        {/* Types Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Types</h2>
          
          {/* Secteur Clients */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Secteur Clients</h3>
            <div className="flex gap-2 mb-2">
              <Input
                id="new-secteur"
                placeholder="Ajouter un secteur"
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addItem(secteurClients, setSecteurClients, input.value);
                    input.value = '';
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  const input = document.getElementById('new-secteur') as HTMLInputElement;
                  addItem(secteurClients, setSecteurClients, input.value);
                  input.value = '';
                }}
              >
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {secteurClients.map((item, index) => (
                <div key={index} className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(secteurClients, setSecteurClients, index)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Juridiques Clients */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Forme Juridique</h3>
            <div className="flex gap-2 mb-2">
              <Input
                id="new-juridique"
                placeholder="Ajouter une forme juridique"
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addItem(juridiquesClients, setJuridiquesClients, input.value);
                    input.value = '';
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  const input = document.getElementById('new-juridique') as HTMLInputElement;
                  addItem(juridiquesClients, setJuridiquesClients, input.value);
                  input.value = '';
                }}
              >
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {juridiquesClients.map((item, index) => (
                <div key={index} className="bg-purple-100 px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(juridiquesClients, setJuridiquesClients, index)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Projets */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Types de Projets</h3>
            <div className="flex gap-2 mb-2">
              <Input
                id="new-projet"
                placeholder="Ajouter un type de projet"
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addProjetType(input.value);
                    input.value = '';
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  const input = document.getElementById('new-projet') as HTMLInputElement;
                  addProjetType(input.value);
                  input.value = '';
                }}
              >
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {projets.map((projet) => (
                <div key={projet.typeId} className="bg-green-100 px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{projet.label}</span>
                  <button
                    type="button"
                    onClick={() => removeProjetType(projet.typeId)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Catégories de Questions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Catégories de Questions</h3>
            <div className="flex gap-2 mb-2">
              <Input
                id="new-category"
                placeholder="Ajouter une catégorie de question"
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addQuestionCategory(input.value);
                    input.value = '';
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  const input = document.getElementById('new-category') as HTMLInputElement;
                  addQuestionCategory(input.value);
                  input.value = '';
                }}
              >
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {questionCategories.map((category) => {
                const isProtected = category.label.trim().toLowerCase() === "analyse opportunité";

                return (
                  <div
                    key={category.questionCategoryId}
                    className="bg-orange-100 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span>{category.label}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestionCategory(category.questionCategoryId)}
                      className={
                        isProtected
                          ? "text-red-300 font-bold cursor-not-allowed"
                          : "text-red-500 hover:text-red-700 font-bold"
                      }
                      disabled={isProtected}
                      title={isProtected ? "Cette catégorie est protégée" : "Supprimer"}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          
        </div>

        <div className="flex justify-end gap-3">
          {hasUnsavedChanges && (
            <Button
              type="button"
              onClick={() => window.location.reload()}
              disabled={saving}
              variant="secondaryBorder"
            >
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
