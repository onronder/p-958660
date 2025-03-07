
import { categories, helpArticles } from './data.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Get all categories
 */
export function getCategories() {
  return new Response(
    JSON.stringify({ categories }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Get filtered articles based on query parameters
 */
export function getFilteredArticles(params: URLSearchParams) {
  const category = params.get('category');
  const slug = params.get('slug');
  const search = params.get('search');
  
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
  
  return new Response(
    JSON.stringify({ articles: filteredArticles }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Handle errors and return appropriate response
 */
export function handleError(error: Error) {
  console.error("Error processing request:", error);
  return new Response(
    JSON.stringify({ error: "Internal server error" }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
