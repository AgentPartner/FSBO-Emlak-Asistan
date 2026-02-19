# 🏠 FSBO EMLAK ASISTAN - PROJE PLANI
**Son Güncelleme:** 19 Şubat 2026, 03:30  
**Firma:** Nexus Realty (eski: Royal Emlak → Prestij Emlak)  
**AI Asistan:** Beyda Semercioğlu (30 yaş, 8 yıl tecrübe, Kayseri doğumlu)  
**Proje İlerlemesi:** ~%82

---

## 📋 İÇİNDEKİLER

1. [Sistem Mimarisi](#sistem-mimarisi)
2. [Tamamlanan Sistemler](#tamamlanan-sistemler)
3. [Voice AI Geliştirme Süreci](#voice-ai-geliştirme-süreci)
4. [Güncel Teknik Ayarlar](#güncel-teknik-ayarlar)
5. [Yapılacaklar](#yapılacaklar)
6. [Çözülen Sorunlar](#çözülen-sorunlar)
7. [Dosya Konumları](#dosya-konumları)
8. [API Anahtarları & Kimlik Bilgileri](#api-anahtarları)
9. [Hızlı Komutlar](#hızlı-komutlar)

---

## 🏗️ SİSTEM MİMARİSİ

### Genel Akış
```
Sahibinden.com → Chrome Extension → n8n → PostgreSQL → Dashboard
                                                          ↓
                                              "Ara" butonu tıklanır
                                                          ↓
                                    n8n (Prompt hazırla) → Vapi API → Telefon araması
                                                                        ↓
                                                              Müşteri ile AI konuşur
                                                                        ↓
                                                          Vapi Webhook → n8n → DB
                                                          (kayıt, transkript, randevu)
                                                                        ↓
                                                              Dashboard'da görünür
```

### Teknoloji Yığını
| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| **Scraping** | Chrome Extension (JS) | Sahibinden.com ilan verilerini çeker |
| **Otomasyon** | n8n (self-hosted) | 7 aktif workflow, webhook tabanlı |
| **Veritabanı** | PostgreSQL (Docker) | 3 tablo: leads, call_logs, appointments |
| **Voice AI** | Vapi.ai | Telefon araması orkestrasyon platformu |
| **AI Model** | Claude Sonnet 4 (Anthropic) | Konuşma zekası — n8n override ile gönderiliyor |
| **Ses Motoru** | ElevenLabs Flash v2.5 | Beyda sesi (klonlanmış) |
| **Ses Tanıma** | Deepgram Nova-3 | Türkçe STT, anahtar kelime boost |
| **Telefon** | Netgsm SIP Trunk | 0850 303 3860, Türkiye yurt içi arama |
| **Dashboard** | HTML/JS (tek dosya) | Coolify Docker + Nginx + Traefik |
| **Hosting** | Coolify (46.224.146.57) | Docker containerlar, SSL, reverse proxy |
| **Versiyon** | GitHub | AgentPartner/FSBO-Emlak-Asistan |

---

## ✅ TAMAMLANAN SİSTEMLER

### 1. Chrome Extension — Sahibinden Scraper ✅
Sahibinden.com'dan ilan detaylarını çekip veritabanına kaydediyor.
- **Dosyalar:** `C:\FSBO_Emlak_Asistan\chrome-extension\`
- **Çekilen veriler:** İlan ID, başlık, fiyat, konum (il/ilçe/mahalle), m² (brüt/net), oda sayısı, kat, bina yaşı, ısıtma, cephe, site içinde, kategori, telefon, açıklama, KAKS, m² fiyatı
- **Webhook:** `POST /webhook/fsbo-ilan-ekle`
- **Nasıl çalışır:** Extension sayfadaki DOM'u parse eder, JSON oluşturur, n8n webhook'una POST eder

### 2. Dashboard (emlak.agentpartner.pro) ✅
5 sekmeli profesyonel yönetim paneli.
- **URL:** `https://emlak.agentpartner.pro`
- **Giriş:** admin / NexusRealty2026 (Traefik basicauth)
- **Hosting:** Coolify Docker → Nginx container + Traefik reverse proxy + SSL

**Sekmeler ve Özellikler:**

| Sekme | İçerik |
|-------|--------|
| **Genel Bakış** | Özet kartlar (toplam lead, arama, randevu, dönüşüm oranı), Chart.js line chart (trend 7/14/30/90 gün), doughnut chart (durum dağılımı), dönüşüm hunisi |
| **İlanlar** | Lead listesi, durum güncelleme, not ekleme, geri arama tarihi, toplu silme, tek/toplu arama, aktif/pasif tab ayrımı, aranmayı bekleyen banner |
| **Aramalar** | Arama geçmişi, audio player (seekbar + hız ayarı), transkript görüntüleme, süre bilgisi |
| **Randevular** | Randevu listesi (appointments tablosundan), tarih/saat düzenleme, konum düzenleme, durum güncelleme |
| **Krediler** | Servis kredileri (ileride aktif olacak) |

**Ek Özellikler:**
- 📞 Toplu arama sistemi (batch calling) — progress bar, durdurma
- 🔔 Geri arama uyarıları (geciken/yaklaşan/tarihsiz)
- 💬 WhatsApp durum kolonu (bekliyor/gönderildi/okundu/hata)
- 🌙 Koyu tema, responsive design
- 📊 Chart.js interaktif grafikler

### 3. Voice AI — Beyda Asistan ✅ (v9 — 10 iterasyon)
AI telefon asistanı, Sahibinden ilanı sahiplerine arama yapıyor.

**Asistan Kimliği:**
- İsim: Beyda Semercioğlu
- Yaş: 30, Tecrübe: 8 yıl
- Şehir: Kayseri doğumlu, bölgeyi iyi tanıyor
- Ofis sahibi: Halil Bey
- Ofis adresi: Hulusi Akar Bulvarı, Tapu Müdürlüğü yanı, Güneş Apartmanı altı

**Nasıl çalışır:**
1. Dashboard'dan "Ara" butonuna basılır
2. n8n workflow'u lead bilgilerini DB'den çeker
3. Code node'u dinamik system prompt oluşturur (isim, hitap, mülk tipi, fiyat, konum)
4. Vapi API'ye arama isteği gönderilir (assistantOverrides ile model + prompt)
5. Vapi, Netgsm SIP üzerinden müşteriyi arar
6. Beyda (AI) müşteriyle konuşur
7. Arama bitince Vapi webhook gönderir
8. n8n webhook handler: call_logs'a kayıt + randevu varsa appointments'a ekler

**Konuşma Stratejisi (Prompt Mimarisi):**
- Prensip tabanlı düşünme sistemi (senaryo bazlı değil)
- 3 aşamalı açılış: İsim teyidi → Hal hatır → Pitch + bilgi sorusu
- Soru limiti: Açılış dahil toplam EN FAZLA 3 soru
- Erken sinyal yakalama: Müşteri motivasyonu belli olunca hemen randevu teklifi
- İki seçenekli randevu: Ofiste ağırlama veya mülkte yerinde ziyaret
- Mülk tipine göre dinamik konuşma (daire/arsa/dükkan/villa)
- 455+ kadın isim listesi ile otomatik Bey/Hanım hitabı
- Fiyatlar Türkçe yazıyla söyleniyor (1.500.000 → "bir milyon beş yüz bin lira")

**Yasaklar (Prompt'ta kesin kurallar):**
- "Anlıyorum" en fazla 1 kez tüm görüşmede
- Papağan tekrar yasak (müşterinin söylediğini tekrarlama)
- Uydurma istatistik yasak (somut rakam verme)
- Dolgu sesleri yasak (hmm, şey, yani, aslında, eee)
- "Sizi bağlamaz" yasak → "Hiçbir yükümlülük yok"
- "Evinize gelelim" yasak → "Dairenizi yerinde ziyaret edelim"
- "ben uğrayayım" yasak → "biz uğrayalım"
- "Kahve içeriz" yasak (Ramazan ayı)
- "Satış süreci nasıl gidiyor?" yasak
- "ilgi yoğun mu?" yasak
- Kişisel mali soru yasak

### 4. n8n Workflow'ları ✅

**AKTİF (7 workflow):**

| ID | İsim | Webhook | Açıklama |
|----|-------|---------|----------|
| `mkM9ElMLusx6hWWT` | 📊 FSBO Dashboard API | `/webhook/fsbo-dashboard` | Dashboard veri çekme (GET), appointments tablosundan randevu, 90 gün trend |
| `DSZPgWy1ChnbvdVQ` | ➕ FSBO İlan Ekle API | `/webhook/fsbo-ilan-ekle` | Chrome ext'den ilan kaydet |
| `5ZbP1Cd4bbFB2gYz` | 🗑️ FSBO İlan Sil API | `/webhook/fsbo-delete-lead` | İlan silme |
| `9nPc4ZELtavPt7qE` | 🔄 FSBO Durum Güncelle API | `/webhook/fsbo-update-status` | Durum + randevu güncelleme (birleşik) |
| `Ecx63IrjOtfR1pbi` | 🔄 FSBO Manuel Arama Tetikleme | `/webhook/fsbo-manuel-arama` | Tek ilan arama başlat — **6 node: webhook → DB → prompt hazırla → Vapi API → DB güncelle → yanıt** |
| `p19DB8ciE6HQyra2` | 🔔 FSBO Vapi Webhook Handler | `/webhook/vapi-callback` | Arama sonucu işle — **vapi_call_id ile lead eşleşmesi** (telefon ile DEĞİL), call_logs + appointments'a kayıt |
| `UoyZ8IRDSZWWYJwl` | 📞 FSBO AI Calling - Vapi.ai | (dahili) | Vapi arama motoru |

**Manuel Arama Workflow Detayı (Ecx63IrjOtfR1pbi):**
```
🔔 Manuel Tetikleme (webhook POST, ilan_id alır)
  → 📋 Lead Bilgisi Al (PostgreSQL'den lead çek)
  → 🧠 AI Prompt Hazırla (Code node: dinamik prompt oluştur)
     - Kadın/erkek isim tespiti (455+ kadın isim)
     - Fiyat → Türkçe yazı çevirimi
     - Mülk tipine göre açıklama
     - Detay bilgiler (kat, yaş, ısıtma, cephe)
     - System prompt + firstMessage üretimi
  → 📞 Vapi Arama Başlat (HTTP Request)
     - assistantOverrides ile Claude Sonnet 4 + dinamik prompt gönderir
     - NOT: Assistant'ta model tanımlı olsa da, HER ARAMADA override ile gönderiliyor
  → 📝 Lead Güncelle (vapi_call_id yaz, durum = arama_yapildi)
  → ✅ Yanıt Döndür
```

**Vapi Webhook Handler Detayı (p19DB8ciE6HQyra2):**
```
Vapi webhook gelir (end-of-call-report veya tool-calls)
  → Parse Webhook (JSON parse)
  → Branching: Randevu mu, arama sonu mu?
     - Randevu: "Lead Bul Randevu" → vapi_call_id ile lead bul → appointments tablosuna kaydet
     - Arama sonu: "Lead Bul" → vapi_call_id ile lead bul → call_logs'a kaydet (transkript, süre, kayıt URL)
  
  ÖNEMLİ: Lead eşleşmesi SADECE vapi_call_id ile yapılıyor.
  Eski hali telefon numarasıyla da arıyordu — aynı telefona birden fazla ilan olunca yanlış lead buluyordu.
```

**İNAKTİF (ileride kurulacak):**

| ID | İsim | Açıklama |
|----|-------|----------|
| `N7c43M1k5wc2ptZ6` | 🎧 Kayıt Dinleme & Kalite | AI ile arama puanlama |
| `MjZRjrHAnEfBEow2` | 📱 WhatsApp Takip | Randevu sonrası WhatsApp bildirimi |
| `opBDVkFIcpv8j0RW` | 💰 Servis Kredileri API | Kullanıma göre kredi sistemi |

### 5. Veritabanı ✅

**Tablolar:**

| Tablo | Açıklama | Önemli Alanlar |
|-------|----------|----------------|
| `fsbo_leads` | İlanlar/Lead'ler | ilan_id, ilan_sahibi, telefon, fiyat, konum, durum, vapi_call_id, notlar, geri_arama_tarihi, whatsapp_durumu |
| `fsbo_call_logs` | Arama kayıtları | call_id, ilan_id, sure, transcript, recording_url, randevu_bilgisi |
| `fsbo_appointments` | Randevular | ilan_id, ilan_sahibi, telefon, baslik, tarih, tur (ofis/yerinde), konum, durum, whatsapp_durumu |

**Durum Akışı:**
```
Yeni → Aktarıldı → Aranacak → Arama Yapıldı → Randevu / Tekrar Aranacak / İlgilenmiyor / Aranmayacak
```

### 6. SIP Trunk (Netgsm) ✅
- **Numara:** 0850 303 3860
- **Sunucu:** sip.netgsm.com.tr:5060
- **Durum:** AKTİF — aramalar başarıyla geçiyor
- **Sorun geçmişi:** İlk kurulumda 503 hatası vardı, Netgsm tarafında codec ayarı düzeltilerek çözüldü

### 7. Deploy Süreci ✅
```
1. Claude dashboard.html düzenler (kendi ortamında)
2. GitHub API ile dosyayı repo'ya yükler (base64 encode + SHA)
3. Sunucuya GitHub API'den çeker:
   curl -sL -H 'Authorization: token TOKEN' -H 'Accept: application/vnd.github.v3.raw' \
     'https://api.github.com/repos/AgentPartner/FSBO-Emlak-Asistan/contents/dashboard/fsbo-dashboard.html' \
     -o /opt/emlak-dashboard/index.html
4. NOT: raw.githubusercontent.com cache yapıyor, api.github.com kullanılmalı
```

---

## 🎙️ VOICE AI GELİŞTİRME SÜRECİ (10 İTERASYON)

### v1 — İlk Kurulum (17 Şubat)
- Vapi + GPT-4o + ElevenLabs temel kurulum
- Basit senaryo bazlı prompt
- Sorunlar: Çok robotik, hazır kalıp cevaplar

### v2 — İnsansılaştırma Araştırması (18 Şubat sabah)
- Web araştırması: Vapi, OpenAI, Resemble AI, PolyAI kaynaklarından profesyonel teknikler
- Dolgu kelimeleri, backchannel, konuşma akışı optimizasyonu
- Türkçe'ye uyarlama planı hazırlandı

### v3 — İlk Uygulama + Geri Bildirim (18 Şubat)
- Dolgu kelimeleri eklendi (çok fazla oldu)
- "Sizi bağlamaz" → "Hiçbir yükümlülük yok" değişikliği
- Ofis adresi prompt'a eklendi
- ElevenLabs V3 araştırması (Vapi'de henüz desteklenmiyor)

### v4 — Claude Sonnet 4 Geçişi (18 Şubat)
- GPT-4o → Claude Sonnet 4 denenip daha iyi bulundu
- Senaryo bazlı prompt'un yetersizliği tespit edildi
- Prensip tabanlı yeniden tasarım kararı

### v5 — Prensip Tabanlı Prompt (18 Şubat)
- Tam yeniden yazım: senaryo → prensip geçişi
- 5 adımlı düşünme sistemi (dinle → analiz et → değer sun → doğal söyle → ilerlet)
- 3 fazlı ikna ritmi (açılış → keşif → randevu)
- İlan açıklamasından ipucu yakalama özelliği

### v6 — Kural Konsolidasyonu (18 Şubat)
- 5 önceki oturumun tüm kuralları tek prompt'ta birleştirildi
- Halil Bey (ofis sahibi) eklendi
- Ramazan uyumlu dil kuralları
- "Ben uğrayayım" → "Biz uğrayalım" çoğul kural

### v7 — Açılış Akışı + Ses Ayarı (18 Şubat akşam)
- 3 adımlı açılış: İsim teyidi → Hal hatır → Pitch
- "Satış süreci nasıl gidiyor?" yasaklandı
- 2 cümle kuralı kaldırıldı (doğallık için)
- ElevenLabs: Similarity 0.85, Stability 0.60
- Nefes sesi sorunu tespit edildi

### v8 — Cinsiyet + Ses + Eşleşme (19 Şubat 00:00)
- Kadın isim listesi 373 → 455+ isme genişletildi (behiye, belma, berrin, vb.)
- ElevenLabs: Similarity 0.90, Stability 0.55
- **KRİTİK FIX:** Webhook handler'da lead eşleşmesi telefon → vapi_call_id'ye değiştirildi

### v9 — Model Düzeltme + STT + Papağan Fix (19 Şubat 01:00-03:00)
Bu oturumda yapılan tüm değişiklikler:

**Model override düzeltmesi:**
- Keşfedilen sorun: Vapi assistant'ta Claude Sonnet 4 tanımlıyken, n8n workflow override ile GPT-4o gönderiyordu
- Tüm aramalar aslında GPT-4o ile yapılmış
- Düzeltme: Override'daki model `anthropic / claude-sonnet-4-20250514` olarak değiştirildi
- Artık HER ARAMA Claude Sonnet 4 ile yapılıyor

**Dolgu sesleri tamamen yasaklandı:**
- "hmm", "şey", "yani", "aslında", "eee", "ııı", "anladım hmm" kesinlikle YASAK
- Prompt'ta iki yerde belirtildi (konuşma stili + kesin yasaklar)

**STT iyileştirmesi (Deepgram):**
- Sorun: "Kirada şu anda" → "Birader şu anda" olarak algılandı
- Çözüm: Deepgram keywords eklendi — emlak kelimeleri boost edildi
- Keywords: kirada:3, kiracı:3, oturuyorum:2, satılık:2, sahibinden:2, emlak:2, daire:2

**Bağlam kuralı eklendi:**
- AI artık müşterinin cevabını son sorulan soruyla ilişkilendiriyor
- Anlamsız cevaplarda "müsait değilsiniz" varsaymak yerine kibarca tekrar soruyor

**Ses ayarları (ElevenLabs):**
- Stability: 0.55 → 0.60 → 0.70 → 0.80 → **1.0** (kesinlikle ton değiştirmesin)
- SimilarityBoost: **0.88**
- Style: **0.0**, Speed: **1.0**
- optimizeStreamingLatency kaldırıldı (kalite düşürüyordu)

**Konuşma zamanlaması (Vapi):**
- Endpointing: 150ms → 100ms → 80ms → **50ms** (müşteri susunca anında algıla)
- waitSeconds: 0.8s → 0.4s → **0.2s** (AI anında konuşmaya başlasın)
- responseDelay: **0s**
- silenceTimeout: 15s → **12s**

**Prompt iyileştirmeleri:**
- "Anlıyorum" tüm görüşmede EN FAZLA 1 kez — alternatifleri: Tamam, Peki, Güzel, Tabii, Hayırlısı
- Papağan tekrar YASAK — müşterinin söylediğini tekrarlama
- Uydurma istatistik YASAK — "Son 6 ayda 3 daire sattık" gibi somut rakamlar yasaklandı
- Soru limiti: Açılış dahil toplam EN FAZLA 3 soru
- Erken sinyal yakalama: Müşteri motivasyonunu söylediğinde hemen değer sunumu + randevu
- Kişisel mali soru YASAK: "Parayı ne kadar sürede bulmanız gerekiyor" gibi sorular yasaklandı
- Cümleler KISA ve NET olacak

---

## ⚙️ GÜNCEL TEKNİK AYARLAR (19 Şubat 03:30)

### Vapi Assistant Ayarları
| Ayar | Değer |
|------|-------|
| **Assistant ID** | `10c4e584-0200-4a57-9262-b42bf75faf1c` |
| **İsim** | Beyda - Royal Emlak (panelde eski isim, override ile Nexus Realty) |
| **Phone Number ID** | `5f8b10b1-eda9-4036-b625-e50fdb23cffc` |
| **Telefon** | 0850 303 3860 (Netgsm SIP) |
| **Randevu Tool ID** | `0f3b2654-d980-4e25-a915-1c3ddc1d580c` |
| **Server URL** | `https://n8n.agentpartner.pro/webhook/vapi-webhook` |
| **Max Süre** | 420 saniye (7 dakika) |
| **Sessizlik Timeout** | 12 saniye |
| **Arka Plan Sesi** | office |
| **Backchannel** | Açık |
| **Gürültü Azaltma** | Açık |
| **Kapanış Cümleleri** | "iyi günler", "hoşça kalın", "görüşürüz", "güle güle" |

### AI Model Ayarları
| Ayar | Değer | Not |
|------|-------|-----|
| **Provider** | Anthropic | — |
| **Model** | claude-sonnet-4-20250514 | n8n override ile gönderiliyor |
| **Temperature** | 0.9 | Doğal konuşma için yüksek |
| **Prompt** | Dinamik | n8n Code node'unda üretiliyor (lead bilgilerine göre) |

**ÖNEMLİ:** Assistant panelinde model tanımlı olsa da, HER ARAMADA n8n workflow'u `assistantOverrides.model` ile gönderir. Bu override assistant ayarını ezer. Model değişikliği yapmak için `Ecx63IrjOtfR1pbi` workflow'undaki "📞 Vapi Arama Başlat" node'undaki jsonBody'deki `provider` ve `model` değiştirilmeli.

### Ses Motoru (ElevenLabs)
| Ayar | Değer | Açıklama |
|------|-------|----------|
| **Provider** | 11labs | — |
| **Voice ID** | `dOQlT8TikdF47jfPQXpe` | Beyda (klonlanmış ses) |
| **Model** | eleven_flash_v2_5 | Hızlı, düşük gecikme |
| **Stability** | **1.0** | Ses tonu KESİNLİKLE değişmesin |
| **SimilarityBoost** | 0.88 | Orijinal sese yakınlık |
| **Style** | 0.0 | Stil ekleme yok |
| **Speed** | 1.0 | Normal hız |

### Ses Tanıma (Deepgram STT)
| Ayar | Değer | Açıklama |
|------|-------|----------|
| **Provider** | Deepgram | — |
| **Model** | nova-3 | En güncel Türkçe model |
| **Language** | tr | Türkçe |
| **Endpointing** | **50ms** | Müşteri susunca çok hızlı algıla |
| **Keywords** | kirada:3, kiracı:3, oturuyorum:2, satılık:2, sahibinden:2, emlak:2, daire:2, arsa:2, randevu:2, değerleme:2, komisyon:2, gayrimenkul:2 | Emlak kelimeleri boost |

### Konuşma Zamanlaması
| Ayar | Değer | Açıklama |
|------|-------|----------|
| **waitSeconds** | **0.2s** | AI cevap ürettikten sonra konuşmaya başlama bekleme |
| **smartEndpointing** | livekit | Akıllı cümle sonu algılama |
| **responseDelay** | 0s | Ek gecikme yok |
| **silenceTimeout** | 12s | Sessizlikte arama kapanma süresi |

### Maliyet Tahmini (arama başına)
| Bileşen | Birim Fiyat | Arama Başına (~3-5 dk) |
|---------|-------------|----------------------|
| Claude Sonnet 4 | $3 input / $15 output per M token | ~$0.03-0.07 |
| ElevenLabs TTS | ~$0.30/1K karakter | ~$0.03-0.08 |
| Vapi Platform | $0.05/dakika | ~$0.15-0.25 |
| Netgsm SIP | ~₺0.15-0.25/dakika | ~$0.01-0.02 |
| **TOPLAM** | | **~$0.25-0.45** |

---

## 🔧 YAPILACAKLAR

### 🔴 Acil — Öncelikli

**1. Canlı Arama Testi ve Doğrulama**
- Gerçek müşteri numarasıyla tam akış testi
- Kontrol edilecekler:
  - [ ] Açılış akışı doğru mu (isim teyidi → hal hatır → pitch)
  - [ ] Ses tonu tutarlı mı (stability 1.0 sonrası)
  - [ ] Duraksama/bekleme kabul edilebilir mi
  - [ ] Dolgu sesleri tamamen kalktı mı
  - [ ] "Anlıyorum" tekrarı düzeldi mi
  - [ ] Papağan tekrar düzeldi mi
  - [ ] Soru sayısı limiti çalışıyor mu (max 3)
  - [ ] Randevu teklifi zamanlaması doğru mu
  - [ ] call_logs'a doğru kayıt düşüyor mu
  - [ ] Randevu varsa appointments tablosuna yazılıyor mu
  - [ ] Dashboard'da doğru ilan altında gözüküyor mu

**2. Prompt İnce Ayar (test sonrası)**
- Stability 1.0 ile ses çok monoton olabilir — test sonucu değerlendir
- Endpointing 50ms çok agresif olabilir — müşterinin sözünü kesebilir, test et
- Claude Sonnet 4 ile GPT-4o karşılaştırması — hangisi daha doğal
- Gerekirse backchannel kapatılabilir (AI'ın "evet", "tamam" araya girmesi)

### 🟡 Orta Öncelik

**3. WhatsApp Cloud API Entegrasyonu**
- **Durum:** Meta Developer hesabı SMS doğrulaması geçemiyor
- Meta Business: "Nexus Realty" (ID: 1647391093135870)
- WABA ID: 870786272439326
- Sorun: Facebook güvenlik kısıtlaması, SMS gelmiyor
- Çözüm adımları:
  1. Meta Business hesap doğrulamasını tamamla
  2. WhatsApp mesaj şablonu oluştur (randevu teyidi)
  3. Meta'dan şablon onayı al
  4. n8n'e WhatsApp workflow ekle (HTTP Request ile Meta API)
  5. Randevu sonrası otomatik WhatsApp bildirimi
  6. WhatsApp durumu webhook ile güncelleme (gönderildi/okundu)
- Maliyet: ~$0.0008/mesaj (Utility), 100 randevu/ay ~3 TL

**4. Dashboard Hosting Kalıcılığı**
- Şu an: Coolify Docker container
- Coolify güncelleme/restart sonrası dashboard düşebilir
- Alternatifler: Static hosting (Cloudflare Pages), ya da Coolify'ı stabilize et

### 🟢 İlerisi

**5. Kalite Kontrol Sistemi**
- AI ile arama puanlama (workflow: N7c43M1k5wc2ptZ6 hazır ama inaktif)
- Kural tabanlı puanlama algoritması tasarlandı
- Dashboard'a performans grafikleri eklendi (henüz veri yok)

**6. İleri Geliştirmeler**
- A/B test altyapısı (farklı promptlar/modeller karşılaştırma)
- Gelişmiş lead scoring algoritmaları
- Sahibinden.com dışı platform entegrasyonları
- Multi-agent yapısı
- SMS/e-posta kanalları
- Sesli mesaj bırakma optimizasyonu

---

## ✅ ÇÖZÜLEN SORUNLAR (kronolojik)

| Tarih | Sorun | Çözüm |
|-------|-------|-------|
| 17 Şub | SIP Trunk 503 hatası | Netgsm codec ayarı düzeltildi |
| 17 Şub | Randevu güncelleme ayrı workflow | Durum Güncelle API'ye entegre |
| 17 Şub | Audio player kapanma sorunu | Düzeltildi |
| 18 Şub | Dashboard randevular sekmesi boş | appointments tablosundan çekiyor |
| 18 Şub | Dönüşüm hunisi yanlış veriler | Leads verisinden doğrudan hesaplama |
| 18 Şub | GitHub push protection | Token izni verildi |
| 18 Şub | Arama süreleri yanlış | Vapi startedAt/endedAt parsing düzeltildi |
| 18 Şub | n8n webhook response hatası | respondToWebhook → set node'una çevrildi |
| 18 Şub | "Evinize gelelim" ifadesi | Prompt'ta yasaklandı |
| 18 Şub | Beyda tekrarlayan cümleler | Anti-tekrar kuralları eklendi |
| 18 Şub | "Sizi bağlamaz" ifadesi | "Hiçbir yükümlülük yok" olarak değiştirildi |
| 18 Şub | AI senaryo bazlı robotik | Prensip tabanlı düşünme sistemine geçildi |
| 18 Şub | Dolgu kelimeleri çok fazla | Limitlendi, sonra tamamen yasaklandı |
| 19 Şub | "Behiye" kadın ismi algılanmıyor | Kadın isim listesi 373 → 455+'e genişletildi |
| 19 Şub | Aynı telefonla birden fazla ilan karışıyor | Lead eşleşme telefon → vapi_call_id'ye değiştirildi |
| 19 Şub | GPT-4o override — Claude Sonnet 4 kullanılmıyordu | Override'daki model anthropic/claude-sonnet-4'e düzeltildi |
| 19 Şub | "Kirada" → "Birader" yanlış STT algılama | Deepgram keywords + bağlam kuralı eklendi |
| 19 Şub | Ses tonu değişiyor | Stability 0.55 → 1.0'a çıkarıldı |
| 19 Şub | Kelime içi duraksama | Stability 1.0 + streaming latency kaldırıldı |
| 19 Şub | "Anlıyorum" çok tekrar | En fazla 1 kez kuralı + alternatif kelimeler |
| 19 Şub | Papağan tekrar (söyleneni geri söyleme) | Prompt'ta kesin yasak eklendi |
| 19 Şub | Uydurma istatistik ("3 daire sattık") | Somut rakam verme yasağı eklendi |
| 19 Şub | Çok fazla soru, geç randevu | Soru limiti 3 + erken sinyal yakalama |
| 19 Şub | Konuşmalar arası çok bekleme | Endpointing 50ms, wait 0.2s, delay 0s |

---

## 📂 DOSYA KONUMLARI

### Windows (Yerel Geliştirme)
| Dosya | Konum |
|-------|-------|
| **Proje Kök Dizin** | `C:\FSBO_Emlak_Asistan\` |
| **Proje Planı** | `C:\FSBO_Emlak_Asistan\FSBO_PROJE_PLANI.md` |
| **Dashboard HTML** | `C:\FSBO_Emlak_Asistan\dashboard\fsbo-dashboard.html` |
| **Chrome Extension** | `C:\FSBO_Emlak_Asistan\chrome-extension\` |
| **Beyda Prompt (referans)** | `C:\FSBO_Emlak_Asistan\beyda-prompt.txt` |
| **SQL Şema** | `C:\FSBO_Emlak_Asistan\create_tables.sql` |
| **SSH Key** | `C:\Users\mimar\.ssh\id_rsa` |

### Production Sunucu (46.224.146.57)
| Dosya | Konum |
|-------|-------|
| **Dashboard (canlı)** | `/opt/emlak-dashboard/index.html` |
| **Docker Compose** | `/opt/emlak-dashboard/docker-compose.yml` |
| **Şifre dosyası** | `/opt/emlak-dashboard/.htpasswd` |
| **PostgreSQL Docker** | Container: `jko4k840gc00w80c40co4wwc` |

### GitHub
- **Repo:** `https://github.com/AgentPartner/FSBO-Emlak-Asistan`
- **Branch:** main

### URL'ler
| Servis | URL | Erişim |
|--------|-----|--------|
| **Dashboard** | `https://emlak.agentpartner.pro` | admin / NexusRealty2026 |
| **n8n Panel** | `https://n8n.agentpartner.pro` | — |

---

## 🔐 API ANAHTARLARI & KİMLİK BİLGİLERİ

| Servis | Bilgi |
|--------|-------|
| **Vapi API Key** | `76f2f9fb-9632-4c62-8ccb-f9abcd609f67` |
| **Vapi Assistant ID** | `10c4e584-0200-4a57-9262-b42bf75faf1c` |
| **Vapi Phone Number ID** | `5f8b10b1-eda9-4036-b625-e50fdb23cffc` |
| **Vapi Randevu Tool ID** | `0f3b2654-d980-4e25-a915-1c3ddc1d580c` |
| **ElevenLabs Voice ID** | `dOQlT8TikdF47jfPQXpe` (Beyda) |
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

### Vapi Assistant Bilgilerini Kontrol
```bash
curl -s "https://api.vapi.ai/assistant/10c4e584-0200-4a57-9262-b42bf75faf1c" \
  -H "Authorization: Bearer 76f2f9fb-9632-4c62-8ccb-f9abcd609f67" | python3 -m json.tool
```
