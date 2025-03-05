
import React from "react";

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="text-lg mb-6">
        Have questions or need assistance? Reach out to our team.
      </p>
      <div className="bg-card p-6 rounded-lg shadow-sm max-w-lg">
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="How can we help you?"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
