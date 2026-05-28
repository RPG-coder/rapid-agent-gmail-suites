import { getCloudRunUrl, isUserLoggedInMongoDB } from '../../index';
import { createButtonGroupSection } from '../../atoms/buttonGroupSection';

/**
 * Organism: Smart Email Manager Home Section
 * Handles conditional UI based on deployment and login status.
 * 
 * Intent: Flow "Deploy" > "Login to MongoDB" > ("View settings" & "Check connections")
 */
export function createSmartEmailManagerHomeSection() {
  const cloudRunUrl = getCloudRunUrl();
  const isDeployed = !cloudRunUrl.includes("putchakai.com");
  const isLoggedIn = isDeployed && isUserLoggedInMongoDB();

  const title = "Smart Email Manager";
  const description = "This feature will organize all your mails into appropriate label groups so you can know where your most important mails are when you access.";
  
  let buttons = [];

  if (!isDeployed) {
    // State 1: Need Deployment
    buttons.push({ 
      text: "Deploy Agent", 
      functionName: "showSEMDeployment", 
      style: CardService.TextButtonStyle.FILLED,
      color: "#4285F4" 
    });
  } else if (!isLoggedIn) {
    // State 2: Deployed, Need MongoDB Setup
    buttons.push({ 
      text: "Configure MongoDB", 
      functionName: "showMongoSetupWizard", 
      style: CardService.TextButtonStyle.FILLED, 
      color: "#0F9D58" 
    });
  } else {
    // State 3: Fully Setup
    buttons.push({ text: "View settings", functionName: "showSmartEmailManager" });
    buttons.push({ text: "Verify & Link Inbox", functionName: "onCheckConnections" });
  }

  return createButtonGroupSection(title, description, buttons);
}
