/**
 * Component for Ask Mailbox Questions chat interface.
 */

/**
 * Creates the Ask Mailbox Questions Card.
 * @param history Array of strings representing the chat history.
 */
function createAskMailboxQuestionsCard(history: string[] = []) {
  const cardBuilder = CardService.newCardBuilder().setName("ASK_QUESTIONS");

  // Header Section
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Rapid Agent Gmail Suite</font></b><br/>' +
          '<i><font color="#333333">Inbox Analytics / Ask Mailbox Questions</font></i>',
      ),
    );
  cardBuilder.addSection(headerSection);

  const fixedFooter = CardService.newFixedFooter();

  if (history.length === 0) {
    // Initial State: Hide "No messages yet" and Input. Show Start button.
    const startSection = CardService.newCardSection()
      .addWidget(
        CardService.newTextParagraph().setText(
          '<font color="#999999">Click the button below to start scanning your mailbox for insights.</font>'
        )
      )
      .addWidget(
        CardService.newTextButton()
          .setText("Start Mailbox Scan")
          .setTextButtonStyle(CardService.TextButtonStyle.OUTLINED)
          .setOnClickAction(CardService.newAction().setFunctionName("onStartScan"))
      );
    cardBuilder.addSection(startSection);

    fixedFooter.setPrimaryButton(
      CardService.newTextButton()
        .setText("Return to Analytics")
        .setOnClickAction(CardService.newAction().setFunctionName("returnToAnalytics"))
    );
  } else {
    // Chatting State
    const chatSection = CardService.newCardSection();
    history.forEach((msg, index) => {
      const isUser = index % 2 === 0;
      const label = isUser ? "<b>You</b>" : "<b>Rapid Agent</b>";
      const color = isUser ? "#1A73E8" : "#202124";

      chatSection.addWidget(
        CardService.newTextParagraph().setText(
          `${label}<br/><font color="${color}">${msg}</font>`,
        ),
      );
    });
    cardBuilder.addSection(chatSection);

    // Input Section
    const inputSection = CardService.newCardSection().addWidget(
      CardService.newTextInput()
        .setFieldName("chat_input")
        .setTitle("Ask Anything")
        .setHint("Type your message here..."),
    );
    cardBuilder.addSection(inputSection);

    fixedFooter.setPrimaryButton(
      CardService.newTextButton()
        .setText("Send")
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName("onSendMessage")
            .setParameters({ history: JSON.stringify(history) }),
        )
    ).setSecondaryButton(
      CardService.newTextButton()
        .setText("Return to Analytics")
        .setOnClickAction(CardService.newAction().setFunctionName("returnToAnalytics"))
    );
  }

  cardBuilder.setFixedFooter(fixedFooter);

  return cardBuilder.build();
}

/**
 * Action handler for starting the scan.
 */
function onStartScan(e: any) {
  const history = [
    "I'm ready! I've scanned your recent emails. How can I help you today?",
    "You can ask me to summarize your unread messages, find attachments, or analyze your response patterns."
  ];
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().updateCard(
        createAskMailboxQuestionsCard(history),
      ),
    )
    .build();
}

/**
 * Action handler for sending a message.
 */
function onSendMessage(e: any) {
  const userInput = e.formInput.chat_input;
  if (!userInput) {
    return CardService.newActionResponseBuilder()
      .setNotification(
        CardService.newNotification().setText("Please enter a question."),
      )
      .build();
  }

  let history = JSON.parse(e.parameters.history || "[]");
  history.push(userInput);

  // Mock Response
  history.push(
    "I am analyzing your mailbox... (This is a mock response for the hackathon prototype).",
  );

  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().updateCard(
        createAskMailboxQuestionsCard(history),
      ),
    )
    .build();
}

/**
 * Navigation function to show the Ask Mailbox Questions card.
 */
function showAskMailboxQuestions(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().pushCard(createAskMailboxQuestionsCard()),
    )
    .build();
}
