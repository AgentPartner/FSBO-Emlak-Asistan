// Content script - sahibinden.com sayfalarında çalışır
// Sayfaya küçük bir floating buton ekler

(function() {
  // Sadece ilan detay sayfasında göster
  if (!window.location.href.includes('/ilan/') || !window.location.href.includes('/detay')) return;
  
  const btn = document.createElement('div');
  btn.id = 'royal-emlak-btn';
  btn.innerHTML = '🏠 Royal Emlak\'a Ekle';
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;z-index:99999;box-shadow:0 4px 20px rgba(59,130,246,.4);transition:all .2s;font-family:system-ui';
  
  btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.05)'; });
  btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; });
  
  btn.addEventListener('click', async () => {
    btn.innerHTML = '⏳ Çekiliyor...';
    btn.style.background = '#f59e0b';
    
    // Extension popup'taki scrapeDetailPage fonksiyonunu burada da tanımlıyoruz
    try {
      chrome.runtime.sendMessage({ action: 'scrapeAndSave' }, (response) => {
        if (response && response.success) {
          btn.innerHTML = '✅ Kaydedildi!';
          btn.style.background = '#10b981';
          setTimeout(() => {
            btn.innerHTML = '🏠 Royal Emlak\'a Ekle';
            btn.style.background = 'linear-gradient(135deg,#3b82f6,#06b6d4)';
          }, 3000);
        } else {
          btn.innerHTML = '❌ Hata!';
          btn.style.background = '#ef4444';
          setTimeout(() => {
            btn.innerHTML = '🏠 Royal Emlak\'a Ekle';
            btn.style.background = 'linear-gradient(135deg,#3b82f6,#06b6d4)';
          }, 3000);
        }
      });
    } catch (e) {
      btn.innerHTML = '❌ ' + e.message;
    }
  });
  
  document.body.appendChild(btn);
})();
