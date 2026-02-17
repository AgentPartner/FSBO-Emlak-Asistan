import requests
import psycopg2
import json
from datetime import datetime

# Vapi API
VAPI_KEY = "76f2f9fb-9632-4c62-8ccb-f9abcd609f67"
VAPI_URL = "https://api.vapi.ai/call"

# PostgreSQL
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "mFZXLdJFCidGswkUsahtzh5fXTMXy8Rr1sd8woL17it7lQxafZRCa4g869GA7lx6",
    "database": "postgres"
}

def fetch_all_vapi_calls():
    """Fetch all calls from Vapi API"""
    headers = {"Authorization": f"Bearer {VAPI_KEY}"}
    all_calls = []
    
    # Fetch with pagination
    params = {"limit": 100}
    r = requests.get(VAPI_URL, headers=headers, params=params)
    calls = r.json()
    all_calls.extend(calls)
    print(f"Fetched {len(calls)} calls from Vapi")
    
    return all_calls

def get_call_details(call_id):
    """Get detailed call info including transcript and recording"""
    headers = {"Authorization": f"Bearer {VAPI_KEY}"}
    try:
        r = requests.get(f"{VAPI_URL}/{call_id}", headers=headers)
        return r.json()
    except:
        return None

def map_ended_reason(reason):
    """Map Vapi ended reason to Turkish status"""
    mapping = {
        "customer-busy": "mesgul",
        "customer-ended-call": "musteri_kapatti",
        "assistant-ended-call": "asistan_kapatti", 
        "silence-timed-out": "sessizlik_timeout",
        "customer-did-not-answer": "cevaplanmadi",
        "voicemail": "sesli_mesaj",
        "phone-call-provider-closed-websocket": "baglanti_koptu",
        "assistant-error": "hata",
        "pipeline-error-openai-llm-failed": "hata",
    }
    return mapping.get(reason, reason or "bilinmiyor")

def insert_calls_to_db(calls):
    """Insert calls into fsbo_call_logs"""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    inserted = 0
    skipped = 0
    
    for call in calls:
        call_id = call.get("id", "")
        
        # Check if already exists
        cur.execute("SELECT id FROM fsbo_call_logs WHERE call_id = %s", (call_id,))
        if cur.fetchone():
            skipped += 1
            continue
        
        # Get detailed info
        detail = get_call_details(call_id)
        if not detail:
            detail = call
        
        # Extract fields
        customer = detail.get("customer", {}) or {}
        telefon = customer.get("number", "")
        ilan_sahibi = customer.get("name", "")
        
        # Duration
        started = detail.get("startedAt")
        ended = detail.get("endedAt")
        sure_saniye = 0
        if started and ended:
            try:
                s = datetime.fromisoformat(started.replace("Z", "+00:00"))
                e = datetime.fromisoformat(ended.replace("Z", "+00:00"))
                sure_saniye = int((e - s).total_seconds())
            except:
                pass
        
        # Cost
        maliyet = detail.get("cost", 0) or 0
        
        # Status
        ended_reason = detail.get("endedReason", "")
        durum = map_ended_reason(ended_reason)
        
        # Transcript
        transcript = ""
        messages = detail.get("messages", []) or detail.get("artifact", {}).get("messages", []) or []
        for msg in messages:
            role = msg.get("role", "")
            content = msg.get("message", "") or msg.get("content", "")
            if content and role in ["assistant", "user"]:
                speaker = "Ayşe" if role == "assistant" else "Müşteri"
                transcript += f"{speaker}: {content}\n"
        
        # Recording
        recording_url = detail.get("recordingUrl", "") or ""
        if not recording_url:
            artifact = detail.get("artifact", {}) or {}
            recording_url = artifact.get("recordingUrl", "") or ""
        
        # Summary/analysis
        analysis = detail.get("analysis", {}) or {}
        ozet = analysis.get("summary", "") or ""
        
        # Randevu detection
        randevu = False
        tekrar_ara = False
        if transcript:
            t_lower = transcript.lower()
            if any(w in t_lower for w in ["randevu", "görüşme", "buluşalım", "gelin", "bekleriz", "saat"]):
                randevu = True
            if any(w in t_lower for w in ["tekrar ara", "sonra ara", "müsait değil", "başka zaman"]):
                tekrar_ara = True
        
        # Success evaluation from Vapi
        success = detail.get("analysis", {}).get("successEvaluation", "") if detail.get("analysis") else ""
        if success and "true" in str(success).lower():
            randevu = True
        
        # Created at
        created_at = detail.get("createdAt", "") or datetime.now().isoformat()
        
        # Extract ilan_id from assistantOverrides if available
        overrides = detail.get("assistantOverrides", {}) or {}
        ilan_id = ""
        first_msg = overrides.get("firstMessage", "")
        baslik = first_msg[:500] if first_msg else ""
        
        # Determine call type
        call_type = detail.get("type", "")
        
        try:
            cur.execute("""
                INSERT INTO fsbo_call_logs 
                (call_id, ilan_id, ilan_sahibi, telefon, baslik, sure_saniye, maliyet, durum, ozet, transcript, recording_url, randevu_alindi, tekrar_ara, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                call_id, ilan_id, ilan_sahibi, telefon, baslik,
                sure_saniye, maliyet, durum, ozet, transcript,
                recording_url, randevu, tekrar_ara, created_at
            ))
            inserted += 1
            print(f"  Inserted: {call_id} | {durum} | {sure_saniye}s | {telefon}")
        except Exception as e:
            print(f"  Error inserting {call_id}: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"\nDone! Inserted: {inserted}, Skipped: {skipped}, Total: {len(calls)}")

if __name__ == "__main__":
    print("Fetching calls from Vapi...")
    calls = fetch_all_vapi_calls()
    print(f"\nInserting {len(calls)} calls to database...")
    insert_calls_to_db(calls)
