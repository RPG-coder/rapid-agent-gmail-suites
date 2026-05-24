# Deploying Smart Email Manager Agent

Welcome to the deployment tutorial for the Smart Email Manager Agent! This guide will help you deploy your agent to Google Cloud Run in your selected region.

## Prerequisites

1.  **Project ID**: Ensure you are in the correct Google Cloud project.
    <walkthrough-project-setup></walkthrough-project-setup>

2.  **Enable APIs**: Run the following command to enable the necessary APIs (Cloud Build, Cloud Run, and Artifact Registry).

```bash
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com
```

## Step 1: Prepare Environment

The Gmail Add-on has already provided your preferred region and a setup token.

- **Selected Region**: `$CHOSEN_REGION`
- **Setup Token**: `$SETUP_TOKEN`

## Step 2: Build and Deploy

Navigate to the agent directory and run the deployment script. The script will use the region you selected in the Gmail Add-on.

```bash
cd agents/smart-email-manager
```

Now, execute the deployment command:

```bash
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/smart-email-manager-agent .
```

After the build completes, deploy to Cloud Run:

```bash
gcloud run deploy smart-email-manager-agent \
  --image gcr.io/$(gcloud config get-value project)/smart-email-manager-agent \
  --platform managed \
  --region $CHOSEN_REGION \
  --allow-unauthenticated \
  --port 8080
```

## Step 3: Verify Deployment

Once the deployment is successful, return to your Gmail Sidebar and click the **"Verify Deployment"** button. The add-on will automatically find your new service in the `$CHOSEN_REGION` region and connect to it.

Congratulations! Your Smart Email Manager Agent is now live.
