
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

export const getQueryTemplates = () => [
  { name: 'Shop Info', query: TEST_QUERY_SIMPLE },
  { name: 'Products', query: TEST_QUERY_PRODUCTS }
];
