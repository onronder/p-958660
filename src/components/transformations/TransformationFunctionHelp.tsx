
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

type FunctionCategory = "Arithmetic" | "Logical" | "Text" | "Date";

interface TransformationFunction {
  name: string;
  category: FunctionCategory;
  description: string;
  syntax: string;
  example: string;
}

const transformationFunctions: TransformationFunction[] = [
  // Arithmetic
  { 
    name: "SUM", 
    category: "Arithmetic", 
    description: "Adds values together", 
    syntax: "SUM(value1, value2, ...)", 
    example: "SUM(price, tax) → 110" 
  },
  { 
    name: "AVERAGE", 
    category: "Arithmetic", 
    description: "Calculates the average of values", 
    syntax: "AVERAGE(value1, value2, ...)", 
    example: "AVERAGE(10, 20, 30) → 20" 
  },
  { 
    name: "MULTIPLY", 
    category: "Arithmetic", 
    description: "Multiplies values", 
    syntax: "MULTIPLY(value1, value2)", 
    example: "MULTIPLY(quantity, price) → 2 * 50 = 100" 
  },
  { 
    name: "DIVIDE", 
    category: "Arithmetic", 
    description: "Divides values", 
    syntax: "DIVIDE(value1, value2)", 
    example: "DIVIDE(total, count) → 100 / 4 = 25" 
  },
  
  // Logical
  { 
    name: "IF", 
    category: "Logical", 
    description: "Conditional logic", 
    syntax: "IF(condition, true_value, false_value)", 
    example: "IF(total > 100, 'High', 'Low') → 'High'" 
  },
  { 
    name: "CASE", 
    category: "Logical", 
    description: "Multiple conditional logic", 
    syntax: "CASE(value, case1, result1, case2, result2, default)", 
    example: "CASE(status, 'paid', 'Complete', 'Pending') → 'Complete'" 
  },
  { 
    name: "COALESCE", 
    category: "Logical", 
    description: "Returns first non-null value", 
    syntax: "COALESCE(value1, value2, ...)", 
    example: "COALESCE(null, shipping_address, 'Unknown') → shipping_address" 
  },
  
  // Text
  { 
    name: "CONCAT", 
    category: "Text", 
    description: "Combines text strings", 
    syntax: "CONCAT(text1, text2, ...)", 
    example: "CONCAT(first_name, ' ', last_name) → 'John Smith'" 
  },
  { 
    name: "UPPER", 
    category: "Text", 
    description: "Converts text to uppercase", 
    syntax: "UPPER(text)", 
    example: "UPPER(email) → 'JOHN@EXAMPLE.COM'" 
  },
  { 
    name: "LOWER", 
    category: "Text", 
    description: "Converts text to lowercase", 
    syntax: "LOWER(text)", 
    example: "LOWER(product_code) → 'abc123'" 
  },
  
  // Date
  { 
    name: "DATEDIFF", 
    category: "Date", 
    description: "Calculates difference between dates in days", 
    syntax: "DATEDIFF(date1, date2)", 
    example: "DATEDIFF(order_date, ship_date) → 3" 
  },
  { 
    name: "TIMESTAMPDIFF", 
    category: "Date", 
    description: "Calculates difference between timestamps", 
    syntax: "TIMESTAMPDIFF(timestamp1, timestamp2)", 
    example: "TIMESTAMPDIFF(created_at, updated_at) → 86400" 
  }
];

const TransformationFunctionHelp = () => {
  const [filter, setFilter] = useState<FunctionCategory | 'All'>('All');
  
  const filteredFunctions = filter === 'All' 
    ? transformationFunctions 
    : transformationFunctions.filter(func => func.category === filter);
  
  // Group functions by category
  const groupedFunctions = filteredFunctions.reduce<Record<FunctionCategory, TransformationFunction[]>>((acc, func) => {
    if (!acc[func.category]) {
      acc[func.category] = [];
    }
    acc[func.category].push(func);
    return acc;
  }, {} as Record<FunctionCategory, TransformationFunction[]>);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Transformation Functions</h3>
        <p className="text-sm text-muted-foreground">
          Use these functions in your transformation expressions to manipulate and transform your data.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Badge 
          className={`cursor-pointer ${filter === 'All' ? 'bg-primary' : 'bg-secondary'}`}
          onClick={() => setFilter('All')}
        >
          All
        </Badge>
        <Badge 
          className={`cursor-pointer ${filter === 'Arithmetic' ? 'bg-primary' : 'bg-secondary'}`}
          onClick={() => setFilter('Arithmetic')}
        >
          Arithmetic
        </Badge>
        <Badge 
          className={`cursor-pointer ${filter === 'Logical' ? 'bg-primary' : 'bg-secondary'}`}
          onClick={() => setFilter('Logical')}
        >
          Logical
        </Badge>
        <Badge 
          className={`cursor-pointer ${filter === 'Text' ? 'bg-primary' : 'bg-secondary'}`}
          onClick={() => setFilter('Text')}
        >
          Text
        </Badge>
        <Badge 
          className={`cursor-pointer ${filter === 'Date' ? 'bg-primary' : 'bg-secondary'}`}
          onClick={() => setFilter('Date')}
        >
          Date
        </Badge>
      </div>
      
      <Accordion type="multiple" className="w-full">
        {Object.entries(groupedFunctions).map(([category, functions]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="text-md font-medium">
              {category} Functions
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {functions.map((func) => (
                  <div key={func.name} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{func.name}</h4>
                      <Badge variant="outline">{func.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{func.description}</p>
                    <div className="mt-2 space-y-1">
                      <div className="bg-muted p-2 rounded-md text-xs font-mono">
                        Syntax: {func.syntax}
                      </div>
                      <div className="bg-muted p-2 rounded-md text-xs font-mono">
                        Example: {func.example}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default TransformationFunctionHelp;
