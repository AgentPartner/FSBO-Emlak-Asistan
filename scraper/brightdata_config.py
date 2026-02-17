# Sahibinden Scraper - Bright Data Collector Config
# Bu JSON'u Bright Data Web Scraper IDE'ye yapıştırın

collector_config = {
    "name": "Sahibinden Emlak Scraper",
    "input": [
        {"url": "https://www.sahibinden.com/satilik"},
        {"url": "https://www.sahibinden.com/satilik-arsa"},
        {"url": "https://www.sahibinden.com/satilik-isyeri"}
    ],
    "output_format": "json",
    "scheduling": {
        "enabled": True,
        "interval": "6h"
    }
}

# Bright Data Scraper JavaScript kodu:
scraper_code = """
async function scrape({ page, data }) {
    // Sayfa yüklenene kadar bekle
    await page.waitForSelector('.searchResultsItem, .classified-card');
    
    // Tüm ilanları çek
    const listings = await page.evaluate(() => {
        const items = document.querySelectorAll('.searchResultsItem, .classified-card');
        const results = [];
        
        items.forEach(item => {
            try {
                const id = item.dataset.id || item.querySelector('a[href*="/ilan/"]')?.href.match(/\\/ilan\\/(\\d+)/)?.[1];
                const title = item.querySelector('.classifiedTitle, h3 a')?.innerText?.trim();
                const price = item.querySelector('.classified-price-container, .price')?.innerText?.trim();
                const location = item.querySelector('.searchResultsLocationValue, .location')?.innerText?.trim();
                const link = item.querySelector('a[href*="/ilan/"]')?.href;
                const photoCount = item.querySelector('.photo-count')?.innerText?.match(/\\d+/)?.[0] || '0';
                
                // Özellikleri çek
                const specs = item.querySelectorAll('.searchResultsAttributeValue');
                let m2 = '', rooms = '';
                specs.forEach(spec => {
                    const text = spec.innerText.toLowerCase();
                    if (text.includes('m²')) m2 = spec.innerText.trim();
                    if (text.includes('+')) rooms = spec.innerText.trim();
                });
                
                if (id && title) {
                    results.push({
                        ilan_id: id,
                        baslik: title,
                        fiyat_formatted: price,
                        konum: location,
                        ilan_url: link,
                        foto_sayisi: parseInt(photoCount),
                        metrekare: m2,
                        oda_sayisi: rooms,
                        cekme_tarihi: new Date().toISOString()
                    });
                }
            } catch (e) {}
        });
        
        return results;
    });
    
    return listings;
}
"""
