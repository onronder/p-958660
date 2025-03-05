
import React from "react";

const LoadingState = () => {
  return (
    <div className="py-20 text-center">
      <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 text-muted-foreground">Loading jobs...</p>
    </div>
  );
};

export default LoadingState;
