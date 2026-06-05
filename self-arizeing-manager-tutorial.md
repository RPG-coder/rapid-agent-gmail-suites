# Master Deployment Guide: Self-Arizeing Manager (SAM)

This guide provides the instructions to deploy the Self-Arizeing Manager agent, which provides LLM observability and automated preference tuning for the Gmail Suite.

## Step 0: Arize Phoenix Cloud Setup

Before deploying the agent, you must set up your observability backend.

1.  **Register**: Sign up for a free account at [Arize Phoenix Cloud](https://app.phoenix.arize.com/).
2.  **Generate API Key**:
    *   Go to **Settings** > **API Keys**.
    *   Create a new key and copy it.
3.  **Note Project Name**: By default, we use `gmail-suite-sam`. Ensure this project exists or will be auto-created by your first trace.

---

## Step 1: Configure Environment

In your `agents/self-arizeing-manager/` directory, ensure your `.env` file contains:

```bash
PHOENIX_API_KEY="your_phoenix_api_key_here"
PHOENIX_PROJECT_NAME="gmail-suite-sam"
MONGO_URI="your_mongodb_atlas_uri"
VOYAGE_API_KEY="your_voyage_ai_key"
```

---

## Step 2: Build and Deploy to Cloud Run

This agent acts as an MCP SSE Server, allowing Vertex AI to use its tools.

1.  **Deploy**:
    ```powershell
    cd agents/self-arizeing-manager/deploy
    ./deploy_sam.ps1
    ```
2.  **Capture SSE URL**: At the end of the script, copy the URL ending in `/mcp/sse`.
    *   Example: `https://self-arizeing-manager-agent-xyz.a.run.app/mcp/sse`

---

## Step 3: Register in Vertex AI Agent Builder

1.  **Create Agent**: In [Vertex AI Agent Builder](https://console.cloud.google.com/ai/platform/agents), create a new **Playbook-based Agent**.
2.  **Add Tool**:
    *   Click **Tools** > **Create**.
    *   Select **Model Context Protocol (MCP)**.
    *   Paste your SSE URL from Step 2.
3.  **Capabilities**: This agent now has the power to:
    *   `pull_failed_traces`: Inspect logs from Phoenix Cloud.
    *   `analyze_failure_and_update_preferences`: Use Gemini 3.5 to turn mistakes into long-term memory.
    *   `update_user_preference`: Directly edit the MongoDB semantic memory.

---

## Step 4: The Semantic Loop (Testing)

The power of SAM is improving the `smart-email-manager`.

1.  **Generate Traces**: Use the Gmail Sidebar to categorize emails.
2.  **Identify Failure**: If an email is misclassified, go to Arize Phoenix and tag it or wait for SAM to identify it.
3.  **Run SAM**: Ask your Vertex AI Agent: *"Check my recent failed traces and update my preferences."*
4.  **Verify Memory**: Check your MongoDB `UserPreferences` collection. You should see a new document with an `llm_semantic_note`.
5.  **Enjoy Stability**: Next time you perform a similar action, the `smart-email-manager` will perform a vector search on `UserPreferences`, find the semantic note, and adjust its behavior.

**DONE!** 🕵️ Your Gmail Suite is now self-correcting and improving over time.
