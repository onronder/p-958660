
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All help articles content
const helpArticles = [
  // Getting Started
  {
    id: "1",
    category: "Getting Started",
    title: "Welcome to FlowTechs",
    slug: "welcome-to-flowtechs",
    content: `FlowTechs is designed to help businesses of all sizes integrate their 
data effortlessly. Whether you're a developer, data analyst, or 
business owner, our platform enables easy automation of data workflows.

## What You Can Do with FlowTechs:
- Connect various **data sources** (Shopify, WooCommerce, Google Drive, APIs).
- Apply **transformations** such as filtering, calculations, and restructuring.
- Send processed data to **destinations** like Google Drive, AWS S3, or databases.
- Automate tasks with **scheduled jobs**.
- Analyze your data with **AI-powered insights**.

To get started, navigate to the **Dashboard** and begin exploring the features.`
  },
  {
    id: "2",
    category: "Getting Started",
    title: "How to Navigate the Dashboard",
    slug: "navigate-the-dashboard",
    content: `The **Dashboard** provides a centralized view of your data processing activities. 

### Key Sections:
1. **Service Uptime**: Shows system availability and reliability over the last 24 hours.
2. **New Data Rows**: Displays the volume of data processed in the last 30 days.
3. **API Calls**: Tracks the number of API requests made.
4. **Active Connections**: Lists the currently active sources.

The **Recent Jobs** section provides an overview of scheduled jobs, 
including **start time, duration, rows processed, and job status**.`
  },
  
  // Sources
  {
    id: "3",
    category: "Sources",
    title: "Connecting a New Data Source",
    slug: "connecting-data-source",
    content: `To connect a new data source, navigate to **My Sources** and click \`Add Source\`.
You can select from available options such as **Shopify, WooCommerce, or Custom API**.

### Steps:
1. Click on \`Add Source\` and choose your provider.
2. Authenticate using OAuth (for Shopify) or enter API credentials manually.
3. Save the connection. Once authenticated, the system verifies and stores credentials securely.
4. Your source will now appear in the **My Sources** list.`
  },
  {
    id: "4",
    category: "Sources",
    title: "Supported Data Sources",
    slug: "supported-data-sources",
    content: `FlowTechs allows integration with multiple data sources, including:

- **Shopify**: Connect via OAuth to retrieve order, product, and customer data.
- **WooCommerce**: Use API keys for data extraction.
- **Google Sheets** (Coming Soon): Import spreadsheets into your database.
- **Custom API Endpoints**: Fetch and process data from external APIs.`
  },
  {
    id: "9",
    category: "Sources",
    title: "First Time Shopify Connection",
    slug: "first-time-shopify-connection",
    content: `## Setting Up Your First Shopify Connection

### 1. Create a Shopify Developer Account
Before you begin, you'll need a Shopify Developer account. Sign up for a free account at https://partners.shopify.com/signup.

### 2. Create a New Custom App
Create a new custom app once you have a Developer account:
- Log in to your Shopify Partner Dashboard using your login credentials.
- In the sidebar menu, click on "Apps".
- On the "Apps" page, click on the "Create app" button.
- Next, select the "Custom app" option from the available choices.
- Click on the "Create app" button once again.
- Fill out all the required information for your custom app, such as the app name and app URL, in the appropriate fields.
- Once you have entered all the necessary information, click on the "Create app" button one final time to complete the process.

### 3. Set up API Credentials
To interact with the Shopify API Integration or any external API, your app will need the appropriate API credentials:
- In your custom app's page, click on "App setup."
- Scroll down the "API keys and scopes" section. (If you do not grant read permission to API Scopes, the existing data will not be accessible even if the connection is successful.)
- Click "Generate API credentials."
- Fill in the required information, such as API key description and scopes, and click "Generate."

### 4. Connect to FlowTechs
Now that you have your API Key and Admin API Access Token, you can enter them in the connection form to connect your Shopify store to FlowTechs.`
  },
  
  // Transformations
  {
    id: "5",
    category: "Transformations",
    title: "Creating Your First Transformation",
    slug: "creating-first-transformation",
    content: `Transformations allow you to **modify, clean, and enrich** your data before sending it to a destination.

### Example Use Cases:
- **Combine multiple fields** into a single output.
- **Apply calculations** such as sum, average, or percentage.
- **Filter out unnecessary data** before exporting.

To create a transformation:
1. Go to \`Load & Transform\` and click \`Add New Transformation\`.
2. Select the source data you wish to transform.
3. Use **available functions** (Arithmetic, Logical, Text) to modify data.
4. Save the transformation. It will be applied before export.`
  },
  
  // Jobs
  {
    id: "6",
    category: "Jobs",
    title: "Scheduling Data Jobs",
    slug: "scheduling-data-jobs",
    content: `Jobs allow you to **schedule data extraction, transformation, and export processes** automatically.

### How to Schedule a Job:
1. Navigate to the **Jobs** page.
2. Click \`Create Job\` and select a **data source and transformation**.
3. Define the **execution frequency** (hourly, daily, weekly).
4. Specify the **destination** where the processed data should be sent.
5. Save the job. It will run according to the scheduled time.

You can monitor job execution status in the **Recent Jobs** section.`
  },
  
  // Pro Features
  {
    id: "7",
    category: "Pro Features",
    title: "Data Storage Benefits",
    slug: "data-storage-benefits",
    content: `Pro users get access to **enhanced data storage** features:
- Store **larger datasets** efficiently.
- Retain historical data for **longer periods**.
- Utilize advanced indexing for **faster queries**.`
  },
  {
    id: "8",
    category: "Pro Features",
    title: "AI Insights Features",
    slug: "ai-insights-features",
    content: `AI Insights analyze your data to uncover hidden patterns and provide recommendations.

### Features:
- **Anomaly detection**: Identify unusual spikes or drops in data.
- **Predictive analytics**: Forecast future trends based on historical data.
- **Automated segmentation**: Group customers based on purchase behavior.`
  }
];

const categories = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Learn the basics of FlowTechs, including how to navigate the dashboard and configure your first data source."
  },
  {
    id: "sources",
    name: "Sources",
    description: "Learn how to connect and manage your data sources."
  },
  {
    id: "transformations",
    name: "Transformations",
    description: "Learn how to modify and enhance your data before exporting it."
  },
  {
    id: "jobs",
    name: "Jobs",
    description: "Learn how to automate and schedule data processing jobs."
  },
  {
    id: "pro-features",
    name: "Pro Features",
    description: "Explore advanced capabilities available for Pro users."
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');
    const search = searchParams.get('search');

    // Return all categories
    if (url.pathname.endsWith('/categories')) {
      return new Response(
        JSON.stringify({ categories }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter articles based on query parameters
    let filteredArticles = [...helpArticles];
    
    if (category) {
      filteredArticles = filteredArticles.filter(
        article => article.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (slug) {
      filteredArticles = filteredArticles.filter(
        article => article.slug === slug
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = filteredArticles.filter(article => 
        article.title.toLowerCase().includes(searchLower) || 
        article.content.toLowerCase().includes(searchLower)
      );
    }

    // Return filtered articles
    return new Response(
      JSON.stringify({ articles: filteredArticles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
