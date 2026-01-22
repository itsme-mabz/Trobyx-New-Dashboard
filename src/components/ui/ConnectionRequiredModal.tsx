import React from 'react';
import { ExclamationTriangleIcon, LinkIcon } from '@heroicons/react/24/outline';
import Button from './button/Button';

interface ConnectionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform?: string;
  templateName?: string;
  onConnectClick: () => void;
}

const ConnectionRequiredModal: React.FC<ConnectionRequiredModalProps> = ({
  isOpen,
  onClose,
  platform,
  templateName,
  onConnectClick,
}) => {
  if (!isOpen) return null;

  const platformName = platform ? platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase() : 'Platform';
  
  // Platform-specific styling
  const getPlatformColor = (platform?: string): string => {
    switch (platform?.toLowerCase()) {
      case 'linkedin':
        return 'text-blue-600';
      case 'twitter':
        return 'text-sky-500';
      case 'facebook':
        return 'text-blue-700';
      case 'instagram':
        return 'text-pink-600';
      default:
        return 'text-gray-600';
    }
  };

  const platformColor = getPlatformColor(platform);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {platformName} Connection Required
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            To use <span className="font-semibold">{templateName || 'this template'}</span>, you need to connect your {platformName} account first.
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <LinkIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">How to connect:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Install the Trobyx browser extension</li>
                  <li>Log into your {platformName} account</li>
                  <li>Click the extension icon and sync your cookies</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={onConnectClick}
          >
            Connect {platformName}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionRequiredModal;