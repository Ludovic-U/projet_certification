import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, ArrowLeft } from "lucide-react";

const ProjectPage = () => {
  return (
    <div className="w-full h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-200 p-4 shadow-md">
        <div className="flex items-center">
          <Button variant="ghost" className="text-xl">
            <ArrowLeft className="text-purple-600" size={24} />
          </Button>
          <span className="text-lg font-semibold">LAMBDA-SARL</span>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Bell size={18} />
          </Button>
          <Button variant="outline" className="bg-purple-400 text-white">Ressources Humaines</Button>
          <Button variant="outline" className="bg-purple-400 text-white">Finances</Button>
          <Button variant="destructive">Se déconnecter</Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-8 flex flex-col items-center">
        <Button className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md">
          Nouveau Projet
        </Button>
        <div className="w-full mt-8">
          {/* Table Placeholder */}
          <div className="border rounded-lg overflow-hidden">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`p-4 ${index % 2 === 0 ? "bg-green-100" : "bg-white"}`}
              >
                Ligne {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
