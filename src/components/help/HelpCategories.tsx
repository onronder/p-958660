
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface HelpCategoriesProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const HelpCategories = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}: HelpCategoriesProps) => {
  return (
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
  );
};

export default HelpCategories;
