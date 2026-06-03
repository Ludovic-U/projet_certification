import { useState, useEffect } from 'react';
import { Tutorial } from '@/components/Tutorial/TutorialOverlay';

export const useTutorial = (pageName: string) => {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tutorial on mount
  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tutorial/page/${pageName}`);

        if (response.status === 404) {
          setTutorial(null);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch tutorial');
        }

        const data = await response.json();
        setTutorial(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching tutorial:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorial();
  }, [pageName]);

  // Mark tutorial as viewed
  const markAsViewed = async () => {
    if (!tutorial) return;

    try {
      const response = await fetch('/api/tutorial/mark-viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tutorialId: tutorial.tutorialId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark tutorial as viewed');
      }
    } catch (err) {
      console.error('Error marking tutorial as viewed:', err);
    }
  };

  return {
    tutorial,
    loading,
    error,
    markAsViewed,
  };
};

export default useTutorial;
