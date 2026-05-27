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
  const mongoId = PropertiesService.getScriptProperties().getProperty("MONGODB_PROJECT_ID");
  return !!mongoId;
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
 * Navigation: Show Verify Deployment Page
 */
function showVerifyDeployment(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentPage()))
    .build();
}

/**
 * Navigation: Handle Region Change
 */
function onRegionChange(e: any) {
  const region = e.formInput.deployment_region;
  if (region && region !== "none") {
    PropertiesService.getScriptProperties().setProperty("GCP_REGION", region);
  }
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

/**
 * Verification Handlers: Get Agent Link
 * Optimized to use the GCP_REGION for a direct lookup.
 */
function onGetAgentLink(e: any) {
  const props = PropertiesService.getScriptProperties();
  const region = props.getProperty("GCP_REGION");
  
  if (!region || region === "none") {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Error: No region selected. Please go back to Step 2 and select a region."))
      .build();
  }

  try {
    const projects = listUserProjects();
    if (projects.length === 0) {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Error: No GCP projects found or permission denied."))
        .build();
    }

    for (const project of projects) {
      const url = `https://run.googleapis.com/v2/projects/${project.projectId}/locations/${region}/services/smart-email-manager-agent`;
      const response = UrlFetchApp.fetch(url, {
        method: "get",
        headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true
      });

      const responseCode = response.getResponseCode();
      if (responseCode === 200) {
        const service = JSON.parse(response.getContentText());
        props.setProperty("CLOUD_RUN_URL", service.uri);
        props.setProperty("GCP_PROJECT_ID", project.projectId);
        
        return CardService.newActionResponseBuilder()
          .setNotification(CardService.newNotification().setText("Success: Agent link retrieved!"))
          .setNavigation(CardService.newNavigation().updateCard(createVerifyDeploymentPage()))
          .build();
      }
    }

    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText(`Agent 'smart-email-manager-agent' not found in region ${region}.`))
      .build();

  } catch (error) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("System Error: " + error.toString()))
      .build();
  }
}

/**
 * Navigation: Show MongoDB Setup Wizard
 */
function showMongoSetupWizard(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createMongoSetupWizardPage()))
    .build();
}

/**
 * MongoDB Handlers: Connect and Provision
 */
function onConnectMongoDB(e: any) {
  const publicKey = e.formInput.mongo_public_key;
  const private_key = e.formInput.mongo_private_key;
  const userEmail = Session.getActiveUser().getEmail();
  
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");

  if (!publicKey || !private_key) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Error: Both Public and Private keys are required."))
      .build();
  }

  try {
    // Get the user's current OAuth token for background processing
    const gmailToken = ScriptApp.getOAuthToken();

    const payload = {
      "mongo_public_key": publicKey,
      "mongo_private_key": private_key,
      "user_email": userEmail,
      "gmail_token": gmailToken
    };

    const options: any = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    const response = UrlFetchApp.fetch(`${cloudRunUrl}/api/setup-db`, options);
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      props.setProperty("MONGODB_PROJECT_ID", result.mongo_project_id);
      props.setProperty("AGENT_BUILDER_APP", result.agent_builder_app);
      props.setProperty("MCP_ENDPOINT", result.mcp_url);
      props.setProperty("GCP_PUB_SUB_TOPIC", result.pubsub_topic);

      // Initiate the Gmail Watch
      setupGmailWatch();

      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Success: " + result.message))
        .setNavigation(CardService.newNavigation().updateCard(createHomePage()))
        .build();
    } else {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Agent Error: " + (result.detail || "Setup failed")))
        .build();
    }

  } catch (error) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("System Error: " + error.toString()))
      .build();
  }
}

/**
 * Refreshes the Gmail Watch and Agent status.
 */
function onCheckStatus(e: any) {
  setupGmailWatch();
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Status checked. Gmail Push Notifications refreshed."))
    .build();
}

/**
 * Gmail: Setup Push Notifications
 * Tells Gmail to send notifications to our Pub/Sub topic.
 */
function setupGmailWatch() {
  const props = PropertiesService.getScriptProperties();
  const topicName = props.getProperty("GCP_PUB_SUB_TOPIC");
  
  if (!topicName) {
    console.error("Missing GCP_PUB_SUB_TOPIC property.");
    return;
  }

  const payload = {
    topicName: topicName,
    labelIds: ["INBOX"]
  };

  const options: any = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch("https://gmail.googleapis.com/gmail/v1/users/me/watch", options);
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      props.setProperty("GMAIL_WATCH_EXPIRATION", result.expiration);
      console.log("Gmail Watch active until: " + new Date(parseInt(result.expiration)));
    } else {
      console.error("Gmail Watch failed: " + response.getContentText());
    }
  } catch (error) {
    console.error("Gmail Watch Error: " + error.toString());
  }
}
