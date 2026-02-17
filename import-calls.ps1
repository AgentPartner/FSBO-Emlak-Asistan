# Eski aramalari Vapi'den cekip n8n webhook'a end-of-call-report olarak gonder
$vapiHeaders = @{ "Authorization" = "Bearer 76f2f9fb-9632-4c62-8ccb-f9abcd609f67" }
$webhookUrl = "https://n8n.agentpartner.pro/webhook/vapi-webhook"

# Tum aramalari cek
$calls = Invoke-RestMethod -Uri "https://api.vapi.ai/call?limit=100&assistantId=10c4e584-0200-4a57-9262-b42bf75faf1c" -Method GET -Headers $vapiHeaders

# Gercek konusma olanlari filtrele
$validCalls = $calls | Where-Object { $_.cost -gt 0.01 -and $_.status -eq "ended" -and $_.endedReason -eq "customer-ended-call" }
Write-Host "Gonderilecek arama sayisi: $($validCalls.Count)"

$sent = 0
$failed = 0

foreach ($call in $validCalls) {
    try {
        # Detayli bilgi cek
        $detail = Invoke-RestMethod -Uri "https://api.vapi.ai/call/$($call.id)" -Method GET -Headers $vapiHeaders
        
        $customerNumber = ""
        if ($detail.customer -and $detail.customer.number) { $customerNumber = $detail.customer.number }
        
        $transcript = ""
        if ($detail.transcript) { $transcript = $detail.transcript }
        
        $recordingUrl = ""
        if ($detail.recordingUrl) { $recordingUrl = $detail.recordingUrl }
        
        $duration = 0
        if ($detail.startedAt -and $detail.endedAt) {
            $start = [datetime]::Parse($detail.startedAt)
            $end = [datetime]::Parse($detail.endedAt)
            $duration = [int]($end - $start).TotalSeconds
        }
        
        # end-of-call-report formati olustur
        $payload = @{
            message = @{
                type = "end-of-call-report"
                transcript = $transcript
                recordingUrl = $recordingUrl
                call = @{
                    id = $detail.id
                    duration = $duration
                    cost = $detail.cost
                    recordingUrl = $recordingUrl
                    transcript = $transcript
                    endedReason = $detail.endedReason
                    customer = @{
                        number = $customerNumber
                    }
                }
            }
        } | ConvertTo-Json -Depth 5 -Compress
        
        $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        
        $whHeaders = @{ "Content-Type" = "application/json; charset=utf-8" }
        $resp = Invoke-RestMethod -Uri $webhookUrl -Method POST -Headers $whHeaders -Body $payloadBytes
        
        $sent++
        Write-Host "OK [$sent] $($detail.id) | Phone: $customerNumber | Duration: ${duration}s | Cost: $($detail.cost)"
        
        Start-Sleep -Milliseconds 500
    } catch {
        $failed++
        Write-Host "FAIL: $($call.id) - $($_.Exception.Message)"
    }
}

Write-Host "`n=== SONUC: $sent basarili, $failed basarisiz ==="
