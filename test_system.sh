#!/bin/bash
# FSBO Emlak Asistan - Test Script
# Kullanım: bash test_system.sh

BASE_URL="https://n8n.agentpartner.pro/webhook"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🏠 FSBO Emlak Asistan - Sistem Testi"
echo "===================================="

# 1. Dashboard API Test
echo -e "\n📊 Dashboard API testi..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard/overview")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Dashboard API çalışıyor${NC}"
else
    echo -e "${RED}❌ Dashboard API hatası (HTTP $response)${NC}"
fi

# 2. Lead Listesi Test
echo -e "\n📋 Lead listesi testi..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard/leads")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Lead API çalışıyor${NC}"
else
    echo -e "${RED}❌ Lead API hatası${NC}"
fi

# 3. Recordings API Test
echo -e "\n🎧 Kayıt API testi..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/recordings")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Recordings API çalışıyor${NC}"
else
    echo -e "${RED}❌ Recordings API hatası${NC}"
fi

# 4. Vapi Webhook Test
echo -e "\n📞 Vapi Webhook testi..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/vapi-callback" \
    -H "Content-Type: application/json" \
    -d '{"type":"test"}')
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Vapi Webhook çalışıyor${NC}"
else
    echo -e "${RED}❌ Vapi Webhook hatası${NC}"
fi

echo -e "\n===================================="
echo "Test tamamlandı!"
