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

## Step 2: Return to Gmail
1.  Refresh your Gmail tab.
2.  Click the **"Verify & Link Inbox"** button in the Sidebar.
3.  **It should now turn green!** 🟢


```

## Step 2: Return to Gmail
Once you see a successful response above (a JSON object with an `expiration` timestamp), return to the Gmail Sidebar and click **"Check Connection"**. It should now turn green!
