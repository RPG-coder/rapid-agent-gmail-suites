/**
 * Utility: GCP Scanner
 * Auto-discovers Cloud Run backends across all accessible user projects.
 * Enhanced with detailed diagnostics and pagination.
 */

/**
 * Lists all active projects accessible to the user, with pagination.
 */
export function listUserProjects(): any[] {
  let allProjects: any[] = [];
  let nextPageToken: string | null = null;
  const baseUrl = "https://cloudresourcemanager.googleapis.com/v1/projects";

  try {
    do {
      const url = baseUrl + (nextPageToken ? `?pageToken=${nextPageToken}` : "");
      const response = UrlFetchApp.fetch(url, {
        method: "get",
        headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
        muteHttpExceptions: true
      });

      if (response.getResponseCode() !== 200) {
        console.error(`CRM API Error (${response.getResponseCode()}): ${response.getContentText()}`);
        break; 
      }

      const data = JSON.parse(response.getContentText());
      if (data.projects) {
        allProjects = allProjects.concat(data.projects.filter((p: any) => p.lifecycleState === "ACTIVE"));
      }
      nextPageToken = data.nextPageToken || null;
    } while (nextPageToken);
  } catch (e) {
    console.error(`Project listing failed: ${e.toString()}`);
  }

  return allProjects;
}

/**
 * Searches for the 'smart-email-manager-agent' in a specific project.
 * Optimization: Uses direct GET if region is known, otherwise falls back to list.
 */
export function findCloudRunService(projectId: string): any | null {
  const region = PropertiesService.getScriptProperties().getProperty("GCP_REGION");
  
  // OPTIMIZATION: If we have a region, try a direct GET first (Fast Path)
  if (region && region !== "none") {
    const directUrl = `https://run.googleapis.com/v2/projects/${projectId}/locations/${region}/services/smart-email-manager-agent`;
    const response = UrlFetchApp.fetch(directUrl, {
      method: "get",
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      const service = JSON.parse(response.getContentText());
      return {
        name: "smart-email-manager-agent",
        url: service.uri,
        location: region
      };
    }
  }

  // FALLBACK: Global list (Slow Path)
  const listUrl = `https://run.googleapis.com/apis/serving.knative.dev/v1/projects/${projectId}/services`;
  const response = UrlFetchApp.fetch(listUrl, {
    method: "get",
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });

  if (response.getResponseCode() === 200) {
    const data = JSON.parse(response.getContentText());
    if (data.items) {
      const agentService = data.items.find((s: any) => s.metadata.name === "smart-email-manager-agent");
      if (agentService) {
        return {
          name: agentService.metadata.name,
          url: agentService.status.url,
          location: agentService.metadata.labels['cloud.googleapis.com/location']
        };
      }
    }
  }
  
  return null;
}

/**
 * Main Orchestrator: Scans projects until the agent is found.
 */
export function discoverBackend() {
  const projects = listUserProjects();
  console.log(`Scanning ${projects.length} projects for agent...`);
  
  let errors = [];

  for (const project of projects) {
    try {
      const service = findCloudRunService(project.projectId);
      if (service) {
        return {
          projectId: project.projectId,
          url: service.url,
          region: service.location
        };
      }
    } catch (e) {
      errors.push(`${project.projectId}: ${e.toString()}`);
    }
  }
  
  if (errors.length > 0) {
    console.error("Discovery encountered errors: " + errors.join(", "));
  }

  return null;
}
