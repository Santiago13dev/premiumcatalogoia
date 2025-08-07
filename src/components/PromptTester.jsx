// src/components/PromptTester.jsx
import { useState } from 'react';
import axios from 'axios';

export default function PromptTester({ promptTemplate }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/try-prompt', {
        prompt: promptTemplate,
        input,
      });
      setResponse(res.data.output);
    } catch (err) {
      setResponse('❌ Error al procesar el prompt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="text-lg font-semibold mb-2">🧪 Probar este prompt:</h3>
      <input
        type="text"
        placeholder="Ingresa un texto de entrada"
        className="border px-2 py-1 w-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleTest}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? 'Procesando...' : 'Probar Prompt'}
      </button>
      {response && (
        <div className="mt-4 bg-gray-100 p-3 whitespace-pre-wrap rounded">
          <strong>Respuesta:</strong>
          <div>{response}</div>
        </div>
      )}
    </div>
  );
}
