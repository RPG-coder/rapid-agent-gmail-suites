# Master Deployment Guide: Smart Email Manager

This guide provides the "Golden Path" to deploy the Smart Email Manager stack (Cloud Run, Vertex AI, Pub/Sub, and Gmail Link).

## Step 0: Prerequisites

Before you begin, ensure you have the following accounts and keys:

1.  **MongoDB Atlas**:
    *   Create a free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register).
    *   **Create a Project**: If not automatically prompted, click **"New Project"** (ex: `Rapid-Agent`).
    *   **Create a Cluster**: Create a **"New Cluster"** (Shared/Free Tier, ex: `email-cluster`).
    *   **Database Access**: On the left sidebar, go to **"Security"** > **"Database Access"**. Select your user (**Edit**) > In the **Built-in Roles** dropdown, select **"Read and write to any database"** and click **"Update User"**.
    *   **Network Access**: On the left sidebar, go to **"Security"** > **"Network Access"** > **"IP Access List"**. Add **`0.0.0.0/0`** (Allow Access from Anywhere) for development.
    *   **Connect**: Go to **"Database"** > **"Clusters"**. Click **"Connect"** on your cluster (ex: `email-cluster`) -> **Drivers** -> **Python**. Copy your **Connection String (MONGO_URI)**.

2.  **Voyage AI**:
    *   Sign up at [voyageai.com](https://www.voyageai.com/).
    *   Go to **API Keys** and click **"Create new secret key"**.
    *   Copy your **API Key**.

## Step 1: Initialize Environment

1.  **Paste Command**: Paste the **Setup Command** from the Gmail Sidebar into your terminal.
    *This sets your `$CHOSEN_REGION` and `$SETUP_TOKEN`.*

2.  **Pull Submodules**: Ensure you have the latest agent code.
    ```bash
    git submodule update --init --recursive
    ```

3.  **Create or Select Project**:
    It is highly recommended to use a **fresh GCP Project** for this setup.
    
    *   **Create New**:
        ```bash
        gcloud projects create YOUR_PROJECT_ID --name="Smart Email Manager"
        gcloud config set project YOUR_PROJECT_ID
        ```
        *(Optional) Enable billing in the [GCP Console](https://console.cloud.google.com/billing) if prompted.*
    
    *   **Select Existing**:
        ```bash
        gcloud config set project YOUR_PROJECT_ID
        ```

4.  **Enable Core APIs**:
    ```bash
    gcloud services enable \
        run.googleapis.com \
        cloudbuild.googleapis.com \
        artifactregistry.googleapis.com \
        discoveryengine.googleapis.com \
        dialogflow.googleapis.com \
        aiplatform.googleapis.com \
        gmail.googleapis.com \
        cloudresourcemanager.googleapis.com
    ```

## Step 2: Provision Identity & Permissions

1.  **Link Apps Script (Handshake)**:
    *   **Get Project Number**:
        ```bash
        gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"
        ```
    *   Open [Apps Script Editor](https://script.google.com/home).
    *   Go to **Project Settings (Gear icon)** > **Change Project** > Paste the Project Number.

2.  **Grant Deployment Roles**:
    ```bash
    USER_EMAIL=${SETUP_TOKEN:-$(gcloud config get-value account)}
    PROJECT_ID=$(gcloud config get-value project)
    
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="user:$USER_EMAIL" --role="roles/run.admin"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="user:$USER_EMAIL" --role="roles/discoveryengine.admin"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="user:$USER_EMAIL" --role="roles/pubsub.admin"
    ```

## Step 3: Deploy Backend (Cloud Run)

1.  **Build Container**:
    ```bash
    cd agents/smart-email-manager
    
    # Initialize variables if not set
    PROJECT_ID=$(gcloud config get-value project)
    CHOSEN_REGION=${CHOSEN_REGION:-us-central1}

    # Create repository
    gcloud artifacts repositories create agent-repo \
        --repository-format=docker \
        --location=$CHOSEN_REGION || true

    # Build and Tag
    gcloud builds submit --tag $CHOSEN_REGION-docker.pkg.dev/$PROJECT_ID/agent-repo/smart-email-manager-agent .
    ```

2.  **Launch Service**:
    Deploy the agent:
    ```bash
    gcloud run deploy smart-email-manager-agent \
      --image $CHOSEN_REGION-docker.pkg.dev/$PROJECT_ID/agent-repo/smart-email-manager-agent \
      --platform managed --region $CHOSEN_REGION --allow-unauthenticated --port 8080
    ```

    Update service with its own URL:
    ```bash
    SERVICE_URL=$(gcloud run services describe smart-email-manager-agent --platform managed --region $CHOSEN_REGION --format='value(status.url)')
    gcloud run services update smart-email-manager-agent --set-env-vars CLOUD_RUN_URL=$SERVICE_URL --region $CHOSEN_REGION
    ```

3.  **Configure Secrets**:
    Replace the placeholders below with your actual keys.
    ```bash
    gcloud run services update smart-email-manager-agent \
      --set-env-vars="MONGO_URI=your_mongodb_atlas_uri" \
      --set-env-vars="VOYAGE_API_KEY=your_voyage_api_key" \
      --region $CHOSEN_REGION
    ```

## Step 4: Provision Infra (Pub/Sub & Vertex AI)

1.  **Provision Vertex AI Search**:
    The `gcloud` CLI support for Discovery Engine can vary by version. Use this `curl` command to reliably provision your engine:

    ```bash
    # 1. Enable API
    gcloud services enable discoveryengine.googleapis.com

    # 2. Create Placeholder Data Store
    curl -X POST \
      -H "Authorization: Bearer $(gcloud auth print-access-token)" \
      -H "X-Goog-User-Project: $(gcloud config get-value project)" \
      -H "Content-Type: application/json" \
      -d '{"displayName": "Smart Email Manager Data Store", "industryVertical": "GENERIC", "contentConfig": "NO_CONTENT"}' \
      "https://discoveryengine.googleapis.com/v1beta/projects/$(gcloud config get-value project)/locations/global/collections/default_collection/dataStores?dataStoreId=smart-email-manager-ds"

    # 3. Create Search Engine
    curl -X POST \
      -H "Authorization: Bearer $(gcloud auth print-access-token)" \
      -H "X-Goog-User-Project: $(gcloud config get-value project)" \
      -H "Content-Type: application/json" \
      -d '{"displayName": "Smart Email Manager", "solutionType": "SOLUTION_TYPE_SEARCH", "industryVertical": "GENERIC", "dataStoreIds": ["smart-email-manager-ds"]}' \
      "https://discoveryengine.googleapis.com/v1beta/projects/$(gcloud config get-value project)/locations/global/collections/default_collection/engines?engineId=smart-email-manager"
    ```

2.  **Create Pub/Sub Bridges**:

    **Bridge A: Gmail Notifications** (Incoming Mail)
    ```bash
    gcloud pubsub topics create gmail-notifications || true
    gcloud pubsub topics add-iam-policy-binding gmail-notifications \
        --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \
        --role="roles/pubsub.publisher"

    gcloud pubsub subscriptions create gmail-notifications-sub --topic=gmail-notifications \
        --push-endpoint="$SERVICE_URL/api/on-new-mail" || \
    gcloud pubsub subscriptions update gmail-notifications-sub --push-endpoint="$SERVICE_URL/api/on-new-mail"
    ```

    **Bridge B: Auto-Reorganization** (Self-Healing)
    ```bash
    gcloud pubsub topics create reorganize-inbox || true

    gcloud pubsub subscriptions create reorganize-inbox-sub --topic=reorganize-inbox \
        --push-endpoint="$SERVICE_URL/api/reorganize" || \
    gcloud pubsub subscriptions update reorganize-inbox-sub --push-endpoint="$SERVICE_URL/api/reorganize"
    ```

3.  **Activate Gmail Watch (The Handshake)**:

    To bypass security blocks on personal accounts, we use Apps Script to perform the handshake.

    1. **Pre-flight Check (Unblock App)**:
       * Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) in GCP Console.
       * Set User Type to **External**.
       * Click **ADD USERS** under "Test users", enter your email, and click **SAVE**.
    2. Open your **Apps Script Editor**.
    3. Paste this function into a script file:
       ```javascript
       function activateGmailWatch() {
         GmailApp.getInboxUnreadCount(); // Triggers permission prompt
         const projectId = 'YOUR_PROJECT_ID'; 
         const options = {
           method: "post",
           contentType: "application/json",
           payload: JSON.stringify({
             topicName: `projects/${projectId}/topics/gmail-notifications`,
             labelIds: ["INBOX"]
           }),
           headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
           muteHttpExceptions: true
         };
         const response = UrlFetchApp.fetch("https://gmail.googleapis.com/gmail/v1/users/me/watch", options);
         Logger.log(response.getContentText());
       }
       ```
    4. Replace `YOUR_PROJECT_ID` with your actual Project ID and click **Run**.
    5. Click **Advanced** > **Go to [Project] (unsafe)** when the permission popup appears.

## Step 5: Finalize in Gmail

1.  Return to your **Gmail Sidebar**.
2.  Paste your **Service URL** into the setup box.
3.  Click **"Verify Installation"**.
4.  **Success!** 🟢 Your agent is now watching your inbox and indexing to MongoDB.
