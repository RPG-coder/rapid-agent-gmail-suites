import { createFooterSection } from './footer';

/**
 * Atom: Page
 * A reusable layout for creating standardized CardService cards.
 * 
 * @param name Internal name for the card.
 * @param title Large title text.
 * @param subtitle Italicized subtitle text.
 * @param description Small description text.
 * @param sections Array of CardService.CardSection to be added to the card.
 */
export function createPage(
  name: string,
  title: string,
  subtitle: string,
  description: string,
  sections: any[]
) {
  const cardBuilder = CardService.newCardBuilder().setName(name);

  // --- HEADER ---
  cardBuilder.addSection(
    CardService.newCardSection()
      .addWidget(
        CardService.newTextParagraph().setText(
          `<b><font color="#1A1A1A" size="large">${title}</font></b><br/>` +
          `<i><font color="#5F6368">${subtitle}</font></i>`
        )
      )
      .addWidget(
        CardService.newTextParagraph().setText(
          `<font color="#4D4D4D"><small>${description}</small></font>`
        )
      )
  );

  // --- SUB-SECTIONS ---
  if (sections && sections.length > 0) {
    sections.forEach((section) => {
      cardBuilder.addSection(section);
    });
  }

  // --- FOOTER ---
  cardBuilder.addSection(createFooterSection());

  return cardBuilder.build();
}
