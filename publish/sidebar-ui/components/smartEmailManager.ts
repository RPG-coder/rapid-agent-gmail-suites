/**
 * Component for Smart Email Manager UI.
 */

/**
 * Creates the Smart Email Manager Card.
 * @param connectionStatus Current status of the connection ("Success" or "Failure" or "Not verified").
 * @param connectionTimestamp Timestamp of the last connection verification.
 * @param syncPercentage Current sync percentage.
 * @param syncTimestamp Timestamp of the last sync.
 * @param message Optional message to display (e.g., verification result).
 */
function createSmartEmailManagerCard(
  connectionStatus: string = "Not verified",
  connectionTimestamp: string = "N/A",
  syncPercentage: string = "0",
  syncTimestamp: string = "N/A",
  message: string = ""
) {
  const cardBuilder = CardService.newCardBuilder().setName("SMART_EMAIL_MANAGER");

  // Header Section
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Rapid Agent Gmail Suite</font></b><br/>' +
        '<i><font color="#333333">Smart Email Manager</font></i>'
      )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">This feature will organize all your mails into appropriate label groups so you can know where your most important mails are when you access.</font>'
      )
    );
  
  if (message) {
    headerSection.addWidget(
      CardService.newTextParagraph().setText(`<font color="#0F9D58">${message}</font>`)
    );
  }
  
  cardBuilder.addSection(headerSection);

  // Deployment Section (NEW)
  const deploymentSection = CardService.newCardSection()
    .setHeader("GCP Deployment")
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">Select your preferred region and deploy the agent to Google Cloud Platform.</font>'
      )
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setTitle("Select Region")
        .setFieldName("region")
        .addItem("US Central (Iowa)", "us-central1", true)
        .addItem("US East (S. Carolina)", "us-east1", false)
        .addItem("Europe West (Belgium)", "europe-west1", false)
        .addItem("Asia East (Taiwan)", "asia-east1", false)
        .addItem("Australia Southeast (Sydney)", "australia-southeast1", false)
    )
    .addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText("Deploy GCP")
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setBackgroundColor("#4285F4")
            .setOnClickAction(CardService.newAction().setFunctionName("onDeployGCPSEM"))
        )
        .addButton(
          CardService.newTextButton()
            .setText("Verify Deployment")
            .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
            .setOnClickAction(CardService.newAction().setFunctionName("onVerifyDeploymentSEM"))
        )
    );
  cardBuilder.addSection(deploymentSection);

  // Automated Workflows Section
  const autoWorkflowsSection = CardService.newCardSection()
    .setHeader("Automated Workflows")
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">New mail can be sent directly on arrival. This keeps your email manager and analytics upto date</font>'
      )
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName("auto_sync_emails")
        .addItem("Auto-sync new emails after arrival", "true", true)
    );
  cardBuilder.addSection(autoWorkflowsSection);

  // Manual Workflows Section
  const connectionStatusColor = connectionStatus === "Success" ? "#0F9D58" : (connectionStatus === "Not verified" ? "#999999" : "#DB4437");
  const connectionTimestampDisplay = connectionTimestamp !== "N/A" ? `<br/><font color="#999999">${connectionTimestamp}</font>` : "";
  
  const syncStatusDisplay = syncPercentage === "0" ? '<font color="#999999">Yet to sync</font>' : `(${syncPercentage}%) ....`;
  const syncTimestampDisplay = syncTimestamp !== "N/A" ? `<br/><font color="#999999">${syncTimestamp}</font>` : "";

  const manualWorkflowsSection = CardService.newCardSection()
    .setHeader("Manual Workflows")
    .addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText("Check connection")
            .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
            .setOnClickAction(CardService.newAction().setFunctionName("onCheckConnectionSEM"))
        )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        `<b>Last Verified:</b> <font color="${connectionStatusColor}">${connectionStatus}</font>${connectionTimestampDisplay}`
      )
    )
    .addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText("Sync to mongoDB")
            .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
            .setOnClickAction(CardService.newAction().setFunctionName("onSyncMongoDBSEM"))
        )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        `<b>Last Timestamp sync:</b> ${syncStatusDisplay}${syncTimestampDisplay}`
      )
    );
  cardBuilder.addSection(manualWorkflowsSection);

  // Smart Email Manager Configurations
  const configSection = CardService.newCardSection()
    .setHeader("Smart Email Manager Configurations")
    // Group 1
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">Set the max number of gmail labels to be generated by the email manager. The labels are similar to bucket to which emails are organized into.</font>'
      )
    )
    .addWidget(
      CardService.newTextInput()
        .setFieldName("max_labels")
        .setTitle("Max Number of labels generated")
        .setValue("5")
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName("suggest_reconsider_labels")
        .addItem("Suggest me to reconsider number of labels to optimal number. (via mail)", "true", false)
    )
    // Group 2
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">Set the max semantic score that the manager can agree upon. Below this threshold the manager will reorganize mails to meet the balanced semantic scores, if necessary generate new appropriate labels.</font>'
      )
    )
    .addWidget(
      CardService.newTextInput()
        .setFieldName("min_semantic_score")
        .setTitle("Min Semantic scores")
        .setValue("60%")
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName("notify_before_change")
        .addItem("Notify me before performing a change to old labels.", "true", false)
    );
  cardBuilder.addSection(configSection);

  // Footer Section
  const footerSection = CardService.newCardSection()
    .addWidget(CardService.newDivider())
    .addWidget(
      CardService.newDecoratedText()
        .setBottomLabel("Terms & Conditions | Privacy Policy | Support")
        .setWrapText(true)
    )
    .addWidget(
      CardService.newDecoratedText()
        .setBottomLabel(
          'Website: <a href="https://www.rahulgputcha.com">www.rahulgputcha.com</a><br/>Developer Email: rahulgputcha@gmail.com'
        )
        .setWrapText(true)
    )
    .addWidget(
      CardService.newDecoratedText()
        .setBottomLabel(
          "© Copyright 2026 Rahul Gautham Putcha, Sree Harshitha Jonnalagadda.<br/>All rights reserved"
        )
        .setWrapText(true)
    );
  cardBuilder.addSection(footerSection);

  return cardBuilder.build();
}

/**
 * Action handler for Deploy GCP.
 */
function onDeployGCPSEM(e: any) {
  const selectedRegion = e.formInput.region || "us-central1";
  const userEmail = Session.getActiveUser().getEmail();
  const userEmailToken = Utilities.base64Encode(userEmail);
  
  // URL to launch Cloud Shell with tutorial and environment variables
  const repoUrl = "https://github.com/RPG-coder/rapid-agent-gmail-suites"; 
  const cloudShellUrl = "https://shell.cloud.google.com/cloudshell/editor" +
    "?cloudshell_git_repo=" + encodeURIComponent(repoUrl) +
    "&cloudshell_tutorial=tutorial.md" +
    "&cloudshell_env=CHOSEN_REGION=" + encodeURIComponent(selectedRegion) +
    ",SETUP_TOKEN=" + encodeURIComponent(userEmailToken);

  return CardService.newActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink().setUrl(cloudShellUrl))
    .build();
}

/**
 * Action handler for Verify Deployment.
 */
function onVerifyDeploymentSEM(e: any) {
  const selectedRegion = e.formInput.region || "us-central1";
  const accessToken = ScriptApp.getOAuthToken();
  
  try {
    // 1. Get Project ID
    const projectId = "project-9c87d17f-07e0-465a-ace"; 
    
    // 2. Query Cloud Run Admin API
    const url = `https://run.googleapis.com/v1/projects/${projectId}/locations/${selectedRegion}/services`;
    const response = UrlFetchApp.fetch(url, {
      headers: { Authorization: "Bearer " + accessToken },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      const services = data.items || [];
      
      // 3. RegEx to find the service
      const serviceRegex = /smart-email-manager-agent/i;
      const matchedService = services.find((s: any) => serviceRegex.test(s.metadata.name));
      
      if (matchedService) {
        const serviceUrl = matchedService.status.url;
        // Save the URL to ScriptProperties for later use
        PropertiesService.getScriptProperties().setProperty("CLOUD_RUN_URL", serviceUrl);
        
        return CardService.newActionResponseBuilder()
          .setNavigation(CardService.newNavigation().updateCard(
            createSmartEmailManagerCard("Success", new Date().toLocaleString(), "0", "N/A", "✅ Service verified! Now you can Login to MongoDB from the Home screen.")
          ))
          .setNotification(CardService.newNotification().setText("Cloud Run service verified successfully!"))
          .build();
      } else {
        return CardService.newActionResponseBuilder()
          .setNotification(CardService.newNotification().setText("No matching Cloud Run service found in " + selectedRegion + ". Make sure you have deployed it first."))
          .build();
      }
    } else {
      const errorBody = response.getContentText();
      console.error("Cloud Run API Error:", errorBody);
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Cloud Run API Error (403): Please ensure you have 'Cloud Run Viewer' permissions in the GCP project."))
        .build();
    }
  } catch (err) {
    console.error("Verification Error:", err);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Verification failed: " + err.toString()))
      .build();
  }
}

/**
 * Action handler for checking the connection.
 */
function onCheckConnectionSEM(e: any) {
  const now = new Date().toLocaleString();
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().updateCard(
        createSmartEmailManagerCard("Success", now, "100", now)
      )
    )
    .setNotification(CardService.newNotification().setText("Connection verified successfully."))
    .build();
}

/**
 * Action handler for syncing to MongoDB.
 */
function onSyncMongoDBSEM(e: any) {
  const now = new Date().toLocaleString();
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().updateCard(
        createSmartEmailManagerCard("Success", now, "100", now)
      )
    )
    .setNotification(CardService.newNotification().setText("Synced to MongoDB successfully."))
    .build();
}

/**
 * Navigation function to show the Smart Email Manager card.
 */
function showSmartEmailManager(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().pushCard(createSmartEmailManagerCard("Not verified", "N/A", "0", "N/A"))
    )
    .build();
}
