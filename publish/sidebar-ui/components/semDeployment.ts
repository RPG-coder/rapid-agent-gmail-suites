/**
 * Component for Smart Email Manager Deployment UI.
 */

/**
 * Creates the SEM Deployment Card.
 */
function createSEMDeploymentCard() {
  const cardBuilder = CardService.newCardBuilder().setName("SEM_DEPLOYMENT");

  // Header Section
  cardBuilder.addSection(
    CardService.newCardSection().addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Smart Email Manager</font></b><br/>' +
          '<i><font color="#333333">GCP Deployment & Verification</font></i>',
      ),
    ),
  );

  // Step 1: Region Selection
  cardBuilder.addSection(
    CardService.newCardSection()
      .setHeader("Step 1: Region Selection")
      .addWidget(
        CardService.newSelectionInput()
          .setType(CardService.SelectionInputType.DROPDOWN)
          .setTitle("Select GCP Region")
          .setFieldName("region")
          .addItem("US Central (Iowa)", "us-central1", true)
          .addItem("US East (S. Carolina)", "us-east1", false)
          .addItem("Europe West (Belgium)", "europe-west1", false)
          .addItem("Asia East (Taiwan)", "asia-east1", false)
          .addItem(
            "Australia Southeast (Sydney)",
            "australia-southeast1",
            false,
          ),
      ),
  );

  // Step 2: Deployment Setup
  cardBuilder.addSection(
    CardService.newCardSection()
      .setHeader("Step 2: Deployment Setup")
      .addWidget(
        CardService.newTextInput()
          .setFieldName("project_id")
          .setTitle("GCP Project ID")
          .setHint("e.g. fleet-furnace-497500-d2")
          .setValue(getGCPProjectId() === "YOUR_PROJECT_ID" ? "" : getGCPProjectId())
      )
      .addWidget(
        CardService.newTextButton()
          .setText("Deploy Infrastructure")
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor("#4285F4")
          .setOnClickAction(CardService.newAction().setFunctionName("onDeployGCPSEM"))
      )
      .addWidget(
        CardService.newTextParagraph().setText(
          '<div style="text-align: center;"><b>— OR —</b></div>',
        ),
      )
      .addWidget(
        CardService.newTextInput()
          .setFieldName("manual_service_url")
          .setTitle("Enter Service URL manually")
          .setHint("https://...a.run.app"),
      )
  );

  // Step 3: Verify Deployment
  cardBuilder.addSection(
    CardService.newCardSection()
      .setHeader("Step 3: Verify Deployment")
      .addWidget(
        CardService.newTextButton()
          .setText("Verify Connection")
          .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
          .setOnClickAction(
            CardService.newAction().setFunctionName("onVerifyDeploymentSEM"),
          ),
      ),
  );

  // Footer Section
  const footerSection = CardService.newCardSection()
    .addWidget(CardService.newDivider())
    .addWidget(
      CardService.newDecoratedText()
        .setBottomLabel("Terms & Conditions | Privacy Policy | Support")
        .setWrapText(true),
    )
    .addWidget(
      CardService.newDecoratedText()
        .setBottomLabel(
          'Website: <a href="https://www.putchakai.com">https://www.putchakai.com</a><br/>Developer Email: rahulgputcha@gmail.com',
        )
        .setWrapText(true),
    )
    .addWidget(
      CardService.newDecoratedText()
        .setBottomLabel(
          "© Copyright 2026 Rahul Gautham Putcha, Sree Harshitha Jonnalagadda.<br/>All rights reserved",
        )
        .setWrapText(true),
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

  const setupCommand = `export CHOSEN_REGION="${selectedRegion}"\nexport SETUP_TOKEN="${userEmailToken}"`;

  const card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader().setTitle("Step 1: Copy Setup Command"),
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            "Copy the command below. You will need to paste it into the Cloud Shell terminal once it opens.",
          ),
        )
        .addWidget(
          CardService.newTextInput()
            .setFieldName("setup_cmd")
            .setTitle("Setup Command")
            .setValue(setupCommand)
            .setMultiline(true),
        )
        .addWidget(
          CardService.newButtonSet().addButton(
            CardService.newTextButton()
              .setText("Step 2: Open Cloud Shell")
              .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
              .setBackgroundColor("#4285F4")
              .setOpenLink(
                CardService.newOpenLink().setUrl(
                  "https://console.cloud.google.com/cloudshell/editor" +
                    "?cloudshell_git_repo=" +
                    encodeURIComponent(
                      "https://github.com/RPG-coder/rapid-agent-gmail-suites",
                    ) +
                    "&cloudshell_tutorial=tutorial.md",
                ),
              ),
          ),
        ),
    )
    .build();

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card))
    .build();
}

/**
 * Creates a dedicated screen for Verification Results.
 */
function createVerifyDeploymentResultCard(isSuccess: boolean, detail: string = "") {
  const cardBuilder = CardService.newCardBuilder().setName("VERIFY_RESULT");

  const statusText = isSuccess 
    ? '<b><font color="#0F9D58">Success</font></b>' 
    : '<b><font color="#DB4437">connection failed</font></b>';
  
  const section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText(statusText))
    .addWidget(CardService.newTextParagraph().setText(detail || (isSuccess ? "Your agent is correctly linked and ready." : "We couldn't find the smart-email-manager-agent in your project.")));

  if (isSuccess) {
    // Step 1: Register
    section.addWidget(CardService.newTextParagraph().setText("<b>Step 1: Create Database</b>"));
    section.addWidget(
      CardService.newTextButton()
        .setText("Register to MongoDB Atlas")
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
        .setOpenLink(CardService.newOpenLink().setUrl("https://www.mongodb.com/cloud/atlas/register"))
    );

    section.addWidget(CardService.newTextParagraph().setText('<div style="text-align: center;"><small>— AND / OR —</small></div>'));

    // Step 2: Login
    section.addWidget(CardService.newTextParagraph().setText("<b>Step 2: Connect Agent</b>"));
    section.addWidget(
      CardService.newTextButton()
        .setText("Login to MongoDB")
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor("#0F9D58")
        .setOnClickAction(CardService.newAction().setFunctionName("onLoginToMongoDB"))
    );

    section.addWidget(CardService.newDivider());

    // Step 3: Return
    section.addWidget(CardService.newTextParagraph().setText("<b>Step 3: Finalize</b>"));
    section.addWidget(
      CardService.newTextButton()
        .setText("Return to Home")
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
        .setOnClickAction(CardService.newAction().setFunctionName("onReturnToRoot"))
    );
  } else {
    section.addWidget(
      CardService.newButtonSet().addButton(
        CardService.newTextButton()
          .setText("Try Again")
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor("#4285F4")
          .setOnClickAction(CardService.newAction().setFunctionName("showSEMDeployment"))
      ).addButton(
        CardService.newTextButton()
          .setText("Return to Home")
          .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
          .setOnClickAction(CardService.newAction().setFunctionName("onReturnToRoot"))
      )
    );
  }

  cardBuilder.addSection(section);
  return cardBuilder.build();
}

/**
 * Utility to pop back to the MAIN home card.
 */
function onReturnToRoot(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().popToRoot())
    .build();
}

/**
 * Action handler for Verify Deployment.
 */
function onVerifyDeploymentSEM(e: any) {
  const manualUrl = e.formInput.manual_service_url;
  const projectIdManual = e.formInput.project_id;

  if (!manualUrl || !manualUrl.startsWith("https://")) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Please enter a valid Cloud Run Service URL."))
      .build();
  }

  // Save manual project ID if provided
  if (projectIdManual) {
    PropertiesService.getScriptProperties().setProperty("GCP_PROJECT_ID", projectIdManual);
  }

  try {
    // Call the agent root to verify it's running and get the project ID
    const response = UrlFetchApp.fetch(manualUrl, { muteHttpExceptions: true });
    
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      const projectIdAuto = data.project_id;
      
      // Save the validated details
      PropertiesService.getScriptProperties().setProperty("CLOUD_RUN_URL", manualUrl);
      
      // Prefer auto-discovered ID, but fallback to manual if agent is old
      if (projectIdAuto && projectIdAuto !== "unknown") {
        PropertiesService.getScriptProperties().setProperty("GCP_PROJECT_ID", projectIdAuto);
      } else if (!projectIdManual) {
         return CardService.newActionResponseBuilder()
          .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentResultCard(false, "Connection successful, but your agent is too old to report its Project ID. Please enter your Project ID manually above and click Verify again.")))
          .build();
      }

      return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentResultCard(true, "✅ Connection successful! Agent is running and Project ID saved.")))
        .setNotification(CardService.newNotification().setText("Verification successful!"))
        .build();
    } else {
      return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentResultCard(false, `Agent returned error ${response.getResponseCode()}. Check your Cloud Run logs.`)))
        .build();
    }
  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentResultCard(false, "Could not reach the service. Ensure the URL is correct and the service is public.")))
      .build();
  }
}

/**
 * Navigation function to show the SEM Deployment card.
 */
function showSEMDeployment(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().pushCard(createSEMDeploymentCard()),
    )
    .build();
}
