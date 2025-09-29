/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface CropPanelProps {
  onApplyCrop: () => void;
  onSetAspect: (aspect: number | undefined) => void;
  isLoading: boolean;
  isCropping: boolean;
}

export const CropPanel: React.FC<CropPanelProps> = ({ 
  onApplyCrop, 
  onSetAspect, 
  isLoading, 
  isCropping 
}) => {
  const aspectRatios = [
    { label: 'Free', value: undefined },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:4', value: 3 / 4 },
    { label: '9:16', value: 9 / 16 }
  ];

  return (
    <div className="space-y-4 w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <div className="text-center text-gray-400">
        <h3 className="text-lg font-semibold text-gray-300">Crop Image</h3>
        <p className="text-sm text-gray-400">Select an aspect ratio and drag to crop the image</p>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {aspectRatios.map(ratio => (
          <button
            key={ratio.label}
            onClick={() => onSetAspect(ratio.value)}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            {ratio.label}
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <button
          onClick={onApplyCrop}
          disabled={!isCropping || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Cropping...' : 'Apply Crop'}
        </button>
      </div>
    </div>
  );
};
