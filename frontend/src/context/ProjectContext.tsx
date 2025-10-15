"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Project = {
    id: string;
    name: string;
    description?: string;
    // Ajoutez d'autres propriétés selon vos besoins
};

type ProjectContextType = {
    project: Project | null;
    setProject: (project: Project) => void;
    clearProject: () => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject doit être utilisé dans un ProjectProvider');
    }
    return context;
};

type ProjectProviderProps = {
    children: ReactNode;
};

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
    const [project, setProjectState] = useState<Project | null>(null);

    const setProject = (proj: Project) => setProjectState(proj);
    const clearProject = () => setProjectState(null);

    return (
        <ProjectContext.Provider value={{ project, setProject, clearProject }}>
            {children}
        </ProjectContext.Provider>
    );
};