-- 1. Create a temporary table with new Vertex AI embeddings
-- Note: This requires a BigQuery connection to Vertex AI (usually named 'gemini_conn' or similar)
CREATE OR REPLACE TABLE `grah-2026.mongo_sync_smart_email_manger.EmailData_Vertex_Migration` AS
SELECT 
  * EXCEPT(ml_generate_embedding_result, ml_generate_embedding_statistics, ml_generate_embedding_status),
  ml_generate_embedding_result as old_voyage_vector,
  ml_embedding.ml_generate_embedding_result as ml_generate_embedding_result,
  ml_embedding.ml_generate_embedding_status as ml_generate_embedding_status
FROM ML.GENERATE_EMBEDDING(
  MODEL `grah-2026.mongo_sync_smart_email_manger.embedding_model`, -- Ensure this model exists in BQ
  (SELECT * FROM `grah-2026.mongo_sync_smart_email_manger.EmailData_Enriched`),
  STRUCT('RETRIEVAL_DOCUMENT' as flatten_json_output)
) as ml_embedding;

-- 2. Verify results
SELECT subject, ARRAY_LENGTH(ml_generate_embedding_result) as dim 
FROM `grah-2026.mongo_sync_smart_email_manger.EmailData_Vertex_Migration` 
LIMIT 5;

-- 3. Final Step: Swap the tables (Manual check recommended before running)
-- DROP TABLE `grah-2026.mongo_sync_smart_email_manger.EmailData_Enriched`;
-- ALTER TABLE `grah-2026.mongo_sync_smart_email_manger.EmailData_Vertex_Migration` RENAME TO `EmailData_Enriched`;
