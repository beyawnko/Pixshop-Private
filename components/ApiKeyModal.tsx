/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-2xl w-full max-w-md flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-100">Enter Fal.ai API Key</h2>
        <p className="text-gray-400">
          The Fal Qwen Edit model requires an API key from <a href="https://fal.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Fal.ai</a>. 
          Your key is only stored for this session and is not saved.
        </p>
        <div>
          <label htmlFor="fal-api-key" className="block text-sm font-medium text-gray-300 mb-2">
            API Key (format: KEY_ID:KEY_SECRET)
          </label>
          <input
            id="fal-api-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="e.g., 11111111-1111-1111-1111-111111111111:xxxxxxxx..."
            className="w-full bg-gray-900 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-gray-200 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
