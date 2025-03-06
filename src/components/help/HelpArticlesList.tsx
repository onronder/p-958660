
import { Loader2, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpArticle } from "@/hooks/useHelpArticles";
import HelpArticleCard from "@/components/help/HelpArticleCard";

interface HelpArticlesListProps {
  helpArticles: HelpArticle[];
  isLoading: boolean;
  searchQuery: string;
  onClearSearch: () => void;
  onArticleClick: (article: HelpArticle) => void;
}

const HelpArticlesList = ({ 
  helpArticles,
  isLoading,
  searchQuery,
  onClearSearch,
  onArticleClick
}: HelpArticlesListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (helpArticles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            We couldn't find any articles that match your search. Try using different keywords or browse by category.
          </p>
          <Button 
            variant="outline" 
            onClick={onClearSearch}
          >
            Clear search
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {searchQuery && (
        <p className="mb-4 text-sm text-muted-foreground">
          {helpArticles.length} {helpArticles.length === 1 ? 'result' : 'results'} found for "{searchQuery}"
        </p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {helpArticles.map((article) => (
          <HelpArticleCard 
            key={article.id} 
            article={article}
            onClick={onArticleClick}
          />
        ))}
      </div>
    </>
  );
};

export default HelpArticlesList;
