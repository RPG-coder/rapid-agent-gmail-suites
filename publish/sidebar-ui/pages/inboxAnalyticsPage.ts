import { createPage } from '../atoms/page';
import { createButtonGroupSection } from '../atoms/buttonGroupSection';

/**
 * Page: Inbox Analytics Dashboard (Updated per requirements)
 */
export function createInboxAnalyticsPage() {
  const sections = [];

  // Section 1: Average Response Time
  const responseTimeSection = CardService.newCardSection()
    .setHeader("Average Response Time")
    .addWidget(CardService.newTextParagraph().setText("Get to know the Average Response Time of you and your recipients."))
    .addWidget(CardService.newTextButton()
      .setText("Analyze Response Time")
      .setOnClickAction(CardService.newAction().setFunctionName("onShowContactSelection")));
  sections.push(responseTimeSection);

  // Section 2: Recommendation Settings
  const recommendationSection = CardService.newCardSection()
    .setHeader("Recommendation")
    .addWidget(CardService.newTextParagraph().setText("Send recommendations on managing email based on your access, read or interest patterns."));

  // Frequency Dropdown
  const frequencyDropdown = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName("recommendation_frequency")
    .setTitle("Report Frequency")
    .addItem("Send Hourly", "hourly", false)
    .addItem("Send Daily", "daily", true)
    .addItem("Send Weekly", "weekly", false)
    .addItem("Send Yearly", "yearly", false);
  recommendationSection.addWidget(frequencyDropdown);

  // Checkbox: Tiering/Lifecycle
  recommendationSection.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setFieldName("notify_tiering")
    .addItem("Notify tiering/lifecycle recommendations", "true", true));
    
  recommendationSection.addWidget(CardService.newTextParagraph()
    .setText("  ↳ Selecting this will recommend mails to archive and mails to delete."));

  // Checkbox: Unsubscribe
  recommendationSection.addWidget(CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setFieldName("notify_unsubscribe")
    .addItem("Notify mails to unsubscribe", "true", true));

  // Threshold Setting (New Requirement)
  recommendationSection.addWidget(CardService.newTextInput()
    .setFieldName("similarity_threshold")
    .setTitle("Similarity Threshold (0.1 - 1.0)")
    .setHint("Lower = more recommendations, Higher = more strict. Default: 0.8")
    .setValue(PropertiesService.getScriptProperties().getProperty("ANALYTICS_THRESHOLD") || "0.8"));

  // Save Button for recommendations
  recommendationSection.addWidget(CardService.newTextButton()
    .setText("Save Preferences")
    .setOnClickAction(CardService.newAction().setFunctionName("onSaveAnalyticsSettings")));

  // Generate Button
  recommendationSection.addWidget(CardService.newTextButton()
    .setText("Generate Recommendation Mail")
    .setOnClickAction(CardService.newAction().setFunctionName("onTriggerRecommendationReport")));

  sections.push(recommendationSection);

  return createPage(
    "INBOX_ANALYTICS_PAGE",
    "Rapid Agent Gmail Suite",
    "Inbox Analytics",
    "This feature will analyze your mail and present you timely insights, mailbox optimization, mail box recommendations and your average response time to a particular user. You can also ask any insight about you mailbox.",
    sections
  );
}

/**
 * Screen: Contact Selection for Response Time
 */
export function createContactSelectionPage(contacts: string[]) {
  const section = CardService.newCardSection()
    .setHeader("Select Contacts to Analyze");

  const multiSelect = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setFieldName("selected_contacts")
    .setTitle("Recent Contacts");

  contacts.forEach(contact => {
    multiSelect.addItem(contact, contact, false);
  });

  section.addWidget(multiSelect);
  
  section.addWidget(CardService.newTextButton()
    .setText("Generate Analytics Report")
    .setOnClickAction(CardService.newAction().setFunctionName("onGenerateResponseTimeReport")));

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Response Time Analysis"))
    .addSection(section)
    .build();
}
