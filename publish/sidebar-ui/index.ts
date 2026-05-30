import { createHomePage } from './pages/homePage';
import { createSEMDeployPage } from './organisms/sem/semDeploy';
import { createVerifyDeploymentPage } from './organisms/sem/verifyDeployment';
import { createMongoSetupWizardPage } from './organisms/sem/mongoSetupWizard';
import { listUserProjects } from './utils/gcpScanner';

/**
 * Global utility to get the Cloud Run URL from script properties.
 * @returns {string} The service URL or a placeholder.
 */
export function getCloudRunUrl(): string {
  const url = PropertiesService.getScriptProperties().getProperty("CLOUD_RUN_URL");
  return url || "https://www.putchakai.com/gmail-addon/404";
}

/**
 * Placeholder check for MongoDB login status.
 * @returns {boolean} True by default for now.
 */
export function isUserLoggedInMongoDB(): boolean {
  const mongoId = PropertiesService.getScriptProperties().getProperty("MONGODB_PROJECT_ID");
  return !!mongoId;
}

/**
 * Triggered when the Add-on homepage is opened.
 */
export function onHomepage(e: any) {
  return createHomePage();
}

/**
 * Triggered when a Gmail message is opened.
 */
export function onGmailMessage(e: any) {
  return createHomePage();
}

/**
 * Placeholder Action Handlers
 */
export function onViewSettings(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Settings coming soon."))
    .build();
}

export function onCheckConnections(e: any) {
  const result = onVerifyInstallation(e);
  return result;
}

export function onAskQuestions(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Ask Mailbox coming soon."))
    .build();
}

/**
 * Navigation: Show SEM Deployment Page
 */
export function showSEMDeployment(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createSEMDeployPage(e)))
    .build();
}

/**
 * Navigation: Show Verify Deployment Page
 */
export function showVerifyDeployment(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentPage()))
    .build();
}

/**
 * Navigation: Handle Region Change
 */
export function onRegionChange(e: any) {
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
export function onOpenGCPRegistration(e: any) {
  return CardService.newActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink().setUrl("https://cloud.google.com/"))
    .build();
}

export function onOpenMongoDBRegistration(e: any) {
  return CardService.newActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink().setUrl("https://www.mongodb.com/cloud/atlas/register"))
    .build();
}

/**
 * Deployment: Cloud Shell Setup Handler
 */
export function onOpenCloudShellSetup(e: any) {
  const cloudShellUrl = `https://shell.cloud.google.com/cloudshell/editor?` +
    `cloudshell_git_repo=https://github.com/RPG-coder/rapid-agent-gmail-suites.git&` +
    `cloudshell_tutorial=tutorial.md`;
  
  return CardService.newActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink().setUrl(cloudShellUrl))
    .build();
}

/**
 * Verification Handlers: Get Agent Link
 */
export function onGetAgentLink(e: any) {
  const props = PropertiesService.getScriptProperties();
  const region = props.getProperty("GCP_REGION");
  
  if (!region || region === "none") {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Error: No region selected."))
      .build();
  }

  try {
    const projects = listUserProjects();
    if (projects.length === 0) {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Error: No projects found."))
        .build();
    }

    for (const project of projects) {
      const url = `https://run.googleapis.com/v2/projects/${project.projectId}/locations/${region}/services/smart-email-manager-agent`;
      const response = UrlFetchApp.fetch(url, {
        method: "get",
        headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true
      });

      if (response.getResponseCode() === 200) {
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
      .setNotification(CardService.newNotification().setText(`Agent not found in region ${region}.`))
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
export function showMongoSetupWizard(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createMongoSetupWizardPage()))
    .build();
}

/**
 * Phase 1: Initialize MongoDB Atlas Deployment
 */
export function onInitDBDeployment(e: any) {
  const publicKey = e.formInput.mongo_public_key;
  const private_key = e.formInput.mongo_private_key;
  const userEmail = Session.getActiveUser().getEmail();
  
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");

  if (!publicKey || !private_key) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Error: Both keys are required."))
      .build();
  }

  try {
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

    const response = UrlFetchApp.fetch(`${cloudRunUrl}/api/setup-db-init`, options);
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      props.setProperty("MONGODB_PROJECT_ID", result.mongo_project_id);
      props.setProperty("MONGODB_PASSWORD", result.db_pass);
      props.setProperty("MONGO_PUBLIC_KEY", publicKey);
      props.setProperty("MONGO_PRIVATE_KEY", private_key);
      props.setProperty("SETUP_STATUS", "DB_PROVISIONING");

      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Database setup initialized successfully!"))
        .setNavigation(CardService.newNavigation().updateCard(createMongoSetupWizardPage()))
        .build();
    } else {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Agent Error: " + (result.detail || "Init failed")))
        .build();
    }
  } catch (error) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("System Error: " + error.toString()))
      .build();
  }
}

/**
 * Phase 2: Build GCP Infrastructure (Vertex AI, Pub/Sub)
 */
export function onBuildGCPInfrastructure(e: any) {
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");
  
  const projectId = props.getProperty("GCP_PROJECT_ID") || "grah-2026";
  const mongoProjectId = props.getProperty("MONGODB_PROJECT_ID");
  const userEmail = Session.getActiveUser().getEmail();
  const gmailToken = ScriptApp.getOAuthToken();

  if (!mongoProjectId) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Error: MongoDB Project ID missing. Start over."))
      .build();
  }

  try {
    const url = `${cloudRunUrl}/api/setup-gcp-infra?` +
      `project_id=${encodeURIComponent(projectId)}&` +
      `mongo_project_id=${encodeURIComponent(mongoProjectId)}&` +
      `user_email=${encodeURIComponent(userEmail)}&` +
      `gmail_token=${encodeURIComponent(gmailToken)}`;

    const response = UrlFetchApp.fetch(url, { method: "post", muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      props.setProperty("AGENT_BUILDER_APP", result.agent_builder_app);
      props.setProperty("GCP_PUB_SUB_TOPIC", result.pubsub_topic);
      props.setProperty("MCP_ENDPOINT", `${cloudRunUrl}/mcp/call`);
      props.setProperty("SETUP_STATUS", "GCP_READY");

      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Vertex AI Environment Provisioned!"))
        .setNavigation(CardService.newNavigation().updateCard(createMongoSetupWizardPage()))
        .build();
    } else {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Agent Error: " + (result.detail || "GCP Setup failed")))
        .build();
    }
  } catch (error) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("System Error: " + error.toString()))
      .build();
  }
}

/**
 * Gmail: Setup Push Notifications via Backend Proxy
 */
export function verifySystem() {
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");
  const projectId = props.getProperty("GCP_PROJECT_ID") || "grah-2026";

  if (!cloudRunUrl) return "Error: Cloud Run URL missing. Please run Step 4 in tutorial.md.";

  try {
    const gmailToken = ScriptApp.getOAuthToken();
    const url = `${cloudRunUrl}/api/verify-system?gmail_token=${encodeURIComponent(gmailToken)}&project_id=${encodeURIComponent(projectId)}`;

    // Note: Apps Script URLFetchApp does not support custom timeout settings in the options object.
    // It has a hard limit (usually 60s), but we'll wrap the logic to handle errors better.
    const response = UrlFetchApp.fetch(url, { 
      method: "get", 
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const content = response.getContentText();

    if (responseCode === 200) {
      const result = JSON.parse(content);
      // Check for any warnings/errors in the stack
      const issues = Object.keys(result).filter(k => result[k].status !== "ok");
      
      if (issues.length === 0) {
        props.setProperty("SETUP_STATUS", "COMPLETED");
        return "✅ ALL SYSTEMS GREEN: Your agent is fully deployed and watching your inbox!";
      } else {
        let msg = "⚠️ Partial Setup:\n";
        issues.forEach(k => {
          msg += `- ${k.toUpperCase()}: ${result[k].message || "Check Logs"}\n`;
        });
        return msg;
      }
    } else {
      return `Backend Verification Error (${responseCode}): ${content.slice(0, 100)}`;
    }
  } catch (error) {
    const errorMsg = error.toString();
    if (errorMsg.includes("timeout") || errorMsg.includes("Deadline") || errorMsg.includes("Exceeded maximum execution time")) {
      return "⏱️ Verification Timeout: The backend is taking too long. Please check your Cloud Run logs for errors.";
    }
    return "Network Error: " + errorMsg;
  }
}

/**
 * Verification: Full system diagnostic
 */
export function onVerifyInstallation(e: any) {
  const result = verifySystem();
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(result))
    .setNavigation(CardService.newNavigation().updateCard(createVerifyDeploymentPage()))
    .build();
}

/**
 * Recovery: Reset the setup state
 */
export function onResetSetupState(e: any) {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty("SETUP_STATUS");
  props.deleteProperty("CLOUD_RUN_URL");
  
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Setup state reset."))
    .setNavigation(CardService.newNavigation().updateCard(createVerifyDeploymentPage()))
    .build();
}

// Assign global functions to the 'global' object for gas-webpack-plugin
declare var global: any;
var gasGlobal: any = typeof global !== 'undefined' ? global : this;
gasGlobal.onHomepage = onHomepage;
gasGlobal.onGmailMessage = onGmailMessage;
gasGlobal.onViewSettings = onViewSettings;
gasGlobal.onCheckConnections = onVerifyInstallation;
gasGlobal.onVerifyInstallation = onVerifyInstallation;
gasGlobal.onAskQuestions = onAskQuestions;
gasGlobal.showSEMDeployment = showSEMDeployment;
gasGlobal.showVerifyDeployment = showVerifyDeployment;
gasGlobal.onRegionChange = onRegionChange;
gasGlobal.onOpenGCPRegistration = onOpenGCPRegistration;
gasGlobal.onOpenMongoDBRegistration = onOpenMongoDBRegistration;
gasGlobal.onOpenCloudShellSetup = onOpenCloudShellSetup;
gasGlobal.onGetAgentLink = onGetAgentLink;
gasGlobal.onResetSetupState = onResetSetupState;
