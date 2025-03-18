
import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 text-red-800 p-2 rounded mb-4">
      Error: {error}
    </div>
  );
}
