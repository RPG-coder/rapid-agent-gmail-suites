import { createPage } from '../atoms/page';
import { getCloudRunUrl } from '../index';

/**
 * Page: Workflow & Connectivity
 * Settings for synchronization and backend status.
 */
export function createWorkflowSettingsPage() {
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = getCloudRunUrl();
  const userEmail = Session.getActiveUser().getEmail();

  let currentSettings = {
    "AUTO_SYNC_NEW_EMAILS": true
  };

  try {
    const response = UrlFetchApp.fetch(`${cloudRunUrl}/api/settings?user_email=${encodeURIComponent(userEmail)}`, {
      method: "get",
      muteHttpExceptions: true
    });
    if (response.getResponseCode() === 200) {
      const allSettings = JSON.parse(response.getContentText());
      currentSettings = { ...currentSettings, ...allSettings };
    }
  } catch (e) {
    console.error("Failed to fetch settings: " + e.toString());
  }

  const sections = [];

  // --- AUTOMATED WORKFLOWS ---
  const autoSection = CardService.newCardSection()
    .setHeader("Automated Workflows")
    .addWidget(CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.CHECK_BOX)
      .setFieldName("auto_sync")
      .addItem("Auto-sync new emails", "true", currentSettings.AUTO_SYNC_NEW_EMAILS))
    .addWidget(CardService.newTextButton()
      .setText("Save Workflow")
      .setOnClickAction(CardService.newAction().setFunctionName("onSaveSettings"))
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED));
  sections.push(autoSection);

  // --- MANUAL WORKFLOWS ---
  const lastSync = props.getProperty("LAST_SYNC_TIMESTAMP") || "Never";

  const manualSection = CardService.newCardSection()
    .setHeader("Tools & Diagnostics")
    .addWidget(CardService.newTextButton()
      .setText("Check Connection")
      .setOnClickAction(CardService.newAction().setFunctionName("onCheckConnections")))
    .addWidget(CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.DROPDOWN)
      .setTitle("Lookback Range")
      .setFieldName("sync_range")
      .addItem("Last 30 days", "30", true)
      .addItem("Last 60 days", "60", false)
      .addItem("Last 90 days", "90", false))
    .addWidget(CardService.newTextButton()
      .setText("Sync to MongoDB")
      .setOnClickAction(CardService.newAction().setFunctionName("onManualSync")))
    .addWidget(CardService.newTextParagraph().setText(`<font color="#666666"><small>Last Sync: ${lastSync}</small></font>`));
  sections.push(manualSection);

  return createPage(
    "WorkflowPage",
    "Workflow Settings",
    "Settings / Workflow",
    "Manage your connectivity and automation behaviors.",
    sections
  );
}
