import React, { useState, useRef, useEffect } from 'react';
import mlService from '../services/mlService';
import LoadingSpinner from './LoadingSpinner';
import { Upload, Camera, Mic, Brain, Search, BarChart3 } from 'lucide-react';

const MLDashboard = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Text similarity state
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  
  // Semantic search state
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState(['']);
  
  // Image state
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    mlService.initialize();
  }, []);

  // Text Similarity Analysis
  const handleTextSimilarity = async () => {
    setLoading(true);
    setError(null);
    try {
      const similarity = await mlService.getTextSimilarity(text1, text2);
      setResults({
        type: 'similarity',
        value: similarity,
        percentage: (similarity * 100).toFixed(2)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Semantic Search
  const handleSemanticSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await mlService.semanticSearch(
        searchQuery,
        documents.filter(doc => doc.trim())
      );
      setResults({
        type: 'search',
        results: searchResults
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Image Classification
  const handleImageClassification = async () => {
    setLoading(true);
    setError(null);
    try {
      if (imageRef.current) {
        const predictions = await mlService.classifyImage(imageRef.current);
        setResults({
          type: 'classification',
          predictions
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Object Detection
  const handleObjectDetection = async () => {
    setLoading(true);
    setError(null);
    try {
      if (imageRef.current) {
        const objects = await mlService.detectObjects(imageRef.current);
        setResults({
          type: 'objects',
          objects
        });
        drawBoundingBoxes(objects);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Draw bounding boxes on canvas
  const drawBoundingBoxes = (predictions) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    predictions.forEach(prediction => {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        prediction.bbox[0],
        prediction.bbox[1],
        prediction.bbox[2],
        prediction.bbox[3]
      );
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`,
        prediction.bbox[0],
        prediction.bbox[1] - 5
      );
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setImageFile(file);
    }
  };

  // Add document for semantic search
  const addDocument = () => {
    setDocuments([...documents, '']);
  };

  const updateDocument = (index, value) => {
    const updated = [...documents];
    updated[index] = value;
    setDocuments(updated);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Machine Learning Dashboard
        </h2>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('text')}
            className={`pb-2 px-4 ${activeTab === 'text' ? 'border-b-2 border-purple-600' : ''}`}
          >
            <Brain className="inline w-4 h-4 mr-2" />
            Text Analysis
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-2 px-4 ${activeTab === 'image' ? 'border-b-2 border-purple-600' : ''}`}
          >
            <Camera className="inline w-4 h-4 mr-2" />
            Image Analysis
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-2 px-4 ${activeTab === 'search' ? 'border-b-2 border-purple-600' : ''}`}
          >
            <Search className="inline w-4 h-4 mr-2" />
            Semantic Search
          </button>
        </div>

        {/* Text Analysis Tab */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Text Similarity Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Text 1</label>
                <textarea
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter first text..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Text 2</label>
                <textarea
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter second text..."
                />
              </div>
            </div>
            <button
              onClick={handleTextSimilarity}
              disabled={loading || !text1 || !text2}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Analyze Similarity'}
            </button>
          </div>
        )}

        {/* Image Analysis Tab */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Image Analysis</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload image</span>
              </label>
            </div>
            
            {imageUrl && (
              <div className="relative">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded"
                  className="max-w-full h-auto rounded-lg"
                  onLoad={() => setResults(null)}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ display: results?.type === 'objects' ? 'block' : 'none' }}
                />
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleImageClassification}
                disabled={loading || !imageUrl}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Classify Image
              </button>
              <button
                onClick={handleObjectDetection}
                disabled={loading || !imageUrl}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Detect Objects
              </button>
            </div>
          </div>
        )}

        {/* Semantic Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Semantic Search</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Search Query</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter search query..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Documents</label>
              {documents.map((doc, index) => (
                <textarea
                  key={index}
                  value={doc}
                  onChange={(e) => updateDocument(index, e.target.value)}
                  className="w-full h-20 p-2 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder={`Document ${index + 1}`}
                />
              ))}
              <button
                onClick={addDocument}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                + Add Document
              </button>
            </div>
            
            <button
              onClick={handleSemanticSearch}
              disabled={loading || !searchQuery || !documents.some(d => d.trim())}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Search'}
            </button>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold mb-2">Results:</h4>
            
            {results.type === 'similarity' && (
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {results.percentage}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Similarity Score: {results.value.toFixed(4)}
                </div>
              </div>
            )}
            
            {results.type === 'classification' && (
              <div className="space-y-2">
                {results.predictions.map((pred, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{pred.className}</span>
                    <span className="font-medium">
                      {(pred.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {results.type === 'objects' && (
              <div className="space-y-2">
                {results.objects.map((obj, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{obj.class}</span>
                    <span className="font-medium">
                      {(obj.score * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {results.type === 'search' && (
              <div className="space-y-2">
                {results.results.map((result, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Score: {(result.similarity * 100).toFixed(1)}%
                    </div>
                    <div>{result.document}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default MLDashboard;