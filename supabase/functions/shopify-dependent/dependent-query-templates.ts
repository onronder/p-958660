
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
    "products_with_metafields": {
      primaryQuery: `
        query GetProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                id
                title
                handle
                description
                productType
                vendor
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      buildSecondaryQuery: (productId: string) => {
        return {
          query: `
            query GetProductMetafields($productId: ID!, $first: Int!) {
              product(id: $productId) {
                metafields(first: $first) {
                  edges {
                    node {
                      id
                      namespace
                      key
                      value
                      type
                    }
                  }
                }
              }
            }
          `,
          variables: {
            productId,
            first: 20
          }
        };
      },
      idExtractor: (products: any[]) => {
        return products.map(product => product.id);
      },
      resultMerger: (products: any[], metafieldData: any[]) => {
        // Create a map of product ID to metafields
        const metafieldsMap = new Map();
        
        metafieldData.forEach(data => {
          if (data.product && data.product.metafields) {
            const productId = data.product.id;
            const metafields = data.product.metafields.edges.map((edge: any) => edge.node);
            metafieldsMap.set(productId, metafields);
          }
        });
        
        // Merge products with their metafields
        return products.map(product => {
          return {
            ...product,
            metafields: metafieldsMap.get(product.id) || []
          };
        });
      }
    }
  };
  
  return templates[templateName] || null;
}
