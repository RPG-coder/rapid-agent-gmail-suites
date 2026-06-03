CREATE OR REPLACE VIEW `grah-2026.mongo_sync_smart_email_manger.v_response_analytics` AS 
WITH base_data AS ( 
  SELECT 
    JSON_VALUE(data, "$.thread_id") as thread_id, 
    JSON_VALUE(data, "$.message_id") as message_id, 
    JSON_VALUE(data, "$.sender") as sender, 
    SAFE_CAST(JSON_VALUE(data, "$.sent_at") AS TIMESTAMP) as sent_at_ts 
  FROM `grah-2026.mongo_sync_smart_email_manger.email_data` 
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
  FORMAT_TIMESTAMP("%A", original_sent_at) as day_of_week, 
  EXTRACT(HOUR FROM original_sent_at) as hour_of_day, 
  EXTRACT(DAYOFWEEK FROM original_sent_at) as day_num 
FROM thread_deltas 
WHERE responder IS NOT NULL 
  AND original_sender != responder
