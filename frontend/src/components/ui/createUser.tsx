import React from 'react';
import { Button } from '@/components/ui/button'; 

const CreateUserButton = () => {
  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
       
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la création de l\'utilisateur :', errorData);
        
      }
    } catch (error) {
      console.error('Erreur lors de la requête :', error);
     
    }
  };

  return (
    <Button onClick={handleCreateUser}>Ajouter un utilisateur</Button>
  );
};

export {CreateUserButton};