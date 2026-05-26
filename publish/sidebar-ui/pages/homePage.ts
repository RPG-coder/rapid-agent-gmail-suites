/**
 * Page: Home Page
 * Orchestrates the main card using atomic components.
 */
function createHomePage() {
  const cardBuilder = CardService.newCardBuilder().setName("HOME_PAGE");

  // --- HEADER ---
  cardBuilder.addSection(
    CardService.newCardSection()
      .addWidget(
        CardService.newTextParagraph().setText(
          '<b><font color="#1A1A1A" size="large">Rapid Agent Gmail Suite</font></b><br/>' +
          '<i><font color="#5F6368">Google Rapid Agent Hackathon</font></i>'
        )
      )
      .addWidget(
        CardService.newTextParagraph().setText(
          '<font color="#4D4D4D">Below are the feature agents and their setting that are part of the Gmail suite add-on.</font>'
        )
      )
  );

  // --- SECTION 1: SMART EMAIL MANAGER ---
  cardBuilder.addSection(
    createButtonGroupSection(
      "Smart Email Manager",
      "This feature will organize all your mails into appropriate label groups so you can know where your most important mails are when you access.",
      [
        { text: "View settings", functionName: "onViewSettings" },
        { text: "Check connections", functionName: "onCheckConnections" }
      ]
    )
  );

  // --- SECTION 2: INBOX ANALYTICS ---
  cardBuilder.addSection(
    createButtonGroupSection(
      "Inbox Analytics",
      "This feature will analyze your mail and present you timely insights, mailbox optimization, mail box recommendations and your average response time to a particular user. You can also ask any insight about you mailbox",
      [
        { text: "View settings", functionName: "onViewSettings" },
        { text: "Ask Mailbox Questions", functionName: "onAskQuestions" },
        { text: "Check connections", functionName: "onCheckConnections" }
      ]
    )
  );

  // --- SECTION 3: SMART ARIZE-ING EMAIL MANAGER ---
  cardBuilder.addSection(
    createButtonGroupSection(
      "Smart Arize-ing Email Manager",
      "Manage your User Preferences in one place. Your email manager will keep it's pace in line with your inbox mails and your activities. Next time it relieves you lo seduce burden at managing emails based on recognized personalization.",
      [
        { text: "View settings", functionName: "onViewSettings" },
        { text: "Check connections", functionName: "onCheckConnections" }
      ]
    )
  );

  // --- FOOTER ---
  cardBuilder.addSection(createFooterSection());

  return cardBuilder.build();
}
