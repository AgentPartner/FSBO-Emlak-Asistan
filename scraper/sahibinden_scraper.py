"""
🏠 Sahibinden.com Emlak İlan Scraper
=====================================
Bu script Sahibinden.com'dan emlak ilanlarını çeker.

KULLANIM:
---------
1. Bright Data hesabı oluşturun (proxy için)
2. .env dosyasını doldurun
3. python sahibinden_scraper.py

NOT: Sahibinden.com scraping'e karşı koruma kullanıyor.
     Production için Bright Data veya Apify kullanmanız önerilir.
"""

import requests
import json
import time
import random
import re
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from bs4 import BeautifulSoup
import logging

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class EmlakIlan:
    """Emlak ilanı veri modeli"""
    ilan_id: str
    baslik: str
    aciklama: str = ""
    fiyat: float = 0
    fiyat_formatted: str = ""
    para_birimi: str = "TRY"
    il: str = ""
    ilce: str = ""
    mahalle: str = ""
    adres: str = ""
    mulk_tipi: str = ""
    oda_sayisi: str = ""
    metrekare: int = 0
    bina_yasi: int = 0
    kat: str = ""
    telefon: str = ""
    ilan_sahibi: str = ""
    ilan_tarihi: str = ""
    goruntuleme: int = 0
    foto_sayisi: int = 0
    ilan_url: str = ""
    kayit_tarihi: str = ""


class SahibindenScraper:
    """Sahibinden.com scraper sınıfı"""
    
    BASE_URL = "https://www.sahibinden.com"
    
    CATEGORIES = {
        "konut": "/satilik",
        "arsa": "/satilik-arsa",
        "isyeri": "/satilik-isyeri"
    }
    
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    ]
    
    def __init__(self, proxy_url: Optional[str] = None):
        self.session = requests.Session()
        self.proxy_url = proxy_url
        if proxy_url:
            self.session.proxies = {"http": proxy_url, "https": proxy_url}
    
    def _get_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": random.choice(self.USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "tr-TR,tr;q=0.9"
        }
    
    def _parse_price(self, price_text: str) -> tuple:
        if not price_text:
            return 0, "", "TRY"
        price_text = price_text.strip()
        currency = "TRY"
        if "$" in price_text: currency = "USD"
        elif "€" in price_text: currency = "EUR"
        numbers = re.findall(r'[\d.,]+', price_text)
        price = float(numbers[0].replace(".", "").replace(",", ".")) if numbers else 0
        return price, price_text, currency
    
    def scrape_category(self, category: str, max_pages: int = 5) -> List[EmlakIlan]:
        listings = []
        base_path = self.CATEGORIES.get(category, "/satilik")
        
        for page in range(1, max_pages + 1):
            try:
                url = f"{self.BASE_URL}{base_path}"
                params = {"pagingOffset": (page - 1) * 50}
                time.sleep(random.uniform(3, 7))
                
                response = self.session.get(url, params=params, headers=self._get_headers(), timeout=30)
                soup = BeautifulSoup(response.text, "html.parser")
                cards = soup.select(".searchResultsItem")
                
                for card in cards:
                    ilan_id = card.get("data-id", "")
                    title = card.select_one(".classifiedTitle")
                    price = card.select_one(".classified-price-container")
                    location = card.select_one(".searchResultsLocationValue")
                    
                    if ilan_id:
                        listings.append(EmlakIlan(
                            ilan_id=ilan_id,
                            baslik=title.get_text(strip=True) if title else "",
                            fiyat_formatted=price.get_text(strip=True) if price else "",
                            il=location.get_text(strip=True).split("/")[0] if location else "",
                            mulk_tipi=category,
                            kayit_tarihi=datetime.now().isoformat()
                        ))
                
                logger.info(f"Sayfa {page}: {len(cards)} ilan")
            except Exception as e:
                logger.error(f"Hata: {e}")
                break
        return listings
    
    def save_to_json(self, listings: List[EmlakIlan], filename: str = "listings.json"):
        with open(filename, "w", encoding="utf-8") as f:
            json.dump([asdict(l) for l in listings], f, ensure_ascii=False, indent=2)
        logger.info(f"{len(listings)} ilan kaydedildi: {filename}")


if __name__ == "__main__":
    scraper = SahibindenScraper()
    listings = scraper.scrape_category("konut", max_pages=2)
    scraper.save_to_json(listings)
