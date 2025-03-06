
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
        // According to Supabase docs, for GET requests with params, we need to pass them as queryParams
        const { data, error } = await supabase.functions.invoke("help-articles", {
          method: "GET",
          // For Edge Functions, we need to pass parameters in the body regardless of HTTP method
          body: {
            query: searchQuery || undefined,
            category: selectedCategory !== "All Categories" ? selectedCategory : undefined
          }
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
