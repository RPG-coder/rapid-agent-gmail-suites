/**
 * Component for User Personalization UI.
 */

const MOCK_PREFERENCES = [
  { id: "1", active: true, note: "Automatically categorize emails from '@github.com' as 'Development'." },
  { id: "2", active: true, note: "Summarize threads longer than 5 messages using bullet points." },
  { id: "3", active: false, note: "Move all promotional emails older than 30 days to Trash." },
  { id: "4", active: true, note: "Flag emails mentioning 'invoice' or 'payment' for manual review." },
  { id: "5", active: true, note: "Suggest draft replies for meeting invites based on my calendar availability." }
];

/**
 * Creates the User Personalization Card.
 * @param searchQuery Optional search query to filter preferences.
 * @param activeIds Comma-separated list of active preference IDs.
 */
function createUserPersonalizationCard(searchQuery: string = "", activeIds: string | null = null) {
  const cardBuilder = CardService.newCardBuilder().setName("USER_PERSONALIZATION");

  // If activeIds is null, initialize from MOCK_PREFERENCES
  if (activeIds === null) {
    activeIds = MOCK_PREFERENCES.filter(p => p.active).map(p => p.id).join(",");
  }
  const activeSet = new Set(activeIds ? activeIds.split(",") : []);

  // Header Section
  const headerSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph().setText(
        '<b><font color="#1A1A1A">Rapid Agent Gmail Suite</font></b><br/>' +
        '<i><font color="#333333">Self Arize-ing Email Manager / User Personalization</font></i>'
      )
    )
    .addWidget(
      CardService.newTextParagraph().setText(
        '<font color="#999999">List all User Personalization your Self Arize-ing/Learning Email agent have identified as per your email routines over time. You can review, manage, disable or delete any of the identified preferences.</font>'
      )
    );
  cardBuilder.addSection(headerSection);

  // Search Section
  const searchSection = CardService.newCardSection()
    .addWidget(
      CardService.newTextInput()
        .setFieldName("pref_search")
        .setTitle("Search By Keyword")
        .setHint("Enter a keyword to filter on preferences")
        .setValue(searchQuery)
        .setOnChangeAction(CardService.newAction().setFunctionName("onSearchPreferences").setParameters({ activeIds }))
    );
  cardBuilder.addSection(searchSection);

  // Preferences List Section
  const listSection = CardService.newCardSection();

  const filtered = MOCK_PREFERENCES.filter(p => 
    p.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    listSection.addWidget(CardService.newTextParagraph().setText("<i>No preferences found matching your search.</i>"));
  } else {
    filtered.forEach(p => {
      const isActive = activeSet.has(p.id);
      const statusLabel = isActive ? '<font color="#0F9D58">Active</font>' : '<font color="#999999">Inactive</font>';

      // "Table Row" simulation
      listSection.addWidget(
        CardService.newDecoratedText()
          .setTopLabel(statusLabel)
          .setText(p.note)
          .setWrapText(true)
          .setSwitchControl(
            CardService.newSwitch()
              .setFieldName(`active_${p.id}`)
              .setValue("true")
              .setSelected(isActive)
              .setOnChangeAction(CardService.newAction().setFunctionName("onTogglePreference").setParameters({ 
                id: p.id,
                activeIds: activeIds as string,
                searchQuery: searchQuery
              }))
          )
      );

      listSection.addWidget(
        CardService.newButtonSet()
          .addButton(
            CardService.newTextButton()
              .setText("Edit")
              .setOnClickAction(CardService.newAction().setFunctionName("onEditPreference").setParameters({ id: p.id }))
          )
          .addButton(
            CardService.newTextButton()
              .setText("Delete")
              .setOnClickAction(CardService.newAction().setFunctionName("onDeletePreference").setParameters({ id: p.id }))
          )
      );
      
      listSection.addWidget(CardService.newDivider());
    });
  }
  cardBuilder.addSection(listSection);

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
 * Action handler for searching preferences.
 */
function onSearchPreferences(e: any) {
  const query = e.formInput.pref_search || "";
  const activeIds = e.parameters.activeIds || "";
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(createUserPersonalizationCard(query, activeIds)))
    .build();
}

/**
 * Action handler for toggling preference active state.
 */
function onTogglePreference(e: any) {
  const id = e.parameters.id;
  const searchQuery = e.parameters.searchQuery || "";
  let activeIds = e.parameters.activeIds ? e.parameters.activeIds.split(",") : [];
  if (activeIds.length === 1 && activeIds[0] === "") activeIds = [];

  const isSelected = e.formInputs[`active_${id}`] && e.formInputs[`active_${id}`][0] === "true";
  
  if (isSelected) {
    if (!activeIds.includes(id)) activeIds.push(id);
  } else {
    activeIds = activeIds.filter(activeId => activeId !== id);
  }

  const newActiveIds = activeIds.join(",");

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(createUserPersonalizationCard(searchQuery, newActiveIds)))
    .setNotification(CardService.newNotification().setText(`Preference is now ${isSelected ? "Active" : "Inactive"}.`))
    .build();
}

/**
 * Action handler for editing a preference.
 */
function onEditPreference(e: any) {
  const id = e.parameters.id;
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(`Editing preference ${id}...`))
    .build();
}

/**
 * Action handler for deleting a preference.
 */
function onDeletePreference(e: any) {
  const id = e.parameters.id;
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText(`Preference ${id} deleted.`))
    .build();
}

/**
 * Navigation function to show the User Personalization card.
 */
function showUserPersonalization(e: any) {
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().pushCard(createUserPersonalizationCard())
    )
    .build();
}
