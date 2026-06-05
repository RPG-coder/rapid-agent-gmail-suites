import { createPage } from '../atoms/page';
import { getCloudRunUrl } from '../index';

/**
 * Page: AI & Logic Tuning
 * Granular settings for AI behavior.
 */
export function createAITuningSettingsPage() {
  const props = PropertiesService.getScriptProperties();

  // Load from local cache (optimistic UI) or defaults
  const currentSettings = {
    "MAX_SEMANTIC_LABELS": props.getProperty("SETTING_MAX_LABELS") || "5",
    "DEFAULT_SIMILARITY_THRESHOLD": props.getProperty("SETTING_SIM_THRESHOLD") || "0.85",
    "REORG_COOLDOWN_HOURS": props.getProperty("SETTING_REORG_COOLDOWN") || "1",
    "BACKLOG_THRESHOLD": props.getProperty("SETTING_BACKLOG_THRESHOLD") || "15",
    "LAST_SYNC": props.getProperty("SETTING_LAST_SYNC") || "Never"
  };

  const sections = [];
  const configSection = CardService.newCardSection().setHeader("AI Configurations");

  // Max Labels
  configSection.addWidget(CardService.newTextParagraph().setText("<b>Max Labels</b><br/><small>Max gmail labels to be generated.</small>"));
  configSection.addWidget(CardService.newTextInput()
    .setFieldName("max_labels")
    .setTitle("Limit")
    .setValue(currentSettings.MAX_SEMANTIC_LABELS));

  // Similarity Threshold
  configSection.addWidget(CardService.newTextParagraph().setText("<b>Similarity Threshold</b><br/><small>Higher = more accurate but strict.</small>"));
  configSection.addWidget(CardService.newTextInput()
    .setFieldName("sim_threshold")
    .setTitle("Threshold (e.g. 0.85)")
    .setValue(currentSettings.DEFAULT_SIMILARITY_THRESHOLD));

  // Reorg Cooldown
  configSection.addWidget(CardService.newTextParagraph().setText("<b>Reorg Cooldown (Hours)</b><br/><small>Speed limit for label changes.</small>"));
  configSection.addWidget(CardService.newTextInput()
    .setFieldName("reorg_cooldown")
    .setTitle("Hours")
    .setValue(currentSettings.REORG_COOLDOWN_HOURS));

  // Backlog Threshold
  configSection.addWidget(CardService.newTextParagraph().setText("<b>Backlog Threshold</b><br/><small>Min emails before new label.</small>"));
  configSection.addWidget(CardService.newTextInput()
    .setFieldName("backlog_threshold")
    .setTitle("Count")
    .setValue(currentSettings.BACKLOG_THRESHOLD));

  configSection.addWidget(CardService.newTextButton()
    .setText("Save AI Settings")
    .setOnClickAction(CardService.newAction().setFunctionName("onSaveSettings"))
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED));

  sections.push(configSection);

  // Advanced Sync Section
  const syncSection = CardService.newCardSection().setHeader("Cloud Sync");
  syncSection.addWidget(CardService.newTextParagraph().setText(`<small>Last synced from cloud: ${currentSettings.LAST_SYNC}</small>`));
  syncSection.addWidget(CardService.newTextButton()
    .setText("Fetch Latest from Cloud")
    .setOnClickAction(CardService.newAction().setFunctionName("onFetchLatestSettings")));
  
  sections.push(syncSection);

  return createPage(
    "AITuningPage",
    "AI Tuning",
    "Settings / AI Logic",
    "Fine-tune the responsiveness of your agent. Changes are cached locally for speed.",
    sections
  );
}
