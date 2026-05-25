/**
 * Main entry point for the Gmail Add-on.
 */

function getCloudRunUrl() {
  const url =
    PropertiesService.getScriptProperties().getProperty("CLOUD_RUN_URL");
  return url || "https://www.putchakai.com/gmail-addon/404";
}

function onHomepage(e: any) {
  return createMainCard();
}

function onGmailMessage(e: any) {
  return createMainCard();
}

/**
 * Checks if the user is logged into MongoDB via Cloud Run.
 */
function isUserLoggedInMongoDB() {
  const userEmail = Session.getActiveUser().getEmail();
  const cloudRunUrl = getCloudRunUrl();

  // If not deployed yet, don't bother fetching
  if (cloudRunUrl.includes("putchakai.com")) return false;

  const url = `${cloudRunUrl}/mongodb/status?user_email=${encodeURIComponent(userEmail)}`;
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
    });
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return !!data.logged_in;
    }
  } catch (e) {
    console.error("Error checking MongoDB status:", e);
  }
  return false;
}

/**
 * Creates the main card based on the design in image.png.
 */
function createMainCard() {
  const cardBuilder = CardService.newCardBuilder().setName("MAIN");
  const cloudRunUrl = getCloudRunUrl();
  const isDeployed = !cloudRunUrl.includes("putchakai.com");
  const isLoggedIn = isDeployed && isUserLoggedInMongoDB();

  // Header/Title Section
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Rapid Agent Gmail Suite</font></b><br><i><font color="#333333">Google Rapid Agent Hackathon</font></i>',
      ),
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#4D4D4D">Below are the feature agents and their settings that are part of the Gmail suite add-on.</font>',
      ),
    );

  cardBuilder.addSection(headerSection);

  // Smart Email Manager Section
  const smartEmailManagerSection = CardService.newCardSection()
    .setHeader("Smart Email Manager")
    .addWidget(
      CardService.newTextParagraph().setText(
        '<small><font color="#999999">This feature will organize all your mails into appropriate label groups so you can know where your most important mails are when you access.</font></small>',
      ),
    );

  const buttonSet = CardService.newButtonSet();

  if (!isDeployed) {
    // State 1: Not Deployed
    buttonSet.addButton(
      CardService.newTextButton()
        .setText("Deploy Agent")
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setBackgroundColor("#4285F4")
        .setOnClickAction(
          CardService.newAction().setFunctionName("showSEMDeployment"),
        ),
    );
  } else if (!isLoggedIn) {
    // State 2: Deployed but not authenticated
    buttonSet
      .addButton(
        CardService.newTextButton()
          .setText("Login to MongoDB")
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
          .setBackgroundColor("#0F9D58")
          .setOnClickAction(
            CardService.newAction().setFunctionName("onLoginToMongoDB"),
          ),
      )
      .addButton(
        CardService.newTextButton()
          .setText("Deployment Settings")
          .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
          .setOnClickAction(
            CardService.newAction().setFunctionName("showSEMDeployment"),
          ),
      );
  } else {
    // State 3: Fully Operational (Deployed AND Logged In)
    buttonSet
      .addButton(
        CardService.newTextButton()
          .setText("View settings")
          .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
          .setOnClickAction(
            CardService.newAction().setFunctionName("showSmartEmailManager"),
          ),
      )
      .addButton(
        CardService.newTextButton()
          .setText("Check connection")
          .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
          .setOnClickAction(
            CardService.newAction().setFunctionName("onCheckConnections"),
          ),
      );
  }

  smartEmailManagerSection.addWidget(buttonSet);
  cardBuilder.addSection(smartEmailManagerSection);

  // Inbox Analytics Section
  const inboxAnalyticsSection = CardService.newCardSection()
    .setHeader("Inbox Analytics")
    .addWidget(
      CardService.newTextParagraph().setText(
        '<small><font color="#999999">This feature will analyze your mail and present you timely insights, mailbox optimization, mail box recommendations and your average response time to a particular user. You can also ask any insight about your mailbox.</font></small>',
      ),
    )
    .addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText("View settings")
            .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
            .setOnClickAction(
              CardService.newAction().setFunctionName("showInboxAnalytics"),
            ),
        )
        .addButton(
          CardService.newTextButton()
            .setText("Ask Mailbox Questions")
            .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
            .setOnClickAction(
              CardService.newAction().setFunctionName(
                "showAskMailboxQuestions",
              ),
            ),
        )
        .addButton(
          CardService.newTextButton()
            .setText("Check connections")
            .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
            .setOnClickAction(
              CardService.newAction().setFunctionName("onCheckConnections"),
            ),
        ),
    );

  cardBuilder.addSection(inboxAnalyticsSection);

  // Smart Arize-ing Email Manager Section
  const smartArizeingSection = CardService.newCardSection()
    .setHeader("Smart Arize-ing Email Manager")
    .addWidget(
      CardService.newTextParagraph().setText(
        '<small><font color="#999999">Manage your User Preferences in one place. Your email manager will keep it\'s pace in line with your inbox mails and your activities. Next time it relieves you to reduce burden at managing emails based on recognized personalization.</font></small>',
      ),
    )
    .addWidget(
      CardService.newButtonSet()
        .addButton(
          CardService.newTextButton()
            .setText("View settings")
            .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
            .setOnClickAction(
              CardService.newAction().setFunctionName(
                "showSelfArizingEmailManager",
              ),
            ),
        )
        .addButton(
          CardService.newTextButton()
            .setText("Check connections")
            .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
            .setOnClickAction(
              CardService.newAction().setFunctionName("onCheckConnections"),
            ),
        ),
    );

  cardBuilder.addSection(smartArizeingSection);

  // Footer Section
  const footerSection = CardService.newCardSection()
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
 * Action handler for MongoDB Login.
 */
function onLoginToMongoDB(e: any) {
  const userEmail = Session.getActiveUser().getEmail();
  const cloudRunUrl = getCloudRunUrl();
  const url = `${cloudRunUrl}/mongodb/login?user_email=${encodeURIComponent(userEmail)}&base_url=${encodeURIComponent(cloudRunUrl)}`;
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    if (data.auth_url) {
      return CardService.newActionResponseBuilder()
        .setOpenLink(CardService.newOpenLink().setUrl(data.auth_url))
        .build();
    }
  } catch (e) {
    console.error("Error initiating MongoDB login:", e);
  }
  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification().setText(
        "Failed to initiate MongoDB login.",
      ),
    )
    .build();
}

/**
 * Action handler for MongoDB Registration.
 */
function onRegisterToMongoDB(e: any) {
  const userEmail = Session.getActiveUser().getEmail();
  const cloudRunUrl = getCloudRunUrl();
  const url = `${cloudRunUrl}/mongodb/register?user_email=${encodeURIComponent(userEmail)}`;
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    if (data.register_url) {
      return CardService.newActionResponseBuilder()
        .setOpenLink(CardService.newOpenLink().setUrl(data.register_url))
        .build();
    }
  } catch (e) {
    console.error("Error initiating MongoDB registration:", e);
  }
  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification().setText(
        "Failed to initiate MongoDB registration.",
      ),
    )
    .build();
}

/**
 * Event handlers for button clicks.
 */

function onViewSettings(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification().setText("Opening settings..."),
    )
    .build();
}

function onCheckConnections(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(createMainCard()))
    .setNotification(
      CardService.newNotification().setText(
        "Connections checked and UI updated.",
      ),
    )
    .build();
}

function onAskQuestions(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification().setText("Opening mailbox questions..."),
    )
    .build();
}

/**
 * DUMMY FUNCTION: Forces the script to request GCP Platform Scopes.
 * Do not delete this; it ensures getOAuthToken() has enough power.
 */
function forceGCPAuth() {
  UrlFetchApp.fetch(
    "https://run.googleapis.com/v1/projects/project-9c87d17f-07e0-465a-ace/locations/us-central1/services",
    {
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    },
  );
}
