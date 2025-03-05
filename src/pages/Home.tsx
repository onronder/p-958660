
import React from "react";

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to FlowTechs</h1>
      <p className="text-lg mb-4">
        Streamline your data integration workflow with our powerful platform.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Data Integration</h2>
          <p>Connect and synchronize data across multiple platforms with ease.</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Analytics</h2>
          <p>Gain insights from your integrated data with powerful analytics tools.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
