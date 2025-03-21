
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  slug?: string;
}

export const useHelpArticles = (initialQuery = "", initialCategory = "All Categories") => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const { toast } = useToast();

  const {
    data: helpArticlesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["helpArticles", searchQuery, selectedCategory],
    queryFn: async () => {
      try {
        // Build query string manually
        let url = "help-articles";
        const params = [];
        
        if (searchQuery) params.push(`query=${encodeURIComponent(searchQuery)}`);
        if (selectedCategory !== "All Categories") params.push(`category=${encodeURIComponent(selectedCategory)}`);
        
        // Append query string to URL if we have parameters
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        
        // Call the edge function with parameters in the URL
        const { data, error } = await supabase.functions.invoke(url, {
          method: "GET"
        });

        if (error) throw error;
        return data.articles || [];
      } catch (error) {
        console.error("Error fetching help articles:", error);
        toast({
          title: "Error fetching help articles",
          description: "Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const categories = ["All Categories"];
  if (helpArticlesData) {
    helpArticlesData.forEach((article: HelpArticle) => {
      if (!categories.includes(article.category)) {
        categories.push(article.category);
      }
    });
  }

  return {
    helpArticles: helpArticlesData as HelpArticle[] || [],
    categories,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    refetch,
  };
};
