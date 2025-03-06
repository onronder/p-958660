
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HelpSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const HelpSearch = ({ searchQuery, setSearchQuery }: HelpSearchProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-10"
        placeholder="Search for help topics..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default HelpSearch;
