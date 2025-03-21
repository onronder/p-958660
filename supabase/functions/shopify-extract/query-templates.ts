
/**
 * Query template definition and helpers
 */

/**
 * Template definition for Shopify queries
 */
export interface QueryTemplate {
  query: string;
  variables?: Record<string, any>;
  description?: string;
}

/**
 * Get a query template by key
 */
export function getQueryTemplate(templateKey: string): QueryTemplate | null {
  // Convert from possible legacy template name
  const key = convertLegacyTemplateKey(templateKey);
  
  // Get predefined templates
  const templates: Record<string, QueryTemplate> = {
    "products_basic": {
      query: `
        query GetProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id
                title
                handle
                description
                createdAt
                updatedAt
                productType
                vendor
                publishedAt
                tags
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      `,
      description: "Basic product information"
    },
    "orders_basic": {
      query: `
        query GetOrders($first: Int!) {
          orders(first: $first) {
            edges {
              node {
                id
                name
                createdAt
                displayFinancialStatus
                displayFulfillmentStatus
                email
                phone
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                customer {
                  id
                  email
                  firstName
                  lastName
                }
              }
            }
          }
        }
      `,
      description: "Basic order information"
    },
    "customers_basic": {
      query: `
        query GetCustomers($first: Int!) {
          customers(first: $first) {
            edges {
              node {
                id
                firstName
                lastName
                email
                phone
                createdAt
                updatedAt
                tags
                ordersCount
                totalSpent {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      `,
      description: "Basic customer information"
    },
    // Add more predefined templates as needed
  };
  
  return templates[key] || null;
}

/**
 * Convert legacy template keys to new format if needed
 */
function convertLegacyTemplateKey(key: string): string {
  const legacyMappings: Record<string, string> = {
    "products": "products_basic",
    "orders": "orders_basic",
    "customers": "customers_basic",
    // Add more mappings as needed
  };
  
  return legacyMappings[key] || key;
}
