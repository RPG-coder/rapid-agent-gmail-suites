# Deploying Smart Email Manager Agent

Welcome to the deployment tutorial for the Smart Email Manager Agent! This guide will help you deploy your agent to Google Cloud Run in your selected region.

## Prerequisites

1.  **Project ID**: Ensure you are in the correct Google Cloud project.
    <walkthrough-project-setup></walkthrough-project-setup>

    Run the following command to set your project context (replace `<YOUR_PROJECT_ID>` with your actual Project ID):

    ```bash
    gcloud config set project <YOUR_PROJECT_ID>
    ```

2.  **Enable APIs**: Run the following command to enable the necessary APIs.

```bash
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com
```

## Step 1: Prepare Environment

The Gmail Add-on has already provided your preferred region and a setup token.

- **Selected Region**: `$CHOSEN_REGION`
- **Setup Token**: `$SETUP_TOKEN`

Run the following to prepare your environment and ensure your Gmail account has the necessary permissions to verify the deployment later:

```bash
USER_EMAIL=$(echo $SETUP_TOKEN | base64 --decode)
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member="user:$USER_EMAIL" \
    --role="roles/run.viewer"
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

Once the deployment is successful, return to your Gmail Sidebar and click the **"Verify Deployment"** button. The add-on will automatically find your new service in the `$CHOSEN_REGION` region and connect to it.

Congratulations! Your Smart Email Manager Agent is now live.
