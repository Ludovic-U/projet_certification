"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { CreateUserButton } from "@/components/ui/createUser";
import { ArrowLeft } from "lucide-react";

const HRPage = () => {
  return (
    <div className="w-full h-screen bg-gray-100">
      
      {/* Team Sections */}
      <div className="p-4">
        {/* Governing Team */}
        <div className="border-b pb-4">
          <h2 className="font-semibold text-center">Équipe gouvernante</h2>
          <div className="flex space-x-4 items-center mt-4">
            <div className="p-4 bg-gray-300 rounded-lg flex flex-col items-center w-32">
              <div className="w-16 h-16 bg-white rounded-full"></div>
              <span className="mt-2 text-sm">Dominique Lambda</span>
              <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">Administrateur</span>
            </div>
            <CreateUserButton className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md" >
              Ajouter
            </CreateUserButton>
          </div>
        </div>

        {/* Collaborators */}
        <div className="mt-4 bg-yellow-100 p-4 rounded-lg">
          <h2 className="font-semibold text-center">Collaborateurs</h2>
          <div className="mt-4">
            <CreateUserButton className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md">
              Ajouter
            </CreateUserButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRPage;