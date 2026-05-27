/**
 * Organism: Verify Deployment Page
 * Renders the verification steps for the Smart Email Manager.
 */
function createVerifyDeploymentPage() {
  const props = PropertiesService.getScriptProperties();
  const projectId = props.getProperty("GCP_PROJECT_ID");
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");
  const isFound = !!(projectId && cloudRunUrl);

  const sections = [];

  // --- Detection Section ---
  const detectionSection = CardService.newCardSection()
    .setHeader("Detect Project & Agent Container")
    .addWidget(
      CardService.newTextParagraph().setText(
        "Let Gmail know where your project and agent are located"
      )
    );

  if (isFound) {
    detectionSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel("Status")
        .setText("✅ Backend Detected")
        .setBottomLabel("Your agent is ready to be linked.")
    );
    
    detectionSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel("Project ID")
        .setText(`<b>${projectId}</b>`)
        .setWrapText(true)
    );

    detectionSection.addWidget(
      CardService.newDecoratedText()
        .setTopLabel("Deployed Link")
        .setText(`<a href="${cloudRunUrl}">${cloudRunUrl}</a>`)
        .setWrapText(true)
    );

    // Add a way to re-detect if needed
    detectionSection.addWidget(
      CardService.newTextButton()
        .setText("Re-detect Backend")
        .setOnClickAction(CardService.newAction().setFunctionName("onGetAgentLink"))
    );
    
    sections.push(detectionSection);

    // --- MongoDB Setup Section (Appears after backend discovery) ---
    const mongoProjectId = props.getProperty("MONGODB_PROJECT_ID");
    const isMongoConfigured = !!mongoProjectId;

    sections.push(
      createButtonGroupSection(
        "Setup MongoDB",
        isMongoConfigured 
          ? "✅ MongoDB Cluster is being provisioned/ready." 
          : "Connect your agent to a MongoDB instance to start managing email data.",
        [
          { 
            text: "Configure MongoDB", 
            functionName: "showMongoSetupWizard",
            style: isMongoConfigured ? CardService.TextButtonStyle.OUTLINED : CardService.TextButtonStyle.FILLED,
            disabled: isMongoConfigured
          },
          { text: "Check Status", functionName: "onCheckStatus" }
        ]
      )
    );
  } else {
    detectionSection.addWidget(
      CardService.newButtonSet().addButton(
        CardService.newTextButton()
          .setText("Get Agent Link")
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor("#4285F4")
          .setOnClickAction(CardService.newAction().setFunctionName("onGetAgentLink"))
      )
    );
    sections.push(detectionSection);
  }

  return createPage(
    "VERIFY_DEPLOYMENT_PAGE",
    "Verify Deployment",
    "Smart Email Manager / Verify Deployment",
    "Follow below steps to verify",
    sections
  );
}
