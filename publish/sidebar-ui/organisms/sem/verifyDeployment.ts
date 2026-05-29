import { createPage } from '../../atoms/page';
import { createButtonGroupSection } from '../../atoms/buttonGroupSection';

/**
 * Organism: Verify Deployment Page
 * Refactored to be the "Master Installer Dashboard".
 */
export function createVerifyDeploymentPage() {
  const props = PropertiesService.getScriptProperties();
  const projectId = props.getProperty("GCP_PROJECT_ID");
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");
  const isFound = !!(projectId && cloudRunUrl);
  const setupStatus = props.getProperty("SETUP_STATUS");

  const sections = [];

  // --- 1. Step: Identify Backend ---
  const identitySection = CardService.newCardSection()
    .setHeader("Step 1: Identify Backend");

  if (isFound) {
    identitySection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel("Status")
        .setText("✅ Backend Linked")
        .setBottomLabel(`Project: ${projectId}`)
    );
    identitySection.addWidget(
      CardService.newTextButton()
        .setText("Re-detect Backend")
        .setOnClickAction(CardService.newAction().setFunctionName("onGetAgentLink"))
    );
  } else {
    identitySection.addWidget(
      CardService.newTextParagraph().setText("Link your Gmail to your deployed Cloud Run service.")
    );
    identitySection.addWidget(
      CardService.newTextButton()
        .setText("Detect Agent Link")
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor("#4285F4")
        .setOnClickAction(CardService.newAction().setFunctionName("onGetAgentLink"))
    );
  }
  sections.push(identitySection);

  // --- 2. Step: Verify Installation ---
  if (isFound) {
    const verifySection = CardService.newCardSection()
      .setHeader("Step 2: Verify & Finish");

    if (setupStatus === "COMPLETED") {
       verifySection.addWidget(
         CardService.newDecoratedText()
           .setText("🎉 SYSTEM ACTIVE")
           .setBottomLabel("Your agent is watching your inbox.")
       );
    } else {
       verifySection.addWidget(
         CardService.newTextParagraph().setText("Once you finish the tutorial steps, click verify below.")
       );
    }

    verifySection.addWidget(
      CardService.newTextButton()
        .setText("Verify Installation")
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor("#34A853")
        .setOnClickAction(CardService.newAction().setFunctionName("onVerifyInstallation"))
    );
    sections.push(verifySection);
  }

  // --- Reset Section ---
  const resetSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextButton()
        .setText("Reset Setup State")
        .setOnClickAction(CardService.newAction().setFunctionName("onResetSetupState"))
    );
  sections.push(resetSection);

  return createPage(
    "VERIFY_DEPLOYMENT_PAGE",
    "Setup Dashboard",
    "Smart Email Manager / Setup",
    "Follow the 3 steps below",
    sections
  );
}
