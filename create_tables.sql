-- FSBO EMLAK ASISTAN TABLOLARI

-- 1. LEADS TABLOSU
CREATE TABLE IF NOT EXISTS fsbo_leads (
    id SERIAL PRIMARY KEY,
    ilan_id VARCHAR(50) UNIQUE NOT NULL,
    baslik VARCHAR(500),
    aciklama TEXT,
    fiyat DECIMAL(15,2),
    fiyat_formatted VARCHAR(50),
    para_birimi VARCHAR(10) DEFAULT 'TRY',
    il VARCHAR(100),
    ilce VARCHAR(100),
    mahalle VARCHAR(100),
    adres TEXT,
    mulk_tipi VARCHAR(50),
    oda_sayisi VARCHAR(20),
    metrekare INTEGER,
    bina_yasi INTEGER,
    kat VARCHAR(20),
    telefon VARCHAR(20),
    ilan_sahibi VARCHAR(200),
    ilan_tarihi TIMESTAMP,
    goruntuleme INTEGER DEFAULT 0,
    foto_sayisi INTEGER DEFAULT 0,
    ilan_url TEXT,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lead_score INTEGER DEFAULT 50,
    oncelik VARCHAR(20) DEFAULT 'orta',
    durum VARCHAR(50) DEFAULT 'yeni',
    arama_sayisi INTEGER DEFAULT 0,
    son_arama TIMESTAMP,
    vapi_call_id VARCHAR(100),
    randevu_durumu VARCHAR(50),
    randevu_tarihi TIMESTAMP,
    whatsapp_gonderildi BOOLEAN DEFAULT FALSE,
    red_nedeni VARCHAR(200),
    notlar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CALL LOGS TABLOSU
CREATE TABLE IF NOT EXISTS fsbo_call_logs (
    id SERIAL PRIMARY KEY,
    ilan_id VARCHAR(50),
    vapi_call_id VARCHAR(100) UNIQUE,
    arama_baslangic TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    arama_bitis TIMESTAMP,
    sure_saniye INTEGER,
    maliyet DECIMAL(10,4),
    durum VARCHAR(50),
    transcript TEXT,
    recording_url TEXT,
    randevu_alindi BOOLEAN DEFAULT FALSE,
    randevu_tarihi TIMESTAMP,
    tekrar_ara BOOLEAN DEFAULT FALSE,
    red_nedeni VARCHAR(200),
    musteri_ilgisi INTEGER,
    duygu VARCHAR(20),
    ozet TEXT,
    sonraki_adim TEXT,
    kalite_puani INTEGER,
    kalite_notu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. APPOINTMENTS TABLOSU
CREATE TABLE IF NOT EXISTS fsbo_appointments (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER,
    call_log_id INTEGER,
    randevu_tarihi TIMESTAMP NOT NULL,
    randevu_turu VARCHAR(50) DEFAULT 'degerleme',
    konum TEXT,
    atanan_personel VARCHAR(200),
    durum VARCHAR(50) DEFAULT 'bekliyor',
    sonuc VARCHAR(50),
    sonuc_notu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DO NOT CALL TABLOSU
CREATE TABLE IF NOT EXISTS fsbo_do_not_call (
    id SERIAL PRIMARY KEY,
    telefon VARCHAR(20) UNIQUE NOT NULL,
    neden VARCHAR(200),
    ekleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXLER
CREATE INDEX IF NOT EXISTS idx_fsbo_leads_durum ON fsbo_leads(durum);
CREATE INDEX IF NOT EXISTS idx_fsbo_leads_il ON fsbo_leads(il);
CREATE INDEX IF NOT EXISTS idx_fsbo_leads_score ON fsbo_leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_fsbo_call_logs_ilan ON fsbo_call_logs(ilan_id);
CREATE INDEX IF NOT EXISTS idx_fsbo_appointments_tarih ON fsbo_appointments(randevu_tarihi);
