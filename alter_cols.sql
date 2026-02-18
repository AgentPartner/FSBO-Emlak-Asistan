ALTER TABLE fsbo_call_logs ADD COLUMN IF NOT EXISTS call_id VARCHAR(100);
ALTER TABLE fsbo_call_logs ADD COLUMN IF NOT EXISTS ilan_sahibi VARCHAR(200);
ALTER TABLE fsbo_call_logs ADD COLUMN IF NOT EXISTS baslik VARCHAR(500);
ALTER TABLE fsbo_call_logs ADD COLUMN IF NOT EXISTS telefon VARCHAR(20);
ALTER TABLE fsbo_call_logs ADD COLUMN IF NOT EXISTS randevu_notu TEXT;
ALTER TABLE fsbo_call_logs ADD COLUMN IF NOT EXISTS randevu_yeri TEXT;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='fsbo_call_logs' ORDER BY ordinal_position;
