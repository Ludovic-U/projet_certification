'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import api_backend from '../../../api/axiosInstance';
import { Input } from '@/components/ui/Input';
import {Button} from '@/components/ui/Button/Button';

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
}

export default function AdminConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { control, handleSubmit, reset } = useForm<AppConfig>();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api_backend.get('/config');
        reset(response.data);
      } catch (error) {
        setMessage({ type: 'error', text: 'Erreur lors du chargement de la configuration' });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [reset]);

  const onSubmit = async (data: AppConfig) => {
    setSaving(true);
    setMessage(null);
    
    try {
      await api_backend.put('/config', data);
      setMessage({ type: 'success', text: 'Configuration mise à jour avec succès' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de la mise à jour';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement de la configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
