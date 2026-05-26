/**
 * Atom: Button Group Section
 * Renders a section with a title, description, and a set of buttons.
 * 
 * @param title The section title.
 * @param description The section description.
 * @param buttons Array of button configurations { text, functionName, style }.
 */
function createButtonGroupSection(
  title: string,
  description: string,
  buttons: { text: string; functionName: string; style?: any; color?: string }[]
) {
  const section = CardService.newCardSection().setHeader(title);

  // Add Description
  section.addWidget(
    CardService.newTextParagraph().setText(
      `<font color="#70757A"><small>${description}</small></font>`
    )
  );

  // Add Button Group
  if (buttons && buttons.length > 0) {
    section.addWidget(CardService.newTextParagraph().setText("<br>"));
    const buttonSet = CardService.newButtonSet();
    buttons.forEach((btn) => {
      const button = CardService.newTextButton()
        .setText(btn.text)
        .setTextButtonStyle(btn.style || CardService.TextButtonStyle.OUTLINED)
        .setOnClickAction(CardService.newAction().setFunctionName(btn.functionName));
      
      if (btn.color) {
        button.setBackgroundColor(btn.color);
      }
      
      buttonSet.addButton(button);
    });
    section.addWidget(buttonSet);
    section.addWidget(CardService.newTextParagraph().setText("<br>"));
  }

  return section;
}
