
import React from "react";
import { Link } from "react-router-dom";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with Data Integration",
      excerpt: "Learn the basics of data integration and how to set up your first flow.",
      date: "June 10, 2023",
      author: "Jane Smith"
    },
    {
      id: 2,
      title: "Best Practices for ETL Processes",
      excerpt: "Discover the best practices for extract, transform, and load processes.",
      date: "July 22, 2023",
      author: "John Doe"
    },
    {
      id: 3,
      title: "Optimizing Data Workflows",
      excerpt: "Tips and tricks for optimizing your data workflows for maximum efficiency.",
      date: "August 15, 2023",
      author: "Alex Johnson"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              <Link to={`/blog/${post.id}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {post.date} · {post.author}
            </p>
            <p className="mb-4">{post.excerpt}</p>
            <Link 
              to={`/blog/${post.id}`}
              className="text-primary hover:underline"
            >
              Read more →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
