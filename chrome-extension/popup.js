const DASHBOARD_URL = 'https://emlak.agentpartner.pro/#leads';
const ADD_API = 'https://n8n.agentpartner.pro/webhook/fsbo-add-lead';
const EXT_VERSION = 'v2.2'; // kategori + cephe fix

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  const isSahibinden = url.includes('sahibinden.com');
  const isDetail = isSahibinden && url.includes('/ilan/');
  const isList = isSahibinden && !url.includes('/ilan/') && (url.includes('satilik') || url.includes('kiralik') || url.includes('/emlak'));
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const btnSingle = document.getElementById('btnSingle');
  const btnBulk = document.getElementById('btnBulk');
  const btnBulkAll = document.getElementById('btnBulkAll');
  if (isDetail) { statusDot.className='status-dot green'; statusText.textContent='✅ İlan detay sayfası — hazır'; btnSingle.disabled=false; }
  else if (isList) { statusDot.className='status-dot green'; statusText.textContent='✅ İlan liste sayfası — toplu çekime hazır'; btnBulk.disabled=false; btnBulkAll.disabled=false; }
  else if (isSahibinden) { statusDot.className='status-dot orange'; statusText.textContent='⚠️ Sahibinden — ilan sayfasına git'; }
  else { statusDot.className='status-dot red'; statusText.textContent='❌ Sahibinden.com değil'; }

  btnSingle.addEventListener('click', async () => {
    btnSingle.disabled=true; btnSingle.textContent='⏳ Çekiliyor...';
    try {
      const [result] = await chrome.scripting.executeScript({target:{tabId:tab.id},func:scrapeDetailPage});
      const data = result.result;
      if(!data||!data.success){btnSingle.textContent='❌ Veri çekilemedi';setTimeout(()=>{btnSingle.textContent='📋 Bu İlanı Çek ve Kaydet';btnSingle.disabled=false;},3000);return;}
      console.log('Scraped ['+EXT_VERSION+']:',JSON.stringify(data));
      const resp=await fetch(ADD_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const rt=await resp.text(); let json; try{json=JSON.parse(rt);}catch(e){json={success:false,message:rt.substring(0,100)};}
      if(json.success){
        showResult('✅ İlan kaydedildi!',[['Başlık',(data.baslik||'-').substring(0,50)],['Fiyat',data.fiyat?Number(data.fiyat).toLocaleString('tr-TR')+' ₺':'-'],['Konum',(data.il||'')+' / '+(data.ilce||'')+(data.mahalle?' / '+data.mahalle:'')],['Telefon',data.telefon||'-'],['İlan Sahibi',data.ilan_sahibi||'-']]);
        btnSingle.textContent='✅ Kaydedildi!'; btnSingle.style.background='linear-gradient(135deg,#10b981,#059669)';
      } else { showResult('⚠️ Kayıt',[['Mesaj',json.message||'Bilinmeyen']]); btnSingle.textContent='⚠️ Hata'; }
    } catch(e){btnSingle.textContent='❌ '+e.message.substring(0,30);}
    setTimeout(()=>{btnSingle.textContent='📋 Bu İlanı Çek ve Kaydet';btnSingle.disabled=false;btnSingle.style.background='';},5000);
  });

  btnBulk.addEventListener('click', async () => {
    btnBulk.disabled=true;btnBulkAll.disabled=true;
    const delay=parseInt(document.getElementById('delay').value)||5;
    try{
      const [lr]=await chrome.scripting.executeScript({target:{tabId:tab.id},func:scrapeListPage});
      const links=lr.result;
      if(!links||!links.length){btnBulk.textContent='❌ İlan bulunamadı';setTimeout(()=>{btnBulk.textContent='📦 Sayfadaki Tüm İlanları Çek';btnBulk.disabled=false;btnBulkAll.disabled=false;},3000);return;}
      showProgress(links.length+' ilan bulundu...',0,links.length);
      let saved=0,failed=0;
      for(let i=0;i<links.length;i++){
        updateProgress(i+1,links.length,(links[i].title||'İlan '+(i+1)).substring(0,40));
        try{await chrome.tabs.update(tab.id,{url:links[i].url});await waitForPageLoad(tab.id,delay);
          const [dr]=await chrome.scripting.executeScript({target:{tabId:tab.id},func:scrapeDetailPage});
          const d=dr.result;
          if(d&&d.success){const r=await fetch(ADD_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const t=await r.text();try{if(JSON.parse(t).success)saved++;else failed++;}catch(e){failed++;}}else{failed++;}
        }catch(e){failed++;}
        if(i<links.length-1)await sleep(delay*1000);
      }
      showResult('✅ Toplu çekim tamamlandı!',[['Toplam',links.length+' ilan'],['Kaydedilen',saved+' ilan'],['Hatalı',failed+' ilan']]);
    }catch(e){btnBulk.textContent='❌ '+e.message;}
    btnBulk.disabled=false;btnBulkAll.disabled=false;
  });

  document.getElementById('btnDashboard').addEventListener('click',()=>{chrome.tabs.create({url:DASHBOARD_URL});});
});

function showProgress(t,c,n){document.getElementById('progress').classList.add('active');document.getElementById('result').classList.remove('active');document.getElementById('progressTitle').textContent=t;updateProgress(c,n,'');}
function updateProgress(c,n,d){var p=n>0?Math.round(c/n*100):0;document.getElementById('progressFill').style.width=p+'%';document.getElementById('progressText').textContent=c+' / '+n+(d?' — '+d:'');}
function showResult(t,s){document.getElementById('progress').classList.remove('active');var e=document.getElementById('result');e.classList.add('active');document.getElementById('resultTitle').textContent=t;document.getElementById('resultStats').innerHTML=s.map(function(x){return'<div class="result-stat"><span>'+x[0]+'</span><span>'+x[1]+'</span></div>';}).join('');}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
function waitForPageLoad(tid,d){return new Promise(function(res){var l=function(id,info){if(id===tid&&info.status==='complete'){chrome.tabs.onUpdated.removeListener(l);setTimeout(res,d*1000);}};chrome.tabs.onUpdated.addListener(l);setTimeout(function(){chrome.tabs.onUpdated.removeListener(l);res();},30000);});}

// ============================================================
// SCRAPE DETAIL PAGE
// ============================================================
function scrapeDetailPage(){
  try{
    function getInfo(label){
      var allLi=document.querySelectorAll('ul.classifiedInfoList li, ul li');
      for(var i=0;i<allLi.length;i++){
        var strong=allLi[i].querySelector('strong');
        if(strong&&strong.textContent.indexOf(label)!==-1){
          var spans=allLi[i].querySelectorAll('span');
          if(spans.length>0)return spans[spans.length-1].textContent.trim();
        }
      }
      var body=document.body.innerText;
      var re=new RegExp(label+'\\s*[:\\n]\\s*(.+?)(?:\\n|$)','i');
      var m=body.match(re);
      if(m)return m[1].trim().split('\n')[0].trim();
      return '';
    }

    var h1=document.querySelector('h1');
    var baslik=h1?h1.textContent.trim():'';

    var fiyat=0;
    var fiyatEl=document.querySelector('.classifiedInfo h3');
    if(fiyatEl){fiyat=parseInt(fiyatEl.textContent.replace(/[^\d]/g,''))||0;}

    // KONUM: h2 tag "Kayseri / Talas / Mevlana Mah."
    var il='',ilce='',mahalle='';
    var allH2=document.querySelectorAll('h2');
    for(var i=0;i<allH2.length;i++){
      var h2t=allH2[i].textContent.replace(/\s+/g,' ').trim();
      var lm=h2t.match(/([A-Za-z\u00c7\u011e\u0130\u00d6\u015e\u00dc\u00e7\u011f\u0131\u00f6\u015f\u00fc\u0131]+)\s*\/\s*([A-Za-z\u00c7\u011e\u0130\u00d6\u015e\u00dc\u00e7\u011f\u0131\u00f6\u015f\u00fc\u0131]+)\s*\/?\s*([A-Za-z\u00c7\u011e\u0130\u00d6\u015e\u00dc\u00e7\u011f\u0131\u00f6\u015f\u00fc\u0131.\s]*)/);
      if(lm&&lm[1].length>2){il=lm[1].trim();ilce=lm[2].trim();mahalle=(lm[3]||'').trim().replace(/\.\s*$/,'');break;}
    }

    var ilanNo=getInfo('İlan No')||'';
    var ilanTarihiRaw=getInfo('İlan Tarihi')||'';
    var ilanTarihi='';
    if(ilanTarihiRaw){
      var aylar={'ocak':'01','şubat':'02','mart':'03','nisan':'04','mayıs':'05','haziran':'06','temmuz':'07','ağustos':'08','eylül':'09','ekim':'10','kasım':'11','aralık':'12'};
      var dm=ilanTarihiRaw.match(/(\d{1,2})\s+(\S+)\s+(\d{4})/);
      if(dm){var ay=aylar[dm[2].toLowerCase()]||'01';ilanTarihi=dm[3]+'-'+ay+'-'+dm[1].padStart(2,'0')+'T12:00:00';}
    }

    var emlakTipi=getInfo('Emlak Tipi')||'';
    var m2Brut=getInfo('m² (Brüt)')||getInfo('Brüt')||'';
    var m2Net=getInfo('m² (Net)')||getInfo('Net')||'';
    var odaSayisi=getInfo('Oda Sayısı')||'';
    var binaYasi=getInfo('Bina Yaşı')||'';
    var bulunduguKat=getInfo('Bulunduğu Kat')||'';
    var katSayisi=getInfo('Kat Sayısı')||'';
    var isitma=getInfo('Isıtma')||'';
    var banyoSayisi=getInfo('Banyo Sayısı')||'';
    var balkon=getInfo('Balkon')||'';
    var esyali=getInfo('Eşyalı')||'';
    var kullanimDurumu=getInfo('Kullanım Durumu')||'';
    var siteIcinde=getInfo('Site İçerisinde')||getInfo('Site İçinde')||'';
    var krediyeUygun=getInfo('Krediye Uygun')||'';
    var takas=getInfo('Takas')||'';
    var tapuDurumu=getInfo('Tapu Durumu')||'';
    var kimden=getInfo('Kimden')||'';
    var adaNo=getInfo('Ada No')||getInfo('Ada')||'';
    var parselNo=getInfo('Parsel No')||getInfo('Parsel')||'';
    var imarDurumu=getInfo('İmar Durumu')||getInfo('İmar')||'';
    var gabari=getInfo('Gabari')||'';
    var kaks=getInfo('Kaks (Emsal)')||getInfo('Emsal')||'';
    var m2Fiyati=getInfo('m² Fiyatı')||'';
    if(m2Fiyati)m2Fiyati=m2Fiyati.replace(/[^\d,.]/g,'').replace(',','.');
    // m² - arsa/isyeri ilanlarinda tek m2 alani
    if(!m2Brut){var m2Tek=getInfo('m²')||'';if(m2Tek)m2Brut=m2Tek;}
    // Sahibinden ilan no
    var sahibindenNo=getInfo('İlan No')||'';
    if(sahibindenNo)sahibindenNo=sahibindenNo.replace(/[^\d]/g,'');

    // CEPHE: 1) Ozellikler bolumundeki tikli cephe degerlerini cek, 2) getInfo tablodan, 3) basliktan cikar
    var cephe='';
    // Oncelik 1: Ozellikler bolumundeki cephe tick'lerini bul
    var cepheSection=document.querySelectorAll('.classified-props-list li, .classifiedFeaturesList li, ul.feature-list li');
    // Sahibinden "Cephe" basligini bul ve altindaki tikli degerleri cek
    var allHeaders=document.querySelectorAll('h4, h3, h5, .classifiedFeatureTitle, strong');
    for(var ci=0;ci<allHeaders.length;ci++){
      if(allHeaders[ci].textContent.trim().toLowerCase()==='cephe'){
        // Bu header'dan sonraki ul veya parent icindeki tikli degerler
        var parent=allHeaders[ci].closest('li,div,section')||allHeaders[ci].parentElement;
        if(parent){
          var nextUl=parent.querySelector('ul');
          if(!nextUl)nextUl=parent.nextElementSibling;
          if(nextUl){
            var cepheLis=nextUl.querySelectorAll('li');
            var cepheList=[];
            for(var cl=0;cl<cepheLis.length;cl++){
              var liText=cepheLis[cl].textContent.trim();
              // Tikli mi kontrol et (class tick, check, selected vs.)
              var hasTick=cepheLis[cl].querySelector('.tick, .check, svg, .selected, .icon-tick');
              var hasClass=cepheLis[cl].className&&(cepheLis[cl].className.indexOf('selected')!==-1||cepheLis[cl].className.indexOf('tick')!==-1);
              if(hasTick||hasClass){
                if(liText)cepheList.push(liText);
              }
            }
            if(cepheList.length>0)cephe=cepheList.join(', ');
          }
        }
        break;
      }
    }
    // Oncelik 2: getInfo tablodan
    if(!cephe)cephe=getInfo('Cephe')||'';
    // Oncelik 3: body text'ten cephe satirini bul (Sahibinden "Cephe" basliginin altinda tikli degerler)
    if(!cephe){
      var bodyText=document.body.innerText;
      var cepheMatch=bodyText.match(/Cephe\s*\n([\s\S]*?)(?:\n\s*\n|İç Özellikler|Dış Özellikler|Muhit|Ulaşım)/i);
      if(cepheMatch){
        var dirs=['Batı','Doğu','Güney','Kuzey'];
        var cBlock=cepheMatch[1];
        var found=[];
        for(var d=0;d<dirs.length;d++){
          // Tikli olanlar icin: sahibinden'de tikli degerler "✓ Dogu" seklinde veya sadece isim olarak gosterilir
          if(cBlock.indexOf(dirs[d])!==-1)found.push(dirs[d]);
        }
        if(found.length>0)cephe=found.join(', ');
      }
    }
    // Oncelik 4: Basliktan cephe bilgisi cikar
    if(!cephe){
      var dirs=['Batı','Doğu','Güney','Kuzey'];
      var baslikLow=baslik.toLowerCase();
      if(baslikLow.indexOf('cephe')!==-1){
        var found=[];
        for(var d=0;d<dirs.length;d++){
          if(baslikLow.indexOf(dirs[d].toLowerCase())!==-1)found.push(dirs[d]);
        }
        if(found.length>0)cephe=found.join(', ');
      }
    }

    // ILAN ACIKLAMASI
    var aciklama='';
    var descEl=document.querySelector('#classifiedDescription, .classifiedDescription, [class*="classified-description"]');
    if(descEl)aciklama=descEl.innerText.trim().substring(0,2000);

    // ILAN SAHIBI - CSS ::before content'ten cek (Sahibinden obfuscation)
    var ilanSahibi='';
    // username-info-area icindeki style tag'inda content:'Isim' var
    var usernameArea=document.querySelector('.username-info-area, [data-hj-suppress]');
    if(usernameArea){
      var uaInner=usernameArea.innerHTML;
      var cssMatch=uaInner.match(/content:\s*['"]([^'"]+)['"]/);
      if(cssMatch)ilanSahibi=cssMatch[1].trim();
    }
    // Fallback: tum classifiedUserContent icinde ara
    if(!ilanSahibi){
      var userContent=document.querySelector('.classifiedUserContent');
      if(userContent){
        var ucInner=userContent.innerHTML;
        var cssMatch2=ucInner.match(/content:\s*['"]([^'"]+)['"]/);
        if(cssMatch2)ilanSahibi=cssMatch2[1].trim();
      }
    }
    var ownerBoxEl=document.querySelector('.classifiedUserContent, .classifiedUserBox');

    // TELEFON - innerHTML'den cek (CSS obfuscation bypass)
    var telefon='';
    var fullHTML=document.body.innerHTML;
    // Oncelik 1: Tum sayfada 05xx cep numarasi (0850 haric)
    var phoneHTML=fullHTML.match(/0?\s*\(?\s*(5\d{2})\s*\)?\s*(\d{3})\s*(\d{2})\s*(\d{2})/);
    if(phoneHTML)telefon='0'+phoneHTML[1]+phoneHTML[2]+phoneHTML[3]+phoneHTML[4];
    // Oncelik 2: Sabit hat 02xx/03xx/04xx
    if(!telefon){
      var ph2=fullHTML.match(/0?\s*\(?\s*([2-4]\d{2})\s*\)?\s*(\d{3})\s*(\d{2})\s*(\d{2})/);
      if(ph2)telefon='0'+ph2[1]+ph2[2]+ph2[3]+ph2[4];
    }
    // Fallback: a[href^=tel:] (0850 haric)
    if(!telefon){
      var phoneEls=document.querySelectorAll('a[href^="tel:"]');
      for(var i=0;i<phoneEls.length;i++){
        var hr=phoneEls[i].getAttribute('href').replace('tel:','').replace(/[\s\-]/g,'');
        if(hr.length>=10 && !hr.startsWith('0850') && !hr.startsWith('850')){telefon=hr;break;}
      }
    }

    // ISLEM TURU
    var islemTuru='satilik';
    var pu=document.URL.toLowerCase();
    if(pu.indexOf('kiralik')!==-1||baslik.toLowerCase().indexOf('kiralık')!==-1)islemTuru='kiralik';

    // MULK TIPI - oncelikle emlakTipi'nden belirle, sonra baslik/URL'den
    var mulkTipi='Daire';
    var et=emlakTipi.toLowerCase();
    // URL'den bahce/arsa gibi kelime cikarmadan ONCE emlakTipi'ni kontrol et
    // emlakTipi sahibinden'in kendi kategorisi (Satılık Daire, Kiralık Daire vs.)
    // Oncelik 1: emlakTipi direkt eslesmesi
    if(et.indexOf('daire')!==-1)mulkTipi='Daire';
    else if(et.indexOf('arsa')!==-1)mulkTipi='Arsa';
    else if(et.indexOf('tarla')!==-1)mulkTipi='Tarla';
    else if(et.indexOf('bağ')!==-1||et.indexOf('bahçe')!==-1)mulkTipi='Bağ / Bahçe';
    else if(et.indexOf('dükkan')!==-1||et.indexOf('mağaza')!==-1||et.indexOf('kiralık dükkan')!==-1)mulkTipi='Dükkan / Mağaza';
    else if(et.indexOf('ofis')!==-1)mulkTipi='Ofis';
    else if(et.indexOf('depo')!==-1||et.indexOf('antrepo')!==-1)mulkTipi='Depo / Antrepo';
    else if(et.indexOf('fabrika')!==-1)mulkTipi='Fabrika';
    else if(et.indexOf('komple bina')!==-1)mulkTipi='Komple Bina';
    else if(et.indexOf('villa')!==-1)mulkTipi='Villa';
    else if(et.indexOf('müstakil')!==-1)mulkTipi='Müstakil Ev';
    else if(et.indexOf('residence')!==-1)mulkTipi='Residence';
    // Oncelik 2: SADECE basliktan detay (URL'yi dahil etme, mahalle isimleri karistiriyor)
    else {
      var bl=baslik.toLowerCase();
      if(bl.indexOf('villa')!==-1)mulkTipi='Villa';
      else if(bl.indexOf('residence')!==-1)mulkTipi='Residence';
      else if(bl.indexOf('müstakil')!==-1)mulkTipi='Müstakil Ev';
      else if(bl.indexOf('çiftlik evi')!==-1)mulkTipi='Çiftlik Evi';
      else if(bl.indexOf('köşk')!==-1||bl.indexOf('konak')!==-1)mulkTipi='Köşk / Konak';
      else if(bl.indexOf('yalı daire')!==-1)mulkTipi='Yalı Dairesi';
      else if(bl.indexOf('yalı')!==-1)mulkTipi='Yalı';
      else if(bl.indexOf('yazlık')!==-1)mulkTipi='Yazlık';
      else if(bl.indexOf('prefabrik')!==-1)mulkTipi='Prefabrik Ev';
      else if(bl.indexOf('kooperatif')!==-1)mulkTipi='Kooperatif';
      else if(bl.indexOf('dükkan')!==-1||bl.indexOf('mağaza')!==-1)mulkTipi='Dükkan / Mağaza';
      else if(bl.indexOf('ofis')!==-1)mulkTipi='Ofis';
      else if(bl.indexOf('büfe')!==-1)mulkTipi='Büfe';
      else if(bl.indexOf('fabrika')!==-1)mulkTipi='Fabrika';
      else if(bl.indexOf('atölye')!==-1||bl.indexOf('imalathane')!==-1)mulkTipi='Atölye / İmalathane';
      else if(bl.indexOf('depo')!==-1||bl.indexOf('antrepo')!==-1)mulkTipi='Depo / Antrepo';
      else if(bl.indexOf('komple bina')!==-1)mulkTipi='Komple Bina';
      else if(bl.indexOf('apart')!==-1&&bl.indexOf('otel')!==-1)mulkTipi='Apart Otel';
      else if(bl.indexOf('tarla')!==-1)mulkTipi='Tarla';
      else if(bl.indexOf('arsa')!==-1)mulkTipi='Arsa';
      else if(bl.indexOf('çiftlik')!==-1)mulkTipi='Çiftlik';
    }

    var ilanId=ilanNo?'SAH-'+ilanNo.slice(-6):'SAH-'+Date.now().toString().slice(-6);
    if(siteIcinde==='Var')siteIcinde='Evet';
    else if(siteIcinde==='Yok')siteIcinde='Hayır';

    return {success:true,ilan_id:ilanId,baslik:baslik,fiyat:fiyat,il:il,ilce:ilce,mahalle:mahalle,telefon:telefon,ilan_sahibi:ilanSahibi,aciklama:aciklama,ilan_url:document.URL,islem_turu:islemTuru,mulk_tipi:mulkTipi,metrekare:parseInt((m2Brut||'').replace(/\./g,''))||0,m2_net:parseInt((m2Net||'').replace(/\./g,''))||0,oda_sayisi:odaSayisi,bina_yasi:binaYasi,bulundugu_kat:bulunduguKat,kat_sayisi:katSayisi,isitma:isitma,banyo:banyoSayisi,balkon:balkon,esyali:esyali,kullanim:kullanimDurumu,site_icinde:siteIcinde,cephe:cephe,kredi:krediyeUygun,takas:takas,tapu:tapuDurumu,ilan_tarihi:ilanTarihi,kimden:kimden,ada:adaNo,parsel:parselNo,imar:imarDurumu,gabari:gabari,kaks:kaks,m2_fiyati:parseFloat((m2Fiyati||'').replace(/\./g,'').replace(',','.'))||0,sahibinden_no:sahibindenNo};
  }catch(e){return{success:false,error:e.message};}
}

function scrapeListPage(){
  try{
    var links=[];
    var items=document.querySelectorAll('tr.searchResultsItem, .searchResultsItem');
    for(var i=0;i<items.length;i++){
      var a=items[i].querySelector('a[href*="/ilan/"]');
      if(a&&a.href){var h=a.href;if(h.indexOf('/detay')===-1)h+='/detay';links.push({url:h,title:a.textContent.trim().substring(0,80)});}
    }
    var seen={};
    return links.filter(function(l){if(seen[l.url])return false;seen[l.url]=true;return true;});
  }catch(e){return[];}
}
