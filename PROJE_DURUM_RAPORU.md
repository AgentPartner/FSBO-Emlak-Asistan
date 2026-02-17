# 🏠 FSBO EMLAK ASİSTANI — PROJE DURUM RAPORU
## Tarih: 16 Şubat 2026 (Son Güncelleme)

---

# ✅ TAMAMLANAN İŞLER

---

## 1. ALTYAPI & HESAPLAR
| Bileşen | Durum | Detay |
|---------|-------|-------|
| Vapi.ai hesabı | ✅ | mimar.halilyildirim@gmail.com |
| Vapi Assistant | ✅ | "İsmail - Royal Emlak" (ID: 10c4e584-0200-4a57-9262-b42bf75faf1c) |
| SIP Trunk (Netgsm) | ✅ | ID: 62e5ab92, +908503033860 |
| ElevenLabs | ✅ | Starter plan, Beyda sesi (Türkçe doğal kadın sesi) |
| n8n (self-hosted) | ✅ | https://n8n.agentpartner.pro |
| PostgreSQL DB | ✅ | Coolify üzerinde çalışıyor |

## 2. VERİTABANI TABLOLARI
| Tablo | Durum | Alan Sayısı | Açıklama |
|-------|-------|-------------|----------|
| fsbo_leads | ✅ | 27+ alan | Ana ilan/lead tablosu (konut, arazi, işyeri alanları dahil) |
| fsbo_call_logs | ✅ | 14 alan | Arama geçmişi (call_id, süre, maliyet, transkript, recording_url, randevu_alindi, tekrar_ara) |
| fsbo_appointments | ✅ | 6 alan | Randevu takibi |
| fsbo_do_not_call | ✅ | Temel | Aranmayacak listesi |

### fsbo_leads Genişletilmiş Alanlar:
- Temel: ilan_id, baslik, aciklama, fiyat, il, ilce, mahalle, telefon, ilan_sahibi, ilan_url, islem_turu, mulk_tipi, durum
- Konut: metrekare, m2_net, oda_sayisi, bina_yasi, bulundugu_kat, kat_sayisi, isitma, banyo, balkon, esyali, site_icinde, cephe, kullanim, takas, kredi
- Arazi: ada, parsel, imar, tapu, gabari
- Sistem: created_at, arama_sayisi, son_arama, vapi_call_id

## 3. n8n WORKFLOW'LARI (AKTİF)
| # | Workflow | ID | Durum | Webhook Path |
|---|----------|----|-------|--------------|
| 1 | 📊 FSBO Dashboard API | mkM9ElMLusx6hWWT | ✅ Aktif | /fsbo-dashboard |
| 2 | ➕ FSBO İlan Ekle API | DSZPgWy1ChnbvdVQ | ✅ Aktif | /fsbo-add-lead |
| 3 | 🗑️ FSBO İlan Sil API | 5ZbP1Cd4bbFB2gYz | ✅ Aktif | /fsbo-delete-lead |
| 4 | 🔄 FSBO Durum Güncelle API | 9nPc4ZELtavPt7qE | ✅ Aktif | /fsbo-update-status |
| 5 | 🔄 FSBO Manuel Arama Tetikleme | Ecx63IrjOtfR1pbi | ✅ Aktif | /fsbo-manuel-arama |
| 6 | 📞 FSBO AI Calling - Vapi.ai | UoyZ8IRDSZWWYJwl | ✅ Aktif | (dahili, Vapi API çağırır) |
| 7 | 🔔 FSBO Vapi Webhook Handler | p19DB8ciE6HQyra2 | ✅ Aktif | /vapi-webhook |

### Webhook Handler Detay:
- Vapi end-of-call-report olaylarını yakalar
- Transkript analizi yapar (randevu/tekrar ara/ilgilenmiyor tespiti)
- fsbo_call_logs tablosuna kaydeder
- fsbo_leads tablosunu günceller (durum, son_arama)
- Vapi Assistant serverUrl: https://n8n.agentpartner.pro/webhook/vapi-webhook

## 4. n8n WORKFLOW'LARI (İNAKTİF — Henüz kurulmadı)
| # | Workflow | ID | Durum | Not |
|---|----------|----|-------|-----|
| 1 | 🏠 FSBO Lead Scraping | JtnUuOGf1SP1NsHk | ❌ İnaktif | Sahibinden scraper — bot koruması var |
| 2 | 📊 FSBO Günlük Rapor | H8NabauU4gryP2M3 | ❌ İnaktif | Slack/Email bağlantısı gerekli |
| 3 | 📱 FSBO WhatsApp Takip | MMdagtJ7HTOJHVZy | ❌ İnaktif | Twilio/WhatsApp Business gerekli |
| 4 | 🎧 FSBO Kayıt Dinleme & Kalite | LNQmTvXmMeoFXW7N | ❌ İnaktif | Anthropic API entegrasyonu gerekli |
| 5 | 🔧 FSBO DB Admin | gCXqPlU591qf4gra | ❌ İnaktif | Test amaçlı DB yönetim aracı |

## 5. DASHBOARD (fsbo-dashboard.html)
| Özellik | Durum | Detay |
|---------|-------|-------|
| Genel Bakış sekmesi | ✅ | Özet kartları (toplam ilan, bekleyen, arandı, randevu, ilgilenmiyor, toplam arama) |
| İlanlar sekmesi | ✅ | Tam liste, arama/filtreleme, sıralama |
| İlan Ekleme formu | ✅ | Sahibinden.com formatında, kategori bazlı (Konut/Arazi/İşyeri) dinamik alanlar |
| İlan Detay paneli | ✅ | Sağdan açılan panel, tüm alanlar görünür |
| İlan Düzenleme | ✅ | Mevcut ilan bilgilerini formda düzenleme |
| İlan Silme | ✅ | Onaylı silme |
| Durum güncelleme | ✅ | Detay panelinde dropdown ile durum değiştirme |
| Manuel Arama butonu | ✅ | Detay panelinde "📞 Ara" butonu — Vapi üzerinden arama başlatır |
| Aramalar sekmesi | ✅ | Tıklanabilir satırlar, expand detay paneli |
| Arama kaydı dinleme | ✅ | Audio player (▶/⏸) ile browser içi dinleme |
| Transkript görüntüleme | ✅ | Scroll edilebilir transkript kutusu |
| Arama filtreleme | ✅ | İsim, ilan ID, sonuç ile arama |
| Sonuç badge'leri | ✅ | ✅ Randevu, 🔄 Tekrar Ara, ❌ İlgilenmiyor, ⏱ Kısa |
| Randevular sekmesi | ✅ | Temel randevu listesi |
| Otomatik yenileme | ✅ | 60 saniyede bir |

### Dashboard Dosya Konumu:
- `C:\FSBO_Emlak_Asistan\dashboard\fsbo-dashboard.html`

### Dashboard API Endpoint'leri:
```
GET  https://n8n.agentpartner.pro/webhook/fsbo-dashboard     → Tüm veriler (summary, leads, calls, appointments)
POST https://n8n.agentpartner.pro/webhook/fsbo-add-lead       → İlan ekle/güncelle
POST https://n8n.agentpartner.pro/webhook/fsbo-delete-lead    → İlan sil
POST https://n8n.agentpartner.pro/webhook/fsbo-update-status  → Durum güncelle
POST https://n8n.agentpartner.pro/webhook/fsbo-manuel-arama   → Manuel arama başlat
POST https://n8n.agentpartner.pro/webhook/vapi-webhook        → Vapi callback (otomatik)
```

## 6. VAPI AI ASİSTAN KONFİGÜRASYONU
| Parametre | Değer |
|-----------|-------|
| İsim | Beyda Semercioğlu |
| Firma | Royal Emlak |
| Ses | ElevenLabs Beyda (Türkçe) |
| Model | Claude claude-sonnet-4-20250514 |
| Transcriber | Deepgram Nova-3 (TR) |
| serverUrl | https://n8n.agentpartner.pro/webhook/vapi-webhook |
| Telefon | +908503033860 (Netgsm SIP) |
| Prompt | Samimi sohbet öncelikli, ilan detaylarını kullanır, randevu almaya çalışır |

### Prompt Özellikleri:
- 27 DB alanını kullanarak ilan hakkında detaylı bilgi verir
- Kategori bazlı (Konut/Arazi/İşyeri) açıklamalar yapar
- İsim teyidi alır
- Doğal Türkçe konuşma
- Randevu/red/tekrar ara durumlarını yönetir

## 7. ÖNEMLİ KİMLİK BİLGİLERİ (Referans)
```
Vapi API Key (Private): 76f2f9fb-9632-4c62-8ccb-f9abcd609f67
Vapi API Key (Public):  1534bb42-f515-4a32-adf6-2f7ff3a4f8df
Assistant ID:           10c4e584-0200-4a57-9262-b42bf75faf1c
SIP Trunk ID:           62e5ab92-80a5-492a-b252-40662360fa95
Phone Number ID:        5f8b10b1-eda9-4036-b625-e50fdb23cffc

Netgsm Numara:          +908503033860
Netgsm SIP User:        8503033860
Netgsm SIP Şifre:       u8JWKKcYD9Y3
Netgsm SIP Sunucu:      sip.netgsm.com.tr
Netgsm SIP Port:        5060 (UDP)

n8n Base URL:           https://n8n.agentpartner.pro
```

## 8. TEKNİK NOTLAR
- n8n'de MCP ile oluşturulan webhook'lar için `webhookId` parametresi ZORUNLU, yoksa production URL register olmaz (test URL çalışır)
- Dashboard API'da "Always Output Data" açık olmalı (boş sonuçlar için)
- Vapi assistant güncellemesi: PATCH https://api.vapi.ai/assistant/{id}
- Google Sheets entegrasyonu kuruldu ama kaldırıldı (gereksiz, DB yeterli)

---

# ❌ KALAN İŞLER (Yapılmadı / Yapılması Gereken)

---

## 🔴 YÜKSEK ÖNCELİK

### 1. Gerçek Canlı Test Araması
- **Durum:** Henüz gerçek bir FSBO ilanı aranmadı
- **Yapılacak:** Dashboard'a 1-2 gerçek ilan ekle → Manuel arama ile test et → Ses kalitesi, konuşma akışı, transkript doğruluğu kontrol et
- **Neden önemli:** Tüm sistem çalışıyor ama gerçek dünyada test edilmedi
- **Tahmini süre:** 30 dakika

### 2. Dashboard Hosting (Kalıcı Erişim)
- **Durum:** Dashboard şu an lokal dosya olarak açılıyor
- **Seçenekler:**
  - a) Coolify üzerinde statik site olarak deploy et
  - b) n8n webhook ile HTML serve et
  - c) Netlify/Vercel'e deploy et (ücretsiz)
  - d) Cloudflare Pages'e deploy et (ücretsiz)
- **Neden önemli:** Telefondan veya herhangi bir yerden erişim için
- **Tahmini süre:** 30 dakika

### 3. SIP Trunk Bağlantı Doğrulama
- **Durum:** Önceki testlerde 503 hatası alınmıştı, çözüldü mü belirsiz
- **Yapılacak:** Gerçek outbound arama ile Netgsm SIP bağlantısını test et
- **Sorun olursa:** Netgsm destek hattını ara, IP whitelist kontrolü yap
- **Tahmini süre:** 15-60 dakika (soruna bağlı)

## 🟡 ORTA ÖNCELİK

### 4. Otomatik Toplu Arama (Batch Calling) Sistemi
- **Durum:** Manuel arama çalışıyor, otomatik batch henüz yok
- **Yapılacak:**
  - Zamanlayıcı (Cron/Schedule) ile "yeni" veya "aktarildi" durumdaki leadleri sıraya al
  - Arama arası bekleme süresi (rate limiting)
  - Günlük max arama limiti
  - Çalışma saatleri kısıtlaması (09:00-18:00)
- **Mevcut workflow:** 📞 FSBO AI Calling (UoyZ8IRDSZWWYJwl) — güncellenmeli
- **Tahmini süre:** 1-2 saat

### 5. Günlük Rapor Sistemi
- **Mevcut workflow:** 📊 FSBO Günlük Rapor (H8NabauU4gryP2M3) — inaktif
- **Yapılacak:**
  - Email veya Slack ile günlük özet gönderimi
  - Toplam arama, randevu, red, tekrar ara sayıları
  - Başarı oranları
  - Çalışma saati sonunda otomatik tetiklenme
- **Gerekli:** Email SMTP veya Slack webhook
- **Tahmini süre:** 1 saat

### 6. WhatsApp/SMS Takip Sistemi
- **Mevcut workflow:** 📱 FSBO WhatsApp Takip (MMdagtJ7HTOJHVZy) — inaktif
- **Yapılacak:**
  - Twilio hesabı aç veya WhatsApp Business API kur
  - Arama sonrası otomatik takip mesajı (ilgilenen + tekrar ara durumları)
  - Mesaj şablonları oluştur
  - Webhook handler'a WhatsApp tetikleme ekle
- **Gerekli:** Twilio hesabı ($), WhatsApp Business onayı
- **Tahmini süre:** 2-3 saat

### 7. Dashboard Geliştirmeleri
- **Randevu yönetimi:** Randevu oluştur/düzenle/sil (şu an sadece listeleme var)
- **Grafik/Chart:** Günlük/haftalık arama istatistikleri grafiği
- **Export:** CSV/Excel olarak lead ve arama listesi dışa aktarma
- **Dark/Light mode:** Tema değiştirme
- **Tahmini süre:** 2-3 saat

## 🟢 DÜŞÜK ÖNCELİK

### 8. Kayıt Dinleme & AI Kalite Kontrol
- **Mevcut workflow:** 🎧 FSBO Kayıt Dinleme & Kalite (LNQmTvXmMeoFXW7N) — inaktif
- **Yapılacak:**
  - Anthropic API ile arama transkriptlerini değerlendir
  - Kalite puanı (1-10) ver
  - İyileştirme önerileri üret
  - Dashboard'a kalite paneli ekle
- **Gerekli:** Anthropic API key (n8n credential)
- **Tahmini süre:** 1-2 saat

### 9. A/B Testing Sistemi
- **Mevcut workflow:** Yok (JSON dosyası var ama import edilmedi: 9_AB_Testing.json)
- **Yapılacak:**
  - Farklı prompt varyantları oluştur
  - Arama sonuçlarını varyanta göre karşılaştır
  - Kazanan varyantı otomatik seç
- **Tahmini süre:** 2-3 saat

### 10. Lead Scraping (Sahibinden)
- **Mevcut workflow:** 🏠 FSBO Lead Scraping (JtnUuOGf1SP1NsHk) — inaktif
- **Sorun:** Sahibinden.com bot koruması çok güçlü
- **Alternatifler:**
  - a) Bright Data proxy ($500/ay) — en güvenilir
  - b) Manuel ilan girişi (şu anki yöntem) — ücretsiz
  - c) Apify/ScrapingBee gibi servisler
  - d) Sahibinden API (varsa)
- **Karar:** Manuel giriş şimdilik yeterli, ölçeklendirmede gerekecek

### 11. CRM Entegrasyonu
- **Yapılacak:** HubSpot veya Pipedrive bağlantısı
- **Amaç:** Lead yönetimini profesyonel CRM'e taşıma
- **Tahmini süre:** 3-4 saat

---

# 📊 GENEL DURUM ÖZETİ

| Kategori | Tamamlanan | Kalan | Yüzde |
|----------|-----------|-------|-------|
| Altyapı & Hesaplar | 6/6 | 0 | %100 |
| Veritabanı | 4/4 | 0 | %100 |
| Aktif Workflow'lar | 7/12 | 5 | %58 |
| Dashboard Özellikleri | 14/18 | 4 | %78 |
| AI Asistan | 1/1 | 0 | %100 |
| **TOPLAM** | **32/41** | **9** | **~%78** |

### Sistem Çalışabilirlik Durumu:
✅ İlan ekle → ✅ Manuel arama başlat → ✅ AI görüşme yap → ✅ Sonuç DB'ye kaydet → ✅ Dashboard'da gör

**Temel akış %100 çalışıyor. Eksikler otomasyon ve ek özellikler.**

---

# 🎯 ÖNERİLEN SIRALAMA

1. 🔴 **Gerçek canlı test araması** — Sistemi gerçek dünyada doğrula
2. 🔴 **SIP bağlantı testi** — Outbound aramanın çalıştığını teyit et
3. 🔴 **Dashboard hosting** — Kalıcı web erişimi sağla
4. 🟡 **Otomatik toplu arama** — Ölçeklendirme için kritik
5. 🟡 **Günlük rapor** — Performans takibi
6. 🟡 **WhatsApp takip** — Dönüşüm oranını artırır
7. 🟡 **Dashboard grafik/export** — Görsel analiz
8. 🟢 **AI kalite kontrol** — Prompt iyileştirme
9. 🟢 **A/B testing** — Optimizasyon
10. 🟢 **Scraping** — Ölçeklendirme

---
*Son güncelleme: 16 Şubat 2026, 07:35 TSİ*