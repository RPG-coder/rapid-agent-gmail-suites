/**
 * Creates the Inbox Analytics Card with detailed settings.
 * Based on user requirements and standard Card Service patterns.
 */
function createInboxAnalyticsCard() {
  const cardBuilder = CardService.newCardBuilder().setName("INBOX_ANALYTICS");

  // Main Header Section
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Rapid Agent Gmail Suite</font></b><br/>' +
        '<i><font color="#333333">Inbox Analytics</font></i>'
      )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">This feature will analyze your mail and present you timely insights, mailbox optimization, mail box recommendations and your average response time to a particular user. You can also ask any insight about you mailbox.</font>'
      )
    );
  cardBuilder.addSection(headerSection);

  // Section 1: Average Response Time
  const responseTimeSection = CardService.newCardSection()
    .setHeader("Average Response Time")
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">Get to know the Average Response Time of you and your recipients.</font>'
      )
    )
    .addWidget(
      CardService.newTextButton()
        .setText("Analyze Response Time")
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
        .setOnClickAction(CardService.newAction().setFunctionName("showAverageResponseTime"))
    );
  cardBuilder.addSection(responseTimeSection);

  // Section 2: Analytics Setting
  const analyticsSettingSection = CardService.newCardSection()
    .setHeader("Analytics Setting")
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">Send analytic emails periodically on frequency setting.</font>'
      )
    )
    // Option 1
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName("clutter_compression")
        .addItem("Clutter Compression", "true", false)
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setTitle("Duration")
        .setFieldName("clutter_duration")
        .addItem("Send Daily", "daily", false)
        .addItem("Send Weekly", "weekly", true) // default
        .addItem("Send Monthly", "monthly", false)
        .addItem("Send Yearly", "yearly", false)
    )
    // Option 2
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName("summary")
        .addItem("Summary", "true", false)
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setTitle("Duration")
        .setFieldName("summary_duration")
        .addItem("Send Daily", "daily", false)
        .addItem("Send Weekly", "weekly", true) // default
        .addItem("Send Monthly", "monthly", false)
        .addItem("Send Yearly", "yearly", false)
    );
  cardBuilder.addSection(analyticsSettingSection);

  // Section 3: Recommendations
  const recommendationsSection = CardService.newCardSection()
    .setHeader("Recommendations")
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">Send recommendations on managing email based on your access, read or interest patterns.</font>'
      )
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName("rec_tiering_1")
        .addItem("Monitor and notify tiering/lifecycle recommendations", "true", false)
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName("rec_unsubscribe")
        .addItem("Notify on mail to unsubscribe", "true", false)
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName("rec_expired")
        .addItem("Notify on expired/outdated conversations", "true", false)
    )
    .addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setTitle("Duration")
        .setFieldName("recommendations_duration")
        .addItem("Send Daily", "daily", false)
        .addItem("Send Weekly", "weekly", true) // default
        .addItem("Send Monthly", "monthly", false)
        .addItem("Send Yearly", "yearly", false)
    );
  cardBuilder.addSection(recommendationsSection);

  // Section 4: Ask Mailbox question
  const askQuestionSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextButton()
        .setText("Ask Mailbox question?")
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
        .setOnClickAction(CardService.newAction().setFunctionName("showAskMailboxQuestions"))
    );
  cardBuilder.addSection(askQuestionSection);

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
 * Navigation function to show the Inbox Analytics card.
 */
function showInboxAnalytics(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createInboxAnalyticsCard()))
    .build();
}

/**
 * Placeholder for Analyze Response Time action.
 */
function onAnalyzeResponseTime(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Analyzing response times..."))
    .build();
}

/**
 * Robustly returns to the Inbox Analytics card and resets the navigation stack.
 * Ensures the platform's back button will consistently lead to the Home screen (MAIN).
 */
function returnToAnalytics(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation()
        .popToRoot()
        .pushCard(createInboxAnalyticsCard())
    )
    .build();
}
