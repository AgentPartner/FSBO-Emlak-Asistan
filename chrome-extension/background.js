const ADD_API = 'https://n8n.agentpartner.pro/webhook/fsbo-add-lead';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scrapeAndSave') {
    // Content script'ten geldi, sayfadaki veriyi çek
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      func: scrapeDetailPage
    }).then(async ([result]) => {
      const data = result.result;
      if (data && data.success) {
        try {
          const resp = await fetch(ADD_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const json = await resp.json();
          sendResponse({ success: json.success });
        } catch (e) {
          sendResponse({ success: false, error: e.message });
        }
      } else {
        sendResponse({ success: false, error: 'Parse failed' });
      }
    });
    return true; // async response
  }
});

function scrapeDetailPage() {
  try {
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.textContent.trim() : '';
    };
    
    const getInfo = (label) => {
      const items = document.querySelectorAll('.classifiedInfoList li, .classified-info-list li');
      for (const item of items) {
        const lbl = item.querySelector('strong, .label');
        if (lbl && lbl.textContent.trim().includes(label)) {
          const val = item.querySelector('span:last-child, .value');
          return val ? val.textContent.trim() : '';
        }
      }
      const rows = document.querySelectorAll('table tr, .uiBox .uiBoxContainer ul li');
      for (const row of rows) {
        if (row.textContent.includes(label)) {
          const cells = row.querySelectorAll('td, span');
          if (cells.length >= 2) return cells[cells.length - 1].textContent.trim();
        }
      }
      return '';
    };
    
    const baslik = getText('h1');
    let fiyatText = getText('.classifiedInfo h3') || getText('h3');
    let fiyat = 0;
    const fm = fiyatText.match(/([\d.]+)/);
    if (fm) fiyat = parseInt(fm[1].replace(/\./g, ''));
    
    const breadcrumb = document.querySelector('.breadcrumb-container, .classified-breadcrumb');
    let il = '', ilce = '', mahalle = '';
    if (breadcrumb) {
      const crumbs = breadcrumb.querySelectorAll('a');
      const texts = Array.from(crumbs).map(a => a.textContent.trim());
      for (let i = 0; i < texts.length; i++) {
        if (['Kayseri','İstanbul','Ankara','İzmir','Bursa','Antalya'].some(c => texts[i].includes(c))) {
          il = texts[i]; if (texts[i+1]) ilce = texts[i+1]; if (texts[i+2]) mahalle = texts[i+2].replace(/\.$/, ''); break;
        }
      }
    }
    
    const ilanNo = getInfo('İlan No');
    const ilanId = ilanNo ? 'SAH-' + ilanNo.slice(-6) : 'SAH-' + Date.now().toString().slice(-6);
    
    let telefon = '';
    const phoneEl = document.querySelector('.classified-owner-phones a, .phone-number');
    if (phoneEl) telefon = phoneEl.textContent.trim().replace(/[\s()-]/g, '');
    
    let ilanSahibi = '';
    const ownerEl = document.querySelector('.username-info-area h5, .classified-owner-info h5');
    if (ownerEl) ilanSahibi = ownerEl.textContent.trim();
    
    let islemTuru = document.URL.includes('kiralik') ? 'kiralik' : 'satilik';
    
    return {
      success: true, ilan_id: ilanId, baslik, fiyat, il, ilce, mahalle, telefon, ilan_sahibi: ilanSahibi,
      ilan_url: document.URL, islem_turu: islemTuru, mulk_tipi: 'Daire',
      metrekare: parseInt(getInfo('m² (Brüt)')) || 0, m2_net: parseInt(getInfo('m² (Net)')) || 0,
      oda_sayisi: getInfo('Oda Sayısı'), bina_yasi: getInfo('Bina Yaşı'),
      bulundugu_kat: getInfo('Bulunduğu Kat'), kat_sayisi: getInfo('Kat Sayısı'),
      isitma: getInfo('Isıtma'), banyo: getInfo('Banyo Sayısı'), balkon: getInfo('Balkon'),
      esyali: getInfo('Eşyalı'), kullanim: getInfo('Kullanım Durumu'),
      site_icinde: getInfo('Site İçerisinde'), kredi: getInfo('Krediye Uygun'),
      takas: getInfo('Takas'), tapu: getInfo('Tapu Durumu'), ilan_tarihi: getInfo('İlan Tarihi')
    };
  } catch (e) { return { success: false, error: e.message }; }
}
