import { createPage } from '../atoms/page';
import { createButtonGroupSection } from '../atoms/buttonGroupSection';

/**
 * Page: Smart Email Manager Settings (Menu)
 * Main entry point for granular configuration categories.
 */
export function createSettingsPage() {
  const sections = [];

  // --- Category: Workflow & Connectivity ---
  sections.push(
    createButtonGroupSection(
      "Workflow & Sync",
      "Manage how your emails are synchronized and verify your backend connection.",
      [
        { text: "Open Workflow Settings", functionName: "onShowWorkflowSettings", style: CardService.TextButtonStyle.FILLED, color: "#4285F4" }
      ]
    )
  );

  // --- Category: AI Tuning ---
  sections.push(
    createButtonGroupSection(
      "AI & Logic Tuning",
      "Adjust classification thresholds, label limits, and reorganization speeds.",
      [
        { text: "Open AI Tuning", functionName: "onShowAITuningSettings", style: CardService.TextButtonStyle.FILLED, color: "#9C27B0" }
      ]
    )
  );

  return createPage(
    "SettingsPageMenu",
    "Rapid Agent Gmail Suite",
    "Smart Email Manager / Settings",
    "Select a category to customize your agent's behavior.",
    sections
  );
}
