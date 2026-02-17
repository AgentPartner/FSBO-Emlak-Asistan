"""
🏠 FSBO Emlak Asistanı - Sahibinden.com Scraper
================================================
Bu script Sahibinden.com'dan emlak ilanlarını çeker.

Kullanım:
    python sahibinden_scraper.py --category konut --city istanbul --limit 100

Gereksinimler:
    pip install requests beautifulsoup4 selenium playwright psycopg2-binary python-dotenv

Not: Sahibinden.com scraping'i için Bright Data veya benzeri proxy servisi önerilir.
"""

import os
import json
import time
import random
import argparse
import logging
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Playwright kullanımı (daha güvenilir)
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

# Veritabanı bağlantısı
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment variables
load_dotenv()

@dataclass
class Listing:
    """Sahibinden ilan veri modeli"""
    ilan_id: str
    baslik: str
    aciklama: Optional[str] = None
    fiyat: Optional[float] = None
    fiyat_formatted: Optional[str] = None
    para_birimi: str = "TRY"
    il: Optional[str] = None
    ilce: Optional[str] = None
    mahalle: Optional[str] = None
    mulk_tipi: Optional[str] = None
    oda_sayisi: Optional[str] = None
    metrekare: Optional[int] = None
    bina_yasi: Optional[int] = None
    kat: Optional[str] = None
    telefon: Optional[str] = None
    ilan_sahibi: Optional[str] = None
    ilan_tarihi: Optional[str] = None
    goruntuleme: Optional[int] = None
    foto_sayisi: Optional[int] = None
    ilan_url: Optional[str] = None


class SahibindenScraper:
    """Sahibinden.com scraper sınıfı"""
    
    BASE_URL = "https://www.sahibinden.com"
    
    CATEGORIES = {
        "konut": "/satilik",
        "arsa": "/satilik-arsa",
        "isyeri": "/satilik-isyeri",
        "devremulk": "/satilik-devremulk"
    }
    
    CITIES = {
        "istanbul": "34",
        "ankara": "6",
        "izmir": "35",
        "bursa": "16",
        "antalya": "7",
    }
    
    def __init__(self, use_proxy: bool = True, proxy_url: Optional[str] = None):
        self.use_proxy = use_proxy
        self.proxy_url = proxy_url or os.getenv("BRIGHTDATA_PROXY_URL")
        self.session = self._create_session()
        self.listings: List[Listing] = []
        
    def _create_session(self) -> requests.Session:
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        })
        
        if self.use_proxy and self.proxy_url:
            session.proxies = {"http": self.proxy_url, "https": self.proxy_url}
            logger.info(f"Proxy kullanılıyor")
        
        return session
    
    def _random_delay(self, min_sec: float = 1.0, max_sec: float = 3.0):
        time.sleep(random.uniform(min_sec, max_sec))
    
    def scrape_listing_list(
        self, 
        category: str = "konut",
        city: Optional[str] = None,
        limit: int = 100
    ) -> List[Listing]:
        listings = []
        page = 1
        
        base_path = self.CATEGORIES.get(category, "/satilik")
        
        while len(listings) < limit:
            url = f"{self.BASE_URL}{base_path}"
            params = {"pagingOffset": (page - 1) * 20}
            
            if city and city.lower() in self.CITIES:
                params["address_city"] = self.CITIES[city.lower()]
            
            try:
                self._random_delay(2.0, 4.0)
                logger.info(f"📄 Sayfa {page} scrape ediliyor...")
                
                response = self.session.get(url, params=params, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                listing_cards = soup.select("tr.searchResultsItem")
                
                if not listing_cards:
                    break
                
                for card in listing_cards:
                    if len(listings) >= limit:
                        break
                    listing = self._parse_listing_card(card)
                    if listing:
                        listings.append(listing)
                
                page += 1
                
            except Exception as e:
                logger.error(f"❌ Hata (sayfa {page}): {str(e)}")
                break
        
        self.listings = listings
        logger.info(f"✅ Toplam {len(listings)} ilan scrape edildi.")
        return listings
    
    def _parse_listing_card(self, card) -> Optional[Listing]:
        try:
            link = card.select_one("a.classifiedTitle")
            if not link:
                return None
            
            href = link.get("href", "")
            ilan_id = href.split("/")[-1].split("-")[-1] if href else None
            ilan_url = f"{self.BASE_URL}{href}" if href else None
            baslik = link.text.strip()
            
            price_elem = card.select_one("td.searchResultsPriceValue")
            fiyat_text = price_elem.text.strip() if price_elem else "0"
            fiyat = self._parse_price(fiyat_text)
            
            location_elem = card.select_one("td.searchResultsLocationValue")
            location_text = location_elem.text.strip() if location_elem else ""
            il, ilce, mahalle = self._parse_location(location_text)
            
            date_elem = card.select_one("td.searchResultsDateValue")
            ilan_tarihi = date_elem.text.strip() if date_elem else None
            
            attrs = card.select("td.searchResultsAttributeValue")
            oda_sayisi = attrs[0].text.strip() if len(attrs) > 0 else None
            metrekare = self._parse_int(attrs[1].text) if len(attrs) > 1 else None
            
            return Listing(
                ilan_id=ilan_id,
                baslik=baslik,
                fiyat=fiyat,
                fiyat_formatted=fiyat_text,
                il=il,
                ilce=ilce,
                mahalle=mahalle,
                oda_sayisi=oda_sayisi,
                metrekare=metrekare,
                ilan_tarihi=ilan_tarihi,
                ilan_url=ilan_url
            )
        except Exception as e:
            logger.error(f"Kart parse hatası: {str(e)}")
            return None
    
    def _parse_price(self, price_text: str) -> Optional[float]:
        try:
            clean = price_text.replace(".", "").replace(",", ".").replace("TL", "").strip()
            return float(clean) if clean else None
        except:
            return None
    
    def _parse_location(self, location_text: str) -> tuple:
        parts = [p.strip() for p in location_text.split("/")]
        il = parts[0] if len(parts) > 0 else None
        ilce = parts[1] if len(parts) > 1 else None
        mahalle = parts[2] if len(parts) > 2 else None
        return il, ilce, mahalle
    
    def _parse_int(self, text: str) -> Optional[int]:
        try:
            clean = "".join(filter(str.isdigit, text))
            return int(clean) if clean else None
        except:
            return None
    
    def save_to_database(self):
        if not DB_AVAILABLE:
            logger.error("psycopg2 yüklü değil!")
            return
        
        if not self.listings:
            return
        
        conn = None
        try:
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            for listing in self.listings:
                cursor.execute("""
                    INSERT INTO leads (ilan_id, baslik, fiyat, fiyat_formatted, 
                        il, ilce, mahalle, oda_sayisi, metrekare, ilan_tarihi, ilan_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (ilan_id) DO UPDATE SET
                        fiyat = EXCLUDED.fiyat,
                        guncelleme_tarihi = CURRENT_TIMESTAMP
                """, (
                    listing.ilan_id, listing.baslik, listing.fiyat, 
                    listing.fiyat_formatted, listing.il, listing.ilce,
                    listing.mahalle, listing.oda_sayisi, listing.metrekare,
                    listing.ilan_tarihi, listing.ilan_url
                ))
            
            conn.commit()
            logger.info(f"✅ {len(self.listings)} ilan veritabanına kaydedildi.")
            
        except Exception as e:
            logger.error(f"❌ Veritabanı hatası: {str(e)}")
            if conn:
                conn.rollback()
        finally:
            if conn:
                conn.close()
    
    def save_to_json(self, filename: str = "listings.json"):
        data = [asdict(l) for l in self.listings]
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"✅ {len(self.listings)} ilan {filename} dosyasına kaydedildi.")


def main():
    parser = argparse.ArgumentParser(description="Sahibinden.com Emlak Scraper")
    parser.add_argument("--category", default="konut", choices=["konut", "arsa", "isyeri", "devremulk"])
    parser.add_argument("--city", default=None)
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--output", default="listings.json")
    parser.add_argument("--save-db", action="store_true")
    
    args = parser.parse_args()
    
    logger.info(f"🚀 Scraping başlıyor: {args.category}, {args.city or 'Tüm'}, limit={args.limit}")
    
    scraper = SahibindenScraper()
    scraper.scrape_listing_list(category=args.category, city=args.city, limit=args.limit)
    scraper.save_to_json(args.output)
    
    if args.save_db:
        scraper.save_to_database()


if __name__ == "__main__":
    main()
