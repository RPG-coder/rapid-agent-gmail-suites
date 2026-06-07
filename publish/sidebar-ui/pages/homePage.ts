import { createPage } from '../atoms/page';
import { createSmartEmailManagerHomeSection } from '../organisms/sem/smartEmailManagerHome';
import { createButtonGroupSection } from '../atoms/buttonGroupSection';

/**
 * Page: Home Page
 * Orchestrates the main card using atomic components.
 */
export function createHomePage() {
  return createPage(
    "HOME_PAGE",
    "Rapid Agent Gmail Suite",
    "Google Rapid Agent Hackathon",
    "Below are the feature agents and their setting that are part of the Gmail suite add-on.",
    [
      createSmartEmailManagerHomeSection(),
      createButtonGroupSection(
        "Inbox Analytics",
        "Gain timely insights, optimize your mailbox with tiered recommendations, and analyze your average response times with key contacts.",
        [
          { text: "View Settings", functionName: "onShowInboxAnalytics" },
          { text: "Ask Mailbox Questions", functionName: "onAskQuestions" },
          { text: "Verify & Link Inbox", functionName: "onCheckConnections" }
        ]
      ),
      createButtonGroupSection(
        "Smart Arize-ing Email Manager",
        "Manage your User Preferences in one place. Your email manager will keep it's pace in line with your inbox mails and your activities. Next time it relieves you lo seduce burden at managing emails based on recognized personalization.",
        [
          { text: "View settings", functionName: "onViewSettings" },
          { text: "Verify & Link Inbox", functionName: "onCheckSAMConnections" }
        ]
      )
    ]
  );
}
