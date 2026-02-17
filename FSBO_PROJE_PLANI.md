# 🏠 FSBO EMLAK ASISTAN - PROJE PLANI
**Tarih:** 18 Şubat 2026  
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
| **Beyda Prompt** | `C:\FSBO_Emlak_Asistan\beyda-prompt.txt` |
| **SQL Şema** | `C:\FSBO_Emlak_Asistan\create_tables.sql` |
| **SSH Key** | `C:\Users\mimar\.ssh\id_rsa` |

### Production Sunucu (46.224.146.57)
| Dosya | Konum |
|-------|-------|
| **Dashboard (canlı)** | `/opt/emlak-dashboard/index.html` |
| **n8n Docker** | `jko4k840gc00w80c40co4wwc` (PostgreSQL) |
| **Veritabanı** | PostgreSQL: `postgres/postgres` |

### GitHub
| Bilgi | Değer |
|-------|-------|
| **Repo** | `https://github.com/AgentPartner/FSBO-Emlak-Asistan` |
| **Kullanıcı** | AgentPartner (`mimar.halilyildirim@gmail.com`) |

### URL'ler
| Servis | URL |
|--------|-----|
| **Dashboard** | `https://emlak.agentpartner.pro` |
| **n8n Panel** | `https://n8n.agentpartner.pro` |
| **Dashboard API** | `https://n8n.agentpartner.pro/webhook/fsbo-dashboard` |
| **Manuel Arama** | `https://n8n.agentpartner.pro/webhook/fsbo-manuel-arama` |

---

## ✅ TAMAMLANAN İŞLER

### 1. Chrome Extension - Sahibinden Scraper
**Ne yapıyor:** Sahibinden.com'dan ilan detaylarını otomatik çekip veritabanına kaydediyor.
**Dosyalar:** `C:\FSBO_Emlak_Asistan\chrome-extension\`

**Çekilen veriler:** İlan ID, başlık, fiyat, konum, oda sayısı, m², kat, bina yaşı, ısıtma, cephe, kategori, işlem türü, ilan sahibi adı, telefon, açıklama, Sahibinden No, KAKS, m² fiyatı

**Webhook:** `https://n8n.agentpartner.pro/webhook/fsbo-ilan-ekle`
**n8n Workflow:** ➕ FSBO İlan Ekle API (`DSZPgWy1ChnbvdVQ`) - AKTİF ✅

### 2. Dashboard (emlak.agentpartner.pro)
**5 Sekme:** Genel Bakış, İlanlar, Aramalar, Randevular, Krediler

**Özellikler:** Audio player (seekbar+hız), durum güncelleme, geri arama tarihi, not alanı, toplu silme, aranmayı bekleyen banner, randevu düzenleme (✏️)

**Hosting:** Coolify Docker → Nginx → `emlak.agentpartner.pro`
**n8n Workflow:** 📊 FSBO Dashboard API (`mkM9ElMLusx6hWWT`) - AKTİF ✅

### 3. Vapi AI Asistan - Beyda
- Vapi Assistant ID: `10c4e584-0200-4a57-9262-b42bf75faf1c`
- Phone Number ID: `5f8b10b1-eda9-4036-b625-e50fdb23cffc`
- Telefon: 0850 303 3860 (Netgsm SIP)
- Mülk tipine göre dinamik konuşma
- 373 kadın ismi, iki seçenekli randevu
- YASAK: "evinize gelelim" → Doğru: "dairenizi yerinde görmek"

### 4. n8n Workflow'ları (Aktif)
| ID | İsim | Webhook |
|----|-------|---------|
| `mkM9ElMLusx6hWWT` | 📊 Dashboard API | `/webhook/fsbo-dashboard` |
| `DSZPgWy1ChnbvdVQ` | ➕ İlan Ekle API | `/webhook/fsbo-ilan-ekle` |
| `5ZbP1Cd4bbFB2gYz` | 🗑️ İlan Sil API | `/webhook/fsbo-delete-lead` |
| `9nPc4ZELtavPt7qE` | 🔄 Durum+Randevu Güncelle | `/webhook/fsbo-update-status` |
| `Ecx63IrjOtfR1pbi` | 🔄 Manuel Arama Tetikleme | `/webhook/fsbo-manuel-arama` |
| `p19DB8ciE6HQyra2` | 🔔 Vapi Webhook Handler | `/webhook/vapi-callback` |
| `UoyZ8IRDSZWWYJwl` | 📞 AI Calling - Vapi.ai | (dahili) |

**İnaktif (ileride kurulacak):**
| ID | İsim |
|----|-------|
| `N7c43M1k5wc2ptZ6` | 🎧 Kayıt Dinleme & Kalite |
| `MjZRjrHAnEfBEow2` | 📱 WhatsApp Takip |
| `opBDVkFIcpv8j0RW` | 💰 Servis Kredileri API |

### 5. Veritabanı
- `fsbo_leads` - İlanlar/Lead'ler
- `fsbo_call_logs` - Arama kayıtları (randevu bilgisi burada)
- `fsbo_appointments` - Randevular (henüz boş)

### 6. Deploy Süreci
```
1. Claude dashboard.html düzenler
2. GitHub'a upload (Python API)
3. Windows'a indir: Invoke-WebRequest ...
4. SCP ile production'a: scp -i ... root@46.224.146.57:/opt/emlak-dashboard/index.html
```

---

## 🔧 YAPILACAKLAR

### 🔴 Acil
- SIP Trunk 503 hatası çözümü (Netgsm destek: 444 0 220)
- Randevu düzenleme test

### 🟡 Orta
- Vapi'den randevu tarihi otomatik parse
- Toplu arama (batch calling)
- fsbo_appointments tablosu entegrasyonu

### 🟢 İlerisi
- WhatsApp takip mesajı
- Kalite kontrol sistemi
- Gelişmiş raporlama
- Multi-agent / A-B test

---

## 🛠️ TEKNİK KOMUTLAR

### DB
```powershell
ssh -i C:\Users\mimar\.ssh\id_rsa root@46.224.146.57 "docker exec -i jko4k840gc00w80c40co4wwc psql -U postgres -d postgres -c 'SQL'"
```

### Deploy
```powershell
scp -i C:\Users\mimar\.ssh\id_rsa C:\FSBO_Emlak_Asistan\dashboard\fsbo-dashboard.html root@46.224.146.57:/opt/emlak-dashboard/index.html
```

### Git
```powershell
cd C:\FSBO_Emlak_Asistan
& "C:\Program Files\Git\cmd\git.exe" add -A
& "C:\Program Files\Git\cmd\git.exe" commit -m "mesaj"
& "C:\Program Files\Git\cmd\git.exe" push
```
