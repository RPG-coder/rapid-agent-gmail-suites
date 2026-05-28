# Deploying Smart Email Manager Agent

Welcome to the deployment tutorial for the Smart Email Manager Agent! This guide will help you deploy your agent to Google Cloud Run in your selected region.

## Step 1: Setup Environment

Before we begin, you need to set up your environment variables. 

1.  **Paste Command**: Paste the **Setup Command** you copied from the Gmail Sidebar into the terminal below and press **Enter**.

    *This will set your `$CHOSEN_REGION` and `$SETUP_TOKEN` for the rest of the tutorial.*

2.  **Verify**: You can verify the variables were set by running:
    ```bash
    echo "Region: $CHOSEN_REGION"
    echo "Token: $SETUP_TOKEN"
    ```

3.  **Establish Project Context**: Ensure you are in the correct Google Cloud project.
    <walkthrough-project-setup></walkthrough-project-setup>

    Run the following command to set your project context (replace `<YOUR_PROJECT_ID>` with your actual Project ID):

    ```bash
    gcloud config set project <YOUR_PROJECT_ID>
    ```

4.  **Enable APIs**: Run the following command to enable the necessary APIs.

```bash
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    cloudresourcemanager.googleapis.com \
    discoveryengine.googleapis.com \
    dialogflow.googleapis.com \
    aiplatform.googleapis.com \
    gmail.googleapis.com
```

### 5. Link Apps Script to GCP Project (CRITICAL)
For Gmail Push Notifications to work, your Apps Script project must be linked to your GCP Project:
1.  **Get Project Number**: Run this command in the terminal below and **copy the resulting number**:
    ```bash
    gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"
    ```
2.  **Open Apps Script**: In your Apps Script editor, click the **Settings** (gear icon) on the left.
3.  **Change Project**: Scroll down to **Google Cloud Platform (GCP) Project** and click **Change project**.
4.  **Paste & Set**: Paste your **Project Number** and click **Set project**.

### 6. Grant Permissions
Execute these blocks one by one to ensure your account has the necessary permissions.
**1. Initialize Identity**
Use the token directly as the email, with a fallback to the active gcloud account.
```bash
USER_EMAIL=${SETUP_TOKEN:-$(gcloud config get-value account)}
PROJECT_ID=$(gcloud config get-value project)
echo "Setting permissions for: $USER_EMAIL"
```

**2. Grant Viewer Access** (Required for 'Verify Deployment' and 'Fetch Projects')
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/run.viewer"
```

**3. Grant Admin/Editor Access** (Required for 'Update Backend' and Automated Agent Builder)
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/discoveryengine.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/serviceusage.serviceUsageAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/pubsub.admin"
```

**4. Grant Agent Service Account Permissions** (Required for the Agent to self-provision)
```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SA_EMAIL="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

echo "Granting permissions to Service Account: $SA_EMAIL"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/discoveryengine.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/dialogflow.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/serviceusage.serviceUsageAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/pubsub.admin"
```

## Step 2: Initialize Submodules

Ensure the agent code is correctly pulled from the submodule:

```bash
git submodule update --init --recursive
```

## Step 3: Build and Deploy

1.  **Create Repository**: Create a Docker repository in Artifact Registry to host your agent image.

```bash
gcloud artifacts repositories create agent-repo \
    --repository-format=docker \
    --location=$CHOSEN_REGION \
    --description="Docker repository for Rapid Agent Gmail Suite"
```

2.  **Navigate and Build**: Navigate to the agent directory and build the container image.

```bash
cd agents/smart-email-manager
```

Execute the build command:

```bash
gcloud builds submit --tag $CHOSEN_REGION-docker.pkg.dev/$(gcloud config get-value project)/agent-repo/smart-email-manager-agent .
```

3.  **Deploy to Cloud Run**: After the build completes, deploy the container to Cloud Run.

```bash
gcloud run deploy smart-email-manager-agent \
  --image $CHOSEN_REGION-docker.pkg.dev/$(gcloud config get-value project)/agent-repo/smart-email-manager-agent \
  --platform managed \
  --region $CHOSEN_REGION \
  --allow-unauthenticated \
  --port 8080
```

## Step 4: Verify Deployment

Once the deployment is successful, gcloud will output your **Service URL** (e.g., `https://smart-email-manager-agent-xyz-uc.a.run.app`).

1.  **Copy the Service URL** from the terminal.
2.  Return to your **Gmail Sidebar**.
3.  Paste the URL into the **"Cloud Run Service URL"** box.
4.  Click the **"Verify Connection"** button.

The add-on will automatically connect to your agent, retrieve your Project ID, and finalize the setup.

Congratulations! Your Smart Email Manager Agent is now live.
