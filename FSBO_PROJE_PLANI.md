# 🏠 FSBO EMLAK ASISTAN - PROJE PLANI
**Son Güncelleme:** 18 Şubat 2026  
**Firma:** Nexus Realty (eski: Royal Emlak → Prestij Emlak)  
**AI Asistan:** Beyda Semercioğlu (30 yaş, 8 yıl tecrübe)

---

## 📂 DOSYA KONUMLARI

### Windows (Yerel Geliştirme)
| Dosya | Konum |
|-------|-------|
| **Proje Kök Dizin** | `C:\FSBO_Emlak_Asistan\` |
| **Dashboard HTML** | `C:\FSBO_Emlak_Asistan\dashboard\fsbo-dashboard.html` |
| **Chrome Extension** | `C:\FSBO_Emlak_Asistan\chrome-extension\` |
| **Beyda Prompt (referans)** | `C:\FSBO_Emlak_Asistan\beyda-prompt.txt` |
| **SQL Şema** | `C:\FSBO_Emlak_Asistan\create_tables.sql` |
| **SSH Key** | `C:\Users\mimar\.ssh\id_rsa` |

### Production Sunucu (46.224.146.57)
| Dosya | Konum |
|-------|-------|
| **Dashboard (canlı)** | `/opt/emlak-dashboard/index.html` |
| **Dashboard yedek** | `/opt/emlak-dashboard/index.html.bak` |
| **Docker Compose** | `/opt/emlak-dashboard/docker-compose.yml` |
| **Şifre dosyası** | `/opt/emlak-dashboard/.htpasswd` |
| **PostgreSQL Docker** | Container: `jko4k840gc00w80c40co4wwc` |
| **DB Bilgileri** | User: postgres, DB: postgres |

### GitHub
| Bilgi | Değer |
|-------|-------|
| **Repo** | `https://github.com/AgentPartner/FSBO-Emlak-Asistan` |
| **Branch** | main |

### URL'ler
| Servis | URL | Erişim |
|--------|-----|--------|
| **Dashboard** | `https://emlak.agentpartner.pro` | admin / NexusRealty2026 |
| **n8n Panel** | `https://n8n.agentpartner.pro` | — |

---

## ✅ TAMAMLANAN & ÇALIŞAN SİSTEMLER

### 1. Chrome Extension - Sahibinden Scraper ✅
Sahibinden.com'dan ilan detaylarını çekip DB'ye kaydediyor.
- **Dosyalar:** `C:\FSBO_Emlak_Asistan\chrome-extension\`
- **Çekilen:** İlan ID, başlık, fiyat, konum, m², kat, ısıtma, cephe, kategori, telefon, açıklama, KAKS, m² fiyatı
- **Webhook:** `/webhook/fsbo-ilan-ekle`

### 2. Dashboard (emlak.agentpartner.pro) ✅
5 sekmeli profesyonel yönetim paneli: **Genel Bakış, İlanlar, Aramalar, Randevular, Krediler**
- 🔒 Traefik basicauth şifre koruması (admin:NexusRealty2026)
- 📊 Chart.js interaktif grafikler (line chart + doughnut chart)
- 📈 Zaman aralıklı trend grafikleri (7 Gün / 14 Gün / 30 Gün / 3 Ay / Tümü)
- 📊 Dönüşüm hunisi — leads verisinden doğrudan hesaplanıyor, tüm durumları gösteriyor
- 📋 Özet kartlar — leads verisinden hesaplanan doğru sayılar
- 🎵 Audio player (seekbar + hız ayarı)
- 📝 Durum güncelleme, not ekleme, geri arama tarihi
- 🗑️ Toplu silme, aranmayı bekleyen banner
- ✏️ Randevu düzenleme (tarih/saat + konum)
- 📞 Toplu arama sistemi (batch calling) — progress bar, durdurma özelliği
- 🔔 Geri arama uyarıları (geciken/yaklaşan/tarihsiz)
- ✅ Aktif/Pasif tab ayrımı
- 💬 WhatsApp durum kolonu (bekliyor/gönderildi/okundu/hata)
- 🌙 Koyu tema, responsive design
- **Hosting:** Coolify Docker → Nginx + Traefik

### 3. Vapi AI Asistan - Beyda ✅ ÇALIŞIYOR
- **Assistant ID:** `10c4e584-0200-4a57-9262-b42bf75faf1c`
- **Phone Number ID:** `5f8b10b1-eda9-4036-b625-e50fdb23cffc`
- **Telefon:** 0850 303 3860 (Netgsm SIP) — **SIP BAĞLANTISI AKTİF, ARAMALAR GEÇİYOR**
- **Randevu Tool:** ID `0f3b2654-d980-4e25-a915-1c3ddc1d580c` — otomatik randevu kaydı
- Son başarılı aramalar: 17.02 16:14, 17.02 16:00, 16.02 20:40
- Mülk tipine göre dinamik konuşma (daire/arsa/dükkan/villa)
- 373 kadın ismi ile otomatik Bey/Hanım hitabı
- İki seçenekli randevu: yerinde değerleme veya ofise davet
- YASAK: "evinize gelelim" → Doğru: "dairenizi yerinde görmek"
- Anti-tekrar kuralları — "TEKRAR YAPMA" bölümü prompt'a eklendi
- Dinamik tarih bilgisi prompt'a enjekte ediliyor
- Gerçek prompt n8n workflow içinde dinamik oluşturuluyor

### 4. n8n Workflow'ları

**AKTİF (7 workflow):**
| ID | İsim | Webhook | Açıklama |
|----|-------|---------|----------|
| `mkM9ElMLusx6hWWT` | 📊 FSBO Dashboard API | `/webhook/fsbo-dashboard` | Dashboard veri çekme (GET), appointments tablosundan randevu, 90 gün trend |
| `DSZPgWy1ChnbvdVQ` | ➕ FSBO İlan Ekle API | `/webhook/fsbo-ilan-ekle` | Chrome ext'den ilan kaydet |
| `5ZbP1Cd4bbFB2gYz` | 🗑️ FSBO İlan Sil API | `/webhook/fsbo-delete-lead` | İlan silme |
| `9nPc4ZELtavPt7qE` | 🔄 FSBO Durum Güncelle API | `/webhook/fsbo-update-status` | Durum + randevu güncelleme (birleşik) |
| `Ecx63IrjOtfR1pbi` | 🔄 FSBO Manuel Arama Tetikleme | `/webhook/fsbo-manuel-arama` | Tek ilan arama başlat |
| `p19DB8ciE6HQyra2` | 🔔 FSBO Vapi Webhook Handler | `/webhook/vapi-callback` | Arama sonucu + randevu → call_logs + **appointments** tablosuna kaydet (14 node) |
| `UoyZ8IRDSZWWYJwl` | 📞 FSBO AI Calling - Vapi.ai | (dahili) | Vapi arama motoru, dinamik prompt |

**İNAKTİF (ileride kurulacak):**
| ID | İsim |
|----|-------|
| `N7c43M1k5wc2ptZ6` | 🎧 Kayıt Dinleme & Kalite |
| `MjZRjrHAnEfBEow2` | 📱 WhatsApp Takip |
| `opBDVkFIcpv8j0RW` | 💰 Servis Kredileri API |

### 5. Veritabanı Tabloları
- `fsbo_leads` — İlanlar/Lead'ler (durum, notlar, geri arama tarihi, WhatsApp durumu)
- `fsbo_call_logs` — Arama kayıtları (call_id, süre, transcript, recording_url, randevu bilgisi)
- `fsbo_appointments` — **AKTİF** ✅ Randevular (ilan_id, ilan_sahibi, telefon, baslik, tarih, tür, konum, durum, WhatsApp durumu)

**Durum Akışı:**
```
Yeni → Aktarıldı → Aranacak → Arama Yapıldı → Randevu / Tekrar Aranacak / İlgilenmiyor
                                              → Aranmayacak
```

### 6. Deploy Süreci
```
1. Claude dashboard.html düzenler (/home/claude/)
2. GitHub API ile upload (Python base64)
3. Sunucuya GitHub API'den çek (raw.githubusercontent cache sorunu var, api.github.com kullan):
   curl -sL -H 'Authorization: token TOKEN' -H 'Accept: application/vnd.github.v3.raw' \
     'https://api.github.com/repos/AgentPartner/FSBO-Emlak-Asistan/contents/dashboard/fsbo-dashboard.html' \
     -o /opt/emlak-dashboard/index.html
```

---

## ✅ ÇÖZÜLEN SORUNLAR
- ~~SIP Trunk 503 hatası~~ → ÇÖZÜLDÜ, aramalar başarıyla geçiyor
- ~~Randevu güncelleme ayrı workflow~~ → Durum Güncelle API'ye entegre edildi
- ~~"evinize gelelim" ifadesi~~ → Prompt'ta yasaklandı
- ~~Audio player kapanma sorunu~~ → Düzeltildi
- ~~Dashboard randevular sekmesi boş~~ → fsbo_appointments tablosundan çekiyor
- ~~Beyda tekrarlayan cümleler~~ → "TEKRAR YAPMA" bölümü eklendi
- ~~Arama süreleri yanlış~~ → Vapi API startedAt/endedAt parsing düzeltildi
- ~~n8n webhook response hatası~~ → respondToWebhook → set node'una çevrildi
- ~~Dönüşüm hunisi yanlış veriler~~ → Leads verisinden doğrudan hesaplama
- ~~Özet kartlar eksik durumlar~~ → Leads verisinden tüm durumlar hesaplanıyor
- ~~GitHub push protection~~ → Token izni verildi

---

## 🔧 YAPILACAKLAR

### 🔴 Acil — Beklemede
- **WhatsApp Cloud API Entegrasyonu** — Meta Developer hesabı SMS doğrulaması geçemiyor
  - Meta Business: "Nexus Realty" (ID: 1647391093135870)
  - WABA ID: 870786272439326
  - Sorun: Facebook güvenlik kısıtlaması, SMS gelmiyor
  - Çözüm: 24-48 saat bekle, tekrar dene
  - Fiyat: ~$0.0008/mesaj (Utility), 100 randevu/ay ~3 TL

### 🟡 Orta Öncelik
- Canlı arama testi — Gerçek numara ile tam akışı doğrula (arama → kayıt → randevu → appointments)
- WhatsApp mesaj şablonu oluştur ve Meta'dan onay al
- n8n'e WhatsApp node ekle (HTTP Request ile Meta API)
- WhatsApp durumu otomatik güncelleme sistemi (gönderildi/okundu webhook)

### 🟢 İlerisi
- Kalite kontrol sistemi (AI ile arama puanlama)
- Gelişmiş lead scoring algoritmaları
- Sahibinden.com dışı platform entegrasyonları
- Multi-agent / A-B test
- Ek iletişim kanalları (SMS, e-posta)

---

## 🔐 API ANAHTARLARI & KİMLİK BİLGİLERİ

| Servis | Bilgi |
|--------|-------|
| **Vapi API Key** | `76f2f9fb-9632-4c62-8ccb-f9abcd609f67` |
| **Vapi Assistant ID** | `10c4e584-0200-4a57-9262-b42bf75faf1c` |
| **Vapi Phone Number ID** | `5f8b10b1-eda9-4036-b625-e50fdb23cffc` |
| **Vapi Randevu Tool ID** | `0f3b2654-d980-4e25-a915-1c3ddc1d580c` |
| **ElevenLabs API Key** | `sk_98ee0d111f7b1bb7bb4c4f5a5aa29239b1ad08b1f8ddec89` |
| **Netgsm SIP** | User: `8503033860` / Pass: `u8JWKKcYD9Y3` / Server: `sip.netgsm.com.tr:5060` |
| **n8n Vapi Credential** | ID: `g8lOTMaAD5DD4k8a` (Header Auth) |
| **n8n Postgres Credential** | ID: `nmP7dbHwgdJq9OTf` |
| **GitHub Token** | `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` |
| **SSH** | Key: `C:\Users\mimar\.ssh\id_rsa` → `root@46.224.146.57` |
| **DB Şifre** | `mFZXLdJFCidGswkUsahtzh5fXTMXy8Rr1sd8woL17it7lQxafZRCa4g869GA7lx6` |
| **Dashboard Şifre** | `admin` / `NexusRealty2026` |
| **Meta Business ID** | `1647391093135870` |
| **WABA ID** | `870786272439326` |

---

## 🛠️ HIZLI KOMUTLAR

### Veritabanı Sorgusu
```powershell
ssh -i C:\Users\mimar\.ssh\id_rsa root@46.224.146.57 docker exec -i jko4k840gc00w80c40co4wwc psql -U postgres -d postgres -c "SQL_BURAYA"
```

### Dashboard Deploy (Sunucu)
```bash
curl -sL -H 'Authorization: token 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' -H 'Accept: application/vnd.github.v3.raw' \
  'https://api.github.com/repos/AgentPartner/FSBO-Emlak-Asistan/contents/dashboard/fsbo-dashboard.html' \
  -o /opt/emlak-dashboard/index.html
```

### Git Push
```powershell
cd C:\FSBO_Emlak_Asistan
& "C:\Program Files\Git\cmd\git.exe" add -A
& "C:\Program Files\Git\cmd\git.exe" commit -m "mesaj"
& "C:\Program Files\Git\cmd\git.exe" push
```

### Test Arama Başlat
```powershell
Invoke-WebRequest -Uri "https://n8n.agentpartner.pro/webhook/fsbo-manuel-arama" -Method POST -ContentType "application/json" -Body '{"ilan_id":"SAH-XXXXXX"}'
```
