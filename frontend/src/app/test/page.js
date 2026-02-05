"use client";

import { useState } from "react";
import api_backend from "@/api/axiosInstance";

export default function GenerateGanttPage() {
  const [result, setResult] = useState("");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  // const [inputMode, setInputMode] = useState("both"); // 'text', 'file', or 'both'

  async function generateGanttviaMistral(e) {
    e.preventDefault();
    
    if (!text && !file) {
      alert("Veuillez entrer du texte et/ou sélectionner un fichier");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      if (text) {
        formData.append('text', text);
      }
      
      if (file) {
        formData.append('file', file);
      }
      
      const res = await api_backend.post('/mistral/generateGanttviaMistral', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log(res.data);
      setResult(res.data);
    } catch (error) {
      console.error(error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Test Mistral API</h1>
          <p className="text-gray-600 mb-8">Entrez du texte et/ou uploadez un fichier pour générer un diagramme de Gantt</p>
          
          {/* Text Input Section */}
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-gray-700 font-semibold mb-2 block">Entrez votre texte</span>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Entrez le texte à analyser..."
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-vertical min-h-32"
              />
            </label>
          </div>
          
          {/* File Upload Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
            <label className="block mb-4">
              <span className="text-gray-700 font-semibold mb-2 block">Sélectionnez un fichier</span>
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                  file:cursor-pointer cursor-pointer"
              />
            </label>
            {file && (
              <div className="mt-3 flex items-center text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Fichier sélectionné: {file.name}</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={generateGanttviaMistral}
            disabled={loading || (!text && !file)}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white text-lg
              ${loading || (!text && !file)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'} 
              transition-all duration-200 shadow-lg`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyse en cours...
              </span>
            ) : (
              '🚀 Analyser avec Mistral AI'
            )}
          </button>
        </div>
        
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Résultat</h2>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap wrap-break-words">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
