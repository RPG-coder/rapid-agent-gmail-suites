/**
 * Component for Self Arize-ing Email Manager UI.
 */

/**
 * Creates the Self Arize-ing Email Manager Card.
 */
function createSelfArizingEmailManagerCard() {
  const cardBuilder = CardService.newCardBuilder().setName("SELF_ARIZING_MANAGER");

  // Header Section
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Rapid Agent Gmail Suite</font></b><br/>' +
        '<i><font color="#333333">Self Arize-ing Email Manager</font></i>'
      )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">Manage your User Preferences in one place. Your email manager will keep it\'s pace in line with your inbox mails and your activities. Next time it relieves you to reduce burden at managing emails based on recognized personalization.</font>'
      )
    );
  cardBuilder.addSection(headerSection);

  // User Personalization Section
  const personalizationSection = CardService.newCardSection()
    .setHeader("User Personalization")
    
    // Group 1: User Preferences
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">List all User Personalization your Self Arize-ing/Learning Email ' +
        'agent have identified as per your email routines over time. You can review, manage, disable or delete any of the identified preferences.</font>'
      )
    )
    .addWidget(
      CardService.newTextButton()
        .setText("Show all User preferences")
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
        .setOnClickAction(CardService.newAction().setFunctionName("showUserPersonalization"))
    )
    .addWidget(CardService.newTextParagraph().setText("<br/>"))

    // Group 2: Delete Data
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#DB4437"><b>Warning:</b></font> <font color="#999999">This will Delete your Rapid Agent Gmail suite data from all MCP connected infrastructure (Arize, Fivetran, MongoDB).</font>'
      )
    )
    .addWidget(
      CardService.newTextButton()
        .setText("Delete your Data")
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
        .setOnClickAction(CardService.newAction().setFunctionName("onDeleteData"))
    )
    .addWidget(CardService.newTextParagraph().setText("<br/>"))

    // Group 3: Clear Connections
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#DB4437"><b>Warning:</b></font> <font color="#999999">This will lose all connection setting from all services configured in Rapid Agent Gmail suite.</font>'
      )
    )
    .addWidget(
      CardService.newTextButton()
        .setText("Clear MCP Connections")
        .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
        .setOnClickAction(CardService.newAction().setFunctionName("onClearMCPConnections"))
    )
    .addWidget(CardService.newTextParagraph().setText("<br/>"));
  cardBuilder.addSection(personalizationSection);

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
 * Action handler for showing user preferences.
 */
function onShowUserPreferences(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Fetching user preferences..."))
    .build();
}

/**
 * Action handler for deleting data.
 */
function onDeleteData(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Deleting data from all platforms..."))
    .build();
}

/**
 * Action handler for clearing MCP connections.
 */
function onClearMCPConnections(e: any) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Clearing all service connections..."))
    .build();
}

/**
 * Navigation function to show the Self Arize-ing Email Manager card.
 */
function showSelfArizingEmailManager(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().pushCard(createSelfArizingEmailManagerCard())
    )
    .build();
}
