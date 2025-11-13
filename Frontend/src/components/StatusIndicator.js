import React from 'react';
import { Circle } from 'lucide-react';

function StatusIndicator({ status, label }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'text-green-500';
      case 'stopped':
        return 'text-red-500';
      case 'starting':
      case 'stopping':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Circle 
        size={12} 
        className={`${getStatusColor(status)} fill-current`}
      />
      <span className="text-sm font-medium text-gray-700">
        {label}: <span className="capitalize">{status || 'Unknown'}</span>
      </span>
    </div>
  );
}

export default StatusIndicator;