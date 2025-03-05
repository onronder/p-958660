
import React from "react";
import { useParams, Link } from "react-router-dom";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock blog post data
  const blogPosts = {
    "1": {
      title: "Getting Started with Data Integration",
      content: `
        <p>Data integration is the process of combining data from different sources to provide users with a unified view. This process, often referred to as ETL (Extract, Transform, Load), is essential for businesses that rely on data from various systems.</p>
        <h3>Why Data Integration Matters</h3>
        <p>In today's data-driven world, businesses collect information from numerous sources: CRM systems, marketing platforms, financial software, and more. Without integration, this data remains siloed, making it difficult to gain comprehensive insights.</p>
        <p>Effective data integration allows organizations to:</p>
        <ul>
          <li>Make better-informed decisions based on complete information</li>
          <li>Improve operational efficiency by automating data flows</li>
          <li>Enhance customer experiences through unified data views</li>
          <li>Identify trends and patterns that might be missed in siloed data</li>
        </ul>
        <h3>Getting Started</h3>
        <p>To begin your data integration journey, first identify your key data sources and the specific data points you need to bring together. Then, determine how frequently this data needs to be updated and how it will be used within your organization.</p>
      `,
      date: "June 10, 2023",
      author: "Jane Smith"
    },
    "2": {
      title: "Best Practices for ETL Processes",
      content: `
        <p>Extract, Transform, Load (ETL) is the backbone of data integration, but implementing it effectively requires careful planning and execution.</p>
        <h3>Key Best Practices</h3>
        <p>Follow these guidelines to optimize your ETL processes:</p>
        <ol>
          <li><strong>Profile your data sources:</strong> Understand the structure, volume, and quality of your source data before beginning the ETL process.</li>
          <li><strong>Design for scalability:</strong> Ensure your ETL solution can handle growing data volumes and additional data sources.</li>
          <li><strong>Implement error handling:</strong> Build robust error detection and handling mechanisms to ensure data quality.</li>
          <li><strong>Document everything:</strong> Maintain detailed documentation on data sources, transformations, and loading procedures.</li>
          <li><strong>Monitor performance:</strong> Regularly assess ETL job performance and optimize as needed.</li>
        </ol>
        <h3>Common Pitfalls to Avoid</h3>
        <p>Watch out for these common ETL challenges:</p>
        <ul>
          <li>Underestimating the complexity of data transformations</li>
          <li>Neglecting to validate data quality</li>
          <li>Failing to plan for system downtime or failures</li>
          <li>Overlooking the need for ongoing maintenance</li>
        </ul>
      `,
      date: "July 22, 2023",
      author: "John Doe"
    },
    "3": {
      title: "Optimizing Data Workflows",
      content: `
        <p>Efficient data workflows are essential for organizations looking to maximize the value of their data assets.</p>
        <h3>Optimization Strategies</h3>
        <p>Consider these approaches to streamline your data workflows:</p>
        <ol>
          <li><strong>Parallel processing:</strong> Execute multiple tasks simultaneously to reduce overall processing time.</li>
          <li><strong>Incremental loading:</strong> Process only new or changed data rather than full datasets whenever possible.</li>
          <li><strong>Data compression:</strong> Reduce storage requirements and network transfer times through appropriate compression techniques.</li>
          <li><strong>Caching strategies:</strong> Implement intelligent caching to avoid redundant data retrieval and processing.</li>
          <li><strong>Resource allocation:</strong> Allocate computing resources based on task priority and complexity.</li>
        </ol>
        <h3>Measuring Success</h3>
        <p>To ensure your optimization efforts are effective, establish key performance indicators (KPIs) such as:</p>
        <ul>
          <li>Total processing time</li>
          <li>Resource utilization</li>
          <li>Data throughput rates</li>
          <li>Error frequency and resolution time</li>
          <li>End-user satisfaction with data availability</li>
        </ul>
      `,
      date: "August 15, 2023",
      author: "Alex Johnson"
    }
  };
  
  const post = blogPosts[id as keyof typeof blogPosts];
  
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Post Not Found</h1>
        <p>The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className="text-primary hover:underline mt-4 inline-block">
          ← Back to all posts
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/blog" className="text-primary hover:underline mb-4 inline-block">
        ← Back to all posts
      </Link>
      <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {post.date} · {post.author}
      </p>
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
};

export default BlogPost;
