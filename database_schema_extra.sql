-- =====================================================
-- FSBO EMLAK ASISTAN - EK VERİTABANI TABLOLARI
-- A/B Testing, WhatsApp, Kalite Kontrol için
-- =====================================================

-- A/B Test Varyantları
CREATE TABLE IF NOT EXISTS ab_test_variants (
    id SERIAL PRIMARY KEY,
    isim VARCHAR(100) NOT NULL,
    aciklama TEXT,
    test_tipi VARCHAR(50), -- prompt, ses, zamanlama, acilis
    prompt_degisiklik TEXT, -- JSON formatında değişiklikler
    agirlik INTEGER DEFAULT 1, -- Weighted selection için
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Örnek varyantlar
INSERT INTO ab_test_variants (isim, aciklama, test_tipi, prompt_degisiklik, agirlik) VALUES
('Kontrol', 'Standart prompt', 'prompt', '{}', 5),
('Değer Öncelikli', 'Değer önerisini öne çıkar', 'prompt', '{"emphasis": "value_proposition"}', 3),
('Empati Öncelikli', 'Empatiyi artır', 'prompt', '{"emphasis": "empathy"}', 2),
('Direkt Randevu', 'Hızlı randevu kapanışı', 'prompt', '{"style": "direct_close"}', 2);

-- Call logs'a A/B test alanı ekle
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS ab_variant_id INTEGER REFERENCES ab_test_variants(id);
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS ai_kalite_puani INTEGER;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS ai_kalite_detay JSONB;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS kalite_puani INTEGER;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS kalite_notu TEXT;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS kalite_tarihi TIMESTAMP;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS kalite_veren VARCHAR(100);

-- Leads'e WhatsApp alanları ekle
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_gonderildi BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_tarihi TIMESTAMP;

-- INDEX'ler
CREATE INDEX IF NOT EXISTS idx_call_logs_ab_variant ON call_logs(ab_variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_variants_aktif ON ab_test_variants(aktif);

-- A/B Test sonuçları VIEW'ı
CREATE OR REPLACE VIEW v_ab_test_results AS
SELECT 
    v.id,
    v.isim,
    v.test_tipi,
    COUNT(cl.id) as toplam_arama,
    SUM(CASE WHEN cl.randevu_alindi THEN 1 ELSE 0 END) as randevu,
    ROUND(100.0 * SUM(CASE WHEN cl.randevu_alindi THEN 1 ELSE 0 END) / NULLIF(COUNT(cl.id), 0), 2) as donusum_orani,
    ROUND(AVG(cl.musteri_ilgisi), 2) as ort_ilgi,
    ROUND(AVG(cl.sure_saniye), 0) as ort_sure,
    SUM(cl.maliyet) as toplam_maliyet
FROM ab_test_variants v
LEFT JOIN call_logs cl ON cl.ab_variant_id = v.id
WHERE v.aktif = true
GROUP BY v.id, v.isim, v.test_tipi
ORDER BY donusum_orani DESC NULLS LAST;

-- Kalite istatistikleri VIEW'ı
CREATE OR REPLACE VIEW v_quality_stats AS
SELECT 
    DATE(arama_baslangic) as tarih,
    COUNT(*) as toplam_kayit,
    COUNT(kalite_puani) as manuel_degerlendirilmis,
    COUNT(ai_kalite_puani) as ai_degerlendirilmis,
    ROUND(AVG(kalite_puani), 2) as ort_manuel_puan,
    ROUND(AVG(ai_kalite_puani), 2) as ort_ai_puan,
    ROUND(AVG(musteri_ilgisi), 2) as ort_musteri_ilgisi
FROM call_logs
GROUP BY DATE(arama_baslangic)
ORDER BY tarih DESC;

-- WhatsApp takip istatistikleri
CREATE OR REPLACE VIEW v_whatsapp_stats AS
SELECT 
    DATE(whatsapp_tarihi) as tarih,
    COUNT(*) as gonderilen,
    SUM(CASE WHEN durum = 'randevu_alindi' THEN 1 ELSE 0 END) as sonradan_randevu,
    ROUND(100.0 * SUM(CASE WHEN durum = 'randevu_alindi' THEN 1 ELSE 0 END) / COUNT(*), 2) as donusum_orani
FROM leads
WHERE whatsapp_gonderildi = true
GROUP BY DATE(whatsapp_tarihi)
ORDER BY tarih DESC;
