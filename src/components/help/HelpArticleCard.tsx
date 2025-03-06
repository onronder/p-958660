
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { HelpArticle } from "@/hooks/useHelpArticles";

interface HelpArticleCardProps {
  article: HelpArticle;
  onClick: (article: HelpArticle) => void;
}

const HelpArticleCard = ({ article, onClick }: HelpArticleCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all duration-200 ${expanded ? 'border-primary' : ''}`}
      onClick={() => onClick(article)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{article.title}</CardTitle>
            <CardDescription>{article.category}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={toggleExpand}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {expanded ? (
          <div className="text-sm text-foreground">
            {article.content}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {article.content}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default HelpArticleCard;
