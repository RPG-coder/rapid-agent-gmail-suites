# Final Step: Activate Your Agent

To allow Gmail to send notifications to your new infrastructure, we need to "Watch" your inbox.

## Step 1: Run the Handshake

Click the "Run" icon in the code block below to activate the connection. 

**Note:** Ensure you have already initialized your infrastructure in the Gmail Sidebar UI (Setup Wizard) before running this command. This ensures the Pub/Sub topic `gmail-notifications` exists.

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
