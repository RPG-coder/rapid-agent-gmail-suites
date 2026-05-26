/**
 * Organism: MongoDB Setup Wizard
 * Renders a step-by-step form to capture MongoDB API keys.
 */
function createMongoSetupWizardPage() {
  const sections = [];

  // --- Step 1: Instructions ---
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

  // --- Step 2: Input Keys ---
  const inputSection = CardService.newCardSection()
    .setHeader("Step 2: Enter Credentials")
    .addWidget(
      CardService.newTextInput()
        .setFieldName("mongo_public_key")
        .setTitle("Public Key")
        .setHint("Example: abcdefgh")
    )
    .addWidget(
      CardService.newTextInput()
        .setFieldName("mongo_private_key")
        .setTitle("Private Key")
        .setHint("Example: 12345678-abcd-1234-abcd-1234567890ab")
    )
    .addWidget(
      CardService.newTextButton()
        .setText("Connect & Auto-Provision Database")
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor("#0F9D58")
        .setOnClickAction(CardService.newAction().setFunctionName("onConnectMongoDB"))
    );

  sections.push(inputSection);

  return createPage(
    "MONGO_SETUP_WIZARD",
    "Configure MongoDB",
    "Smart Email Manager / MongoDB Setup",
    "Follow these steps to link your MongoDB account.",
    sections
  );
}
