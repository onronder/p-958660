
import React from 'react';

const SkipTransformationInfo = () => {
  return (
    <div className="pt-4">
      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Skip Transformation Selected</h3>
        <p className="text-sm text-muted-foreground">
          Raw data will be exported directly from the source without any transformations.
          This is useful when you need the original data format or for performance optimization.
        </p>
      </div>
    </div>
  );
};

export default SkipTransformationInfo;
