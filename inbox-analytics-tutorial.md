# 📊 Tutorial: Setting up Inbox-Analytics Agent

This tutorial guides you through the setup and validation of the **Inbox-Analytics** agent, focusing on Vertex AI integration and BigQuery analytical processing.

## 🛠️ Prerequisites
- Google Cloud Project: `grah-2026`
- Active Fivetran connectors (MongoDB to BigQuery)
- Enabled Vertex AI and Discovery Engine APIs

---

## 🔍 Step 1: Vertex AI Validation
Before building the agent, ensure the Vertex AI environment is ready.

### 1.1 Verify API Enablement
Run this command to check if the necessary services are active:
```bash
gcloud services list --enabled --filter="name:(discoveryengine.googleapis.com OR aiplatform.googleapis.com)"
```

### 1.2 Test Discovery Engine Access
Verify that you can list engines (agents) in your project:
```bash
curl -X GET \
-H "Authorization: Bearer $(gcloud auth print-access-token)" \
"https://discoveryengine.googleapis.com/v1beta/projects/grah-2026/locations/global/collections/default_collection/engines"
```

---

## 📈 Step 2: BigQuery Analytical View Setup
The Analytics engine requires a specialized view to calculate response times (deltas) between emails in the same thread.

### 2.1 Create the Response Analytics View
Run this command to create the `v_response_analytics` view. This view parses raw JSON data from the `email_data` table and calculates response latency.

```bash
bq query --use_legacy_sql=false --project_id=grah-2026 \
"CREATE OR REPLACE VIEW mongo_sync_smart_email_manger.v_response_analytics AS 
WITH base_data AS ( 
  SELECT 
    JSON_VALUE(data, '$.thread_id') as thread_id, 
    JSON_VALUE(data, '$.message_id') as message_id, 
    JSON_VALUE(data, '$.sender') as sender, 
    SAFE_CAST(JSON_VALUE(data, '$.sent_at') AS TIMESTAMP) as sent_at_ts 
  FROM mongo_sync_smart_email_manger.email_data 
) 
, thread_deltas AS ( 
  SELECT 
    thread_id, 
    sender as original_sender, 
    sent_at_ts as original_sent_at, 
    LEAD(sender) OVER (PARTITION BY thread_id ORDER BY sent_at_ts) as responder, 
    LEAD(sent_at_ts) OVER (PARTITION BY thread_id ORDER BY sent_at_ts) as response_at 
  FROM base_data 
  WHERE thread_id IS NOT NULL 
) 
SELECT 
  *, 
  TIMESTAMP_DIFF(response_at, original_sent_at, MINUTE) / 60.0 as response_time_hours, 
  FORMAT_TIMESTAMP('%A', original_sent_at) as day_of_week, 
  EXTRACT(HOUR FROM original_sent_at) as hour_of_day, 
  EXTRACT(DAYOFWEEK FROM original_sent_at) as day_num 
FROM thread_deltas 
WHERE responder IS NOT NULL 
  AND original_sender != responder"
```

### 2.2 Verify the View Structure
Ensure the view was created successfully and inspect the columns:
```bash
bq show --format=prettyjson grah-2026:mongo_sync_smart_email_manger.v_response_analytics
```

---

## 🤖 Step 3: Agent Creation (Scaffold)
(To be detailed in Phase 2)
