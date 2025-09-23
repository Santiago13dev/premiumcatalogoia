import React, { useState } from 'react';

const PromptBuilder = ({ onGenerate }) => {
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [style, setStyle] = useState('');
  const [constraints, setConstraints] = useState('');
  const [examples, setExamples] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const templates = {
    general: {
      name: 'General',
      template: 'Task: {task}\n\nContext: {context}\n\nStyle: {style}\n\nConstraints: {constraints}\n\nExamples: {examples}'
    },
    coding: {
      name: 'Coding',
      template: 'Write {style} code that {task}.\n\nRequirements:\n{constraints}\n\nContext:\n{context}\n\nExample usage:\n{examples}'
    },
    creative: {
      name: 'Creative Writing',
      template: 'Write a {style} about {task}.\n\nSetting/Context: {context}\n\nGuidelines: {constraints}\n\nTone/Style examples: {examples}'
    },
    analysis: {
      name: 'Analysis',
      template: 'Analyze {task}\n\nBackground information: {context}\n\nFocus on: {constraints}\n\nAnalysis style: {style}\n\nSimilar analyses: {examples}'
    },
    translation: {
      name: 'Translation',
      template: 'Translate the following {task} from {context} to {style}.\n\nMaintain: {constraints}\n\nReference translations: {examples}'
    }
  };

  const [selectedTemplate, setSelectedTemplate] = useState('general');

  const generatePrompt = () => {
    const template = templates[selectedTemplate].template;
    const prompt = template
      .replace('{task}', task || '[task]')
      .replace('{context}', context || '[context]')
      .replace('{style}', style || '[style]')
      .replace('{constraints}', constraints || '[constraints]')
      .replace('{examples}', examples || '[examples]');
    
    setGeneratedPrompt(prompt);
    if (onGenerate) {
      onGenerate(prompt);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Prompt Builder</h3>
      
      {/* Template Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Template</label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          {Object.entries(templates).map(([key, template]) => (
            <option key={key} value={key}>{template.name}</option>
          ))}
        </select>
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Task/Objetivo</label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="¿Qué quieres lograr?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contexto</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-20"
            placeholder="Información de fondo o contexto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estilo/Formato</label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            placeholder="Estilo o formato deseado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Restricciones</label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-20"
            placeholder="Limitaciones o requisitos específicos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ejemplos</label>
          <textarea
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-20"
            placeholder="Ejemplos de referencia"
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePrompt}
        className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Generar Prompt
      </button>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Prompt Generado</label>
            <button
              onClick={copyToClipboard}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Copiar
            </button>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-pre-wrap">
            {generatedPrompt}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptBuilder;