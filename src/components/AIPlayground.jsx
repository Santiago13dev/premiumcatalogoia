import React, { useState } from 'react';
import aiService from '../services/aiService';
import LoadingSpinner from './LoadingSpinner';

const AIPlayground = () => {
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonResults, setComparisonResults] = useState([]);

  const models = {
    openai: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-vision-preview'],
    anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    huggingface: ['gpt2', 'bert-base-uncased', 'roberta-base'],
    cohere: ['command', 'command-light']
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      if (compareMode) {
        const results = await aiService.compareModels(
          prompt,
          ['openai', 'anthropic', 'huggingface']
        );
        setComparisonResults(results);
      } else {
        const result = await aiService.testPrompt(prompt, provider, model);
        setResponse(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          AI Playground
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Escribe tu prompt aquí..."
              required
            />
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Comparar modelos</span>
            </label>
          </div>

          {/* Provider and Model Selection */}
          {!compareMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Proveedor
                </label>
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    setModel('');
                  }}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="huggingface">Hugging Face</option>
                  <option value="cohere">Cohere</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Modelo
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Default</option>
                  {models[provider].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !prompt}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Ejecutar'}
          </button>
        </form>

        {/* Results */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {response && !compareMode && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Respuesta:</h3>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}

        {comparisonResults.length > 0 && compareMode && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Comparación de modelos:</h3>
            {comparisonResults.map((result, index) => (
              <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-indigo-600 dark:text-indigo-400">
                  {result.provider}
                </h4>
                {result.error ? (
                  <p className="text-red-500">Error: {result.error}</p>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">
                    {result.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPlayground;