
import { useState } from "react";
import { Search, Book, HelpCircle, Info, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock help articles data (this would come from Supabase in a real implementation)
const helpArticles = [
  {
    id: "1",
    category: "Getting Started",
    title: "Welcome to FlowTechs",
    content: "FlowTechs is a powerful data integration platform that helps you connect, transform, and load your data across different systems."
  },
  {
    id: "2",
    category: "Getting Started",
    title: "How to Navigate the Dashboard",
    content: "The Dashboard provides an overview of your data processing activities, including job status, data processed, and recent activities."
  },
  {
    id: "3",
    category: "Sources",
    title: "Connecting a New Data Source",
    content: "To connect a new data source, navigate to the 'My Sources' page and click the 'Add Source' button. Follow the configuration wizard to set up your connection."
  },
  {
    id: "4",
    category: "Sources",
    title: "Supported Data Sources",
    content: "FlowTechs supports various data sources including Shopify, WooCommerce, CSV files, and database connections."
  },
  {
    id: "5",
    category: "Transformations",
    title: "Creating Your First Transformation",
    content: "Transformations allow you to modify your data before sending it to a destination. Create a transformation by selecting a source and defining transformation rules."
  },
  {
    id: "6",
    category: "Jobs",
    title: "Scheduling Data Jobs",
    content: "Jobs can be scheduled to run at specific intervals. Navigate to the Jobs page to create and manage your data processing schedules."
  },
  {
    id: "7",
    category: "Pro Features",
    title: "Data Storage Benefits",
    content: "Pro users get access to increased data storage capabilities, allowing you to store and manage larger datasets efficiently."
  },
  {
    id: "8",
    category: "Pro Features",
    title: "AI Insights Features",
    content: "AI Insights provide automated analysis of your data, revealing patterns and offering recommendations to optimize your data flows."
  }
];

// Get unique categories
const categories = Array.from(new Set(helpArticles.map(article => article.category)));

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedArticle, setSelectedArticle] = useState(helpArticles[0]);

  // Filter articles based on search query and selected category
  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All Categories" || 
      article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
                <button
                  key="all-categories"
                  className={`w-full text-left px-4 py-2 transition-colors ${
                    selectedCategory === "All Categories" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedCategory("All Categories")}
                >
                  All Categories
                </button>
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
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-9">
          {searchQuery && (
            <p className="mb-4 text-sm text-muted-foreground">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'result' : 'results'} found for "{searchQuery}"
            </p>
          )}

          {filteredArticles.length === 0 ? (
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
                    setSelectedCategory(categories[0]);
                  }}
                >
                  Clear search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription>{article.category}</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selected Article Modal/Detail could be added here */}
        </div>
      </div>

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
