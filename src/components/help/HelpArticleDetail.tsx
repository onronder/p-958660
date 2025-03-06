
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpArticle } from "@/hooks/useHelpArticles";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HelpArticleDetailProps {
  article: HelpArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

const HelpArticleDetail = ({ article, isOpen, onClose }: HelpArticleDetailProps) => {
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{article.title}</DialogTitle>
          <DialogDescription>
            {article.category}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-4">
            <div className="prose dark:prose-invert prose-sm max-w-none">
              {article.content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HelpArticleDetail;
