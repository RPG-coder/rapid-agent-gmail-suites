import { createHomePage } from './pages/homePage';
import { createSEMDeployPage } from './organisms/sem/semDeploy';
import { createVerifyDeploymentPage } from './organisms/sem/verifyDeployment';
import { createMongoSetupWizardPage } from './organisms/sem/mongoSetupWizard';
import { createSettingsPage } from './pages/settingsPage';
import { createWorkflowSettingsPage } from './pages/workflowSettingsPage';
import { createAITuningSettingsPage } from './pages/aiTuningSettingsPage';
import { listUserProjects } from './utils/gcpScanner';
import { createSelfHealingActionsSection, createHITLFormPage } from './organisms/sam/selfHealingActions';
import { createSmartEmailManagerHomeSection } from './organisms/sem/smartEmailManagerHome';

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
  const messageId = e.gmail.messageId;
  const cloudRunUrl = getCloudRunUrl();
  const userEmail = Session.getActiveUser().getEmail();

  // 1. Lifecycle Tracking: Record "First Read" or Access
  try {
    UrlFetchApp.fetch(`${cloudRunUrl}/mcp/call`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        tool: "update_email_lifecycle",
        arguments: { message_id: messageId, action: "read" }
      }),
      muteHttpExceptions: true
    });
  } catch (err) {
    console.error("Lifecycle Tracking Error:", err);
  }

  // 2. Build Home Page with Self-Healing Actions
  const cardBuilder = CardService.newCardBuilder()
    .setName("MESSAGE_VIEW")
    .setHeader(CardService.newCardHeader().setTitle("Email Insights & Actions"));

  // Add the self-healing actions as a top section
  cardBuilder.addSection(createSelfHealingActionsSection(messageId));
  
  // Mix in parts of the home page for context
  cardBuilder.addSection(createSmartEmailManagerHomeSection());

  return cardBuilder.build();
}

/**
 * Action: Show HITL Reason Form
 */
export function onShowHITLForm(e: any) {
  const messageId = e.parameters.messageId;
  const action = e.parameters.action;
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createHITLFormPage(messageId, action)))
    .build();
}

/**
 * Action: Submit HITL Feedback to SAM Backend
 */
export function onSubmitHITL(e: any) {
  const messageId = e.parameters.messageId;
  const action = e.parameters.action;
  const reason = e.formInput.reason || "";
  const cloudRunUrl = getCloudRunUrl();
  const userEmail = Session.getActiveUser().getEmail();

  try {
    // 1. Call SAM Backend to Learn
    UrlFetchApp.fetch(`${cloudRunUrl}/mcp/call`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        tool: "report_hitl_action",
        arguments: { 
          user_id: userEmail, 
          message_id: messageId, 
          action: action, 
          reason: reason 
        }
      }),
      muteHttpExceptions: true
    });

    // 2. Perform actual Gmail action
    if (action === "archive") {
      GmailApp.getMessageById(messageId).getThread().moveToArchive();
    } else if (action === "delete") {
      GmailApp.getMessageById(messageId).getThread().moveToTrash();
    }

    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText(`✅ ${action.toUpperCase()} complete. Agent has learned your preference.`))
      .setNavigation(CardService.newNavigation().popCard())
      .build();

  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("⚠️ Feedback recorded, but Gmail action failed: " + err.toString()))
      .build();
  }
}

/**
 * Placeholder Action Handlers
 */
export function onViewSettings(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createSettingsPage()))
    .build();
}

/**
 * Navigation: Show Sub-Settings Pages
 */
export function onShowWorkflowSettings(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createWorkflowSettingsPage()))
    .build();
}

export function onShowAITuningSettings(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createAITuningSettingsPage()))
    .build();
}

/**
 * Action: Save Smart Email Manager Configurations
 */
export function onSaveSettings(e: any) {
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = getCloudRunUrl();
  const userEmail = Session.getActiveUser().getEmail();
  
  const settings: any = {};
  
  if (e.formInput.auto_sync !== undefined) {
    settings["AUTO_SYNC_NEW_EMAILS"] = e.formInput.auto_sync === "true";
  }
  if (e.formInput.max_labels !== undefined) {
    settings["MAX_SEMANTIC_LABELS"] = parseInt(e.formInput.max_labels);
    props.setProperty("SETTING_MAX_LABELS", e.formInput.max_labels);
  }
  if (e.formInput.sim_threshold !== undefined) {
    settings["DEFAULT_SIMILARITY_THRESHOLD"] = parseFloat(e.formInput.sim_threshold);
    props.setProperty("SETTING_SIM_THRESHOLD", e.formInput.sim_threshold);
  }
  if (e.formInput.reorg_cooldown !== undefined) {
    settings["REORG_COOLDOWN_HOURS"] = parseFloat(e.formInput.reorg_cooldown);
    props.setProperty("SETTING_REORG_COOLDOWN", e.formInput.reorg_cooldown);
  }
  if (e.formInput.backlog_threshold !== undefined) {
    settings["BACKLOG_THRESHOLD"] = parseInt(e.formInput.backlog_threshold);
    props.setProperty("SETTING_BACKLOG_THRESHOLD", e.formInput.backlog_threshold);
  }

  try {
    const response = UrlFetchApp.fetch(`${cloudRunUrl}/api/settings`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        user_email: userEmail,
        settings: settings
      }),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      props.setProperty("SETTING_LAST_SYNC", new Date().toLocaleString());
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("✅ Saved & Synced!"))
        .build();
    } else {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("⚠️ Cached locally, but backend update failed. Check logs."))
        .build();
    }
  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("⚠️ Cached locally. (Cloud Sync Offline)"))
      .build();
  }
}

/**
 * Action: Explicitly fetch latest settings from backend
 */
export function onFetchLatestSettings(e: any) {
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = getCloudRunUrl();
  const userEmail = Session.getActiveUser().getEmail();

  try {
    const response = UrlFetchApp.fetch(`${cloudRunUrl}/api/settings?user_email=${encodeURIComponent(userEmail)}`, {
      method: "get",
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      const s = JSON.parse(response.getContentText());
      if (s.MAX_SEMANTIC_LABELS) props.setProperty("SETTING_MAX_LABELS", s.MAX_SEMANTIC_LABELS.toString());
      if (s.DEFAULT_SIMILARITY_THRESHOLD) props.setProperty("SETTING_SIM_THRESHOLD", s.DEFAULT_SIMILARITY_THRESHOLD.toString());
      if (s.REORG_COOLDOWN_HOURS) props.setProperty("SETTING_REORG_COOLDOWN", s.REORG_COOLDOWN_HOURS.toString());
      if (s.BACKLOG_THRESHOLD) props.setProperty("SETTING_BACKLOG_THRESHOLD", s.BACKLOG_THRESHOLD.toString());
      
      props.setProperty("SETTING_LAST_SYNC", new Date().toLocaleString());

      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("🔄 Settings updated from cloud!"))
        .setNavigation(CardService.newNavigation().updateCard(createAITuningSettingsPage()))
        .build();
    } else {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("❌ Sync Failed: Backend busy or unreachable."))
        .build();
    }
  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("⚠️ Connection Error: " + err.toString()))
      .build();
  }
}

/**
 * Action: Trigger Manual Historical Sync
 */
export function onManualSync(e: any) {
  const cloudRunUrl = getCloudRunUrl();
  const userEmail = Session.getActiveUser().getEmail();
  const lookback = parseInt(e.formInput.sync_range || "30");

  try {
    const response = UrlFetchApp.fetch(`${cloudRunUrl}/api/sync-historical`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        user_email: userEmail,
        lookback_days: lookback
      }),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      const timestamp = new Date().toLocaleString();
      PropertiesService.getScriptProperties().setProperty("LAST_SYNC_TIMESTAMP", timestamp);
      
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText(`🚀 Sync triggered for last ${lookback} days!`))
        .setNavigation(CardService.newNavigation().updateCard(createSettingsPage()))
        .build();
    } else {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("❌ Sync Failed: " + response.getContentText()))
        .build();
    }
  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("⚠️ Connection Error: " + err.toString()))
      .build();
  }
}

export function onCheckConnections(e: any) {
  return onVerifyInstallation(e);
}

export function onAskQuestions(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Ask Mailbox coming soon."))
    .build();
}

/**
 * Navigation Handlers
 */
export function showSEMDeployment(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createSEMDeployPage(e)))
    .build();
}

export function showVerifyDeployment(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentPage()))
    .build();
}

export function onRegionChange(e: any) {
  const region = e.formInput.deployment_region;
  if (region && region !== "none") {
    PropertiesService.getScriptProperties().setProperty("CHOSEN_REGION", region);
  }
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(createSEMDeployPage(e)))
    .build();
}

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

export function onOpenCloudShellSetup(e: any) {
  const cloudShellUrl = `https://shell.cloud.google.com/cloudshell/editor?` +
    `cloudshell_git_repo=https://github.com/RPG-coder/rapid-agent-gmail-suites.git&` +
    `cloudshell_tutorial=smart-email-manager-tutorial.md`;

  return CardService.newActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink().setUrl(cloudShellUrl))
    .build();
}

export function onGetAgentLink(e: any) {
  const props = PropertiesService.getScriptProperties();
  const region = props.getProperty("CHOSEN_REGION");
  if (!region || region === "none") {
    return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Error: No region selected.")).build();
  }
  try {
    const projects = listUserProjects();
    if (projects.length === 0) return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Error: No projects found.")).build();
    for (const project of projects) {
      const url = `https://run.googleapis.com/v2/projects/${project.projectId}/locations/${region}/services/smart-email-manager-agent`;
      const response = UrlFetchApp.fetch(url, { method: "get", headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
      if (response.getResponseCode() === 200) {
        const service = JSON.parse(response.getContentText());
        props.setProperty("CLOUD_RUN_URL", service.uri);
        props.setProperty("GCP_PROJECT_ID", project.projectId);
        return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Success: Agent link retrieved!")).setNavigation(CardService.newNavigation().updateCard(createVerifyDeploymentPage())).build();
      }
    }
    return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText(`Agent not found in region ${region}.`)).build();
  } catch (error) {
    return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("System Error: " + error.toString())).build();
  }
}

export function showMongoSetupWizard(e: any) {
  return CardService.newActionResponseBuilder().setNavigation(CardService.newNavigation().pushCard(createMongoSetupWizardPage())).build();
}

export function onInitDBDeployment(e: any) {
  const publicKey = e.formInput.mongo_public_key;
  const private_key = e.formInput.mongo_private_key;
  const userEmail = Session.getActiveUser().getEmail();
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");
  if (!publicKey || !private_key) return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Error: Both keys are required.")).build();
  try {
    const payload = { "mongo_public_key": publicKey, "mongo_private_key": private_key, "user_email": userEmail, "gmail_token": ScriptApp.getOAuthToken() };
    const response = UrlFetchApp.fetch(`${cloudRunUrl}/api/setup-db-init`, { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true });
    const result = JSON.parse(response.getContentText());
    if (response.getResponseCode() === 200) {
      props.setProperties({ "MONGODB_PROJECT_ID": result.mongo_project_id, "MONGODB_PASSWORD": result.db_pass, "MONGO_PUBLIC_KEY": publicKey, "MONGO_PRIVATE_KEY": private_key, "SETUP_STATUS": "DB_PROVISIONING" });
      return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Database setup initialized successfully!")).setNavigation(CardService.newNavigation().updateCard(createMongoSetupWizardPage())).build();
    }
    return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Agent Error: " + (result.detail || "Init failed"))).build();
  } catch (error) { return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("System Error: " + error.toString())).build(); }
}

export function onBuildGCPInfrastructure(e: any) {
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");
  const projectId = props.getProperty("GCP_PROJECT_ID") || "grah-2026";
  const mongoProjectId = props.getProperty("MONGODB_PROJECT_ID");
  const userEmail = Session.getActiveUser().getEmail();
  if (!mongoProjectId) return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Error: MongoDB Project ID missing.")).build();
  try {
    const url = `${cloudRunUrl}/api/setup-gcp-infra?project_id=${encodeURIComponent(projectId)}&mongo_project_id=${encodeURIComponent(mongoProjectId)}&user_email=${encodeURIComponent(userEmail)}&gmail_token=${encodeURIComponent(ScriptApp.getOAuthToken())}`;
    const response = UrlFetchApp.fetch(url, { method: "post", muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());
    if (response.getResponseCode() === 200) {
      props.setProperties({ "AGENT_BUILDER_APP": result.agent_builder_app, "GCP_PUB_SUB_TOPIC": result.pubsub_topic, "MCP_ENDPOINT": `${cloudRunUrl}/mcp/call`, "SETUP_STATUS": "GCP_READY" });
      return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Vertex AI Environment Provisioned!")).setNavigation(CardService.newNavigation().updateCard(createMongoSetupWizardPage())).build();
    }
    return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Agent Error: " + (result.detail || "GCP Setup failed"))).build();
  } catch (error) { return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("System Error: " + error.toString())).build(); }
}

export function verifySystem() {
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");
  const projectId = props.getProperty("GCP_PROJECT_ID") || "grah-2026";
  if (!cloudRunUrl) return "Error: Cloud Run URL missing.";
  try {
    const url = `${cloudRunUrl}/api/verify-system?gmail_token=${encodeURIComponent(ScriptApp.getOAuthToken())}&project_id=${encodeURIComponent(projectId)}`;
    const response = UrlFetchApp.fetch(url, { method: "get", muteHttpExceptions: true });
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      const issues = Object.keys(result).filter(k => result[k].status !== "ok");
      if (issues.length === 0) { props.setProperty("SETUP_STATUS", "COMPLETED"); return "✅ ALL SYSTEMS GREEN!"; }
      return "⚠️ Partial Setup: " + issues.join(", ");
    }
    return "Backend Verification Error: " + response.getResponseCode();
  } catch (error) { return "Network Error: " + error.toString(); }
}

/**
 * Action: Trigger the Weekly Intelligence Report
 */
export function onTriggerWeeklyReport(e: any) {
  const cloudRunUrl = getCloudRunUrl();
  const userEmail = Session.getActiveUser().getEmail();

  try {
    const response = UrlFetchApp.fetch(`${cloudRunUrl}/mcp/call`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        tool: "generate_weekly_summary",
        arguments: { user_id: userEmail }
      }),
      muteHttpExceptions: true
    });

    const report = response.getContentText();

    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(
        CardService.newCardBuilder()
          .setHeader(CardService.newCardHeader().setTitle("Weekly Intelligence Report"))
          .addSection(CardService.newCardSection().addWidget(CardService.newTextParagraph().setText(report)))
          .build()
      ))
      .build();

  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("⚠️ Failed to generate report: " + err.toString()))
      .build();
  }
}

export function onVerifyInstallation(e: any) {
  const result = verifySystem();
  return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText(result)).setNavigation(CardService.newNavigation().updateCard(createVerifyDeploymentPage())).build();
}

/**
 * Diagnostic logic for the SAM agent.
 */
export function verifySAMSystem() {
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = getCloudRunUrl();
  // Derive SAM URL if not explicitly set
  const samUrl = cloudRunUrl.replace("smart-email-manager-agent", "self-arizeing-manager-agent");
  const projectId = props.getProperty("GCP_PROJECT_ID") || "grah-2026";

  try {
    const url = `${samUrl}/api/verify-sam?project_id=${encodeURIComponent(projectId)}`;
    const response = UrlFetchApp.fetch(url, { method: "get", muteHttpExceptions: true });
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      const issues = Object.keys(result).filter(k => result[k].status !== "ok");
      if (issues.length === 0) return "✅ SAM AGENT: ALL SYSTEMS GREEN!";
      return "⚠️ SAM Partial Setup: " + issues.join(", ");
    }
    return "SAM Backend Verification Error: " + response.getResponseCode();
  } catch (error) { return "SAM Network Error: " + error.toString(); }
}

export function onCheckSAMConnections(e: any) {
  const result = verifySAMSystem();
  return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText(result)).build();
}

export function onResetSetupState(e: any) {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty("SETUP_STATUS");
  props.deleteProperty("CLOUD_RUN_URL");
  return CardService.newActionResponseBuilder().setNotification(CardService.newNotification().setText("Setup state reset.")).setNavigation(CardService.newNavigation().updateCard(createVerifyDeploymentPage())).build();
}

// Global Exports for gas-webpack-plugin
declare var global: any;
var gasGlobal: any = typeof global !== 'undefined' ? global : this;
gasGlobal.onHomepage = onHomepage;
gasGlobal.onGmailMessage = onGmailMessage;
gasGlobal.onViewSettings = onViewSettings;
gasGlobal.onShowWorkflowSettings = onShowWorkflowSettings;
gasGlobal.onShowAITuningSettings = onShowAITuningSettings;
gasGlobal.onSaveSettings = onSaveSettings;
gasGlobal.onManualSync = onManualSync;
gasGlobal.onCheckConnections = onCheckConnections;
gasGlobal.onCheckSAMConnections = onCheckSAMConnections;
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
gasGlobal.onShowHITLForm = onShowHITLForm;
gasGlobal.onSubmitHITL = onSubmitHITL;
gasGlobal.onTriggerWeeklyReport = onTriggerWeeklyReport;
gasGlobal.showMongoSetupWizard = showMongoSetupWizard;
gasGlobal.onInitDBDeployment = onInitDBDeployment;
gasGlobal.onBuildGCPInfrastructure = onBuildGCPInfrastructure;
