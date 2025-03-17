
/**
 * Helper function to get predefined query
 */
export function getPredefinedQuery(templateName: string): string {
  const templates: Record<string, string> = {
    "products_basic": `
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
    "orders_basic": `
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
    "customers_basic": `
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
    // Add more predefined templates as needed
  };
  
  return templates[templateName] || "";
}

/**
 * Helper function for dependent query templates
 */
export function getDependentQueryTemplate(templateName: string): any {
  const templates: Record<string, any> = {
    "customer_with_orders": {
      primaryQuery: `
        query GetCustomers($first: Int!, $after: String) {
          customers(first: $first, after: $after) {
            edges {
              node {
                id
                firstName
                lastName
                email
                phone
                createdAt
                tags
                ordersCount
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      buildSecondaryQuery: (customerId: string) => {
        return {
          query: `
            query GetCustomerOrders($customerId: ID!, $first: Int!) {
              customer(id: $customerId) {
                orders(first: $first) {
                  edges {
                    node {
                      id
                      name
                      createdAt
                      totalPriceSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      displayFinancialStatus
                      displayFulfillmentStatus
                    }
                  }
                }
              }
            }
          `,
          variables: {
            customerId,
            first: 10
          }
        };
      },
      idExtractor: (customers: any[]) => {
        return customers.map(customer => customer.id);
      },
      resultMerger: (customers: any[], orderData: any[]) => {
        // Create a map of customer ID to orders
        const ordersMap = new Map();
        
        orderData.forEach(data => {
          if (data.customer && data.customer.orders) {
            const customerId = data.customer.id;
            const orders = data.customer.orders.edges.map((edge: any) => edge.node);
            ordersMap.set(customerId, orders);
          }
        });
        
        // Merge customers with their orders
        return customers.map(customer => {
          return {
            ...customer,
            orders: ordersMap.get(customer.id) || []
          };
        });
      }
    },
    // Add more dependent query templates as needed
  };
  
  return templates[templateName] || { primaryQuery: "", buildSecondaryQuery: () => ({}), idExtractor: () => [], resultMerger: () => [] };
}
