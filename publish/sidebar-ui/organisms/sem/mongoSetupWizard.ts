import { createPage } from '../../atoms/page';

/**
 * Organism: MongoDB Setup Wizard
 * Renders a step-by-step form to capture MongoDB API keys.
 */
export function createMongoSetupWizardPage() {
  const sections = [];
  const props = PropertiesService.getScriptProperties();
  const setupStatus = props.getProperty("SETUP_STATUS") || "START"; // START, DB_PROVISIONING, GCP_READY

  // --- Step 1: Instructions (Always show unless completed) ---
  const instructionSection = CardService.newCardSection()
    .setHeader("Step 1: Create API Keys")
    .addWidget(
      CardService.newTextParagraph().setText(
        "To allow the agent to manage your database, you need to provide an Organization API Key."
      )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        "1. Click the button below to go to your MongoDB Organization Access Manager.<br/>" +
        "2. Click <b>'Create API Key'</b>.<br/>" +
        "3. Label it <b>'RapidAgent'</b>.<br/>" +
        "4. Select <b>'Organization Project Creator'</b> permissions.<br/>" +
        "5. Copy the Public and Private keys."
      )
    )
    .addWidget(
      CardService.newTextButton()
        .setText("Open MongoDB Access Manager")
        .setOpenLink(
          CardService.newOpenLink().setUrl("https://cloud.mongodb.com/v2#/preferences/organizations")
        )
    );
  
  sections.push(instructionSection);

  // --- Progress / Action Section ---
  const actionSection = CardService.newCardSection().setHeader("Setup Progress");
  const buttonSet = CardService.newButtonSet();

  if (setupStatus === "START") {
    actionSection.addWidget(
      CardService.newTextInput()
        .setFieldName("mongo_public_key")
        .setTitle("Public Key")
        .setHint("Example: abcdefgh")
    );
    actionSection.addWidget(
      CardService.newTextInput()
        .setFieldName("mongo_private_key")
        .setTitle("Private Key")
        .setHint("Example: 12345678-abcd-1234-abcd-1234567890ab")
    );

    const connectButton = CardService.newTextButton()
      .setText("1. Provision Database Cluster")
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setBackgroundColor("#0F9D58")
      .setOnClickAction(CardService.newAction().setFunctionName("onInitDBDeployment"));
    buttonSet.addButton(connectButton);
  } 
  
  else if (setupStatus === "DB_PROVISIONING") {
    actionSection.addWidget(CardService.newTextParagraph().setText(
      '<font color="#F4B400"><b>Step 1 Complete:</b> Database cluster is spinning up in Atlas cloud.</font>'
    ));
    
    const gcpButton = CardService.newTextButton()
      .setText("2. Provision Vertex AI Agent Environment")
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setBackgroundColor("#4285F4")
      .setOnClickAction(CardService.newAction().setFunctionName("onBuildGCPInfrastructure"));
    buttonSet.addButton(gcpButton);
  } 
  
  else if (setupStatus === "GCP_READY") {
    actionSection.addWidget(CardService.newTextParagraph().setText(
      '<font color="#0F9D58"><b>Step 2 Complete:</b> Vertex AI Platform & Pub/Sub elements active.</font><br>' +
      '<font color="#4285F4">Awaiting final database availability confirmation...</font>'
    ));

    const verifyButton = CardService.newTextButton()
      .setText("3. Verify & Finalize Application Sync")
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setBackgroundColor("#9C27B0")
      .setOnClickAction(CardService.newAction().setFunctionName("onVerifyDB"));
    buttonSet.addButton(verifyButton);
  }

  actionSection.addWidget(buttonSet);
  sections.push(actionSection);

  return createPage(
    "MONGO_SETUP_WIZARD",
    "Configure MongoDB",
    "Smart Email Manager / MongoDB Setup",
    "Follow the phases below to provision your environment.",
    sections
  );
}
