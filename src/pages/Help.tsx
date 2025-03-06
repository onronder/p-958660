
import { useState } from "react";
import { useHelpArticles, HelpArticle } from "@/hooks/useHelpArticles";
import HelpHeader from "@/components/help/HelpHeader";
import HelpSearch from "@/components/help/HelpSearch";
import HelpCategories from "@/components/help/HelpCategories";
import HelpQuickSupport from "@/components/help/HelpQuickSupport";
import HelpArticlesList from "@/components/help/HelpArticlesList";
import HelpArticleDetail from "@/components/help/HelpArticleDetail";
import HelpFloatingButton from "@/components/help/HelpFloatingButton";

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

  const handleArticleClick = (article: HelpArticle) => {
    setSelectedArticle(article);
    setIsDetailOpen(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
  };

  const handleStartTour = () => {
    // Tour will be activated by the HelpQuickSupport component
    console.log("Tour started");
  };

  return (
    <div className="container mx-auto py-6">
      <HelpHeader />
      <HelpSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <div className="grid grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <HelpCategories 
            categories={categories} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />
          <HelpQuickSupport onStartTour={handleStartTour} />
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-9">
          <HelpArticlesList 
            helpArticles={helpArticles}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            onArticleClick={handleArticleClick}
          />
        </div>
      </div>

      {/* Article Detail Dialog */}
      <HelpArticleDetail 
        article={selectedArticle} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
      />

      {/* Floating Help Button */}
      <HelpFloatingButton />
    </div>
  );
};

export default Help;
