
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SourceTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSource: (sourceType: string) => void;
}

const SourceTypeSelector: React.FC<SourceTypeSelectorProps> = ({
  open,
  onOpenChange,
  onSelectSource,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Source Type</DialogTitle>
          <DialogDescription>
            Choose a data source to connect to your application.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <Card
            className="p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectSource("shopify")}
          >
            <div className="h-12 w-12 flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-green-600"
              >
                <path d="M7 10v-4a4 4 0 1 1 8 0v4" />
                <rect width="18" height="12" x="3" y="10" rx="2" />
              </svg>
            </div>
            <h3 className="font-semibold">Shopify</h3>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Connect to your Shopify store
            </p>
          </Card>
          
          <Card
            className="p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectSource("woocommerce")}
          >
            <div className="h-12 w-12 flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-purple-600"
              >
                <path d="m2 9 3-3h14l3 3M2 15h20" />
                <rect width="18" height="12" x="3" y="5" rx="2" />
              </svg>
            </div>
            <h3 className="font-semibold">WooCommerce</h3>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Connect to your WooCommerce store
            </p>
          </Card>
          
          <Card
            className="p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectSource("api")}
          >
            <div className="h-12 w-12 flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-blue-600"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M8 13h8" />
                <path d="M8 17h8" />
                <path d="M8 9h8" />
              </svg>
            </div>
            <h3 className="font-semibold">Custom API</h3>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Connect to any REST API
            </p>
          </Card>
          
          <Card
            className="p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectSource("googlesheets")}
          >
            <div className="h-12 w-12 flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-green-500"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="3" x2="21" y1="9" y2="9" />
                <line x1="3" x2="21" y1="15" y2="15" />
                <line x1="9" x2="9" y1="3" y2="21" />
                <line x1="15" x2="15" y1="3" y2="21" />
              </svg>
            </div>
            <h3 className="font-semibold">Google Sheets</h3>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Import data from Google Sheets
            </p>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SourceTypeSelector;
