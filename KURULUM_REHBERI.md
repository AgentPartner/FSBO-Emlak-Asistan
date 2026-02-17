# 🏠 KURULUM REHBERİ

## 1. Gerekli Hesaplar

| Servis | URL | Amaç |
|--------|-----|------|
| Vapi.ai | vapi.ai | Voice AI |
| Anthropic | console.anthropic.com | Claude API |
| Supabase | supabase.com | Veritabanı |
| Bright Data | brightdata.com | Scraping |
| Twilio | twilio.com | Telefon |

## 2. Veritabanı Kurulumu

```sql
-- Supabase SQL Editor'da sırasıyla çalıştırın:
-- 1. database_schema.sql
-- 2. database_schema_extra.sql
```

## 3. n8n Credentials

### PostgreSQL
```
Host: db.xxx.supabase.co
Database: postgres
User: postgres
Password: [supabase'den]
SSL: true
```

### Vapi API
```
Type: HTTP Header Auth
Name: Authorization
Value: Bearer YOUR_VAPI_KEY
```

### Anthropic API
```
Type: HTTP Header Auth
Name: x-api-key
Value: YOUR_ANTHROPIC_KEY
```

## 4. Workflow Import

1. n8n → Import from File
2. JSON dosyalarını sırayla yükleyin (1-9)
3. Her workflow'da credentials'ları bağlayın

## 5. Environment Variables

n8n Settings → Variables:
```
VAPI_PHONE_NUMBER_ID=phn_xxx
WEBHOOK_BASE_URL=https://n8n.agentpartner.pro
ANTHROPIC_API_KEY=sk-ant-xxx
```

## 6. Vapi.ai Webhook

Dashboard → Your Phone Number → Server URL:
```
https://n8n.agentpartner.pro/webhook/vapi-callback
```

## 7. Test

1. Manuel bir lead ekleyin
2. Workflow 5'i çalıştırın (Manuel Arama)
3. Kendi numaranızı test edin
4. Webhook'un çalıştığını doğrulayın

## 8. Canlıya Alma

1. Workflow 1'i aktifleştirin (Scraping)
2. Workflow 2'yi aktifleştirin (Calling)
3. Workflow 3 zaten webhook olarak aktif
4. Workflow 4'ü aktifleştirin (Raporlama)
