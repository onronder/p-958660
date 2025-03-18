
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUnselect = (value: string) => {
    onChange(selectedValues.filter((item) => item !== value));
  };

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      handleUnselect(value);
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && !e.currentTarget.textContent && selectedValues.length > 0) {
      handleUnselect(selectedValues[selectedValues.length - 1]);
    }
  };

  const selectAll = () => {
    onChange(options.map(option => option.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex flex-wrap gap-1 max-w-[calc(100%-20px)] overflow-hidden">
            {selectedValues.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : selectedValues.length === options.length ? (
              <span>All log levels</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((value) => (
                  <Badge 
                    key={value} 
                    variant="secondary"
                    className="mr-1 mb-1"
                  >
                    {options.find(option => option.value === value)?.label || value}
                    <button
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(value);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." ref={inputRef} />
          <div className="flex justify-between px-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={selectAll}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7"
              onClick={clearAll}
            >
              Clear All
            </Button>
          </div>
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValues.includes(option.value) 
                      ? "opacity-100" 
                      : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
