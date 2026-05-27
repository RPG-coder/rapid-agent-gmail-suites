/**
 * Utility: MongoDB OAuth2 Service
 * Configures the OAuth2 library to connect with MongoDB Atlas.
 */

declare var OAuth2: any;

/**
 * Configures the MongoDB OAuth2 service.
 */
export function getMongoDBService() {
  const props = PropertiesService.getScriptProperties();
  const clientId = props.getProperty("MONGODB_CLIENT_ID");
  const clientSecret = props.getProperty("MONGODB_CLIENT_SECRET");

  return OAuth2.createService("MongoDB")
    // Set the endpoint URLs.
    .setAuthorizationBaseUrl("https://cloud.mongodb.com/v2/oauth/authorize")
    .setTokenUrl("https://cloud.mongodb.com/v2/oauth/token")

    // Set the client ID and secret.
    .setClientId(clientId || "PLACEHOLDER_CLIENT_ID")
    .setClientSecret(clientSecret || "PLACEHOLDER_CLIENT_SECRET")

    // Set the name of the callback function that should be invoked to
    // complete the OAuth flow.
    .setCallbackFunction("authCallback")

    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties())

    // Set the scope(s) required. 
    // For Atlas Admin API, this is usually 'cloud:read_write'
    .setScope("cloud:read_write")

    // MongoDB Atlas specific parameter (Force approval prompt if needed)
    .setParam("response_type", "code");
}

/**
 * Clears the MongoDB OAuth2 service.
 */
export function logOutMongoDB() {
  getMongoDBService().reset();
}

/**
 * Checks if the MongoDB service is authorized.
 */
export function isMongoDBAuthorized() {
  return getMongoDBService().hasAccess();
}
