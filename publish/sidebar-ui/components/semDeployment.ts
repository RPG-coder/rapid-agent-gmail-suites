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
      ),
  );

  // Step 3: Verify Deployment
  cardBuilder.addSection(
    CardService.newCardSection()
      .setHeader("Step 3: Verify Deployment")
      .addWidget(
        CardService.newTextParagraph().setText(
          '<font color="#999999">Once deployed, click verify to link your agent to this add-on.</font>',
        ),
      )
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
  const selectedRegion = e.formInput.region || "us-central1";
  const manualUrl = e.formInput.manual_service_url;
  const accessToken = ScriptApp.getOAuthToken();

  // 1. Check for manual URL first
  if (manualUrl && manualUrl.startsWith("https://")) {
    PropertiesService.getScriptProperties().setProperty("CLOUD_RUN_URL", manualUrl);
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentResultCard(true, "✅ Service URL updated manually. Now you can Login to MongoDB from the Home screen.")))
      .setNotification(CardService.newNotification().setText("Manual verification successful!"))
      .build();
  }

  try {
    const projectId = "983993789043";
    const url = `https://run.googleapis.com/v1/projects/${projectId}/locations/${selectedRegion}/services`;
    const response = UrlFetchApp.fetch(url, {
      headers: { Authorization: "Bearer " + accessToken },
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      const services = data.items || [];
      
      // Regex check for smart-email-manager-agent
      const serviceRegex = /smart-email-manager-agent/i;
      const matchedService = services.find((s: any) => serviceRegex.test(s.metadata.name));

      if (matchedService) {
        const serviceUrl = matchedService.status.url;
        PropertiesService.getScriptProperties().setProperty("CLOUD_RUN_URL", serviceUrl);

        return CardService.newActionResponseBuilder()
          .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentResultCard(true, "✅ Agent discovered automatically! Service URL: " + serviceUrl)))
          .build();
      } else {
        return CardService.newActionResponseBuilder()
          .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentResultCard(false, "No matching Cloud Run service found in " + selectedRegion + ".")))
          .build();
      }
    } else {
      let errorMsg = "Error querying Cloud Run API: " + response.getResponseCode();
      if (response.getResponseCode() === 403) {
        errorMsg = "Verification Error (403): Insufficient IAM permissions.";
      }
      return CardService.newActionResponseBuilder()
        .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentResultCard(false, errorMsg)))
        .build();
    }
  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().pushCard(createVerifyDeploymentResultCard(false, "Verification failed: " + err.toString())))
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
