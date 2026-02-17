// FSBO Dashboard JavaScript
const API_BASE = 'https://n8n.agentpartner.pro/webhook';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    refreshData();
    setInterval(refreshData, 60000); // Her dakika güncelle
});

// Tüm verileri yenile
async function refreshData() {
    try {
        await Promise.all([
            loadOverview(),
            loadLeads(),
            loadAppointments()
        ]);
        document.getElementById('lastUpdate').textContent = 
            'Son güncelleme: ' + new Date().toLocaleTimeString('tr-TR');
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
    }
}

// Dashboard özet verisi
async function loadOverview() {
    try {
        const res = await fetch(`${API_BASE}/dashboard/overview`);
        const data = await res.json();
        if (data.success) {
            const d = data.data;
            document.getElementById('todayCalls').textContent = d.today_calls || 0;
            document.getElementById('todayAppointments').textContent = d.today_appointments || 0;
            document.getElementById('conversionRate').textContent = (d.conversion_rate || 0) + '%';
            document.getElementById('pendingAppointments').textContent = d.pending_appointments || 0;
            document.getElementById('weekCalls').textContent = d.week_calls || 0;
            document.getElementById('weekAppointments').textContent = d.week_appointments || 0;
            document.getElementById('weekCost').textContent = '$' + (d.week_cost || 0).toFixed(2);
        }
    } catch (e) { console.error(e); }
}

// Lead listesi
async function loadLeads(status = '') {
    try {
        const url = status ? `${API_BASE}/dashboard/leads?status=${status}` : `${API_BASE}/dashboard/leads`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
            renderLeads(data.leads || []);
        }
    } catch (e) { console.error(e); }
}

function renderLeads(leads) {
    const tbody = document.getElementById('leadsTable');
    tbody.innerHTML = leads.slice(0, 10).map(lead => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3">
                <div class="font-medium text-gray-900 truncate max-w-xs">${lead.baslik || '-'}</div>
                <div class="text-xs text-gray-500">${lead.mulk_tipi || ''}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">${lead.il || ''} ${lead.ilce || ''}</td>
            <td class="px-4 py-3 text-sm font-medium">${lead.fiyat_formatted || '-'}</td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                    <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-600" style="width: ${lead.lead_score || 0}%"></div>
                    </div>
                    <span class="text-xs text-gray-500">${lead.lead_score || 0}</span>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded-full ${getStatusClass(lead.durum)}">${getStatusText(lead.durum)}</span>
            </td>
            <td class="px-4 py-3">
                <button onclick="callLead(${lead.id})" class="text-blue-600 hover:text-blue-800" title="Ara">
                    <i data-lucide="phone" class="w-4 h-4"></i>
                </button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function getStatusClass(status) {
    const classes = {
        'yeni': 'bg-blue-100 text-blue-800',
        'randevu_alindi': 'bg-green-100 text-green-800',
        'tekrar_ara': 'bg-yellow-100 text-yellow-800',
        'reddedildi': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status) {
    const texts = {
        'yeni': 'Yeni',
        'randevu_alindi': 'Randevu',
        'tekrar_ara': 'Tekrar Ara',
        'reddedildi': 'Red'
    };
    return texts[status] || status;
}

// Randevular
async function loadAppointments() {
    try {
        const res = await fetch(`${API_BASE}/dashboard/appointments?upcoming=true&limit=5`);
        const data = await res.json();
        if (data.success) {
            renderAppointments(data.appointments || []);
        }
    } catch (e) { console.error(e); }
}

function renderAppointments(appointments) {
    const container = document.getElementById('appointmentsList');
    if (appointments.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">Yaklaşan randevu yok</p>';
        return;
    }
    container.innerHTML = appointments.map(apt => `
        <div class="p-3 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-medium text-gray-900 text-sm">${apt.ilan_sahibi || 'Müşteri'}</p>
                    <p class="text-xs text-gray-500">${apt.il || ''} ${apt.ilce || ''}</p>
                </div>
                <span class="text-xs text-blue-600">${formatDate(apt.randevu_tarihi)}</span>
            </div>
        </div>
    `).join('');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'});
}

// Lead filtrele
function filterLeads() {
    const status = document.getElementById('leadFilter').value;
    loadLeads(status);
}

// Lead'i ara
async function callLead(leadId) {
    if (!confirm('Bu lead\'i aramak istediğinize emin misiniz?')) return;
    try {
        const res = await fetch(`${API_BASE}/trigger-call`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({lead_id: leadId})
        });
        const data = await res.json();
        if (data.success) {
            alert('Arama başlatıldı!');
            refreshData();
        } else {
            alert('Hata: ' + (data.error || 'Bilinmeyen hata'));
        }
    } catch (e) {
        alert('Bağlantı hatası');
    }
}
