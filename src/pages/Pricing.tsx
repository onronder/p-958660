
import React from "react";

const Pricing = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Pricing Plans</h1>
      <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
        Choose the right plan for your business needs. All plans include our core features.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-2">Starter</h2>
          <p className="text-3xl font-bold mb-4">$49<span className="text-sm font-normal">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              5 data sources
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Basic analytics
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Community support
            </li>
          </ul>
          <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Get Started
          </button>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-md border border-primary relative">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">Popular</div>
          <h2 className="text-xl font-semibold mb-2">Professional</h2>
          <p className="text-3xl font-bold mb-4">$99<span className="text-sm font-normal">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              20 data sources
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Advanced analytics
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Email support
            </li>
          </ul>
          <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Get Started
          </button>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-2">Enterprise</h2>
          <p className="text-3xl font-bold mb-4">$249<span className="text-sm font-normal">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Unlimited data sources
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Custom analytics
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Priority support
            </li>
          </ul>
          <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
