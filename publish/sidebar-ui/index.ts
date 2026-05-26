/**
 * Global utility to get the Cloud Run URL from script properties.
 * @returns {string} The service URL or a placeholder.
 */
function getCloudRunUrl(): string {
  const url = PropertiesService.getScriptProperties().getProperty("CLOUD_RUN_URL");
  return url || "https://www.putchakai.com/gmail-addon/404";
}

/**
 * Placeholder check for MongoDB login status.
 * @returns {boolean} True by default for now.
 */
function isUserLoggedInMongoDB(): boolean {
  // return true by default for now as per request
  return true;
}

/**
 * Triggered when the Add-on homepage is opened.
 */
function onHomepage(e: any) {
  return createHomePage();
}

/**
 * Triggered when a Gmail message is opened.
 */
function onGmailMessage(e: any) {
  return createHomePage();
}

/**
 * Placeholder Action Handlers
 */
function onViewSettings(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Settings coming soon."))
    .build();
}

function onCheckConnections(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Checking connections..."))
    .build();
}

function onAskQuestions(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Ask Mailbox coming soon."))
    .build();
}

/**
 * Navigation: Show SEM Deployment Page
 */
function showSEMDeployment(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createSEMDeployPage(e)))
    .build();
}

/**
 * Navigation: Handle Region Change
 */
function onRegionChange(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(createSEMDeployPage(e)))
    .build();
}

/**
 * External Links: Registration Handlers
 */
function onOpenGCPRegistration(e: any) {
  return CardService.newActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink().setUrl("https://cloud.google.com/"))
    .build();
}

function onOpenMongoDBRegistration(e: any) {
  return CardService.newActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink().setUrl("https://www.mongodb.com/cloud/atlas/register"))
    .build();
}

/**
 * Deployment: Cloud Shell Setup Handler
 */
function onOpenCloudShellSetup(e: any) {
  // URL for Cloud Shell without environment variables
  const cloudShellUrl = `https://shell.cloud.google.com/cloudshell/editor?` +
    `cloudshell_git_repo=https://github.com/RPG-coder/rapid-agent-gmail-suites.git&` +
    `cloudshell_tutorial=tutorial.md`;
  
  return CardService.newActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink().setUrl(cloudShellUrl))
    .build();
}
