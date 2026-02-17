# 🏠 FSBO EMLAK ARAMA ASİSTANI
## Komple n8n Workflow Sistemi

---

## 📁 DOSYA YAPISI

```
C:\FSBO_Emlak_Asistan\
│
├── 📋 WORKFLOW DOSYALARI (n8n'e import edin)
│   ├── 1_Lead_Scraping_Workflow.json      # Sahibinden'den lead çekme
│   ├── 2_AI_Calling_Workflow.json         # Vapi.ai ile otomatik arama
│   ├── 3_Vapi_Webhook_Handler.json        # Arama sonuçları işleme
│   ├── 4_Daily_Report_Workflow.json       # Günlük raporlama
│   ├── 5_Manual_Call_Trigger.json         # Manuel arama tetikleme API
│   ├── 6_WhatsApp_Followup.json           # WhatsApp takip mesajları
│   ├── 7_Quality_Control.json             # Kayıt dinleme & kalite kontrol
│   ├── 8_Dashboard_API.json               # Dashboard için API endpoints
│   └── 9_AB_Testing.json                  # A/B test yönetimi
│
├── 🗄️ VERİTABANI
│   ├── database_schema.sql                # Ana PostgreSQL şeması
│   └── database_schema_extra.sql          # Ek tablolar (A/B test, vb.)
│
├── 🎨 DASHBOARD
│   └── dashboard/index.html               # Web dashboard arayüzü
│
├── 🔧 SCRAPER
│   └── scraper/sahibinden_scraper.py      # Python scraper örneği
│
├── 📝 DOKÜMANTASYON
│   ├── KURULUM_REHBERI.md                 # Adım adım kurulum
│   ├── AI_PROMPT_TEMPLATES.md             # AI asistan promptları
│   └── .env.example                       # Environment variables
│
└── README.md                              # Bu dosya
```

---

## 🚀 HIZLI BAŞLANGIÇ

### 1️⃣ Veritabanı Kurulumu
```sql
-- Supabase SQL Editor'da çalıştırın
-- 1. database_schema.sql
-- 2. database_schema_extra.sql
```

### 2️⃣ n8n Workflow Import
```
n8n Dashboard → Import → JSON dosyalarını yükleyin
```

### 3️⃣ Credentials Ayarlama
- PostgreSQL (Supabase)
- Vapi.ai API Key
- Anthropic (Claude) API Key
- Twilio (opsiyonel)
- Slack (opsiyonel)
- Google Calendar (opsiyonel)

### 4️⃣ Environment Variables
```bash
VAPI_API_KEY=your_key
VAPI_PHONE_NUMBER_ID=phn_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
WEBHOOK_BASE_URL=https://n8n.agentpartner.pro
```

---

## 📊 SİSTEM MİMARİSİ

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FSBO EMLAK ASİSTAN SİSTEMİ                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   VERI TOPLAMA          ARAMA               SONUÇ İŞLEME               │
│   ─────────────         ─────               ────────────               │
│   ┌───────────┐        ┌───────────┐       ┌───────────┐               │
│   │Sahibinden │───────▶│  Lead DB  │──────▶│  Vapi.ai  │               │
│   │ Scraper   │        │ (Postgres)│       │ AI Calls  │               │
│   └───────────┘        └───────────┘       └─────┬─────┘               │
│        │                                         │                      │
│        │                                         ▼                      │
│        │                                   ┌───────────┐               │
│        │                                   │  Webhook  │               │
│        │                                   │  Handler  │               │
│        │                                   └─────┬─────┘               │
│        │                                         │                      │
│        ▼                                         ▼                      │
│   ┌───────────┐        ┌───────────┐       ┌───────────┐               │
│   │ Lead      │        │ WhatsApp  │       │ Randevu   │               │
│   │ Scoring   │        │ Followup  │       │ Oluştur   │               │
│   └───────────┘        └───────────┘       └───────────┘               │
│                                                  │                      │
│   RAPORLAMA & ANALİZ                            │                      │
│   ──────────────────                            │                      │
│   ┌───────────┐        ┌───────────┐           │                      │
│   │  Daily    │        │ Dashboard │◀──────────┘                      │
│   │  Report   │        │   API     │                                   │
│   └───────────┘        └───────────┘                                   │
│        │                     │                                         │
│        ▼                     ▼                                         │
│   ┌───────────┐        ┌───────────┐       ┌───────────┐               │
│   │   Slack   │        │  Web UI   │       │  A/B Test │               │
│   │   Email   │        │ Dashboard │       │  Manager  │               │
│   └───────────┘        └───────────┘       └───────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 ÖZELLİKLER

### ✅ Temel Özellikler
- [x] Sahibinden.com'dan otomatik lead çekme
- [x] AI destekli sesli arama (Vapi.ai + Claude)
- [x] Gerçek zamanlı transkript ve kayıt
- [x] Otomatik randevu oluşturma
- [x] Claude ile konuşma analizi
- [x] Günlük performans raporları

### ✅ Gelişmiş Özellikler
- [x] Manuel arama tetikleme API'si
- [x] WhatsApp takip mesajları
- [x] Kayıt dinleme ve kalite kontrol
- [x] AI destekli kalite değerlendirme
- [x] Web dashboard
- [x] A/B testing sistemi
- [x] Lead scoring algoritması

### 🔜 Gelecek Özellikler
- [ ] SMS entegrasyonu
- [ ] HubSpot/Pipedrive CRM entegrasyonu
- [ ] Çoklu asistan desteği (farklı karakterler)
- [ ] Gelişmiş analytics dashboard
- [ ] Mobil uygulama

---

## 💰 TAHMİNİ MALİYET (100 arama/gün)

| Servis | Aylık Maliyet |
|--------|---------------|
| Vapi.ai | $750 - $1,500 |
| Claude API | $200 - $400 |
| Twilio | $225 - $450 |
| Bright Data | $500 |
| Supabase | $25 |
| **TOPLAM** | **$1,700 - $2,900** |

---

## 📈 BEKLENEN PERFORMANS

| Metrik | Değer |
|--------|-------|
| Bağlantı Oranı | %60-70 |
| İlgi Gösteren | %40-50 |
| **Randevu Oranı** | **%8-12** |
| Günlük Randevu | 8-12 adet |

---

## 🔗 API ENDPOINTS

### Dashboard API
```
GET  /webhook/dashboard/overview      # Genel istatistikler
GET  /webhook/dashboard/leads         # Lead listesi
GET  /webhook/dashboard/appointments  # Randevu listesi
GET  /webhook/dashboard/analytics     # Detaylı analytics
POST /webhook/dashboard/appointments/update  # Randevu güncelle
```

### Arama API
```
POST /webhook/trigger-call            # Manuel arama başlat
POST /webhook/vapi-callback           # Vapi webhook handler
```

### Kalite Kontrol API
```
GET  /webhook/recordings              # Kayıtları listele
POST /webhook/recordings/rate         # Kayıt puanla
GET  /webhook/recordings/stats        # Kalite istatistikleri
POST /webhook/recordings/ai-review    # AI ile değerlendir
```

### A/B Testing API
```
GET  /webhook/ab-test/variants        # Varyantları listele
POST /webhook/ab-test/create          # Yeni varyant oluştur
GET  /webhook/ab-test/results         # Test sonuçları
GET  /webhook/ab-test/select-variant  # Weighted varyant seçimi
```

---

## 📞 DESTEK

- **Vapi.ai Docs:** https://docs.vapi.ai
- **n8n Docs:** https://docs.n8n.io
- **Anthropic Docs:** https://docs.anthropic.com

---

**Versiyon:** 1.0.0  
**Son Güncelleme:** 2024
