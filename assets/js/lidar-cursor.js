/* ============================================================
   光達游標（實驗性功能）
   - 游標是一顆旋轉的光達：每條光束在空地上落成一圈一圈的環，
     打到卡片、照片、按鈕時，點會停在它的邊框上（像打到障礙物）
   - 邊框形狀讀取每個元素實際的 border-radius，所以圓角卡片、
     膠囊按鈕、圓形照片都會貼合真正的輪廓
   - 只在有滑鼠的電腦上啟用；滑鼠靜止一陣子就停止掃描，不耗效能
   - 導覽列的雷達按鈕可以開關，訪客的選擇會記住
   ============================================================ */
(function () {
  'use strict';

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!finePointer.matches) return;

  /* ---------- 參數：想調整效果改這裡 ---------- */
  var BEAMS = 240;                             // 每圈光束數（角解析度 1.5°）
  var RINGS = [34, 56, 84, 118, 158, 205];     // 各雷射通道在空地上的落點半徑（px）
  var MAX_RANGE = RINGS[RINGS.length - 1];     // 最遠偵測距離
  var REV_MS = 900;                            // 轉一圈的時間（毫秒）
  var FADE_MS = 1400;                          // 點雲淡出時間
  var IDLE_MS = 3000;                          // 滑鼠靜止多久後停止掃描
  var FREE_ALPHA = 0.14;                       // 空地上的點有多明顯（0–1）
  var HIT_ALPHA = 0.5;                         // 打到物體的點有多明顯（0–1）
  var FREE_SIZE = 1.4;                         // 點的大小（px）
  var HIT_SIZE = 2;

  // 會被當成「障礙物」的元素；圓角會自動從 CSS 的 border-radius 讀取
  var OBSTACLES = '.card, .feature, .feature-media, .tile, .tile-media, .news, ' +
                  '.btn, .icon-btn, .pill, .hero-photo, .globalnav-inner, .tl-logo, .loc-panel';
  // 滑鼠在這些區域裡時，游標光達暫停（例如定位模擬有自己的光達）
  var PAUSE_OVER = '.loc-stage';

  /* ---------- 狀態 ---------- */
  var root = document.documentElement;
  var btn = document.getElementById('lidar-toggle');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var canvas, ctx, dpr = 1;
  var enabled = false, running = false;
  var mouseX = -1, mouseY = -1, lastMove = 0, lastFrame = 0;
  var sweep = 0;                               // 目前掃到第幾條光束（小數）
  var obstacles = [];                          // 頁面座標的障礙物 {l,t,r,b, tl,tr,br,bl（四個角的圓角半徑）}
  var rectsDirty = true;
  var colorHit = '#0071e3', colorFree = '#6e6e73';

  // 每條光束最近一次的掃描結果（頁面座標）
  var beamX = new Float32Array(BEAMS);
  var beamY = new Float32Array(BEAMS);
  var beamDist = new Float32Array(BEAMS);
  var beamTime = new Float64Array(BEAMS);
  var COS = new Float32Array(BEAMS), SIN = new Float32Array(BEAMS);
  for (var i = 0; i < BEAMS; i++) {
    var a = (i / BEAMS) * Math.PI * 2;
    COS[i] = Math.cos(a);
    SIN[i] = Math.sin(a);
  }

  /* ---------- 偏好設定 ---------- */
  function savedPref() {
    try { return localStorage.getItem('lidar'); } catch (e) { return null; }
  }
  function savePref(v) {
    try { localStorage.setItem('lidar', v); } catch (e) {}
  }

  /* ---------- 畫布 ---------- */
  function makeCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'lidar-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    rectsDirty = true;
  }

  function readColors() {
    var cs = getComputedStyle(root);
    colorHit = cs.getPropertyValue('--accent').trim() || colorHit;
    colorFree = cs.getPropertyValue('--secondary').trim() || colorFree;
  }

  /* ---------- 障礙物 ---------- */
  // 讀取一個角的圓角半徑（px）；'50%' 這類百分比依元素寬度換算
  function radiusPx(value, width) {
    var first = String(value).split(' ')[0];
    var n = parseFloat(first);
    if (!n) return 0;
    return first.indexOf('%') >= 0 ? (n / 100) * width : n;
  }

  // 元素四個角的圓角半徑 [左上, 右上, 右下, 左下]，不會超過短邊的一半
  function cornerRadii(el, w, h) {
    var cs = getComputedStyle(el);
    var cap = Math.min(w, h) / 2;
    return {
      radii: [
        Math.min(radiusPx(cs.borderTopLeftRadius, w), cap),
        Math.min(radiusPx(cs.borderTopRightRadius, w), cap),
        Math.min(radiusPx(cs.borderBottomRightRadius, w), cap),
        Math.min(radiusPx(cs.borderBottomLeftRadius, w), cap)
      ],
      clips: cs.overflow !== 'visible'
    };
  }

  function collectObstacles() {
    var sx = window.scrollX, sy = window.scrollY;
    var vh = window.innerHeight, vw = window.innerWidth;
    var list = [];
    var seen = new Map();                                           // 元素 → {rect, radii, clips}

    function info(el) {
      var hit = seen.get(el);
      if (hit) return hit;
      var r = el.getBoundingClientRect();
      var c = cornerRadii(el, r.width, r.height);
      hit = { rect: r, radii: c.radii, clips: c.clips };
      seen.set(el, hit);
      return hit;
    }

    document.querySelectorAll(OBSTACLES).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;                      // 被隱藏的元素
      if (r.bottom < -MAX_RANGE || r.top > vh + MAX_RANGE) return;  // 離畫面太遠
      if (r.right < -MAX_RANGE || r.left > vw + MAX_RANGE) return;

      var rad = info(el).radii.slice();

      // 卡片裡的圖片區塊本身是直角，但會被外層卡片的圓角裁掉：
      // 貼在外層角落的那幾個角，改用外層的圓角
      var parent = el.parentElement && el.parentElement.closest(OBSTACLES);
      if (parent) {
        var p = info(parent);
        if (p.clips) {
          var pr = p.rect, E = 1.5;
          var atL = Math.abs(r.left - pr.left) < E, atR = Math.abs(r.right - pr.right) < E;
          var atT = Math.abs(r.top - pr.top) < E, atB = Math.abs(r.bottom - pr.bottom) < E;
          if (atT && atL) rad[0] = Math.max(rad[0], p.radii[0]);
          if (atT && atR) rad[1] = Math.max(rad[1], p.radii[1]);
          if (atB && atR) rad[2] = Math.max(rad[2], p.radii[2]);
          if (atB && atL) rad[3] = Math.max(rad[3], p.radii[3]);
          var cap = Math.min(r.width, r.height) / 2;
          for (var k = 0; k < 4; k++) rad[k] = Math.min(rad[k], cap);
        }
      }

      list.push({
        l: r.left + sx, t: r.top + sy, r: r.right + sx, b: r.bottom + sy,
        tl: rad[0], tr: rad[1], br: rad[2], bl: rad[3],
        round: rad[0] + rad[1] + rad[2] + rad[3] > 0.5
      });
    });
    obstacles = list;
    rectsDirty = false;
  }

  // 光束與矩形邊框的最近交點距離（游標在矩形內時，打到的是內側邊框）
  function hitRect(ox, oy, dx, dy, o) {
    var tmin = -Infinity, tmax = Infinity, t1, t2;
    if (dx !== 0) {
      t1 = (o.l - ox) / dx; t2 = (o.r - ox) / dx;
      tmin = Math.max(tmin, Math.min(t1, t2)); tmax = Math.min(tmax, Math.max(t1, t2));
    } else if (ox < o.l || ox > o.r) return Infinity;
    if (dy !== 0) {
      t1 = (o.t - oy) / dy; t2 = (o.b - oy) / dy;
      tmin = Math.max(tmin, Math.min(t1, t2)); tmax = Math.min(tmax, Math.max(t1, t2));
    } else if (oy < o.t || oy > o.b) return Infinity;
    if (tmax < tmin || tmax <= 0) return Infinity;
    return tmin > 0 ? tmin : tmax;
  }

  // 光束與一個圓角（四分之一圓弧）的交點距離；qx、qy 指出圓弧在圓心的哪一側
  function hitCorner(ox, oy, dx, dy, cx, cy, rad, qx, qy, best) {
    var fx = ox - cx, fy = oy - cy;
    var b = fx * dx + fy * dy;
    var disc = b * b - (fx * fx + fy * fy - rad * rad);
    if (disc < 0) return best;
    var s = Math.sqrt(disc);
    for (var i = 0; i < 2; i++) {
      var t = i === 0 ? -b - s : -b + s;
      if (t <= 1e-6 || t >= best) continue;
      if ((fx + dx * t) * qx >= -0.01 && (fy + dy * t) * qy >= -0.01) best = t;
    }
    return best;
  }

  // 光束與圓角矩形邊框的最近交點距離：四條直邊（扣掉圓角）加四個圓弧
  function hitRoundRect(ox, oy, dx, dy, o) {
    if (!o.round) return hitRect(ox, oy, dx, dy, o);
    if (hitRect(ox, oy, dx, dy, o) === Infinity) return Infinity;   // 連外框都沒碰到

    var best = Infinity, t, p, E = 0.01;
    if (dy !== 0) {
      t = (o.t - oy) / dy;                                          // 上邊
      if (t > 1e-6 && t < best) { p = ox + dx * t; if (p >= o.l + o.tl - E && p <= o.r - o.tr + E) best = t; }
      t = (o.b - oy) / dy;                                          // 下邊
      if (t > 1e-6 && t < best) { p = ox + dx * t; if (p >= o.l + o.bl - E && p <= o.r - o.br + E) best = t; }
    }
    if (dx !== 0) {
      t = (o.l - ox) / dx;                                          // 左邊
      if (t > 1e-6 && t < best) { p = oy + dy * t; if (p >= o.t + o.tl - E && p <= o.b - o.bl + E) best = t; }
      t = (o.r - ox) / dx;                                          // 右邊
      if (t > 1e-6 && t < best) { p = oy + dy * t; if (p >= o.t + o.tr - E && p <= o.b - o.br + E) best = t; }
    }
    if (o.tl > 0) best = hitCorner(ox, oy, dx, dy, o.l + o.tl, o.t + o.tl, o.tl, -1, -1, best);
    if (o.tr > 0) best = hitCorner(ox, oy, dx, dy, o.r - o.tr, o.t + o.tr, o.tr, 1, -1, best);
    if (o.br > 0) best = hitCorner(ox, oy, dx, dy, o.r - o.br, o.b - o.br, o.br, 1, 1, best);
    if (o.bl > 0) best = hitCorner(ox, oy, dx, dy, o.l + o.bl, o.b - o.bl, o.bl, -1, 1, best);
    return best;
  }

  function nearby(ox, oy) {
    var out = [];
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      if (o.r >= ox - MAX_RANGE && o.l <= ox + MAX_RANGE && o.b >= oy - MAX_RANGE && o.t <= oy + MAX_RANGE) {
        out.push(o);
      }
    }
    return out;
  }

  function cast(beam, ox, oy, near, now) {
    var dx = COS[beam], dy = SIN[beam], best = Infinity;
    for (var i = 0; i < near.length; i++) {
      var t = hitRoundRect(ox, oy, dx, dy, near[i]);
      if (t < best) best = t;
    }
    beamX[beam] = ox;
    beamY[beam] = oy;
    beamDist[beam] = best;
    beamTime[beam] = now;
  }

  /* ---------- 每一格畫面 ---------- */
  function frame(now) {
    if (!running) return;
    var dt = lastFrame ? Math.min(now - lastFrame, 50) : 16;
    lastFrame = now;

    var idle = now - lastMove > IDLE_MS || mouseX < 0;

    // 旋轉掃描：把這一格掃過的光束重新打一次
    if (!idle) {
      if (rectsDirty) collectObstacles();
      var ox = mouseX + window.scrollX, oy = mouseY + window.scrollY;
      var near = nearby(ox, oy);
      var steps = (dt / REV_MS) * BEAMS;
      var start = Math.floor(sweep);
      sweep += steps;
      var end = Math.floor(sweep);
      for (var s = start; s < end; s++) cast(((s % BEAMS) + BEAMS) % BEAMS, ox, oy, near, now);
      if (sweep > BEAMS * 1000) sweep -= BEAMS * 1000;
    }

    // 畫點雲
    var sx = window.scrollX, sy = window.scrollY;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var anyVisible = false;

    for (var b = 0; b < BEAMS; b++) {
      var age = (now - beamTime[b]) / FADE_MS;
      if (age >= 1 || beamTime[b] === 0) continue;
      anyVisible = true;
      var fade = (1 - age) * (1 - age);
      var x0 = beamX[b] - sx, y0 = beamY[b] - sy, d = beamDist[b];

      ctx.globalAlpha = FREE_ALPHA * fade;
      ctx.fillStyle = colorFree;
      for (var k = 0; k < RINGS.length; k++) {
        var r = RINGS[k];
        if (r >= d) break;                                  // 被擋住的通道落在障礙物上
        ctx.fillRect(x0 + COS[b] * r - FREE_SIZE / 2, y0 + SIN[b] * r - FREE_SIZE / 2, FREE_SIZE, FREE_SIZE);
      }

      if (d <= MAX_RANGE) {
        ctx.globalAlpha = HIT_ALPHA * fade;
        ctx.fillStyle = colorHit;
        ctx.fillRect(x0 + COS[b] * d - HIT_SIZE / 2, y0 + SIN[b] * d - HIT_SIZE / 2, HIT_SIZE, HIT_SIZE);
      }
    }
    ctx.globalAlpha = 1;

    // 靜止且點雲都淡出了：停止迴圈，等下一次滑鼠移動
    if (idle && !anyVisible) {
      running = false;
      lastFrame = 0;
      return;
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (!enabled || running) return;
    running = true;
    lastFrame = 0;
    requestAnimationFrame(frame);
  }

  /* ---------- 開關 ---------- */
  function setEnabled(on) {
    enabled = on;
    if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) {
      if (!canvas) makeCanvas();
      readColors();
      canvas.style.display = '';
      rectsDirty = true;
    } else if (canvas) {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
      for (var i = 0; i < BEAMS; i++) beamTime[i] = 0;
    }
  }

  /* ---------- 事件 ---------- */
  window.addEventListener('mousemove', function (e) {
    if (e.target && e.target.closest && e.target.closest(PAUSE_OVER)) {
      mouseX = -1;                             // 交給該區塊自己的光達，游標光達淡出
      mouseY = -1;
      return;
    }
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMove = performance.now();
    start();
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', function () {
    mouseX = -1;
    mouseY = -1;
  });

  window.addEventListener('scroll', function () { rectsDirty = true; }, { passive: true });
  window.addEventListener('resize', resize);
  window.addEventListener('load', function () { rectsDirty = true; });
  document.addEventListener('themechange', readColors);
  setInterval(function () { rectsDirty = true; }, 1000);   // 影片、圖片載入後版面可能會變

  if (btn) {
    btn.addEventListener('click', function () {
      setEnabled(!enabled);
      savePref(enabled ? 'on' : 'off');
    });
  }

  // 預設開啟；訪客關過就記住。系統設定「減少動態效果」的訪客預設關閉。
  var pref = savedPref();
  setEnabled(pref ? pref === 'on' : !reduceMotion.matches);
})();