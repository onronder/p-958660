
export const TEST_QUERY_SIMPLE = `{
  shop {
    name
    email
    url
  }
}`;

export const TEST_QUERY_PRODUCTS = `{
  products(first: 5) {
    edges {
      node {
        id
        title
        description
        handle
        createdAt
        updatedAt
      }
    }
  }
}`;

export const TEST_QUERY_ORDERS = `{
  orders(first: 5) {
    edges {
      node {
        id
        name
        totalPrice
        createdAt
        customer {
          firstName
          lastName
          email
        }
      }
    }
  }
}`;

export const TEST_QUERY_CUSTOMERS = `{
  customers(first: 5) {
    edges {
      node {
        id
        firstName
        lastName
        email
        ordersCount
        totalSpent
      }
    }
  }
}`;

export const getQueryTemplates = () => [
  { name: 'Shop Info', query: TEST_QUERY_SIMPLE },
  { name: 'Products', query: TEST_QUERY_PRODUCTS },
  { name: 'Orders', query: TEST_QUERY_ORDERS },
  { name: 'Customers', query: TEST_QUERY_CUSTOMERS }
];
