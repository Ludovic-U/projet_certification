"use client";
import React from "react";
import { Button } from "@/components/ui/button";

const ProjectPage = () => {
  return (
    <div className="w-full h-screen bg-gray-100">      
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
