# Final Step: Activate Your Agent

To allow Gmail to send notifications to your new infrastructure, we need to "Watch" your inbox. This requires a two-step handshake in Cloud Shell.

## Step 1: Enable Gmail Permissions
By default, Cloud Shell only has access to Google Cloud. Run this command to grant the terminal permission to manage your Gmail settings:

```bash
gcloud auth login --scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/gmail.settings.basic
```
*Follow the link, authorize your account, and paste the code back here.*

## Step 2: Run the Handshake
Click the "Run" icon in the code block below to activate the connection. 

**Note:** Ensure you have already initialized your infrastructure in the Gmail Sidebar UI (Setup Wizard).

```bash
# This command tells Gmail to start sending mail to your topic
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d "{\"topicName\": \"projects/$(gcloud config get-value project)/topics/gmail-notifications\", \"labelIds\": [\"INBOX\"]}" \
  "https://gmail.googleapis.com/gmail/v1/users/me/watch"
```

## Step 2: Return to Gmail
Once you see a successful response above (a JSON object with an `expiration` timestamp), return to the Gmail Sidebar and click **"Check Connection"**. It should now turn green!
