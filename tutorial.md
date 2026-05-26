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
    cloudresourcemanager.googleapis.com
```

5.  **Grant Permissions**: Run the following to ensure your Gmail account has the necessary permissions to manage the deployment and fetch projects. Execute these blocks one by one:

**Initialize Identity**
```bash
# Use the token directly as the email, with a fallback to the active gcloud account
USER_EMAIL=${SETUP_TOKEN:-$(gcloud config get-value account)}
PROJECT_ID=$(gcloud config get-value project)

echo "Setting permissions for: $USER_EMAIL"
```

**Required for 'Verify Deployment' and 'Fetch Projects'**
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/run.viewer"
```

**Required for 'Update Backend' (One-Click Update)**
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$USER_EMAIL" \
    --role="roles/run.admin"
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
