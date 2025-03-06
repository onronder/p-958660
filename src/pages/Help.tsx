
import { useState } from "react";
import { Search, Book, HelpCircle, Info, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useHelpArticles, HelpArticle } from "@/hooks/useHelpArticles";
import HelpArticleCard from "@/components/help/HelpArticleCard";
import HelpArticleDetail from "@/components/help/HelpArticleDetail";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Help = () => {
  const { 
    helpArticles, 
    categories, 
    isLoading, 
    searchQuery, 
    setSearchQuery,
    selectedCategory, 
    setSelectedCategory 
  } = useHelpArticles();
  
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showTourButton, setShowTourButton] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleArticleClick = (article: HelpArticle) => {
    setSelectedArticle(article);
    setIsDetailOpen(true);
  };

  const handleStartTour = async () => {
    // Reset onboarding_completed to false to trigger the tour
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: false })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Onboarding Tour Activated",
          description: "Navigate to the dashboard to start the tour.",
        });

        setShowTourButton(false);
      } catch (error) {
        console.error("Failed to activate tour:", error);
        toast({
          title: "Error",
          description: "Failed to activate the tour. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the guided tour feature.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-8">
        <Book className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold">Help & Documentation</h1>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="categories-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`w-full text-left px-4 py-2 transition-colors ${
                      selectedCategory === category ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick help card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-primary" />
                Need More Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Can't find what you're looking for? Get in touch with our support team.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
              {showTourButton && (
                <Button 
                  variant="link" 
                  className="w-full mt-2 text-primary"
                  onClick={handleStartTour}
                >
                  Start Guided Tour
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-9">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : helpArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Info className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  We couldn't find any articles that match your search. Try using different keywords or browse by category.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Categories");
                  }}
                >
                  Clear search
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                    onClick={handleArticleClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Article Detail Dialog */}
      <HelpArticleDetail 
        article={selectedArticle} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />

      {/* Tooltip component example */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="fixed bottom-4 right-4" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Need help? Click here for a guided tour</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Help;
