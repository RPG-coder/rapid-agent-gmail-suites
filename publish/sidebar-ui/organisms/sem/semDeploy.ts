/**
 * Organism: SEM Deploy Page
 * Renders the deployment page for Smart Email Manager.
 */
function createSEMDeployPage(e?: any) {
  const sections = [];
  const selectedRegion = e?.formInput?.deployment_region;
  
  // Use plain email to avoid base64 decoding issues in terminal
  const setupToken = Session.getActiveUser().getEmail();

  // --- Step 1: Prerequisite ---
  sections.push(
    createButtonGroupSection(
      "Step 1: Prerequisite",
      "Before starting the deploy process, ensure you have accounts on the platforms below. <b>Note:</b> You will need a new GCP project with an active billing account.",
      [
        { text: "Create a GCP account", functionName: "onOpenGCPRegistration" },
        { text: "Create a MongoDB account", functionName: "onOpenMongoDBRegistration" }
      ]
    )
  );

  // --- Step 2: Deploy to GCP ---
  const step2Section = CardService.newCardSection()
    .setHeader("Step 2: Deploy to GCP")
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#70757A"><small>Deploy the agent on GCP. Select your preferred region for the deployment.</small></font>'
      )
    );

  // Dropdown for Region
  const regionDropdown = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Select Region")
    .setFieldName("deployment_region")
    .addItem("Select a region...", "none", !selectedRegion)
    .addItem("US Central (Iowa)", "us-central1", selectedRegion === "us-central1")
    .addItem("US East (S. Carolina)", "us-east1", selectedRegion === "us-east1")
    .addItem("Europe West (Belgium)", "europe-west1", selectedRegion === "europe-west1")
    .addItem("Asia East (Taiwan)", "asia-east1", selectedRegion === "asia-east1")
    .addItem("Australia Southeast (Sydney)", "australia-southeast1", selectedRegion === "australia-southeast1")
    .setOnChangeAction(
      CardService.newAction()
        .setFunctionName("onRegionChange")
        .setParameters({ setupToken: setupToken })
    );

  step2Section.addWidget(regionDropdown);

  // Dynamic Command Box (Lazy Loaded on Region Selection)
  if (selectedRegion && selectedRegion !== "none") {
    const command = `export CHOSEN_REGION="${selectedRegion}"\nexport SETUP_TOKEN="${setupToken}"`;
    step2Section.addWidget(
      CardService.newTextInput()
        .setFieldName("copy_command")
        .setTitle("Copy & Paste to Terminal")
        .setMultiline(true)
        .setValue(command)
        .setHint("Copy these commands and paste them into the Cloud Shell terminal.")
    );
  }

  // Setup Button
  const setupButton = CardService.newTextButton()
    .setText("Setup with Cloud Shell Terminal")
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setBackgroundColor("#4285F4")
    .setDisabled(!(selectedRegion && selectedRegion !== "none"))
    .setOnClickAction(
      CardService.newAction()
        .setFunctionName("onOpenCloudShellSetup")
        .setParameters({ setupToken: setupToken })
    );

  step2Section.addWidget(CardService.newButtonSet().addButton(setupButton));

  sections.push(step2Section);

  // --- Step 3: Verify Deployment ---
  sections.push(
    createButtonGroupSection(
      "Step 3: Verify Deployment",
      "Verify is everything is good.",
      [
        { 
          text: "Verify deployment", 
          functionName: "showVerifyDeployment",
          style: CardService.TextButtonStyle.FILLED,
          color: "#0F9D58"
        }
      ]
    )
  );

  return createPage(
    "SEM_DEPLOY_PAGE",
    "Deploy Agent",
    "Smart Email Manager / Deploy Agent",
    "This feature requires user to deploy infrastructure to the GCP cloud and setting up MongoDB to manage email data. Upon successful deployment the smart email manager agent can automatically organize mail.",
    sections
  );
}
