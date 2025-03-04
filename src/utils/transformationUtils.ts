
import { TransformationFunction, FunctionCategory } from "@/types/transformation";

export const functionCategories: Record<FunctionCategory, TransformationFunction[]> = {
  "Arithmetic": [
    { 
      name: "SUM", 
      category: "Arithmetic", 
      description: "Adds values together", 
      syntax: "SUM(value1, value2, ...)", 
      example: "SUM(price, tax)" 
    },
    { 
      name: "AVERAGE", 
      category: "Arithmetic", 
      description: "Calculates the average of values", 
      syntax: "AVERAGE(value1, value2, ...)", 
      example: "AVERAGE(daily_sales)" 
    },
    { 
      name: "MULTIPLY", 
      category: "Arithmetic", 
      description: "Multiplies values", 
      syntax: "MULTIPLY(value1, value2)", 
      example: "MULTIPLY(quantity, price)" 
    },
    { 
      name: "DIVIDE", 
      category: "Arithmetic", 
      description: "Divides values", 
      syntax: "DIVIDE(value1, value2)", 
      example: "DIVIDE(total, count)" 
    }
  ],
  "Logical": [
    { 
      name: "IF", 
      category: "Logical", 
      description: "Conditional logic", 
      syntax: "IF(condition, true_value, false_value)", 
      example: "IF(total > 100, 'High', 'Low')" 
    },
    { 
      name: "CASE", 
      category: "Logical", 
      description: "Multiple conditional logic", 
      syntax: "CASE(value, case1, result1, ...)", 
      example: "CASE(status, 'paid', 'Complete', 'Pending')" 
    },
    { 
      name: "COALESCE", 
      category: "Logical", 
      description: "Returns first non-null value", 
      syntax: "COALESCE(value1, value2, ...)", 
      example: "COALESCE(shipping_address, billing_address)" 
    }
  ],
  "Text": [
    { 
      name: "CONCAT", 
      category: "Text", 
      description: "Combines text strings", 
      syntax: "CONCAT(text1, text2, ...)", 
      example: "CONCAT(first_name, ' ', last_name)" 
    },
    { 
      name: "UPPER", 
      category: "Text", 
      description: "Converts text to uppercase", 
      syntax: "UPPER(text)", 
      example: "UPPER(email)" 
    },
    { 
      name: "LOWER", 
      category: "Text", 
      description: "Converts text to lowercase", 
      syntax: "LOWER(text)", 
      example: "LOWER(product_code)" 
    }
  ],
  "Date": [
    { 
      name: "DATEDIFF", 
      category: "Date", 
      description: "Calculates difference between dates", 
      syntax: "DATEDIFF(date1, date2)", 
      example: "DATEDIFF(order_date, ship_date)" 
    },
    { 
      name: "TIMESTAMPDIFF", 
      category: "Date", 
      description: "Calculates difference between timestamps", 
      syntax: "TIMESTAMPDIFF(timestamp1, timestamp2)", 
      example: "TIMESTAMPDIFF(created_at, updated_at)" 
    }
  ]
};

export const mockFields = (sourceId: string) => {
  return [
    { id: "1", name: "order_id", category: "Orders", selected: false },
    { id: "2", name: "customer_id", category: "Orders", selected: false },
    { id: "3", name: "total_price", category: "Orders", selected: false },
    { id: "4", name: "created_at", category: "Orders", selected: false },
    { id: "5", name: "first_name", category: "Customers", selected: false },
    { id: "6", name: "last_name", category: "Customers", selected: false },
    { id: "7", name: "email", category: "Customers", selected: false },
    { id: "8", name: "product_id", category: "Products", selected: false },
    { id: "9", name: "product_name", category: "Products", selected: false },
    { id: "10", name: "sku", category: "Products", selected: false },
    { id: "11", name: "price", category: "Products", selected: false }
  ];
};
