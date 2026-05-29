# Master Deployment Guide: Smart Email Manager

This tutorial will help you deploy the entire Smart Email Manager stack (Cloud Run, Vertex AI, Pub/Sub, and Gmail Link) in one session.

## Step 1: Initialize Environment

1.  **Paste Command**: Paste the **Setup Command** from the Gmail Sidebar into the terminal below.
    *This sets your `$CHOSEN_REGION` and `$SETUP_TOKEN`.*

2.  **Pull Submodules**:
    ```bash
    git submodule update --init --recursive
    ```

3.  **Authenticate**:
    ```bash
    gcloud auth application-default login
    ```

4.  **Set Project**:
    ```bash
    gcloud config set project YOUR_PROJECT_ID
    ```

5.  **Enable Core APIs**:
    ```bash
    gcloud services enable run.googleapis.com \
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
    *   Open [Apps Script Editor](https://script.google.com/home). Go to "Rapid Agent Suite" Project Settings (Gear) > Change Project > Paste the Number.

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

    Goto Agent folder
    ```bash
    cd agents/smart-email-manager
    ```

    Ensure variables are set (Use your chosen region, e.g., us-central1)
    ```bash
    PROJECT_ID=$(gcloud config get-value project)
    CHOSEN_REGION=${CHOSEN_REGION:-us-central1}
    ```

    If not created before, create artifacts repository
    ```bash
    gcloud artifacts repositories \
        create agent-repo \
        --repository-format=docker \
        --location=$CHOSEN_REGION || \
        true
    ```

    Build Container:
    ```bash
    gcloud builds submit --tag $CHOSEN_REGION-docker.pkg.dev/$PROJECT_ID/agent-repo/smart-email-manager-agent .
    ```

2.  **Launch Service**:

    Deploy the agent:
    ```bash
    gcloud run deploy smart-email-manager-agent \
      --image $CHOSEN_REGION-docker.pkg.dev/$PROJECT_ID/agent-repo/smart-email-manager-agent \
      --platform managed --region $CHOSEN_REGION --allow-unauthenticated --port 8080
    ```

    Save URL for next steps:
    ```bash
    SERVICE_URL=$(gcloud run services describe smart-email-manager-agent --platform managed --region $CHOSEN_REGION --format='value(status.url)')
    ```

    Update service with its own URL:
    ```bash
    gcloud run services update smart-email-manager-agent --set-env-vars CLOUD_RUN_URL=$SERVICE_URL --region $CHOSEN_REGION
    ```

## Step 4: Provision Infra (Pub/Sub & Gmail Watch)

1.  **Create Pub/Sub Bridge**:
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

    **Option A: Terminal (May be blocked by Google Security)**
    This requires you to have completed the Apps Script link in Step 2!
    ```bash
    curl -X POST -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" -H "Content-Type: application/json" -d "{\"topicName\": \"projects/$PROJECT_ID/topics/gmail-notifications\", \"labelIds\": [\"INBOX\"]}" "https://gmail.googleapis.com/gmail/v1/users/me/watch"
    ```

    **Option B: Apps Script (Recommended - Bypasses Security Block)**
    If Option A fails with "App Blocked", use this:
    1. Open your **Apps Script Editor** (the one from Step 2).
    2. Paste this code into a new script file:
       ```javascript
       function activateGmailWatch() {
         GmailApp.getInboxUnreadCount(); // Triggers scope request
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
    3. Replace `YOUR_PROJECT_ID` with your actual Project ID.
    4. Click **Run**. Click **Advanced** > **Go to [Project] (unsafe)** when prompted.


## Step 5: Finalize in Gmail

1.  Return to your **Gmail Sidebar**.
2.  Paste your **Service URL** into the setup box.
3.  Click **"Verify Installation"**.
4.  **Success!** 🟢 Your agent is now watching your inbox and indexing to MongoDB.
