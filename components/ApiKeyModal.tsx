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

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      onClose();
      setApiKey('');
    }
  };

  const handleClose = () => {
    onClose();
    setApiKey('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Enter Fal.ai API Key</h2>
        <p className="text-gray-400 mb-4">
          You need a Fal.ai API key to use this feature.
          <a 
            href="https://fal.ai/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline ml-1"
          >
            Get your API key here
          </a>
        </p>
        
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="KEY_ID:KEY_SECRET"
          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
