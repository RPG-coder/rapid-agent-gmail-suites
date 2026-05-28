# Final Step: Activate Your Agent

Because of Google's security policies, the easiest way to link your Gmail account is through a one-time "Project Handshake" in the Apps Script settings.

## Step 1: Link your Apps Script to GCP
1.  **Get Project Number**: Run this in your Cloud Shell terminal:
    ```bash
    gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"
    ```
2.  **Open Settings**: Open your project in the [Apps Script Editor](https://script.google.com/home) and click the **Settings Gear (⚙️)** on the left sidebar.
3.  **Change Project**: Click **"Change project"** under the GCP Project section.
4.  **Paste & Set**: Paste the project number from Step 1 and click **"Set project"**.

## Step 2: Ensure Backend Configuration (Persist Settings)
Run these commands in Cloud Shell to ensure your agent knows its own identity and can talk to your database reliably.

1.  **Inject Service URL**: 
    ```bash
    SERVICE_URL=$(gcloud run services describe smart-email-manager-agent --platform managed --region us-central1 --format='value(status.url)')
    gcloud run services update smart-email-manager-agent --set-env-vars CLOUD_RUN_URL=$SERVICE_URL --region us-central1
    ```

2.  **Inject Database URI**: (Replace `[YOUR_PASSWORD]` and `[CLUSTER_URL]` with your real values)
    ```bash
    gcloud run services update smart-email-manager-agent --set-env-vars MONGO_URI='mongodb+srv://agent_user:[YOUR_PASSWORD]@[CLUSTER_URL]/?appName=email-cluster' --region us-central1
    ```

## Step 3: Return to Gmail
1.  Refresh your Gmail tab.
2.  Click the **"Verify & Link Inbox"** button in the Sidebar.
3.  **It should now turn green!** 🟢
