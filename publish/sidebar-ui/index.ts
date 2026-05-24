/**
 * Main entry point for the Gmail Add-on.
 */

function getCloudRunUrl() {
  const url = PropertiesService.getScriptProperties().getProperty("CLOUD_RUN_URL");
  return url || "https://smart-email-manager-agent-zlcyhbxgya-uc.a.run.app";
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
  const url = `${cloudRunUrl}/mongodb/status?user_email=${encodeURIComponent(userEmail)}`;
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return data.logged_in;
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
  const isLoggedIn = isUserLoggedInMongoDB();

  // Header/Title Section
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Rapid Agent Gmail Suite</font></b><br><i><font color="#333333">Google Rapid Agent Hackathon</font></i>',
      ),
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#4D4D4D">Below are the feature agents and their setting that are part of the Gmail suite add-on.</font>',
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

  smartEmailManagerSection.addWidget(
    CardService.newButtonSet()
      .addButton(
        isLoggedIn 
          ? CardService.newTextButton()
              .setText("View settings")
              .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
              .setOnClickAction(CardService.newAction().setFunctionName("showSmartEmailManager"))
          : CardService.newTextButton()
              .setText("Login to MongoDB")
              .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
              .setBackgroundColor("#0F9D58")
              .setOnClickAction(CardService.newAction().setFunctionName("onLoginToMongoDB"))
      )
      .addButton(
        CardService.newTextButton()
          .setText("Deploy / Verify")
          .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
          .setOnClickAction(CardService.newAction().setFunctionName("showSmartEmailManager"))
      )
  );

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
              CardService.newAction().setFunctionName("showAskMailboxQuestions"),
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
              CardService.newAction().setFunctionName("showSelfArizingEmailManager"),
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
          'Website: <a href="https://www.rahulgputcha.com">www.rahulgputcha.com</a><br/>Developer Email: rahulgputcha@gmail.com',
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
  const url = `${cloudRunUrl}/mongodb/login?user_email=${encodeURIComponent(userEmail)}`;
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
    .setNotification(CardService.newNotification().setText("Failed to initiate MongoDB login."))
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
      CardService.newNotification().setText("Connections checked and UI updated."),
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
