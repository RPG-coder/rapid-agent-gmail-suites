# Master Deployment Guide: Smart Email Manager

This guide provides the "Golden Path" to deploy the Smart Email Manager stack (Cloud Run, Vertex AI, Pub/Sub, and Gmail Link).

## Step 1: Initialize Environment

1.  **Paste Command**: Paste the **Setup Command** from the Gmail Sidebar into your terminal.
    *This sets your `$CHOSEN_REGION` and `$SETUP_TOKEN`.*

2.  **Pull Submodules**: Ensure you have the latest agent code.
    ```bash
    git submodule update --init --recursive
    ```

3.  **Set Project**:
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
    ```bash
    gcloud services enable discoveryengine.googleapis.com
    
    # This creates the required search engine
    gcloud alpha discoveryengine engines create \
        --display-name="Smart Email Manager" \
        --engine-id="smart-email-manager" \
        --collection-id="default_collection" \
        --location="global" \
        --type="SEARCH"
    ```

2.  **Create Pub/Sub Bridge**:
    ```bash
    gcloud pubsub topics create gmail-notifications || true
    gcloud pubsub topics add-iam-policy-binding gmail-notifications \
        --member="serviceAccount:gmail-api-push@system.gserviceaccount.com" \
        --role="roles/pubsub.publisher"

    gcloud pubsub subscriptions create gmail-notifications-sub --topic=gmail-notifications \
        --push-endpoint="$SERVICE_URL/api/on-new-mail" || \
    gcloud pubsub subscriptions update gmail-notifications-sub --push-endpoint="$SERVICE_URL/api/on-new-mail"
    ```

2.  **Activate Gmail Watch (The Handshake)**:

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
