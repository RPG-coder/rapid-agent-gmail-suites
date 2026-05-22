/**
 * Component for displaying Average Response Time analysis results.
 */

/**
 * Creates the Start ART Analysis Results Card.
 */
function createStartARTAnalysisCard(selectedEmails: string[] = []) {
  const cardBuilder = CardService.newCardBuilder().setName("ART_RESULTS");

  // Header Section
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Rapid Agent Gmail Suite</font></b><br/>' +
        '<i><font color="#333333">Analysis Results</font></i>'
      )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">Analysis of response patterns for the selected recipients.</font>'
      )
    );
  cardBuilder.addSection(headerSection);

  // Results Section
  const resultsSection = CardService.newCardSection()
    .setHeader("Selected Recipients");

  if (selectedEmails.length > 0) {
    let emailList = selectedEmails.map(email => `• ${email}`).join("<br/>");
    resultsSection.addWidget(
      CardService.newTextParagraph().setText(
        `<font color="#4D4D4D">${emailList}</font>`
      )
    );
  } else {
    resultsSection.addWidget(
      CardService.newTextParagraph().setText("<i>No recipients were selected for analysis.</i>")
    );
  }
  
  resultsSection.addWidget(
    CardService.newTextButton()
      .setText("Return to Analytics")
      .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
      .setOnClickAction(CardService.newAction().setFunctionName("returnToAnalytics"))
  );
  
  cardBuilder.addSection(resultsSection);

  // Footer Section
  const footerSection = CardService.newCardSection()
    .addWidget(CardService.newDivider())
    .addWidget(
      CardService.newDecoratedText()
        .setBottomLabel("© Copyright 2026 Rahul Gautham Putcha, Sree Harshitha Jonnalagadda.")
        .setWrapText(true)
    );
  cardBuilder.addSection(footerSection);

  return cardBuilder.build();
}

/**
 * Action handler for navigating to analysis results.
 */
function showARTResults(selectedEmails: string[]) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createStartARTAnalysisCard(selectedEmails)))
    .build();
}
