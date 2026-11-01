/* ============================================================
   光達游標（實驗性功能）
   - 游標是一顆旋轉的光達：每條光束在空地上落成一圈一圈的環，
     打到卡片、照片、按鈕時，點會停在它的邊框上（像打到障礙物）
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

  // 會被當成「障礙物」的元素；圓形的另外列出，邊緣才會貼合圓框
  var OBSTACLES = '.card, .feature, .feature-media, .tile, .tile-media, .news, ' +
                  '.btn, .icon-btn, .pill, .hero-photo, .globalnav-inner, .tl-logo';
  var CIRCLES = '.hero-photo, .icon-btn';

  /* ---------- 狀態 ---------- */
  var root = document.documentElement;
  var btn = document.getElementById('lidar-toggle');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var canvas, ctx, dpr = 1;
  var enabled = false, running = false;
  var mouseX = -1, mouseY = -1, lastMove = 0, lastFrame = 0;
  var sweep = 0;                               // 目前掃到第幾條光束（小數）
  var obstacles = [];                          // 頁面座標的障礙物 {l,t,r,b} 或 {cx,cy,rad}
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
  function collectObstacles() {
    var sx = window.scrollX, sy = window.scrollY;
    var vh = window.innerHeight, vw = window.innerWidth;
    var list = [];
    document.querySelectorAll(OBSTACLES).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;                      // 被隱藏的元素
      if (r.bottom < -MAX_RANGE || r.top > vh + MAX_RANGE) return;  // 離畫面太遠
      if (r.right < -MAX_RANGE || r.left > vw + MAX_RANGE) return;
      if (el.matches(CIRCLES)) {
        list.push({ circle: true, cx: r.left + r.width / 2 + sx, cy: r.top + r.height / 2 + sy, rad: Math.min(r.width, r.height) / 2 });
      } else {
        list.push({ circle: false, l: r.left + sx, t: r.top + sy, r: r.right + sx, b: r.bottom + sy });
      }
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

  function hitCircle(ox, oy, dx, dy, o) {
    var fx = ox - o.cx, fy = oy - o.cy;
    var b = fx * dx + fy * dy;
    var c = fx * fx + fy * fy - o.rad * o.rad;
    var disc = b * b - c;
    if (disc < 0) return Infinity;
    var s = Math.sqrt(disc);
    var t1 = -b - s, t2 = -b + s;
    return t1 > 0 ? t1 : (t2 > 0 ? t2 : Infinity);
  }

  function nearby(ox, oy) {
    var out = [];
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      if (o.circle) {
        if (Math.abs(o.cx - ox) <= MAX_RANGE + o.rad && Math.abs(o.cy - oy) <= MAX_RANGE + o.rad) out.push(o);
      } else if (o.r >= ox - MAX_RANGE && o.l <= ox + MAX_RANGE && o.b >= oy - MAX_RANGE && o.t <= oy + MAX_RANGE) {
        out.push(o);
      }
    }
    return out;
  }

  function cast(beam, ox, oy, near, now) {
    var dx = COS[beam], dy = SIN[beam], best = Infinity;
    for (var i = 0; i < near.length; i++) {
      var o = near[i];
      var t = o.circle ? hitCircle(ox, oy, dx, dy, o) : hitRect(ox, oy, dx, dy, o);
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