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
 * Action handler for Verify Deployment.
 */
function onVerifyDeploymentSEM(e: any) {
  const selectedRegion = e.formInput.region || "us-central1";
  const manualUrl = e.formInput.manual_service_url;
  const accessToken = ScriptApp.getOAuthToken();

  if (manualUrl && manualUrl.startsWith("https://")) {
    PropertiesService.getScriptProperties().setProperty(
      "CLOUD_RUN_URL",
      manualUrl,
    );
    return CardService.newActionResponseBuilder()
      .setNavigation(
        CardService.newNavigation().updateCard(createSEMDeploymentCard()),
      )
      .setNotification(
        CardService.newNotification().setText(
          "Service URL updated manually! Now you can Login to MongoDB from the Home screen.",
        ),
      )
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
      const serviceRegex = /smart-email-manager-agent/i;
      const matchedService = services.find((s: any) =>
        serviceRegex.test(s.metadata.name),
      );

      if (matchedService) {
        const serviceUrl = matchedService.status.url;
        PropertiesService.getScriptProperties().setProperty(
          "CLOUD_RUN_URL",
          serviceUrl,
        );

        return CardService.newActionResponseBuilder()
          .setNavigation(
            CardService.newNavigation().updateCard(createSEMDeploymentCard()),
          )
          .setNotification(
            CardService.newNotification().setText(
              "Cloud Run service verified successfully! Now you can Login to MongoDB from the Home screen.",
            ),
          )
          .build();
      } else {
        return CardService.newActionResponseBuilder()
          .setNotification(
            CardService.newNotification().setText(
              "No matching Cloud Run service found in " +
                selectedRegion +
                ". Make sure you have deployed it first.",
            ),
          )
          .build();
      }
    } else {
      if (response.getResponseCode() === 403) {
        return CardService.newActionResponseBuilder().setNotification(
          CardService.newNotification().setText(
            "Verification Error (403): Ensure 'Cloud Run Admin API' is enabled and you have 'Cloud Run Viewer' role.",
          ),
        );
      }
      return CardService.newActionResponseBuilder().setNotification(
        CardService.newNotification().setText(
          "Error querying Cloud Run API: " + response.getResponseCode(),
        ),
      );
    }
  } catch (err) {
    return CardService.newActionResponseBuilder().setNotification(
      CardService.newNotification().setText(
        "Verification failed: " + err.toString(),
      ),
    );
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
