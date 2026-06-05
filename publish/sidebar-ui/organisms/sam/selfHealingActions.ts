import { getCloudRunUrl } from '../../index';

/**
 * Organism: Self-Healing Actions
 * Provides HITL feedback buttons for the SAM agent.
 */
export function createSelfHealingActionsSection(messageId: string) {
  const section = CardService.newCardSection()
    .setHeader("🧠 Self-Arizeing Feedback");

  section.addWidget(
    CardService.newTextParagraph().setText(
      "<font color=\"#5F6368\">Teach the agent why you are taking this action to improve future automation.</font>"
    )
  );

  const buttonGroup = CardService.newButtonSet();

  // 1. Delete & Learn
  buttonGroup.addButton(
    CardService.newTextButton()
      .setText("🗑️ Delete & Learn")
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName("onShowHITLForm")
          .setParameters({ "messageId": messageId, "action": "delete" })
      )
  );

  // 2. Archive & Learn
  buttonGroup.addButton(
    CardService.newTextButton()
      .setText("📥 Archive & Learn")
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName("onShowHITLForm")
          .setParameters({ "messageId": messageId, "action": "archive" })
      )
  );

  // 3. Unsubscribe & Learn
  buttonGroup.addButton(
    CardService.newTextButton()
      .setText("🚫 Unsubscribe")
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName("onShowHITLForm")
          .setParameters({ "messageId": messageId, "action": "unsubscribe" })
      )
  );

  section.addWidget(buttonGroup);

  return section;
}

/**
 * Page: HITL Reason Form
 * The "Popup" equivalent for capturing the user's reason.
 */
export function createHITLFormPage(messageId: string, action: string) {
  const card = CardService.newCardBuilder()
    .setName("HITL_FORM")
    .setHeader(CardService.newCardHeader().setTitle(`Feedback: ${action.toUpperCase()}`));

  const section = CardService.newCardSection();

  section.addWidget(
    CardService.newTextParagraph().setText(
      `Why are you choosing to <b>${action}</b> this email? (Optional)`
    )
  );

  section.addWidget(
    CardService.newTextInput()
      .setFieldName("reason")
      .setTitle("Reason for action")
      .setHint("e.g. Too many newsletters, No longer relevant")
  );

  section.addWidget(
    CardService.newTextButton()
      .setText(`Confirm ${action}`)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName("onSubmitHITL")
          .setParameters({ "messageId": messageId, "action": action })
      )
  );

  card.addSection(section);
  return card.build();
}
