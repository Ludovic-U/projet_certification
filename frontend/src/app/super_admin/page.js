"use client";
import React from "react";
import { Button } from "@/components/ui/button-old";

const AdminPage = () => {
  return (
    <div className="w-full h-screen bg-gray-100">
      
      {/* Company Selection */}
      <div className="p-4 flex space-x-4">
        <Button className="bg-purple-400 text-white flex-1 py-3 text-lg font-semibold"
        >
          Lambda-SARL
        </Button>
        <Button className="bg-gray-300 text-gray-600 flex-1 py-3" disabled>
          Modifier Paramètres
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="p-8 flex flex-col items-center">
        <Button className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md">
          Nouveau client
        </Button>
        <div className="w-full mt-8">
         
        </div>
      </div>
    </div>
  );
};

export default AdminPage;