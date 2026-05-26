/**
 * Component for Average Response Time analysis.
 */

const FAKE_EMAILS = [
  { name: "Alice Johnson", email: "alice.j@example.com" },
  { name: "Bob Smith", email: "bob.smith@company.org" },
  { name: "Charlie Davis", email: "charlie.d@startup.io" },
  { name: "Diana Prince", email: "diana.p@justice.com" },
  { name: "Ethan Hunt", email: "ethan.h@mission.impossible" },
  { name: "Fiona Gallagher", email: "fiona.g@southside.edu" },
  { name: "George Costanza", email: "george.c@vandelay.com" },
  { name: "Hannah Abbott", email: "hannah.a@hogwarts.uk" },
  { name: "Ian Wright", email: "ian.w@football.com" },
  { name: "Jane Doe", email: "jane.doe@personal.me" },
  { name: "Kevin Malone", email: "kevin.m@dundermifflin.com" },
  { name: "Laura Palmer", email: "laura.p@twinpeaks.wa" },
  { name: "Michael Scott", email: "michael.s@scranton.com" },
  { name: "Nina Sayers", email: "nina.s@ballet.ny" },
  { name: "Oscar Martinez", email: "oscar.m@accounting.com" },
  { name: "Pam Beesly", email: "pam.b@reception.com" },
  { name: "Quentin Tarantino", email: "quentin.t@pulp.fiction" },
  { name: "Rachel Green", email: "rachel.g@centralperk.com" },
  { name: "Steve Rogers", email: "steve.r@avengers.gov" },
  { name: "Tony Stark", email: "tony.s@starkindustries.com" },
  { name: "Ursula Buffay", email: "ursula.b@waitress.me" },
  { name: "Victor Von Doom", email: "victor.d@latveria.gov" },
  { name: "Wanda Maximoff", email: "wanda.m@vision.home" },
  { name: "Xavier Renegade", email: "xavier.r@spirit.quest" },
  { name: "Yoda Green", email: "yoda@jedi.council" },
  { name: "Zelda Hyrule", email: "zelda@hylia.org" },
  { name: "Arthur Dent", email: "arthur.d@galaxy.hitchhiker" },
  { name: "Bruce Wayne", email: "bruce.w@waynecorp.com" },
  { name: "Clark Kent", email: "clark.k@dailyplanet.com" },
  { name: "Daisy Johnson", email: "daisy.j@shield.gov" },
  { name: "Ellen Ripley", email: "ellen.r@nostromo.com" },
  { name: "Frodo Baggins", email: "frodo.b@shire.me" },
  { name: "Gandalf Grey", email: "gandalf@middleearth.org" },
  { name: "Harry Potter", email: "harry.p@boywholived.uk" },
  { name: "Indy Jones", email: "indy.j@archaeology.edu" },
  { name: "John Wick", email: "john.w@continental.com" },
  { name: "Katniss Everdeen", email: "katniss.e@district12.pa" },
  { name: "Luke Skywalker", email: "luke.s@tatooine.com" },
  { name: "Marty McFly", email: "marty.m@hillvalley.ca" },
  { name: "Neo Anderson", email: "neo.a@matrix.net" },
  { name: "Optimus Prime", email: "optimus.p@cybertron.com" },
  { name: "Peter Parker", email: "peter.p@dailybugle.com" },
  { name: "Quicksilver Maximoff", email: "pietro.m@xmen.edu" },
  { name: "Rip Hunter", email: "rip.h@waverider.time" },
  { name: "Sarah Connor", email: "sarah.c@resistance.me" },
  { name: "Thomas Shelby", email: "thomas.s@peakyblinders.uk" },
  { name: "Ulysses Klaue", email: "ulysses.k@wakanda.blackmarket" },
  { name: "Vesper Lynd", email: "vesper.l@treasury.uk" },
  { name: "Walter White", email: "walter.w@heisenberg.nm" },
  { name: "Ygritte Wildling", email: "ygritte@northofthewall.me" },
];

/**
 * Creates the Average Response Time Card.
 */
function createAverageResponseTimeCard(searchQuery: string = "", selectedEmails: string[] = []) {
  const cardBuilder = CardService.newCardBuilder().setName("ART");

  // Header Section
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Rapid Agent Gmail Suite</font></b><br/>' +
        '<i><font color="#333333">Inbox Analytics / Average Response Time</font></i>'
      )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">Get to know the Average Response Time of you and your recipients.</font>'
      )
    );
  cardBuilder.addSection(headerSection);

  // Filter logic
  const filteredEmails = FAKE_EMAILS.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected = selectedEmails.length === FAKE_EMAILS.length;
  const isAllSearchSelected = searchQuery.length > 0 && filteredEmails.length > 0 && filteredEmails.every(item => selectedEmails.includes(item.email));

  // Prepare Parameters for State Preservation
  const commonParams = {
    selectedEmails: selectedEmails.join(","),
    searchQuery: searchQuery,
    wasAllSelected: isAllSelected.toString(),
    wasAllSearchSelected: isAllSearchSelected.toString()
  };

  const uiChangeAction = CardService.newAction()
    .setFunctionName("onUIChange")
    .setParameters(commonParams);

  // Search Section
  const searchSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextInput()
        .setFieldName("recipient_search")
        .setTitle("Search By Email or Name")
        .setHint("Enter a recipient name or email")
        .setValue(searchQuery)
        .setOnChangeAction(uiChangeAction)
    );
  cardBuilder.addSection(searchSection);

  // Results Section
  const resultsSection = CardService.newCardSection();
  
  // 1. Global Select All
  resultsSection.addWidget(
    CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.CHECK_BOX)
      .setFieldName("select_all")
      .addItem("Select All", "all", isAllSelected)
      .setOnChangeAction(uiChangeAction)
  );

  // 2. Select All (in search)
  if (searchQuery.length > 0 && filteredEmails.length > 0) {
    resultsSection.addWidget(
      CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName("select_all_search")
        .addItem("Select All (in this search)", "search", isAllSearchSelected)
        .setOnChangeAction(uiChangeAction)
    );
  }

  if (filteredEmails.length > 0) {
    const emailSelection = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.CHECK_BOX)
      .setFieldName("selected_recipients")
      .setOnChangeAction(uiChangeAction);

    filteredEmails.forEach((item) => {
      const isSelected = selectedEmails.includes(item.email);
      emailSelection.addItem(`${item.name} (${item.email})`, item.email, isSelected);
    });

    resultsSection.addWidget(emailSelection);
  } else {
    resultsSection.addWidget(
      CardService.newTextParagraph().setText("<i>No results found.</i>")
    );
  }
  cardBuilder.addSection(resultsSection);

  // Fixed Footer
  const fixedFooter = CardService.newFixedFooter()
    .setPrimaryButton(
      CardService.newTextButton()
        .setText("Start Analysis")
        .setOnClickAction(CardService.newAction().setFunctionName("onStartAnalysis").setParameters({
          selectedEmails: selectedEmails.join(",")
        }))
    );
  cardBuilder.setFixedFooter(fixedFooter);

  // Standard Footer
  const internalFooter = CardService.newCardSection()
    .addWidget(CardService.newDivider())
    .addWidget(
      CardService.newDecoratedText()
        .setBottomLabel("© Copyright 2026 Rahul Gautham Putcha, Sree Harshitha Jonnalagadda.")
        .setWrapText(true)
    );
  cardBuilder.addSection(internalFooter);

  return cardBuilder.build();
}

/**
 * Unified handler for UI changes.
 */
function onUIChange(e: any) {
  const newSearchQuery = e.formInput.recipient_search || "";
  const prevSearchQuery = e.parameters.searchQuery || "";
  let masterSelected = e.parameters.selectedEmails ? e.parameters.selectedEmails.split(",") : [];
  if (masterSelected.length === 1 && masterSelected[0] === "") masterSelected = [];

  const wasAllSelected = e.parameters.wasAllSelected === "true";
  const wasAllSearchSelected = e.parameters.wasAllSearchSelected === "true";

  const selectAllChecked = e.formInputs.select_all ? e.formInputs.select_all.includes("all") : false;
  const selectAllSearchChecked = e.formInputs.select_all_search ? e.formInputs.select_all_search.includes("search") : false;

  // Detection: Did searchQuery change?
  const isSearchChange = newSearchQuery !== prevSearchQuery;

  // Detection: Did a bulk toggle happen?
  const selectAllToggle = selectAllChecked !== wasAllSelected;
  const selectAllSearchToggle = !isSearchChange && (selectAllSearchChecked !== wasAllSearchSelected);

  if (selectAllToggle) {
    masterSelected = selectAllChecked ? FAKE_EMAILS.map(i => i.email) : [];
  } else if (selectAllSearchToggle) {
    const filteredEmails = FAKE_EMAILS.filter(item => 
      item.name.toLowerCase().includes(prevSearchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(prevSearchQuery.toLowerCase())
    ).map(i => i.email);

    if (selectAllSearchChecked) {
      masterSelected = Array.from(new Set([...masterSelected, ...filteredEmails]));
    } else {
      masterSelected = masterSelected.filter(email => !filteredEmails.includes(email));
    }
  } else {
    // Normal individual checkbox update
    // Only update the ones that were visible on the screen
    const visibleOnScreen = FAKE_EMAILS.filter(item => 
      item.name.toLowerCase().includes(prevSearchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(prevSearchQuery.toLowerCase())
    ).map(i => i.email);

    const checkedOnScreen = e.formInputs.selected_recipients || [];

    // Sync masterSelected with current screen state
    masterSelected = masterSelected.filter(email => !visibleOnScreen.includes(email));
    masterSelected = [...masterSelected, ...checkedOnScreen];
  }

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(createAverageResponseTimeCard(newSearchQuery, masterSelected)))
    .build();
}

/**
 * Action handler for starting analysis.
 */
function onStartAnalysis(e: any) {
  let selected = e.parameters.selectedEmails ? e.parameters.selectedEmails.split(",") : [];
  if (selected.length === 1 && selected[0] === "") selected = [];

  if (selected.length === 0) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Please select at least one recipient."))
      .build();
  }
    
  return showARTResults(selected);
}

/**
 * Navigation function to show the Average Response Time card.
 */
function showAverageResponseTime(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(createAverageResponseTimeCard()))
    .build();
}
