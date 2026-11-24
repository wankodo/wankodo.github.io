/* 熊八のミニゲーム集（kumagames.js）
   フッターのクレジット「熊八 🐾」タップで開く隠しゲーム。第2弾。
   ページごとに割り当てられたゲームが開く（モグラ叩き＝mogura.js と共存。
   このファイルが担当するページでは、モグラ側のハンドラより先に受けて差し替える）。
   個人情報は一切含まない。ベスト記録は localStorage（同一オリジン共有）。 */
(function () {
  'use strict';
  if (window.__kumaGamesLoaded) return;
  window.__kumaGamesLoaded = true;

  /* ---------- ページ割り当て（上が優先。具体的なページを先に書く） ---------- */
  var ASSIGN = [
    ['/mobility-simulator/train.html', 'numtouch'],
    ['/mobility-simulator/highway.html', 'meoshi'],
    ['/mobility-simulator/taxi.html', 'renda'],
    ['/mobility-simulator/', 'slot'],
    ['/money-tools/bookkeeping.html', 'highlow'],
    ['/money-tools/invoice.html', 'stop5'],
    ['/money-tools/', 'janken'],
    ['/insurance/medical.html', 'memory'],
    ['/insurance/car.html', 'reflex'],
    ['/insurance/social.html', 'flash'],
    ['/uranai/tarot.html', 'coin'],
    ['/uranai/omikuji.html', 'slot'],
    ['/uranai/angel.html', 'simon'],
    ['/uranai/birthday-matome.html', 'flash'],
    ['/history/rulers.html', 'sake'],
    ['/history/', 'acchi']
  ];
  function assignedGame() {
    var p = location.pathname;
    if (p === '/' || p === '/index.html') return 'janken';
    for (var i = 0; i < ASSIGN.length; i++) {
      if (p.indexOf(ASSIGN[i][0]) !== -1) return ASSIGN[i][1];
    }
    return null;
  }
  var GAME_ID = assignedGame();
  if (!GAME_ID) return; // このページはモグラ叩きだけ（従来通り）

  /* ---------- 共通モーダル ---------- */
  var CSS = [
    '.kg-overlay{position:fixed;inset:0;z-index:100001;background:rgba(4,12,20,.62);display:flex;align-items:center;justify-content:center;padding:12px}',
    '.kg-overlay[hidden]{display:none}',
    '.kg-modal{position:relative;background:#fdfbf6;color:#22303c;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.45);width:100%;max-width:430px;max-height:94vh;overflow-y:auto;padding:16px 14px 14px;font-family:inherit}',
    'html[data-theme="andy"] .kg-modal{background:rgba(8,22,34,.97);color:#d8f1f6;border:1px solid rgba(110,205,230,.45)}',
    '.kg-close{position:absolute;top:8px;right:8px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(120,130,140,.4);background:transparent;color:inherit;font-size:20px;line-height:1;cursor:pointer;z-index:3}',
    '.kg-title{text-align:center;font-weight:800;font-size:18px;margin:2px 0 4px}',
    '.kg-sub{text-align:center;font-size:12.5px;opacity:.75;margin:0 0 10px}',
    '.kg-body{touch-action:manipulation;user-select:none;-webkit-user-select:none}',
    '.kg-msg{text-align:center;margin-top:10px;font-size:14px;min-height:22px}',
    '.kg-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}',
    '.kg-btn{background:#f5a400;color:#231600;border:none;border-radius:999px;padding:10px 22px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.2);font:inherit;touch-action:manipulation}',
    'html[data-theme="andy"] .kg-btn{background:linear-gradient(180deg,#8ff2ff,#46d9ec);color:#03222e}',
    '.kg-btn:disabled{opacity:.45;cursor:default}',
    '.kg-btn.ghost{background:transparent;border:1px solid rgba(120,130,140,.5);color:inherit;box-shadow:none}',
    '.kg-stat{display:flex;justify-content:space-between;gap:8px;font-size:14px;margin-bottom:8px}',
    '.kg-pill{border:1px solid rgba(120,130,140,.4);border-radius:999px;padding:4px 12px;white-space:nowrap}',
    '.kg-big{font-size:44px;text-align:center;font-weight:800;line-height:1.25}',
    '.kg-hands{display:flex;justify-content:space-around;align-items:center;text-align:center;margin:8px 0}',
    '.kg-hand{font-size:56px;line-height:1.2}',
    '.kg-hand-label{font-size:12px;opacity:.7}',
    '.kg-grid{display:grid;gap:6px;margin:6px auto}',
    '.kg-cell{border:1px solid rgba(120,130,140,.45);background:rgba(255,255,255,.55);color:inherit;border-radius:10px;font-size:19px;font-weight:700;padding:0;height:52px;cursor:pointer;font:inherit}',
    'html[data-theme="andy"] .kg-cell{background:rgba(255,255,255,.08)}',
    '.kg-cell.done{opacity:.28;pointer-events:none}',
    '.kg-card{height:64px;font-size:30px;border-radius:10px;border:1px solid rgba(120,130,140,.45);background:#31517a;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}',
    '.kg-card.open{background:#fff7e0;color:#22303c}',
    'html[data-theme="andy"] .kg-card.open{background:rgba(255,247,224,.92)}',
    '.kg-card.hit{background:#ffe1a8;color:#22303c;pointer-events:none}',
    '.kg-pad{height:86px;border-radius:14px;cursor:pointer;opacity:.45;border:none}',
    '.kg-pad.on{opacity:1;box-shadow:0 0 0 3px rgba(0,0,0,.25)}',
    '.kg-stage{position:relative;height:280px;background:linear-gradient(#bfe3f2,#e8f7ff);border-radius:14px;overflow:hidden}',
    'html[data-theme="andy"] .kg-stage{background:linear-gradient(#0d2c40,#123a52)}',
    '.kg-fish{position:absolute;font-size:30px;transform:translateX(-50%);pointer-events:none}',
    '.kg-bear{position:absolute;bottom:2px;font-size:42px;transform:translateX(-50%);pointer-events:none;line-height:1}',
    '.kg-bar-wrap{position:relative;height:34px;background:rgba(120,130,140,.25);border-radius:999px;margin:18px 0 6px;overflow:hidden}',
    '.kg-zone{position:absolute;top:0;bottom:0;background:#7bc96f}',
    '.kg-marker{position:absolute;top:-2px;bottom:-2px;width:8px;margin-left:-4px;background:#e33;border-radius:4px}',
    '.kg-input{font-size:18px;padding:10px;border:1px solid rgba(120,130,140,.5);border-radius:10px;width:130px;text-align:center;font:inherit;color:inherit;background:transparent}',
    '.kg-flash{font-size:40px;font-weight:800;letter-spacing:.18em;text-align:center;min-height:56px}',
    '.kg-reel{font-size:52px;width:86px;height:86px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(120,130,140,.4);border-radius:14px;background:rgba(255,255,255,.5)}',
    'html[data-theme="andy"] .kg-reel{background:rgba(255,255,255,.08)}'
  ].join('\n');

  var overlay = null, bodyEl = null, titleEl = null, subEl = null, msgEl = null;
  var timers = [], savedOverflow = '', currentCleanup = null;

  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function every(fn, ms) { var id = setInterval(fn, ms); timers.push(id); return id; }
  function clearTimers() {
    timers.forEach(function (id) { clearTimeout(id); clearInterval(id); });
    timers = [];
  }
  function best(key) {
    try { var v = parseFloat(localStorage.getItem(key)); return isNaN(v) ? null : v; } catch (e) { return null; }
  }
  function setBest(key, v) { try { localStorage.setItem(key, String(v)); } catch (e) {} }

  function buildModal() {
    if (overlay) return;
    var style = document.createElement('style');
    style.id = 'kgStyle';
    style.textContent = CSS;
    document.head.appendChild(style);
    overlay = document.createElement('div');
    overlay.className = 'kg-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="kg-modal" role="dialog" aria-modal="true">' +
      '<button type="button" class="kg-close" aria-label="閉じる">×</button>' +
      '<div class="kg-title"></div>' +
      '<p class="kg-sub"></p>' +
      '<div class="kg-body"></div>' +
      '<div class="kg-msg"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    bodyEl = overlay.querySelector('.kg-body');
    titleEl = overlay.querySelector('.kg-title');
    subEl = overlay.querySelector('.kg-sub');
    msgEl = overlay.querySelector('.kg-msg');
    overlay.querySelector('.kg-close').addEventListener('click', closeGame);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeGame(); });
  }
  function msg(t) { if (msgEl) msgEl.textContent = t || ''; }
  function openGame() {
    buildModal();
    clearTimers();
    if (currentCleanup) { try { currentCleanup(); } catch (e) {} currentCleanup = null; }
    bodyEl.innerHTML = '';
    msg('');
    var g = GAMES[GAME_ID];
    titleEl.textContent = g.title;
    subEl.textContent = g.sub || '';
    overlay.hidden = false;
    savedOverflow = document.documentElement.style.overflow || '';
    document.documentElement.style.overflow = 'hidden';
    currentCleanup = g.start(bodyEl, api) || null;
  }
  function closeGame() {
    if (!overlay || overlay.hidden) return;
    clearTimers();
    if (currentCleanup) { try { currentCleanup(); } catch (e) {} currentCleanup = null; }
    overlay.hidden = true;
    document.documentElement.style.overflow = savedOverflow;
  }
  var api = { later: later, every: every, msg: msg, best: best, setBest: setBest, reopen: openGame };

  /* ---------- トリガー（モグラ側が付ける .mg-paw-trigger を横取りする。
     モグラ.js が無いページ（総合トップ）では自分で 🐾 を包む） ---------- */
  function setupOwnTrigger() {
    if (document.querySelector('.mg-paw-trigger')) return true;
    var dual = document.querySelector('.pic-dual[data-emoji="🐾"]');
    if (dual) { dual.classList.add('mg-paw-trigger'); return true; }
    var best = null;
    var els = document.querySelectorAll('p,div,footer,span,li');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent || '';
      if (t.indexOf('熊八') !== -1 && t.indexOf('Muse Spark') !== -1 && t.indexOf('🐾') !== -1) {
        if (!best || t.length < best.textContent.length) best = els[i];
      }
    }
    if (!best) return false;
    var walker = document.createTreeWalker(best, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var idx = node.nodeValue.indexOf('🐾');
      if (idx !== -1) {
        var span = document.createElement('span');
        span.className = 'mg-paw-trigger';
        span.style.cursor = 'pointer';
        span.textContent = '🐾';
        var after = node.splitText(idx);
        after.nodeValue = after.nodeValue.slice('🐾'.length);
        node.parentNode.insertBefore(span, after);
        return true;
      }
    }
    return false;
  }
  // capture 段階で受けて、モグラ側（bubble 委譲）より先に処理する
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('.mg-paw-trigger')) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openGame();
    }
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeGame(); });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setupOwnTrigger(); setTimeout(setupOwnTrigger, 800); });
  } else {
    setupOwnTrigger();
    setTimeout(setupOwnTrigger, 800);
  }

  /* ================= ゲーム本体 ================= */
  var GAMES = {};

  /* 1. 熊八とじゃんけん（連勝記録つき） */
  GAMES.janken = {
    title: '熊八とじゃんけん',
    sub: '連勝記録に挑戦だで',
    start: function (el, api) {
      var hands = ['✊', '✌️', '🖐️'];
      var names = ['グー', 'チョキ', 'パー'];
      var streak = 0, busy = false;
      el.innerHTML =
        '<div class="kg-hands"><div><div class="kg-hand" id="kgCpu">✊</div><div class="kg-hand-label">熊八</div></div>' +
        '<div style="font-weight:800">VS</div>' +
        '<div><div class="kg-hand" id="kgYou">✊</div><div class="kg-hand-label">あなた</div></div></div>' +
        '<div class="kg-stat"><span class="kg-pill">連勝 <b id="kgStreak">0</b></span><span class="kg-pill">ベスト <b id="kgJkBest">0</b></span></div>' +
        '<div class="kg-row">' +
        '<button type="button" class="kg-btn" data-h="0">✊ グー</button>' +
        '<button type="button" class="kg-btn" data-h="1">✌️ チョキ</button>' +
        '<button type="button" class="kg-btn" data-h="2">🖐️ パー</button></div>';
      var cpuEl = el.querySelector('#kgCpu'), youEl = el.querySelector('#kgYou');
      var streakEl = el.querySelector('#kgStreak'), bestEl = el.querySelector('#kgJkBest');
      var b = api.best('kg_janken_best'); bestEl.textContent = b || 0;
      api.msg('最初はグー、じゃんけん……');
      el.querySelectorAll('[data-h]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (busy) return;
          busy = true;
          var you = parseInt(btn.getAttribute('data-h'), 10);
          youEl.textContent = hands[you];
          var shake = 0;
          var iv = api.every(function () {
            cpuEl.textContent = hands[Math.floor(Math.random() * 3)];
            if (++shake >= 6) {
              clearInterval(iv);
              var cpu = Math.floor(Math.random() * 3);
              cpuEl.textContent = hands[cpu];
              var diff = (you - cpu + 3) % 3;
              if (diff === 0) { api.msg('あいこだで。もう一回！'); }
              else if (diff === 2) {
                streak++;
                api.msg('勝ち！ 熊八は' + names[cpu] + 'だったで');
              } else {
                if (streak > (api.best('kg_janken_best') || 0)) { api.setBest('kg_janken_best', streak); bestEl.textContent = streak; }
                api.msg('負け…… 熊八は' + names[cpu] + '。連勝は ' + streak + ' でストップだで');
                streak = 0;
              }
              streakEl.textContent = streak;
              busy = false;
            }
          }, 70);
        });
      });
    }
  };

  /* 2. 5秒ぴったりチャレンジ */
  GAMES.stop5 = {
    title: '5秒ぴったりチャレンジ',
    sub: 'スタートしたら、5秒だと思うところで止める',
    start: function (el, api) {
      var running = false, t0 = 0;
      el.innerHTML =
        '<div class="kg-big" id="kgDisp">0.000</div>' +
        '<div class="kg-stat"><span class="kg-pill">目標 5.000秒</span><span class="kg-pill">ベスト誤差 <b id="kgS5Best">-</b></span></div>' +
        '<div class="kg-row"><button type="button" class="kg-btn" id="kgS5Btn">スタート</button></div>';
      var disp = el.querySelector('#kgDisp'), btn = el.querySelector('#kgS5Btn'), bestEl = el.querySelector('#kgS5Best');
      var b = api.best('kg_stop5_best'); if (b !== null) bestEl.textContent = b.toFixed(3) + '秒';
      btn.addEventListener('click', function () {
        if (!running) {
          running = true; t0 = Date.now();
          btn.textContent = 'ストップ！';
          api.msg('数えるのは頭の中だけだで');
          api.every(function () { if (running) disp.textContent = ((Date.now() - t0) / 1000).toFixed(3); }, 31);
        } else {
          running = false;
          var sec = (Date.now() - t0) / 1000;
          var err = Math.abs(sec - 5);
          disp.textContent = sec.toFixed(3);
          btn.textContent = 'もう一回';
          var prev = api.best('kg_stop5_best');
          if (prev === null || err < prev) { api.setBest('kg_stop5_best', err); bestEl.textContent = err.toFixed(3) + '秒'; }
          if (err <= 0.05) api.msg('誤差 ' + err.toFixed(3) + '秒。神業だで！');
          else if (err <= 0.2) api.msg('誤差 ' + err.toFixed(3) + '秒。おしい！');
          else if (err <= 0.5) api.msg('誤差 ' + err.toFixed(3) + '秒。なかなかだで');
          else api.msg('誤差 ' + err.toFixed(3) + '秒。体内の時計、調整中だな');
        }
      });
    }
  };

  /* 3. 数字タッチ（1〜25タイムアタック） */
  GAMES.numtouch = {
    title: '数字タッチ',
    sub: '1から25まで、順番にタップ',
    start: function (el, api) {
      el.innerHTML =
        '<div class="kg-stat"><span class="kg-pill">次は <b id="kgNtNext">1</b></span><span class="kg-pill">タイム <b id="kgNtTime">0.0</b>秒</span><span class="kg-pill">ベスト <b id="kgNtBest">-</b></span></div>' +
        '<div class="kg-grid" id="kgNtGrid" style="grid-template-columns:repeat(5,1fr);max-width:340px"></div>' +
        '<div class="kg-row"><button type="button" class="kg-btn" id="kgNtStart">スタート</button></div>';
      var grid = el.querySelector('#kgNtGrid'), nextEl = el.querySelector('#kgNtNext'),
          timeEl = el.querySelector('#kgNtTime'), bestEl = el.querySelector('#kgNtBest'), startBtn = el.querySelector('#kgNtStart');
      var b = api.best('kg_numtouch_best'); if (b !== null) bestEl.textContent = b.toFixed(1) + '秒';
      var next = 1, t0 = 0, playing = false;
      function build() {
        var nums = [];
        for (var i = 1; i <= 25; i++) nums.push(i);
        for (var i = nums.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = nums[i]; nums[i] = nums[j]; nums[j] = t; }
        grid.innerHTML = '';
        nums.forEach(function (n) {
          var c = document.createElement('button');
          c.type = 'button'; c.className = 'kg-cell'; c.textContent = n;
          c.addEventListener('click', function () {
            if (!playing) return;
            if (n === next) {
              c.classList.add('done');
              next++;
              nextEl.textContent = next > 25 ? '―' : next;
              if (next > 25) {
                playing = false;
                var sec = (Date.now() - t0) / 1000;
                var prev = api.best('kg_numtouch_best');
                if (prev === null || sec < prev) { api.setBest('kg_numtouch_best', sec); bestEl.textContent = sec.toFixed(1) + '秒'; api.msg(sec.toFixed(1) + '秒！ ベスト更新だで'); }
                else api.msg(sec.toFixed(1) + '秒で全部タッチ。やるな');
                startBtn.textContent = 'もう一回';
                startBtn.disabled = false;
              }
            } else {
              api.msg('次は ' + next + ' だで');
            }
          });
          grid.appendChild(c);
        });
      }
      build();
      startBtn.addEventListener('click', function () {
        build();
        next = 1; nextEl.textContent = '1';
        playing = true; t0 = Date.now();
        startBtn.disabled = true;
        api.msg('1から順番に！');
        api.every(function () { if (playing) timeEl.textContent = ((Date.now() - t0) / 1000).toFixed(1); }, 97);
      });
    }
  };

  /* 4. 連打王（10秒） */
  GAMES.renda = {
    title: '連打王',
    sub: '10秒間、ボタンを連打しまくれ',
    start: function (el, api) {
      var count = 0, playing = false;
      el.innerHTML =
        '<div class="kg-big" id="kgRdCount">0</div>' +
        '<div class="kg-stat"><span class="kg-pill">残り <b id="kgRdTime">10.0</b>秒</span><span class="kg-pill">ベスト <b id="kgRdBest">0</b>回</span></div>' +
        '<div class="kg-row"><button type="button" class="kg-btn" id="kgRdBtn" style="font-size:20px;padding:16px 34px">連打ボタン</button></div>';
      var countEl = el.querySelector('#kgRdCount'), timeEl = el.querySelector('#kgRdTime'),
          bestEl = el.querySelector('#kgRdBest'), btn = el.querySelector('#kgRdBtn');
      var b = api.best('kg_renda_best'); bestEl.textContent = b || 0;
      btn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        if (!playing) {
          playing = true; count = 0; countEl.textContent = '0';
          api.msg('いけいけいけー！');
          var t0 = Date.now();
          api.every(function () {
            var left = 10 - (Date.now() - t0) / 1000;
            timeEl.textContent = Math.max(0, left).toFixed(1);
            if (left <= 0) {
              playing = false;
              var prev = api.best('kg_renda_best') || 0;
              if (count > prev) { api.setBest('kg_renda_best', count); bestEl.textContent = count; api.msg(count + '回！ ベスト更新だで'); }
              else api.msg(count + '回。指、あったまったか？');
            }
          }, 53);
        }
        if (playing) { count++; countEl.textContent = count; }
      });
    }
  };

  /* 5. 反射神経テスト */
  GAMES.reflex = {
    title: '反射神経テスト',
    sub: '緑になったら、すかさずタップ',
    start: function (el, api) {
      var state = 'idle', t0 = 0;
      el.innerHTML =
        '<div id="kgRfArea" style="height:190px;border-radius:14px;background:#c0392b;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;text-align:center;padding:10px;cursor:pointer">タップでスタート</div>' +
        '<div class="kg-stat" style="margin-top:8px"><span class="kg-pill">結果 <b id="kgRfRes">-</b></span><span class="kg-pill">ベスト <b id="kgRfBest">-</b></span></div>';
      var area = el.querySelector('#kgRfArea'), resEl = el.querySelector('#kgRfRes'), bestEl = el.querySelector('#kgRfBest');
      var b = api.best('kg_reflex_best'); if (b !== null) bestEl.textContent = Math.round(b) + ' ms';
      area.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        if (state === 'idle' || state === 'done') {
          state = 'wait';
          area.style.background = '#c0392b';
          area.textContent = '緑になるまで待つ……';
          api.later(function () {
            if (state !== 'wait') return;
            state = 'go'; t0 = Date.now();
            area.style.background = '#27ae60';
            area.textContent = 'タップ！';
          }, 1200 + Math.random() * 2600);
        } else if (state === 'wait') {
          state = 'idle';
          area.style.background = '#c0392b';
          area.textContent = 'フライング！ タップでやり直し';
        } else if (state === 'go') {
          var ms = Date.now() - t0;
          state = 'done';
          resEl.textContent = ms + ' ms';
          var prev = api.best('kg_reflex_best');
          if (prev === null || ms < prev) { api.setBest('kg_reflex_best', ms); bestEl.textContent = ms + ' ms'; }
          area.style.background = '#31517a';
          area.textContent = ms + ' ms！ タップでもう一回';
          api.msg(ms < 200 ? '電光石火だで' : ms < 300 ? 'なかなかの反射だで' : ms < 450 ? '普通だな。もう一回いくか' : 'のんびり屋さんだな');
        }
      });
    }
  };

  /* 6. 神経衰弱 */
  GAMES.memory = {
    title: '神経衰弱',
    sub: 'カードをめくって、同じ絵をそろえよう',
    start: function (el, api) {
      var faces = ['🐻', '🐟', '🍡', '🍙', '🌰', '🍯'];
      var deck = faces.concat(faces);
      for (var i = deck.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
      var open = [], matched = 0, tries = 0, lock = false;
      el.innerHTML =
        '<div class="kg-stat"><span class="kg-pill">めくった回数 <b id="kgMmTry">0</b></span><span class="kg-pill">そろった組 <b id="kgMmPair">0</b>/6</span><span class="kg-pill">ベスト <b id="kgMmBest">-</b></span></div>' +
        '<div class="kg-grid" id="kgMmGrid" style="grid-template-columns:repeat(4,1fr);max-width:340px"></div>';
      var grid = el.querySelector('#kgMmGrid'), tryEl = el.querySelector('#kgMmTry'), pairEl = el.querySelector('#kgMmPair'), bestEl = el.querySelector('#kgMmBest');
      var b = api.best('kg_memory_best'); if (b !== null) bestEl.textContent = b + '回';
      api.msg('カードは全部で12枚。6組そろえよう');
      deck.forEach(function (f) {
        var c = document.createElement('button');
        c.type = 'button'; c.className = 'kg-card'; c.textContent = '？';
        c.addEventListener('click', function () {
          if (lock || c.classList.contains('open') || c.classList.contains('hit')) return;
          c.classList.add('open'); c.textContent = f;
          open.push({ el: c, face: f });
          if (open.length === 2) {
            tries++; tryEl.textContent = tries;
            if (open[0].face === open[1].face) {
              open.forEach(function (o) { o.el.classList.add('hit'); });
              matched++; pairEl.textContent = matched;
              open = [];
              if (matched === 6) {
                var prev = api.best('kg_memory_best');
                if (prev === null || tries < prev) { api.setBest('kg_memory_best', tries); bestEl.textContent = tries + '回'; api.msg('全部そろった！ ' + tries + '回、ベスト更新だで'); }
                else api.msg('全部そろった！ ' + tries + '回で制覇だで');
              } else api.msg('そろった！ その調子だで');
            } else {
              lock = true;
              var pair = open.slice(); open = [];
              api.later(function () {
                pair.forEach(function (o) { o.el.classList.remove('open'); o.el.textContent = '？'; });
                lock = false;
              }, 750);
            }
          }
        });
        grid.appendChild(c);
      });
    }
  };

  /* 7. 数当てハイ＆ロー */
  GAMES.highlow = {
    title: '数当てハイ＆ロー',
    sub: '熊八が決めた1〜100の数字を当てよう',
    start: function (el, api) {
      var answer = 1 + Math.floor(Math.random() * 100), tries = 0, done = false;
      el.innerHTML =
        '<div class="kg-big" id="kgHlHint">？</div>' +
        '<div class="kg-stat"><span class="kg-pill">挑戦 <b id="kgHlTry">0</b>回</span><span class="kg-pill">ベスト <b id="kgHlBest">-</b></span></div>' +
        '<div class="kg-row"><input type="number" class="kg-input" id="kgHlInput" min="1" max="100" placeholder="1〜100">' +
        '<button type="button" class="kg-btn" id="kgHlBtn">これだ！</button></div>' +
        '<div class="kg-row"><button type="button" class="kg-btn ghost" id="kgHlRetry">数字を変える</button></div>';
      var hint = el.querySelector('#kgHlHint'), tryEl = el.querySelector('#kgHlTry'), bestEl = el.querySelector('#kgHlBest'),
          input = el.querySelector('#kgHlInput'), btn = el.querySelector('#kgHlBtn');
      var b = api.best('kg_highlow_best'); if (b !== null) bestEl.textContent = b + '回';
      api.msg('数字は決めたで。さあ当ててみろ');
      function guess() {
        if (done) return;
        var v = parseInt(input.value, 10);
        if (isNaN(v) || v < 1 || v > 100) { api.msg('1〜100の数字を入れてくれ'); return; }
        tries++; tryEl.textContent = tries;
        if (v === answer) {
          done = true; hint.textContent = '🎯';
          var prev = api.best('kg_highlow_best');
          if (prev === null || tries < prev) { api.setBest('kg_highlow_best', tries); bestEl.textContent = tries + '回'; api.msg(tries + '回で正解！ ベスト更新だで'); }
          else api.msg(tries + '回で正解！ 見事だで');
        } else if (v < answer) { hint.textContent = 'もっと大きい ⬆'; api.msg(v + ' より大きい数字だで'); }
        else { hint.textContent = 'もっと小さい ⬇'; api.msg(v + ' より小さい数字だで'); }
        input.value = ''; input.focus();
      }
      btn.addEventListener('click', guess);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') guess(); });
      el.querySelector('#kgHlRetry').addEventListener('click', function () { api.reopen(); });
    }
  };

  /* 8. 鮭キャッチ */
  GAMES.sake = {
    title: '鮭キャッチ',
    sub: '落ちてくる鮭を熊八で受け止めろ。3回落としたら終わり',
    start: function (el, api) {
      el.innerHTML =
        '<div class="kg-stat"><span class="kg-pill">鮭 <b id="kgSkScore">0</b>匹</span><span class="kg-pill">残りライフ <b id="kgSkLife">♥♥♥</b></span><span class="kg-pill">ベスト <b id="kgSkBest">0</b></span></div>' +
        '<div class="kg-stage" id="kgSkStage"><div class="kg-bear" id="kgSkBear">🐻</div></div>' +
        '<div class="kg-row"><button type="button" class="kg-btn" id="kgSkStart">スタート</button></div>';
      var stage = el.querySelector('#kgSkStage'), bear = el.querySelector('#kgSkBear'),
          scoreEl = el.querySelector('#kgSkScore'), lifeEl = el.querySelector('#kgSkLife'),
          bestEl = el.querySelector('#kgSkBest'), startBtn = el.querySelector('#kgSkStart');
      var b = api.best('kg_sake_best'); bestEl.textContent = b || 0;
      var bearX = 50, fishes = [], score = 0, life = 3, playing = false, last = 0;
      bear.style.left = '50%';
      function moveTo(clientX) {
        var r = stage.getBoundingClientRect();
        bearX = Math.max(4, Math.min(96, (clientX - r.left) / r.width * 100));
        bear.style.left = bearX + '%';
      }
      stage.addEventListener('pointermove', function (e) { moveTo(e.clientX); });
      stage.addEventListener('pointerdown', function (e) { moveTo(e.clientX); });
      function spawnFish() {
        if (!playing) return;
        var f = document.createElement('div');
        f.className = 'kg-fish'; f.textContent = '🐟';
        var x = 6 + Math.random() * 88;
        f.style.left = x + '%'; f.style.top = '-36px';
        stage.appendChild(f);
        fishes.push({ el: f, x: x, y: -36, v: 120 + Math.random() * 130 + score * 4 });
        api.later(spawnFish, 620 + Math.random() * 620);
      }
      function frame(ts) {
        if (!playing) return;
        var dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
        var h = stage.clientHeight, w = stage.clientWidth;
        for (var i = fishes.length - 1; i >= 0; i--) {
          var f = fishes[i];
          f.y += f.v * dt;
          f.el.style.top = f.y + 'px';
          if (f.y > h - 58 && f.y < h - 16 && Math.abs(f.x - bearX) < 11) {
            score++; scoreEl.textContent = score;
            stage.removeChild(f.el); fishes.splice(i, 1);
          } else if (f.y > h - 8) {
            stage.removeChild(f.el); fishes.splice(i, 1);
            life--; lifeEl.textContent = '♥'.repeat(Math.max(0, life));
            api.msg('落とした…… あと ' + Math.max(0, life) + ' 回だで');
            if (life <= 0) {
              playing = false;
              var prev = api.best('kg_sake_best') || 0;
              if (score > prev) { api.setBest('kg_sake_best', score); bestEl.textContent = score; api.msg('おしまい！ 鮭 ' + score + ' 匹、ベスト更新だで'); }
              else api.msg('おしまい！ 鮭 ' + score + ' 匹だったで');
              startBtn.disabled = false; startBtn.textContent = 'もう一回';
            }
          }
        }
        if (playing) requestAnimationFrame(frame);
      }
      startBtn.addEventListener('click', function () {
        fishes.forEach(function (f) { if (f.el.parentNode) f.el.parentNode.removeChild(f.el); });
        fishes = []; score = 0; life = 3;
        scoreEl.textContent = '0'; lifeEl.textContent = '♥♥♥';
        playing = true; startBtn.disabled = true;
        api.msg('鮭の遡上だ。全部受け止めろ');
        last = performance.now();
        requestAnimationFrame(frame);
        spawnFish();
      });
      return function () { playing = false; };
    }
  };

  /* 9. 目押しバー */
  GAMES.meoshi = {
    title: '目押しバー',
    sub: '動くマーカーを緑のゾーンで止めろ。3回成功でクリア',
    start: function (el, api) {
      var pos = 0, dir = 1, speed = 55, playing = false, round = 1, zoneL = 40, zoneW = 16, raf = null;
      el.innerHTML =
        '<div class="kg-stat"><span class="kg-pill">ラウンド <b id="kgMoRound">1</b>/3</span><span class="kg-pill">ベスト <b id="kgMoBest">-</b></span></div>' +
        '<div class="kg-bar-wrap"><div class="kg-zone" id="kgMoZone"></div><div class="kg-marker" id="kgMoMarker"></div></div>' +
        '<div class="kg-row"><button type="button" class="kg-btn" id="kgMoBtn">スタート</button></div>';
      var marker = el.querySelector('#kgMoMarker'), zone = el.querySelector('#kgMoZone'),
          roundEl = el.querySelector('#kgMoRound'), bestEl = el.querySelector('#kgMoBest'), btn = el.querySelector('#kgMoBtn');
      var b = api.best('kg_meoshi_best'); if (b !== null) bestEl.textContent = '第' + b + 'ラウンド';
      function setZone() {
        zoneW = Math.max(7, 17 - round * 3);
        zoneL = 6 + Math.random() * (88 - zoneW);
        zone.style.left = zoneL + '%'; zone.style.width = zoneW + '%';
      }
      function loop() {
        if (!playing) return;
        pos += dir * speed * 0.016;
        if (pos >= 100) { pos = 100; dir = -1; }
        if (pos <= 0) { pos = 0; dir = 1; }
        marker.style.left = pos + '%';
        raf = requestAnimationFrame(loop);
      }
      setZone();
      marker.style.left = '0%';
      btn.addEventListener('click', function () {
        if (!playing) {
          playing = true; btn.textContent = '止める！';
          api.msg('緑の中で止めるんだで');
          loop();
        } else {
          playing = false;
          if (raf) cancelAnimationFrame(raf);
          if (pos >= zoneL && pos <= zoneL + zoneW) {
            if (round >= 3) {
              api.setBest('kg_meoshi_best', 3); bestEl.textContent = '第3ラウンド';
              api.msg('全ラウンド成功！ 目押しの達人だで');
              btn.textContent = 'もう一回'; round = 1; speed = 55;
            } else {
              api.msg('成功！ 次はもっと速いし狭いぞ');
              round++; speed += 26;
              btn.textContent = '次のラウンド';
            }
          } else {
            var prev = api.best('kg_meoshi_best') || 0;
            if (round - 1 > prev) { api.setBest('kg_meoshi_best', round - 1); bestEl.textContent = '第' + (round - 1) + 'ラウンド'; }
            api.msg('外れた…… 第' + round + 'ラウンドで終了だで');
            btn.textContent = 'もう一回'; round = 1; speed = 55;
          }
          roundEl.textContent = round;
          setZone();
        }
      });
      return function () { playing = false; if (raf) cancelAnimationFrame(raf); };
    }
  };

  /* 10. あっち向いてホイ */
  GAMES.acchi = {
    title: 'あっち向いてホイ',
    sub: 'じゃんけんで勝ったら、指の向き当て',
    start: function (el, api) {
      var hands = ['✊', '✌️', '🖐️'];
      var dirs = ['⬆️', '⬇️', '⬅️', '➡️'];
      var dirNames = ['上', '下', '左', '右'];
      var phase = 'janken', wins = 0;
      el.innerHTML =
        '<div class="kg-hands"><div><div class="kg-hand" id="kgAcCpu">✊</div><div class="kg-hand-label">熊八</div></div>' +
        '<div><div class="kg-hand" id="kgAcFace">🐻</div><div class="kg-hand-label">顔の向き</div></div>' +
        '<div><div class="kg-hand" id="kgAcYou">✊</div><div class="kg-hand-label">あなた</div></div></div>' +
        '<div class="kg-stat"><span class="kg-pill">勝ち数 <b id="kgAcWin">0</b></span><span class="kg-pill">ベスト <b id="kgAcBest">0</b></span></div>' +
        '<div class="kg-row" id="kgAcBtns"></div>';
      var cpuEl = el.querySelector('#kgAcCpu'), youEl = el.querySelector('#kgAcYou'), faceEl = el.querySelector('#kgAcFace'),
          winEl = el.querySelector('#kgAcWin'), bestEl = el.querySelector('#kgAcBest'), btns = el.querySelector('#kgAcBtns');
      var b = api.best('kg_acchi_best'); bestEl.textContent = b || 0;
      function showJankenBtns() {
        phase = 'janken';
        btns.innerHTML = '';
        hands.forEach(function (h, i) {
          var btn = document.createElement('button');
          btn.type = 'button'; btn.className = 'kg-btn'; btn.textContent = h;
          btn.addEventListener('click', function () { playJanken(i); });
          btns.appendChild(btn);
        });
        api.msg('最初はグー、じゃんけん……');
      }
      function showDirBtns() {
        phase = 'dir';
        btns.innerHTML = '';
        dirs.forEach(function (d, i) {
          var btn = document.createElement('button');
          btn.type = 'button'; btn.className = 'kg-btn'; btn.textContent = d;
          btn.addEventListener('click', function () { playDir(i); });
          btns.appendChild(btn);
        });
        api.msg('あっち向いて…… ホイ！ どっちを向く？');
      }
      function playJanken(you) {
        youEl.textContent = hands[you];
        var cpu = Math.floor(Math.random() * 3);
        cpuEl.textContent = hands[cpu];
        var diff = (you - cpu + 3) % 3;
        if (diff === 0) api.msg('あいこ。もう一回じゃんけんだで');
        else if (diff === 2) showDirBtns();
        else { api.msg('じゃんけんは熊八の勝ち。あっち向いてホイはおあずけだで'); }
      }
      function playDir(youDir) {
        var cpuDir = Math.floor(Math.random() * 4);
        faceEl.textContent = dirs[cpuDir];
        if (youDir === cpuDir) {
          wins++; winEl.textContent = wins;
          if (wins > (api.best('kg_acchi_best') || 0)) { api.setBest('kg_acchi_best', wins); bestEl.textContent = wins; }
          api.msg('当たった！ 熊八は' + dirNames[cpuDir] + 'を向いたで');
        } else {
          api.msg('外れ。熊八は' + dirNames[cpuDir] + 'だったで');
        }
        api.later(function () { faceEl.textContent = '🐻'; showJankenBtns(); }, 1100);
      }
      showJankenBtns();
    }
  };

  /* 11. フラッシュ記憶 */
  GAMES.flash = {
    title: 'フラッシュ記憶',
    sub: '一瞬だけ出る数字を覚えて、答えよう',
    start: function (el, api) {
      var len = 3, answer = '', phase = 'ready';
      el.innerHTML =
        '<div class="kg-flash" id="kgFlDisp">―</div>' +
        '<div class="kg-stat"><span class="kg-pill">桁数 <b id="kgFlLen">3</b></span><span class="kg-pill">ベスト <b id="kgFlBest">-</b></span></div>' +
        '<div class="kg-row"><input type="number" class="kg-input" id="kgFlInput" placeholder="覚えた数字" style="display:none">' +
        '<button type="button" class="kg-btn" id="kgFlBtn">スタート</button></div>';
      var disp = el.querySelector('#kgFlDisp'), lenEl = el.querySelector('#kgFlLen'),
          bestEl = el.querySelector('#kgFlBest'), input = el.querySelector('#kgFlInput'), btn = el.querySelector('#kgFlBtn');
      var b = api.best('kg_flash_best'); if (b !== null) bestEl.textContent = b + '桁';
      btn.addEventListener('click', function () {
        if (phase === 'ready' || phase === 'done') {
          phase = 'show';
          answer = '';
          for (var i = 0; i < len; i++) answer += Math.floor(Math.random() * 10);
          disp.textContent = answer;
          input.style.display = 'none'; input.value = '';
          btn.disabled = true;
          api.msg('よーく見て覚えるんだで');
          api.later(function () {
            disp.textContent = '？？？';
            input.style.display = '';
            btn.disabled = false; btn.textContent = '答える';
            phase = 'answer';
            api.msg('何の数字だった？');
            input.focus();
          }, 650 + len * 130);
        } else if (phase === 'answer') {
          phase = 'done';
          if (input.value === answer) {
            var cleared = len;
            len++;
            lenEl.textContent = len;
            var prev = api.best('kg_flash_best') || 0;
            if (cleared > prev) { api.setBest('kg_flash_best', cleared); bestEl.textContent = cleared + '桁'; }
            api.msg('正解！ 次は ' + len + ' 桁だで');
          } else {
            api.msg('残念、正解は ' + answer + ' だったで。' + (len - 1) + '桁まで覚えられたな');
            len = 3; lenEl.textContent = '3';
          }
          disp.textContent = answer;
          btn.textContent = 'もう一回';
        }
      });
    }
  };

  /* 12. スロット */
  GAMES.slot = {
    title: '熊八スロット',
    sub: '3つそろえば当たり。熊八が一番高いで',
    start: function (el, api) {
      var faces = ['🍒', '🍋', '🔔', '⭐', '🍇', '🐻'];
      var coins = 0, spinning = false;
      el.innerHTML =
        '<div class="kg-row" style="gap:10px"><div class="kg-reel" id="kgSl0">🐻</div><div class="kg-reel" id="kgSl1">🍒</div><div class="kg-reel" id="kgSl2">⭐</div></div>' +
        '<div class="kg-stat" style="margin-top:8px"><span class="kg-pill">コイン <b id="kgSlCoin">0</b></span><span class="kg-pill">ベスト <b id="kgSlBest">0</b></span></div>' +
        '<div class="kg-row"><button type="button" class="kg-btn" id="kgSlBtn" style="font-size:19px;padding:14px 36px">回す（10コイン）</button></div>';
      var reels = [el.querySelector('#kgSl0'), el.querySelector('#kgSl1'), el.querySelector('#kgSl2')],
          coinEl = el.querySelector('#kgSlCoin'), bestEl = el.querySelector('#kgSlBest'), btn = el.querySelector('#kgSlBtn');
      var b = api.best('kg_slot_best'); bestEl.textContent = b || 0;
      coins = 100; coinEl.textContent = coins;
      api.msg('最初に100コイン持たせるで。全部溶かすなよ');
      btn.addEventListener('click', function () {
        if (spinning) return;
        if (coins < 10) { api.msg('コインが足りない。……特別に100コイン貸してやるで'); coins += 100; coinEl.textContent = coins; return; }
        spinning = true; btn.disabled = true;
        coins -= 10; coinEl.textContent = coins;
        var result = [0, 1, 2].map(function () { return Math.floor(Math.random() * faces.length); });
        var ticks = 0;
        var iv = api.every(function () {
          reels.forEach(function (r) { r.textContent = faces[Math.floor(Math.random() * faces.length)]; });
          ticks++;
          if (ticks >= 12) {
            clearInterval(iv);
            result.forEach(function (v, i) { reels[i].textContent = faces[v]; });
            spinning = false; btn.disabled = false;
            var win = 0, label = '';
            if (result[0] === result[1] && result[1] === result[2]) {
              if (faces[result[0]] === '🐻') { win = 500; label = '熊八が3つ！ 大当たり500コイン！'; }
              else { win = 150; label = faces[result[0]] + 'が3つ！ 150コイン！'; }
            } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
              win = 20; label = '2つそろった。20コイン戻しだで';
            }
            if (win) { coins += win; coinEl.textContent = coins; api.msg(label); }
            else api.msg('ハズレ。次だ次');
            if (coins > (api.best('kg_slot_best') || 0)) { api.setBest('kg_slot_best', coins); bestEl.textContent = coins; }
          }
        }, 70);
      });
    }
  };

  /* 13. コイン当て連勝 */
  GAMES.coin = {
    title: 'コイン当て',
    sub: '表か裏か、当て続けて連勝を伸ばせ',
    start: function (el, api) {
      var streak = 0, busy = false;
      el.innerHTML =
        '<div class="kg-big" id="kgCnFace" style="font-size:64px">🪙</div>' +
        '<div class="kg-stat"><span class="kg-pill">連勝 <b id="kgCnStreak">0</b></span><span class="kg-pill">ベスト <b id="kgCnBest">0</b></span></div>' +
        '<div class="kg-row"><button type="button" class="kg-btn" id="kgCnHeads">表</button><button type="button" class="kg-btn" id="kgCnTails">裏</button></div>';
      var face = el.querySelector('#kgCnFace'), streakEl = el.querySelector('#kgCnStreak'), bestEl = el.querySelector('#kgCnBest');
      var b = api.best('kg_coin_best'); bestEl.textContent = b || 0;
      api.msg('コインを投げるで。表か裏か、当ててみろ');
      function toss(guess) {
        if (busy) return;
        busy = true;
        var flips = 0;
        var iv = api.every(function () {
          face.textContent = flips % 2 ? '🌕' : '🪙';
          if (++flips >= 7) {
            clearInterval(iv);
            var result = Math.random() < 0.5 ? 0 : 1; // 0=表 1=裏
            face.textContent = result === 0 ? '🌞' : '🌚';
            if (result === guess) {
              streak++; streakEl.textContent = streak;
              if (streak > (api.best('kg_coin_best') || 0)) { api.setBest('kg_coin_best', streak); bestEl.textContent = streak; }
              api.msg((result === 0 ? '表' : '裏') + '！ 当たり。' + streak + '連勝だで');
            } else {
              api.msg((result === 0 ? '表' : '裏') + 'だった。連勝は ' + streak + ' でストップ');
              streak = 0; streakEl.textContent = '0';
            }
            busy = false;
          }
        }, 80);
      }
      el.querySelector('#kgCnHeads').addEventListener('click', function () { toss(0); });
      el.querySelector('#kgCnTails').addEventListener('click', function () { toss(1); });
    }
  };

  /* 14. サイモン（色おぼえ） */
  GAMES.simon = {
    title: '色おぼえ',
    sub: '光った順番を覚えて、同じ順にタップ',
    start: function (el, api) {
      var colors = ['#e74c3c', '#f1c40f', '#27ae60', '#3498db'];
      var seq = [], input = [], accepting = false, round = 0;
      el.innerHTML =
        '<div class="kg-stat"><span class="kg-pill">ラウンド <b id="kgSmRound">0</b></span><span class="kg-pill">ベスト <b id="kgSmBest">0</b></span></div>' +
        '<div class="kg-grid" style="grid-template-columns:repeat(2,1fr);max-width:300px">' +
        colors.map(function (c, i) { return '<button type="button" class="kg-pad" data-i="' + i + '" style="background:' + c + '" aria-label="色' + (i + 1) + '"></button>'; }).join('') +
        '</div>' +
        '<div class="kg-row"><button type="button" class="kg-btn" id="kgSmStart">スタート</button></div>';
      var roundEl = el.querySelector('#kgSmRound'), bestEl = el.querySelector('#kgSmBest'), startBtn = el.querySelector('#kgSmStart');
      var pads = el.querySelectorAll('.kg-pad');
      var b = api.best('kg_simon_best'); bestEl.textContent = b || 0;
      function flash(i, done) {
        pads[i].classList.add('on');
        api.later(function () { pads[i].classList.remove('on'); if (done) done(); }, 380);
      }
      function playSeq() {
        accepting = false; input = [];
        api.msg('よく見て覚えるんだで');
        var i = 0;
        function next() {
          if (i >= seq.length) { accepting = true; api.msg('さあ、同じ順にタップだで'); return; }
          flash(seq[i], function () { i++; api.later(next, 180); });
        }
        api.later(next, 450);
      }
      function nextRound() {
        round++; roundEl.textContent = round;
        seq.push(Math.floor(Math.random() * 4));
        playSeq();
      }
      startBtn.addEventListener('click', function () {
        seq = []; round = 0;
        startBtn.disabled = true;
        nextRound();
      });
      pads.forEach(function (pad) {
        pad.addEventListener('click', function () {
          if (!accepting) return;
          var i = parseInt(pad.getAttribute('data-i'), 10);
          flash(i);
          input.push(i);
          var idx = input.length - 1;
          if (input[idx] !== seq[idx]) {
            accepting = false;
            var cleared = round - 1;
            var prev = api.best('kg_simon_best') || 0;
            if (cleared > prev) { api.setBest('kg_simon_best', cleared); bestEl.textContent = cleared; }
            api.msg('間違えた…… ' + cleared + ' ラウンドまで進んだで');
            startBtn.disabled = false; startBtn.textContent = 'もう一回';
            return;
          }
          if (input.length === seq.length) {
            accepting = false;
            api.msg('正解！ 次のラウンドいくで');
            api.later(nextRound, 700);
          }
        });
      });
    }
  };
})();
