
/**
 * Service for handling GraphQL query preparation and validation
 */

/**
 * Prepares and validates a GraphQL query based on provided parameters
 */
export async function prepareQuery(params) {
  const { custom_query, template_key, limit = 5 } = params;
  
  // Verify that we have a valid query
  if (!custom_query && !template_key) {
    console.error("Missing query information, neither custom_query nor template_key was provided");
    return {
      success: false,
      error: {
        message: "Missing query - either custom_query or template_key must be provided",
        details: { 
          hasCustomQuery: !!custom_query,
          hasTemplateKey: !!template_key
        }
      },
      status: 400,
      code: 'missing_query'
    };
  }
  
  // Log query for debugging
  if (custom_query) {
    console.log("Custom GraphQL query:", custom_query.substring(0, 200) + "...");
  } else if (template_key) {
    console.log("Using template key:", template_key);
  }
  
  // Import template query if template_key is provided and no custom_query
  let query = custom_query;
  
  if (!query && template_key) {
    try {
      const { getQueryTemplate } = await import("../query-templates.ts");
      const template = getQueryTemplate(template_key);
      
      if (!template || !template.query) {
        return {
          success: false,
          error: {
            message: `Template not found for key: ${template_key}`,
            details: { provided_key: template_key }
          },
          status: 404,
          code: 'template_not_found'
        };
      }
      
      query = template.query;
    } catch (templateError) {
      console.error("Error loading template:", templateError);
      return {
        success: false,
        error: {
          message: "Failed to load query template",
          details: { error: templateError.message }
        },
        status: 500,
        code: 'template_load_error'
      };
    }
  }
  
  // Final check to ensure we have a query
  if (!query) {
    console.error("No query available after processing");
    return {
      success: false,
      error: {
        message: "No GraphQL query available",
        details: { 
          hasCustomQuery: !!custom_query,
          hasTemplateKey: !!template_key,
          templateResolved: !!query
        }
      },
      status: 400,
      code: 'query_resolution_failed'
    };
  }
  
  // Calculate the preview limit, enforcing a maximum of 5 records
  const previewLimit = Math.min(limit || 5, 5);
  
  return {
    success: true,
    query,
    variables: { first: previewLimit }
  };
}
