# 🏠 FSBO EMLAK ASISTAN - PROJE PLANI
**Son Güncelleme:** 18 Şubat 2026  
**Firma:** Royal Emlak (eski: Prestij Emlak)  
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
| **PostgreSQL Docker** | Container: `jko4k840gc00w80c40co4wwc` |
| **DB Bilgileri** | User: postgres, DB: postgres |

### GitHub
| Bilgi | Değer |
|-------|-------|
| **Repo** | `https://github.com/AgentPartner/FSBO-Emlak-Asistan` |
| **Branch** | main |

### URL'ler
| Servis | URL |
|--------|-----|
| **Dashboard** | `https://emlak.agentpartner.pro` |
| **n8n Panel** | `https://n8n.agentpartner.pro` |

---

## ✅ TAMAMLANAN & ÇALIŞAN SİSTEMLER

### 1. Chrome Extension - Sahibinden Scraper
Sahibinden.com'dan ilan detaylarını çekip DB'ye kaydediyor.
- **Dosyalar:** `C:\FSBO_Emlak_Asistan\chrome-extension\`
- **Çekilen:** İlan ID, başlık, fiyat, konum, m², kat, ısıtma, cephe, kategori, telefon, açıklama, KAKS, m² fiyatı
- **Webhook:** `/webhook/fsbo-ilan-ekle`

### 2. Dashboard (emlak.agentpartner.pro)
5 sekmeli yönetim paneli: Genel Bakış, İlanlar, Aramalar, Randevular, Krediler
- Audio player (seekbar + hız ayarı)
- Durum güncelleme, not ekleme, geri arama tarihi
- Toplu silme, aranmayı bekleyen banner
- Randevu düzenleme (✏️ tarih/saat + konum)
- **Hosting:** Coolify Docker → Nginx

### 3. Vapi AI Asistan - Beyda ✅ ÇALIŞIYOR
- **Assistant ID:** `10c4e584-0200-4a57-9262-b42bf75faf1c`
- **Phone Number ID:** `5f8b10b1-eda9-4036-b625-e50fdb23cffc`
- **Telefon:** 0850 303 3860 (Netgsm SIP) — **SIP BAĞLANTISI AKTİF, ARAMALAR GEÇİYOR**
- Son başarılı aramalar: 17.02 16:14, 17.02 16:00, 16.02 20:40
- Mülk tipine göre dinamik konuşma (daire/arsa/dükkan/villa)
- 373 kadın ismi ile otomatik Bey/Hanım hitabı
- İki seçenekli randevu: yerinde değerleme veya ofise davet
- YASAK ifade: "evinize gelelim" → Doğru: "dairenizi yerinde görmek"
- Gerçek prompt n8n workflow içinde dinamik oluşturuluyor

### 4. n8n Workflow'ları

**AKTİF:**
| ID | İsim | Webhook | Açıklama |
|----|-------|---------|----------|
| `mkM9ElMLusx6hWWT` | 📊 FSBO Dashboard API | `/webhook/fsbo-dashboard` | Dashboard veri çekme (GET) |
| `DSZPgWy1ChnbvdVQ` | ➕ FSBO İlan Ekle API | `/webhook/fsbo-ilan-ekle` | Chrome ext'den ilan kaydet |
| `5ZbP1Cd4bbFB2gYz` | 🗑️ FSBO İlan Sil API | `/webhook/fsbo-delete-lead` | İlan silme |
| `9nPc4ZELtavPt7qE` | 🔄 FSBO Durum Güncelle API | `/webhook/fsbo-update-status` | Durum + randevu güncelleme (birleşik) |
| `Ecx63IrjOtfR1pbi` | 🔄 FSBO Manuel Arama Tetikleme | `/webhook/fsbo-manuel-arama` | Tek ilan arama başlat |
| `p19DB8ciE6HQyra2` | 🔔 FSBO Vapi Webhook Handler | `/webhook/vapi-callback` | Arama sonucu kaydet |
| `UoyZ8IRDSZWWYJwl` | 📞 FSBO AI Calling - Vapi.ai | (dahili, webhook yok) | Vapi arama motoru |

**İNAKTİF (ileride kurulacak):**
| ID | İsim |
|----|-------|
| `N7c43M1k5wc2ptZ6` | 🎧 Kayıt Dinleme & Kalite |
| `MjZRjrHAnEfBEow2` | 📱 WhatsApp Takip |
| `opBDVkFIcpv8j0RW` | 💰 Servis Kredileri API |

**NOT:** Randevu güncelleme ayrı workflow değil, `🔄 Durum Güncelle API` içine entegre edildi. Body'de `randevu_tarihi` veya `randevu_notu` gönderilirse `fsbo_call_logs` tablosu güncellenir.

### 5. Veritabanı Tabloları
- `fsbo_leads` — İlanlar/Lead'ler (durum, notlar, geri arama tarihi burada)
- `fsbo_call_logs` — Arama kayıtları (randevu_tarihi, randevu_notu burada)
- `fsbo_appointments` — Randevular (henüz kullanılmıyor, ileride entegre edilecek)

### 6. Deploy Süreci
```
1. Claude dashboard.html düzenler (kendi bilgisayarında /home/claude/)
2. GitHub'a upload eder (Python urllib API ile)
3. Windows'a çeker:
   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/AgentPartner/FSBO-Emlak-Asistan/main/dashboard/fsbo-dashboard.html" -OutFile "C:\FSBO_Emlak_Asistan\dashboard\fsbo-dashboard.html"
4. SCP ile production'a gönderir:
   scp -i C:\Users\mimar\.ssh\id_rsa C:\FSBO_Emlak_Asistan\dashboard\fsbo-dashboard.html root@46.224.146.57:/opt/emlak-dashboard/index.html
```

---

## ✅ ÇÖZÜLEN SORUNLAR
- ~~SIP Trunk 503 hatası~~ → ÇÖZÜLDÜ, aramalar başarıyla geçiyor
- ~~Randevu güncelleme ayrı workflow~~ → Durum Güncelle API'ye entegre edildi, ayrı workflow silindi
- ~~"evinize gelelim" ifadesi~~ → Prompt'ta yasaklandı, "dairenizi yerinde görmek" olarak düzeltildi
- ~~Audio player kapanma sorunu~~ → Düzeltildi, çalma sırasında satır kapanmıyor
- ~~Dashboard randevular sekmesi boş~~ → call_logs'tan veri çekiyor artık

---

## 🔧 YAPILACAKLAR

### 🔴 Acil
- ~~Randevu düzenleme özelliğini dashboard'dan test et~~ ✅ ÇALIŞIYOR

### 🟡 Orta Öncelik
- Vapi'den randevu tarihini otomatik parse et (transcript'ten veya tool_calls'tan)
- ~~Toplu arama sistemi (batch calling)~~ ✅ TAMAMLANDI — Dashboard'da "📞 Toplu Arama" butonu, progress bar, durdurma özelliği
- fsbo_appointments tablosunu aktif kullanıma al

### 🟢 İlerisi
- WhatsApp takip mesajı (arama sonrası otomatik)
- Kalite kontrol sistemi (AI ile arama puanlama)
- Gelişmiş raporlama (haftalık trendler, dönüşüm oranları)
- Multi-agent / A-B test

---

## 🔐 API ANAHTARLARI & KİMLİK BİLGİLERİ

| Servis | Bilgi |
|--------|-------|
| **Vapi API Key** | `76f2f9fb-9632-4c62-8ccb-f9abcd609f67` |
| **Vapi Assistant ID** | `10c4e584-0200-4a57-9262-b42bf75faf1c` |
| **Vapi Phone Number ID** | `5f8b10b1-eda9-4036-b625-e50fdb23cffc` |
| **ElevenLabs API Key** | `sk_98ee0d111f7b1bb7bb4c4f5a5aa29239b1ad08b1f8ddec89` |
| **Netgsm SIP User** | `8503033860` / Pass: `u8JWKKcYD9Y3` / Server: `sip.netgsm.com.tr:5060` |
| **n8n Vapi Credential** | ID: `g8lOTMaAD5DD4k8a` (Header Auth) |
| **n8n Postgres Credential** | ID: `nmP7dbHwgdJq9OTf` |
| **GitHub Token** | `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` |
| **SSH** | Key: `C:\Users\mimar\.ssh\id_rsa` → `root@46.224.146.57` |

---

## 🛠️ HIZLI KOMUTLAR

### Veritabanı Sorgusu
```powershell
ssh -i C:\Users\mimar\.ssh\id_rsa root@46.224.146.57 "docker exec -i jko4k840gc00w80c40co4wwc psql -U postgres -d postgres -c 'SQL_BURAYA'"
```

### Dashboard Deploy
```powershell
scp -i C:\Users\mimar\.ssh\id_rsa C:\FSBO_Emlak_Asistan\dashboard\fsbo-dashboard.html root@46.224.146.57:/opt/emlak-dashboard/index.html
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
