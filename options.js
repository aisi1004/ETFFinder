/* 설정(옵션) 화면: 오른쪽 위 ⚙ 아이콘
 * - 관심 종목 알림(폰이 직접 계산, 앱 전용): 켜기·기준·받을 시간
 * - 앱 메뉴: 서버의 options.json 으로 항목을 자유롭게 바꿈(앱 업데이트 없이)
 *     text=복사 · url=링크 이동 · link=앱 안 이동(app:...) · 둘 이상이면 선택창
 * - 정보: 개인정보처리방침·이용약관·투자 유의사항·데이터 출처·오픈소스 라이선스, 맨 아래 버전
 */
(function () {
  var PKG = 'com.imeji.etffind';
  var STORE = 'https://play.google.com/store/apps/details?id=' + PKG;
  var SITE_URL = 'https://etf.imeji.com';
  var MAIL = 'imejikr@gmail.com';

  var css = document.createElement('style');
  css.textContent =
    '.optbtn{position:absolute;right:14px;top:calc(16px + max(env(safe-area-inset-top),var(--safe-area-inset-top,0px)));width:42px;height:42px;border:0;border-radius:50%;background:var(--card);color:var(--ink2);font-size:21px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px #0001;z-index:2}' +
    '.optbtn:active{background:var(--bg)}' +
    '.hd{position:relative;padding-right:64px}' +
    '.opt-h{font-size:12px;color:var(--sub);font-weight:600;margin:18px 0 6px}' +
    '.opt-row{display:flex;align-items:center;gap:12px;padding:14px 4px;border-bottom:1px solid var(--line);color:var(--ink);text-decoration:none;cursor:pointer;font-size:15px}' +
    '.opt-row:last-child{border-bottom:0}.opt-row .grow{flex:1;min-width:0}.opt-row .sub2{font-size:12px;color:var(--sub);margin-top:2px;font-weight:400}.opt-row .arr{color:var(--sub)}.opt-row .ic{width:26px;text-align:center;flex:none}' +
    '.sw{width:50px;height:30px;border-radius:15px;background:#c9cfd6;position:relative;flex:none;transition:.2s}.sw::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0003;transition:.2s}' +
    '.sw.on{background:var(--blue)}.sw.on::after{left:23px}.sw.dis{opacity:.45}' +
    '.opt-d summary{list-style:none;cursor:pointer;padding:14px 4px;border-bottom:1px solid var(--line);font-size:15px;display:flex;justify-content:space-between}' +
    '.opt-d summary::-webkit-details-marker{display:none}.opt-d summary::after{content:"+";color:var(--sub)}.opt-d[open] summary::after{content:"–"}' +
    '.opt-d .body{padding:10px 4px 14px;font-size:13px;line-height:1.7;color:var(--ink2);border-bottom:1px solid var(--line)}.opt-d .body ul{margin:0;padding-left:18px}.opt-d .body li{margin:3px 0}' +
    '.optc{text-align:center;padding:6px 0 2px}.optc h2{margin:6px 0 4px;font-size:20px}.optc .box{background:var(--bg);border-radius:14px;padding:14px;margin:12px 0;font-size:15px;word-break:break-all;user-select:all;white-space:pre-wrap}' +
    '.optc .alt{background:var(--bg);color:var(--ink);margin-top:8px}.optc .back{border:0;background:none;color:var(--sub);font:inherit;font-size:14px;margin-top:10px;cursor:pointer}' +
    '@media(min-width:960px){.hd{padding-right:70px}.optbtn{top:30px;right:24px}}' +
    '@media(min-width:700px) and (max-width:959px){.optbtn{right:22px}}';
  document.head.appendChild(css);

  function $(s) { return document.querySelector(s); }
  function plug(n) { return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins[n]) || null; }
  var native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  function h(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function okHttp(u) { return /^https?:\/\//i.test(u || ''); }
  function okUrl(u) { return okHttp(u) || /^(mailto|tel):/i.test(u || ''); }
  function okApp(l) { return /^app:(tab|etf|kr)\/.+/.test(l || ''); }

  // ---- 앱 메뉴 항목: 서버 options.json → 마지막으로 받은 값 → 기본값 ----
  var DEFAULT_ITEMS = [
    { builtin: 'share', icon: '📣', title: '앱 공유하기', sub: '친구에게 ETF 검색기를 소개해요' },
    { icon: '⭐', title: '별점 남기기', sub: 'Google Play 스토어로 이동해요', url: STORE },
    { hidden: true, icon: '✉️', title: '문의하기', sub: MAIL, url: 'mailto:' + MAIL + '?subject=' + encodeURIComponent('[ETF 검색기] 문의') }
  ];
  var CFG = null;
  function loadCfg() {
    var url = (native ? SITE_URL + '/' : '') + 'options.json?' + Date.now();
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { clearTimeout(t); if (!d || !Array.isArray(d.items)) throw 0; try { localStorage.setItem('etf.optcfg', JSON.stringify(d)); } catch (e) {} return d; })
      .catch(function () { clearTimeout(t); try { var c = JSON.parse(localStorage.getItem('etf.optcfg') || 'null'); if (c && Array.isArray(c.items)) return c; } catch (e) {} return { items: DEFAULT_ITEMS }; });
  }
  loadCfg().then(function (d) { CFG = d; });
  function itemsOf(group) {
    var all = (CFG && CFG.items) || DEFAULT_ITEMS;
    return all.filter(function (it) { return it && it.title && !it.hidden && (it.group || '앱') === group; });
  }
  function actionsOf(it) {
    var a = [];
    if (it.text) a.push('copy');
    if (okUrl(it.url)) a.push('url');
    if (okApp(it.link)) a.push('app');
    if (it.builtin === 'share') a.push('share');
    return a;
  }
  var ITEMS = []; // 현재 화면에 그려진 항목(클릭 처리용)

  // ---- 동작들 ----
  function copyText(t, msg) {
    var done = function () { toast(msg || '복사했어요'); };
    function fallback() {
      try {
        var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select(); var ok = document.execCommand('copy'); document.body.removeChild(ta);
        if (ok) done(); else toast('복사하지 못했어요. 길게 눌러 직접 복사해 주세요');
      } catch (e) { toast('복사하지 못했어요'); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done).catch(fallback); else fallback();
  }
  function openUrl(it) {
    var u = it.url;
    if (okHttp(u)) {
      if (it.open === 'inapp' && native && plug('Browser') && plug('Browser').open) plug('Browser').open({ url: u });  // 기본은 기기 브라우저, open=inapp 일 때만 앱 안 브라우저
      else openExternal(u);
    } else { window.location.href = u; }
  }
  function shareApp() {
    var t = 'ETF 검색기 - 미국·국내 ETF를 한국 투자자 눈높이로 한눈에', u = native ? STORE : SITE_URL;
    var sh = plug('Share');
    if (sh && sh.share) { sh.share({ title: 'ETF 검색기', text: t, url: u, dialogTitle: '앱 공유하기' }).catch(function () {}); return; }
    if (navigator.share) { navigator.share({ title: 'ETF 검색기', text: t, url: u }).catch(function () {}); return; }
    copyText(u, '링크를 복사했어요');
  }
  function doAct(it, k) {
    if (k === 'copy') copyText(it.text, it.copied);
    else if (k === 'url') openUrl(it);
    else if (k === 'app') { closeS(); setTimeout(function () { goApp(it.link); }, 50); }
    else if (k === 'share') shareApp();
  }
  var LBL = { copy: '복사하기', url: '링크 열기', app: '앱에서 보기', share: '공유하기' };
  function chooser(it, acts) {
    var body = it.detail || it.text || '';
    $('#sbody').innerHTML = '<div class="optc"><div style="font-size:34px">' + h(it.icon || '') + '</div><h2>' + h(it.title) + '</h2>' +
      (it.sub ? '<div style="color:var(--sub);font-size:13px">' + h(it.sub) + '</div>' : '') +
      (body ? '<div class="box">' + h(body) + '</div>' : '') +
      acts.map(function (k, i) { return '<button class="close' + (i ? ' alt' : '') + '" data-oc="' + k + '" style="' + (i ? '' : 'margin-top:4px') + '">' + (it.labels && it.labels[k] ? h(it.labels[k]) : LBL[k]) + '</button>'; }).join('') +
      '<button class="back" data-ob>‹ 설정으로</button></div>';
    $('#sbody')._it = it;
  }
  function runItem(it) {
    var acts = actionsOf(it);
    if (!acts.length) return;
    if (acts.length === 1) doAct(it, acts[0]); else chooser(it, acts);
  }

  // ---- 화면 ----
  function row(href, title, sub) {
    return '<a class="opt-row" href="' + href + '" target="_blank" rel="noopener"><div class="grow">' + title + (sub ? '<div class="sub2">' + sub + '</div>' : '') + '</div><span class="arr">›</span></a>';
  }
  function itemRows(group) {
    return itemsOf(group).map(function (it) {
      ITEMS.push(it);
      return '<div class="opt-row" data-oi="' + (ITEMS.length - 1) + '">' + (it.icon ? '<span class="ic">' + h(it.icon) + '</span>' : '') + '<div class="grow">' + h(it.title) + (it.sub ? '<div class="sub2">' + h(it.sub) + '</div>' : '') + '</div><span class="arr">›</span></div>';
    }).join('');
  }
  function det(title, html) { return '<details class="opt-d"><summary>' + title + '</summary><div class="body">' + html + '</div></details>'; }

  function openOptions() {
    ITEMS = [];
    var appRows = itemRows('앱'), infoExtra = itemRows('정보');
    var hh = '<h2 style="margin:0 0 2px;font-size:21px">설정</h2>' +
      '<div class="opt-h">알림</div><div class="alp-wrap in">' + alertPanel() + '</div>' +
      (appRows ? '<div class="opt-h">앱</div>' + appRows : '') +
      '<div class="opt-h">정보</div>' +
      row('privacy.html', '개인정보처리방침') +
      row('terms.html', '이용약관') +
      det('투자 유의사항',
        '<ul><li>본 서비스는 <b>투자 권유·자문이 아니며</b>, 투자 판단과 결과의 책임은 이용자 본인에게 있어요.</li>' +
        '<li>과거 수익률은 미래 수익을 보장하지 않아요.</li>' +
        '<li>레버리지·인버스·커버드콜 ETF는 가격 변동이 크거나 구조가 복잡한 <b>고위험 상품</b>일 수 있어요.</li>' +
        '<li>미국 ETF는 환율 변동에 따라 원화 수익이 달라져요.</li>' +
        '<li>세금·계좌 정보는 일반 원칙이며 개인 상황에 따라 달라질 수 있어요. 정확한 내용은 국세청·증권사에 확인하세요.</li></ul>') +
      det('데이터 출처 및 고지',
        '<ul><li>시세·배당·환율: Yahoo Finance (지연되거나 오류가 있을 수 있어요).</li>' +
        '<li>국내 ETF 목록: 상장 ETF 중 순자산 규모 상위 종목을 선별했어요.</li>' +
        '<li>NAV·괴리율·구성종목·총보수 등 상세 정보는 네이버 증권과 운용사 공시 링크로 연결돼요.</li>' +
        '<li>총보수·대응 ETF 정보는 참고용이며 운용사 공시를 꼭 확인하세요.</li>' +
        '<li>각 상품의 명칭과 상표는 해당 운용사의 것이에요.</li></ul>') +
      det('오픈소스 라이선스',
        '<ul><li>Capacitor (MIT License)</li><li>AndroidX WorkManager (Apache License 2.0)</li><li>Pretendard 글꼴 (SIL Open Font License 1.1)</li></ul>') +
      infoExtra +
      '<div class="opt-row" style="cursor:default"><div class="grow">버전 정보<div class="sub2" id="optVer">확인 중…</div></div></div>';
    $('#sbody').innerHTML = hh;
    $('#sheet').classList.add('on'); document.body.style.overflow = 'hidden';
    var asOf = (typeof D !== 'undefined' && D && D.asOf) ? ' · 시세 기준일 ' + D.asOf : '';
    var app = plug('App');
    if (native && app && app.getInfo) app.getInfo().then(function (i) { if ($('#optVer')) $('#optVer').textContent = 'v' + i.version + ' (' + i.build + ')' + asOf; }).catch(function () { if ($('#optVer')) $('#optVer').textContent = '앱' + asOf; });
    else $('#optVer').textContent = '웹 버전' + asOf;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;
    var b = t.closest('[data-opt]');
    if (b) { e.preventDefault(); openOptions(); return; }
    var oi = t.closest('[data-oi]');
    if (oi) { var it = ITEMS[+oi.getAttribute('data-oi')]; if (it) runItem(it); return; }
    var oc = t.closest('[data-oc]');
    if (oc) { var cur = $('#sbody')._it; if (cur) doAct(cur, oc.getAttribute('data-oc')); return; }
    if (t.closest('[data-ob]')) { openOptions(); return; }
  });

  window.openOptions = openOptions;
})();
