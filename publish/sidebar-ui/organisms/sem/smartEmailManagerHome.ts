import { getCloudRunUrl, isUserLoggedInMongoDB } from '../../index';
import { createButtonGroupSection } from '../../atoms/buttonGroupSection';

/**
 * Organism: Smart Email Manager Home Section
 * Handles conditional UI based on setup status.
 */
export function createSmartEmailManagerHomeSection() {
  const props = PropertiesService.getScriptProperties();
  const cloudRunUrl = props.getProperty("CLOUD_RUN_URL");
  const setupStatus = props.getProperty("SETUP_STATUS");
  
  const isDeployed = !!cloudRunUrl;
  const isSetupComplete = setupStatus === "COMPLETED";

  const title = "Smart Email Manager";
  const description = "Organize your inbox semantically using autonomous AI agents.";
  
  let buttons = [];

  if (!isDeployed) {
    buttons.push({ 
      text: "Start Setup", 
      functionName: "showSEMDeployment", 
      style: CardService.TextButtonStyle.FILLED,
      color: "#4285F4" 
    });
  } else if (!isSetupComplete) {
    buttons.push({ 
      text: "Finish Setup", 
      functionName: "showVerifyDeployment", 
      style: CardService.TextButtonStyle.FILLED, 
      color: "#0F9D58" 
    });
  } else {
    buttons.push({ text: "View settings", functionName: "onViewSettings" });
    buttons.push({ text: "Verify Installation", functionName: "showVerifyDeployment" });
    buttons.push({ text: "📊 Weekly Report", functionName: "onTriggerWeeklyReport" });
  }

  return createButtonGroupSection(title, description, buttons);
}
