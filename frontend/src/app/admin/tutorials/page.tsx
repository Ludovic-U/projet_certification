'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader, Button, Modal, Input } from '@/components/ui';
import { FontAwesomeIcon, Icons } from '@/lib/icons';
import { useModal } from '@/hooks';
import api_backend from '@/api/axiosInstance';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

interface Tutorial {
  tutorialId: number;
  pageName: string;
  title: string;
  description?: string;
  content: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TutorialsAdminPage() {
  const { user } = useUser();
  const router = useRouter();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const createModal = useModal();
  const editModal = useModal();

  const [formData, setFormData] = useState({
    pageName: '',
    title: '',
    description: '',
    content: '',
    order: 0,
  });

  // Check authorization on mount
  useEffect(() => {
    if (user && !user.roles?.includes('super_admin')) {
      router.push('/');
    } else {
      setIsAuthorized(true);
    }
  }, [user, router]);

  // Fetch tutorials
  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const response = await api_backend.get('/tutorial/admin/all');
      setTutorials(response.data);
    } catch (err) {
      console.error('Error fetching tutorials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchTutorials();
    }
  }, [isAuthorized]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
    }));
  };

  // Handle create new tutorial
  const handleCreateTutorial = async () => {
    if (!formData.pageName || !formData.title || !formData.content) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      await api_backend.post('/tutorial/admin/create', formData);
      setFormData({ pageName: '', title: '', description: '', content: '', order: 0 });
      createModal.closeModal();
      fetchTutorials();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error creating tutorial');
    }
  };

  // Handle edit tutorial
  const handleOpenEdit = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      pageName: tutorial.pageName,
      title: tutorial.title,
      description: tutorial.description || '',
      content: tutorial.content,
      order: tutorial.order,
    });
    editModal.openModal();
  };

  // Handle update tutorial
  const handleUpdateTutorial = async () => {
    if (!editingTutorial) return;

    try {
      await api_backend.put(`/tutorial/admin/${editingTutorial.tutorialId}`, formData);
      editModal.closeModal();
      setEditingTutorial(null);
      setFormData({ pageName: '', title: '', description: '', content: '', order: 0 });
      fetchTutorials();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error updating tutorial');
    }
  };

  // Handle delete tutorial
  const handleDeleteTutorial = async (tutorialId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tutoriel ?')) return;

    try {
      await api_backend.delete(`/tutorial/admin/${tutorialId}`);
      fetchTutorials();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error deleting tutorial');
    }
  };

  if (!isAuthorized) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader
        title="Gestion des Tutoriels"
        description="Créez et gérez les tutoriels affichés aux utilisateurs"
      />

      <div className="flex justify-end">
        <Button variant="primary" onClick={createModal.openModal}>
          <FontAwesomeIcon icon={Icons.plus} />
          Nouveau tutoriel
        </Button>
      </div>

      {/* Tutorials List */}
      {loading ? (
        <div className="p-8 text-center">Chargement des tutoriels...</div>
      ) : tutorials.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Aucun tutoriel trouvé. Créez-en un nouveau !
        </div>
      ) : (
        <div className="grid gap-4">
          {tutorials.map((tutorial) => (
            <div key={tutorial.tutorialId} className="border rounded-lg p-6 bg-light shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-dark mb-1">{tutorial.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Page: <code className="bg-gray-100 px-2 py-1 rounded">{tutorial.pageName}</code>
                  </p>
                  {tutorial.description && (
                    <p className="text-gray-700 mb-2">{tutorial.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Ordre: {tutorial.order} | Status: {tutorial.isActive ? '✓ Actif' : '✗ Inactif'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenEdit(tutorial)}
                >
                  <FontAwesomeIcon icon={Icons.pen} />
                  Modifier
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeleteTutorial(tutorial.tutorialId)}
                >
                  <FontAwesomeIcon icon={Icons.trash} />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tutorial Modal */}
      <Modal
        modal={createModal}
        title="Créer un nouveau tutoriel"
        description="Remplissez les infos du tutoriel"
      >
        <div className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Page Name *</label>
            <Input
              type="text"
              name="pageName"
              placeholder="ex: ideation, gantt, mindmap"
              value={formData.pageName}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <Input
              type="text"
              name="title"
              placeholder="ex: Introduction à l'idéation"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              type="text"
              name="description"
              placeholder="Description courte"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contenu HTML *</label>
            <textarea
              name="content"
              placeholder="<h3>Étape 1</h3><p>Description...</p>"
              value={formData.content}
              onChange={handleInputChange}
              rows={6}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ordre</label>
            <Input
              type="number"
              name="order"
              placeholder="0"
              value={formData.order}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={createModal.closeModal}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleCreateTutorial}>
              Créer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Tutorial Modal */}
      <Modal
        modal={editModal}
        title="Modifier le tutoriel"
        description="Mettez à jour les infos du tutoriel"
      >
        <div className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Page Name</label>
            <Input
              type="text"
              name="pageName"
              placeholder="ex: ideation, gantt, mindmap"
              value={formData.pageName}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <Input
              type="text"
              name="title"
              placeholder="ex: Introduction à l'idéation"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              type="text"
              name="description"
              placeholder="Description courte"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contenu HTML</label>
            <textarea
              name="content"
              placeholder="<h3>Étape 1</h3><p>Description...</p>"
              value={formData.content}
              onChange={handleInputChange}
              rows={6}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ordre</label>
            <Input
              type="number"
              name="order"
              placeholder="0"
              value={formData.order}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={editModal.closeModal}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleUpdateTutorial}>
              Mettre à jour
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
