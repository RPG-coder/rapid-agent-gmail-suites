import { createPage } from '../atoms/page';
import { getCloudRunUrl } from '../index';

/**
 * Page: AI & Logic Tuning
 * Granular settings for AI behavior.
 */
export function createAITuningSettingsPage() {
  const cloudRunUrl = getCloudRunUrl();
  const userEmail = Session.getActiveUser().getEmail();

  // Default fallback settings
  let currentSettings = {
    "MAX_SEMANTIC_LABELS": 5,
    "REORG_COOLDOWN_HOURS": 1,
    "BACKLOG_THRESHOLD": 15,
    "DEFAULT_SIMILARITY_THRESHOLD": 0.85,
    "ADAPTIVE_THRESHOLD_HYSTERESIS": 0.85,
    "BATCH_CLASSIFICATION_FREQUENCY": 10
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
  const configSection = CardService.newCardSection().setHeader("AI Configurations");

  // Max Labels
  configSection.addWidget(CardService.newTextParagraph().setText("<b>Max Labels</b><br/><small>Max gmail labels to be generated.</small>"));
  configSection.addWidget(CardService.newTextInput()
    .setFieldName("max_labels")
    .setTitle("Limit")
    .setValue(currentSettings.MAX_SEMANTIC_LABELS.toString()));

  // Similarity Threshold
  configSection.addWidget(CardService.newTextParagraph().setText("<b>Similarity Threshold</b><br/><small>Higher = more accurate but strict.</small>"));
  configSection.addWidget(CardService.newTextInput()
    .setFieldName("sim_threshold")
    .setTitle("Threshold (e.g. 0.85)")
    .setValue(currentSettings.DEFAULT_SIMILARITY_THRESHOLD.toString()));

  // Reorg Cooldown
  configSection.addWidget(CardService.newTextParagraph().setText("<b>Reorg Cooldown (Hours)</b><br/><small>Speed limit for label changes.</small>"));
  configSection.addWidget(CardService.newTextInput()
    .setFieldName("reorg_cooldown")
    .setTitle("Hours")
    .setValue(currentSettings.REORG_COOLDOWN_HOURS.toString()));

  // Backlog Threshold
  configSection.addWidget(CardService.newTextParagraph().setText("<b>Backlog Threshold</b><br/><small>Min emails before new label.</small>"));
  configSection.addWidget(CardService.newTextInput()
    .setFieldName("backlog_threshold")
    .setTitle("Count")
    .setValue(currentSettings.BACKLOG_THRESHOLD.toString()));

  configSection.addWidget(CardService.newTextButton()
    .setText("Save AI Settings")
    .setOnClickAction(CardService.newAction().setFunctionName("onSaveSettings"))
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED));

  sections.push(configSection);

  return createPage(
    "AITuningPage",
    "AI Tuning",
    "Settings / AI Logic",
    "Fine-tune the intelligence and responsiveness of your agent.",
    sections
  );
}
