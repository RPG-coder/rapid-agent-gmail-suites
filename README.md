# Rapid Agent Gmail Suite

A specialized, event-driven multi-agent Google Workspace Add-on built for the Google Rapid Agent Hackathon. This suite leverages the Google Agent Development Kit (ADK) and Model Context Protocol (MCP) to provide intelligent email management, deep analytics, and self-observing LLM performance tuning.

## 🏗️ Architecture

The system is built on a serverless architecture using Google Cloud Run, orchestrated via Pub/Sub and EventArc triggers. It features three primary agents working in concert:

### 1. Smart Email Manager (`agents/smart-email-manager/`)

- **Responsibility:** Real-time email categorization, automated drafts, and semantic bucket grouping.
- **Tech Stack:** Voyage AI (embeddings), MongoDB (operational vector cluster/change streams).
- **Workflow:** Event-driven via Google Cloud Pub/Sub.

### 2. Inbox Analytics (`agents/inbox-analytics/`)

- **Responsibility:** Analytical RAG, computing email velocity patterns, and response metrics.
- **Tech Stack:** Fivetran, BigQuery, Vertex AI Vector Search.
- **Workflow:** SQL interaction via BigQuery and semantic parsing via Vertex AI.

### 3. Self-Arizeing Manager (`agents/self-arizeing-manager/`)

- **Responsibility:** LLM observability, trace diagnostics, and automated prompt performance tuning.
- **Tech Stack:** OpenInference Tracing SDK, Arize Phoenix, Gemini 3 (LLM-as-a-Judge).
- **Workflow:** Evaluates trace logs and updates MongoDB semantic notes.

## 📂 Project Structure

- `agents/`: Contains the logic for the three specialized agents.
- `publish/sidebar-ui/`: Gmail Sidebar UI components (Apps Script/TypeScript).
- `shared/`: Single source of truth for MCP schemas and common utility clients.

## 🛠️ Tech Stack

- **Language:** Python 3.11+ (Agents), TypeScript (Sidebar UI)
- **Frameworks:** Google Agent Development Kit (ADK), Model Context Protocol (MCP)
- **Infrastructure:** Google Cloud Run, Pub/Sub, EventArc
- **Databases:** MongoDB, BigQuery
- **AI/ML:** Gemini 3, Voyage AI, Vertex AI

## 🖥️ UI Component Overview

The Sidebar UI is organized into several key functional screens:

- **Main Card**: Entry point showing all agent modules.
- **Smart Email Manager**: Controls for label thresholds and semantic re-organization.
- **Inbox Analytics**: Detailed metrics, response time analysis, and natural language mailbox querying.
- **Self Arize-ing Manager**: Central hub for user personalization, data privacy (Delete Data), and MCP connection management.
- **User Personalization**: Interactive dashboard to review and toggle identified email routines and agent-learned preferences.

### Technical Note: State Management

The Google Apps Script environment is stateless. The Sidebar UI manages state (e.g., active preference IDs, search queries, or chat history) by serializing data into action parameters using `CardService.newAction().setParameters()`. This ensures a seamless interactive experience across card updates.

## 🚀 Deployment

Deployment is handled via serverless containers on Google Cloud Run. See `publish/deploy.sh` for deployment scripts.

---

## 🚀 Quick Start: UI Deployment

To get the Gmail Sidebar UI running, follow these steps:

### 1. Prerequisite: Enable Apps Script API

Go to [script.google.com/home/settings](https://script.google.com/home/settings) and toggle **Google Apps Script API** to **ON**.

### 2. Initial Setup (One-time)

Run these commands in the `publish/` directory to link your local code to a Google Apps Script project:

```powershell
cd publish
npm install
npx clasp login
npx clasp create --title "Rapid Agent Gmail Suite" --type gmail --rootDir .
```

### 3. Automated Deployment

Once linked, use the provided scripts to push code and generate a Deployment ID for the GCP Console:

**On Windows:**

```powershell
powershell.exe -File publish/deploy.ps1
```

**On Mac/Linux:**

```bash
bash publish/deploy.sh
```

---

## 👥 Team & Contributions

- **Rahul Gautham Putcha**: Lead Agent Architect & Repo Holder. Responsible for the core agent logic in `smart-email-manager` and `inbox-analytics`, MCP schema design, and backend infrastructure. Responsible for the Gmail Sidebar UI in `publish/sidebar-ui/`.
- **Sree Harshitha Jonnalagadda**: Data Integration & Observability Specialist. The `self-arizeing-manager` telemetry pipeline, and project orchestration.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Notice:** This repository has been initialized with a README and LICENSE file. Please update the copyright placeholders in the LICENSE file with your information.
