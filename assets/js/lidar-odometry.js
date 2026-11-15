/* ============================================================
   光達里程計小展示（More 區最下面那張卡片）
   - 右邊：模擬的 2D 街景（俯視圖）。滑鼠移進去會變成一台自駕車，
     車頭朝向移動方向，車頂的光達即時掃描周圍的建築、路樹、路邊停車
   - 左邊：只用光達掃描算出來的軌跡。每一幀掃描和上一個關鍵幀做
     scan matching（2D point-to-line ICP），把相對位移累加成路徑。
     估測過程完全不看車子的真實位置；真實軌跡只用來畫對照線和算漂移
   - 目前沒有加感測雜訊（想加的話改 RANGE_NOISE）
   - 觸控裝置沒有滑鼠：捲到看得見時，車子會自己沿著預設路線開
   ============================================================ */
(function () {
  'use strict';

  var card = document.getElementById('loc-demo');
  if (!card) return;
  var simCanvas = card.querySelector('.loc-canvas-sim');
  var estCanvas = card.querySelector('.loc-canvas-est');
  var stage = card.querySelector('.loc-stage');
  if (!simCanvas || !estCanvas || !stage || !simCanvas.getContext) return;

  /* ---------- 參數：想調整效果改這裡（長度單位都是公尺） ---------- */
  var WORLD_W = 48, WORLD_H = 36;      // 街景的大小
  var BEAMS = 240;                     // 每圈光束數（角解析度 1.5°）
  var MAX_RANGE = 20;                  // 光達最遠偵測距離
  var RANGE_NOISE = 0;                 // 測距雜訊的標準差；0 = 完美的感測器
  var STEP = 0.3;                      // 車子每走這麼遠就掃描一次並做一次 scan matching
  var MAX_STEPS_PER_FRAME = 10;        // 滑鼠甩很快時，每格畫面最多補幾步
  var TURN_PER_STEP = 0.14;            // 每一步車頭最多轉幾弧度
  var KEYFRAME_DIST = 1.0;             // 離關鍵幀多遠就換新的關鍵幀
  var KEYFRAME_ANGLE = 0.2;
  var ICP_ITERATIONS = 14;
  var ROT_SEEDS = [-0.14, -0.07, 0.07, 0.14];   // scan matching 起始角度的候選（相對於上一次的結果）
  var CAR_LENGTH = 4.4, CAR_WIDTH = 1.9;
  var CAR_RADIUS = 1.3;                // 碰撞用的半徑：車子不能穿過建築
  var AUTO_SPEED = 7;                  // 自動行駛的速度（公尺／秒）
  var START = { x: 24, y: 18, th: 0 };  // 滑鼠還沒進來之前，車子停在這裡
  var RESPAWN_DIST = 3;                // 滑鼠進入街景時離車子超過這個距離：車子直接出現在滑鼠的位置，重新開始

  /* ---------- 街景：道路、建築、路樹、路邊停車 ---------- */
  var ROADS = [[0, 14, 48, 22], [10, 0, 17, 36], [31, 0, 38, 36]];       // [x1, y1, x2, y2]
  var CROSSINGS = [[10, 17], [31, 38]];                                  // 兩個路口的 x 範圍
  var BUILDINGS = [
    [-2, -2, 8.4, 6], [-2, 7.2, 6.6, 12.4],
    [18.6, -2, 24.2, 12.4], [25.4, -2, 29.4, 10.2],
    [39.6, -2, 50, 5.4], [41.4, 6.6, 50, 12.4],
    [-2, 23.6, 8.4, 29], [-2, 30.2, 6.8, 38],
    [18.6, 23.6, 22.6, 38], [23.8, 25.4, 29.4, 31.5], [23.8, 32.7, 29.4, 38],
    [39.6, 23.6, 50, 30.4], [39.6, 31.6, 46, 38]
  ];
  var PARKED = [
    [20.6, 14.25, 25, 16.15], [41, 19.85, 45.4, 21.75], [2, 19.85, 6.4, 21.75],
    [10.25, 3, 12.15, 7.4], [35.85, 26, 37.75, 30.4]
  ];
  var TREE_R = 0.55;
  var TREES = [
    [9.2, 3], [9.2, 10], [17.8, 5], [30.2, 4], [30.2, 11.5], [38.8, 3], [38.8, 9.5],
    [3, 13.2], [21, 13.2], [27, 13.2], [44, 13.2], [4, 22.8], [26, 22.8], [43, 22.8],
    [9.2, 26], [9.2, 33], [17.8, 30], [30.2, 28], [30.2, 34.5], [38.8, 27], [38.8, 34]
  ];
  // 自動行駛的路線（觸控裝置用），走完會原路折返
  var ROUTE = [
    [6, 18], [13.5, 18], [13.5, 5], [13.5, 31], [13.5, 18], [34.5, 18],
    [34.5, 31], [34.5, 5], [34.5, 18], [43, 18]
  ];

  // 光達看得到的東西：線段（建築、停著的車）和圓（路樹）
  var SOLIDS = BUILDINGS.concat(PARKED);
  var SEGS = [];
  SOLIDS.forEach(function (b) {
    SEGS.push([b[0], b[1], b[2], b[1]], [b[2], b[1], b[2], b[3]],
              [b[2], b[3], b[0], b[3]], [b[0], b[3], b[0], b[1]]);
  });

  var COS = new Float32Array(BEAMS), SIN = new Float32Array(BEAMS);
  for (var i = 0; i < BEAMS; i++) {
    COS[i] = Math.cos((i / BEAMS) * Math.PI * 2);
    SIN[i] = Math.sin((i / BEAMS) * Math.PI * 2);
  }

  /* ---------- 模擬光達 ---------- */
  function gauss() {
    var u = 1 - Math.random(), v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // 在 pose 的位置掃一圈；回傳感測器座標系裡的點（x 軸是車頭方向）
  function scanAt(pose) {
    var range = new Float32Array(BEAMS);
    var px = new Float32Array(BEAMS), py = new Float32Array(BEAMS);
    var c0 = Math.cos(pose.th), s0 = Math.sin(pose.th);
    for (var i = 0; i < BEAMS; i++) {
      var dx = c0 * COS[i] - s0 * SIN[i], dy = s0 * COS[i] + c0 * SIN[i];
      var best = MAX_RANGE, k, t;
      for (k = 0; k < SEGS.length; k++) {
        var g = SEGS[k];
        var ex = g[2] - g[0], ey = g[3] - g[1];
        var den = dx * ey - dy * ex;
        if (den === 0) continue;
        var wx = g[0] - pose.x, wy = g[1] - pose.y;
        t = (wx * ey - wy * ex) / den;
        if (t <= 0 || t >= best) continue;
        var u = (wx * dy - wy * dx) / den;
        if (u >= 0 && u <= 1) best = t;
      }
      for (k = 0; k < TREES.length; k++) {
        var fx = pose.x - TREES[k][0], fy = pose.y - TREES[k][1];
        var b = fx * dx + fy * dy;
        var disc = b * b - (fx * fx + fy * fy - TREE_R * TREE_R);
        if (disc < 0) continue;
        t = -b - Math.sqrt(disc);
        if (t > 0 && t < best) best = t;
      }
      if (best < MAX_RANGE) {
        if (RANGE_NOISE > 0) best += gauss() * RANGE_NOISE;
        range[i] = best;
        px[i] = COS[i] * best;
        py[i] = SIN[i] * best;
      }                                            // 沒打到東西：range 留 0
    }
    return { range: range, px: px, py: py };
  }

  /* ---------- Scan matching：2D point-to-line ICP ---------- */
  // 把一幀掃描整理成參考點：每個點帶一個法向量（由相鄰兩點連線估計）
  function makeReference(scan) {
    var qx = [], qy = [], nx = [], ny = [];
    for (var i = 0; i < BEAMS; i++) {
      var r = scan.range[i];
      if (!r) continue;
      var a = (i + BEAMS - 1) % BEAMS, b = (i + 1) % BEAMS;
      var gap = 0.5 + 0.12 * r;                    // 距離差太多代表是不同物體，不能連線
      var okA = scan.range[a] && Math.abs(scan.range[a] - r) < gap;
      var okB = scan.range[b] && Math.abs(scan.range[b] - r) < gap;
      if (!okA && !okB) continue;
      var j = okA ? a : i, k = okB ? b : i;
      var tx = scan.px[k] - scan.px[j], ty = scan.py[k] - scan.py[j];
      var len = Math.sqrt(tx * tx + ty * ty);
      if (len < 1e-6) continue;
      qx.push(scan.px[i]); qy.push(scan.py[i]);
      nx.push(-ty / len); ny.push(tx / len);
    }
    return { qx: qx, qy: qy, nx: nx, ny: ny, n: qx.length };
  }

  // 粗略評分：scan 放在這個位姿時，和參考點平均差多遠（越小越好）
  function misfit(ref, scan, x, y, th) {
    var c = Math.cos(th), s = Math.sin(th), sum = 0, n = 0;
    for (var i = 0; i < BEAMS; i += 3) {
      if (!scan.range[i]) continue;
      var X = c * scan.px[i] - s * scan.py[i] + x, Y = s * scan.px[i] + c * scan.py[i] + y;
      var best = 1;
      for (var j = 0; j < ref.n; j++) {
        var dx = ref.qx[j] - X, dy = ref.qy[j] - Y, d2 = dx * dx + dy * dy;
        if (d2 < best) best = d2;
      }
      sum += best; n++;
    }
    return n ? sum / n : Infinity;
  }

  // 找出把 scan 對齊到參考幀的相對位姿（x, y, th），從 guess 開始迭代
  function icp(ref, scan, guess) {
    var x = guess.x, y = guess.y, th = guess.th;
    if (ref.n < 12) return null;

    // 車子轉彎時角度變化大，ICP 容易卡住：先試幾個角度，挑最接近的當起點
    var bestFit = misfit(ref, scan, x, y, th);
    for (var a = 0; a < ROT_SEEDS.length; a++) {
      var fit = misfit(ref, scan, x, y, guess.th + ROT_SEEDS[a]);
      if (fit < bestFit * 0.9) { bestFit = fit; th = guess.th + ROT_SEEDS[a]; }
    }

    for (var it = 0; it < ICP_ITERATIONS; it++) {
      var c = Math.cos(th), s = Math.sin(th);
      var coarse = it < 4;                         // 前幾次用點對點（收斂範圍大），之後用點對線（精準）
      var maxD2 = coarse ? 2.25 : 0.36;            // 配對距離門檻：先寬後嚴
      var h00 = 0, h01 = 0, h02 = 0, h11 = 0, h12 = 0, h22 = 0, b0 = 0, b1 = 0, b2 = 0, n = 0;
      for (var i = 0; i < BEAMS; i++) {
        if (!scan.range[i]) continue;
        var px = scan.px[i], py = scan.py[i];
        var X = c * px - s * py + x, Y = s * px + c * py + y;
        var bestJ = -1, bestD = maxD2;
        for (var j = 0; j < ref.n; j++) {
          var ddx = ref.qx[j] - X, ddy = ref.qy[j] - Y;
          var d2 = ddx * ddx + ddy * ddy;
          if (d2 < bestD) { bestD = d2; bestJ = j; }
        }
        if (bestJ < 0) continue;
        var gx = -s * px - c * py, gy = c * px - s * py;                 // 點對旋轉角的導數
        var ex = X - ref.qx[bestJ], ey = Y - ref.qy[bestJ], w;
        if (coarse) {
          w = 1 / (1 + bestD / 0.25);
          h00 += w; h02 += w * gx; h11 += w; h12 += w * gy; h22 += w * (gx * gx + gy * gy);
          b0 += w * ex; b1 += w * ey; b2 += w * (gx * ex + gy * ey);
        } else {
          var nxj = ref.nx[bestJ], nyj = ref.ny[bestJ];
          var e = nxj * ex + nyj * ey;                                   // 點到線的距離
          var jt = nxj * gx + nyj * gy;
          w = 1 / (1 + (e * e) / 0.0225);                                // 降低離群點的影響
          h00 += w * nxj * nxj; h01 += w * nxj * nyj; h02 += w * nxj * jt;
          h11 += w * nyj * nyj; h12 += w * nyj * jt; h22 += w * jt * jt;
          b0 += w * nxj * e; b1 += w * nyj * e; b2 += w * jt * e;
        }
        n++;
      }
      if (n < 12) return null;
      // 解 3×3 的 H·δ = −b（加一點阻尼，避免某個方向沒有約束時發散）
      var lam = 1e-4 * n;
      h00 += lam; h11 += lam; h22 += lam;
      var det = h00 * (h11 * h22 - h12 * h12) - h01 * (h01 * h22 - h12 * h02) + h02 * (h01 * h12 - h11 * h02);
      if (Math.abs(det) < 1e-12) return null;
      var d0 = -(b0 * (h11 * h22 - h12 * h12) - h01 * (b1 * h22 - h12 * b2) + h02 * (b1 * h12 - h11 * b2)) / det;
      var d1 = -(h00 * (b1 * h22 - h12 * b2) - b0 * (h01 * h22 - h12 * h02) + h02 * (h01 * b2 - b1 * h02)) / det;
      var d2t = -(h00 * (h11 * b2 - b1 * h12) - h01 * (h01 * b2 - b1 * h02) + b0 * (h01 * h12 - h11 * h02)) / det;
      x += d0; y += d1; th += d2t;
      if (!coarse && Math.abs(d0) + Math.abs(d1) + Math.abs(d2t) < 1e-5) break;
    }
    return { x: x, y: y, th: th };
  }

  function compose(a, b) {                          // 位姿 a 接著相對位姿 b
    var c = Math.cos(a.th), s = Math.sin(a.th);
    return { x: a.x + c * b.x - s * b.y, y: a.y + s * b.x + c * b.y, th: a.th + b.th };
  }

  /* ---------- 狀態 ---------- */
  var truth, scan;                 // 車子的真實位姿，以及在那裡掃到的最新一幀
  var keyPose, keyRef, rel;        // 里程計：關鍵幀的估測位姿、參考點、目前相對關鍵幀的位姿
  var est;                         // 估測位姿 = keyPose ∘ rel
  var estPath, truePath;           // 兩條軌跡 [x0, y0, x1, y1, …]
  var mapPts, mapCells;            // 用估測位姿拼起來的點雲地圖
  var travelled;
  var target = null;               // 滑鼠（或自動路線）目前指的位置
  var pendingSpawn = false;        // 滑鼠剛進來、還在建築上：等它移到路上，車子才出現在那裡

  function addToMap(pose, s) {
    var c = Math.cos(pose.th), sn = Math.sin(pose.th);
    for (var i = 0; i < BEAMS; i += 2) {
      if (!s.range[i]) continue;
      var x = pose.x + c * s.px[i] - sn * s.py[i], y = pose.y + sn * s.px[i] + c * s.py[i];
      var key = Math.round(x / 0.3) + ',' + Math.round(y / 0.3);
      if (mapCells[key]) continue;
      mapCells[key] = 1;
      mapPts.push(x, y);
    }
    if (mapPts.length > 12000) {                    // 太多就丟掉最舊的一半
      mapPts = mapPts.slice(mapPts.length / 2);
      mapCells = {};
    }
  }

  // 里程計的起點需要一個已知的初始位姿；之後就只靠掃描
  function resetOdometry() {
    scan = scanAt(truth);
    keyPose = { x: truth.x, y: truth.y, th: truth.th };
    keyRef = makeReference(scan);
    rel = { x: 0, y: 0, th: 0 };
    est = { x: truth.x, y: truth.y, th: truth.th };
    estPath = [est.x, est.y];
    truePath = [truth.x, truth.y];
    mapPts = [];
    mapCells = {};
    travelled = 0;
    addToMap(keyPose, scan);
  }

  // 新的一幀掃描進來：和關鍵幀對齊，更新估測位姿
  function odometryStep() {
    var result = icp(keyRef, scan, rel);
    var lost = !result;
    if (result) rel = result;                       // 對不起來時，假設這一步沒有移動
    var prev = est;
    est = compose(keyPose, rel);
    travelled += Math.sqrt((est.x - prev.x) * (est.x - prev.x) + (est.y - prev.y) * (est.y - prev.y));

    if (lost || rel.x * rel.x + rel.y * rel.y > KEYFRAME_DIST * KEYFRAME_DIST || Math.abs(rel.th) > KEYFRAME_ANGLE) {
      keyPose = est;
      keyRef = makeReference(scan);
      rel = { x: 0, y: 0, th: 0 };
      addToMap(keyPose, scan);
    }

    var n = estPath.length;
    var ex = est.x - estPath[n - 2], ey = est.y - estPath[n - 1];
    if (ex * ex + ey * ey > 0.04) {
      estPath.push(est.x, est.y);
      truePath.push(truth.x, truth.y);
      if (estPath.length > 8000) { estPath = estPath.slice(4000); truePath = truePath.slice(4000); }
    }
  }

  /* ---------- 車子的移動 ---------- */
  function isFree(x, y) {
    if (x < CAR_RADIUS || y < CAR_RADIUS || x > WORLD_W - CAR_RADIUS || y > WORLD_H - CAR_RADIUS) return false;
    var i;
    for (i = 0; i < SOLIDS.length; i++) {
      var b = SOLIDS[i];
      if (x > b[0] - CAR_RADIUS && x < b[2] + CAR_RADIUS && y > b[1] - CAR_RADIUS && y < b[3] + CAR_RADIUS) return false;
    }
    var rr = (CAR_RADIUS * 0.6 + TREE_R) * (CAR_RADIUS * 0.6 + TREE_R);
    for (i = 0; i < TREES.length; i++) {
      var dx = x - TREES[i][0], dy = y - TREES[i][1];
      if (dx * dx + dy * dy < rr) return false;
    }
    return true;
  }

  // 朝目標走一步（最多 STEP 公尺），撞到東西就沿著牆滑；回傳有沒有動
  function driveStep() {
    var dx = target.x - truth.x, dy = target.y - truth.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.12) return false;

    var want = Math.atan2(dy, dx);
    var turn = Math.atan2(Math.sin(want - truth.th), Math.cos(want - truth.th));
    if (dist < 0.6) turn = 0;                        // 快到了就不再轉，避免原地抖動
    turn = Math.max(-TURN_PER_STEP, Math.min(TURN_PER_STEP, turn));

    var step = Math.min(STEP, dist);
    var mx = (dx / dist) * step, my = (dy / dist) * step;
    var nx = truth.x, ny = truth.y;
    if (isFree(nx + mx, ny + my)) { nx += mx; ny += my; }
    else if (Math.abs(mx) > 0.01 && isFree(nx + mx, ny)) nx += mx;
    else if (Math.abs(my) > 0.01 && isFree(nx, ny + my)) ny += my;

    if (nx === truth.x && ny === truth.y && Math.abs(turn) < 0.01) return false;
    truth = { x: nx, y: ny, th: truth.th + turn };
    scan = scanAt(truth);
    odometryStep();
    return true;
  }

  /* ---------- 畫面 ---------- */
  var root = document.documentElement;
  var simCtx = simCanvas.getContext('2d'), estCtx = estCanvas.getContext('2d');
  var scale = 10, dpr = 1;          // scale：一公尺等於幾個 CSS px
  var colors = {};
  var statDist = card.querySelector('.loc-stat-dist');
  var statDrift = card.querySelector('.loc-stat-drift');

  function readColors() {
    var cs = getComputedStyle(card);
    ['accent', 'secondary', 'tertiary', 'rule', 'loc-ground', 'loc-road', 'loc-mark', 'loc-building',
     'loc-building-edge', 'loc-tree', 'loc-parked', 'loc-glass'].forEach(function (name) {
      colors[name] = cs.getPropertyValue('--' + name).trim() || '#888';
    });
  }

  function fitCanvas(canvas) {
    var w = canvas.clientWidth;
    if (!w) return;
    var h = w * WORLD_H / WORLD_W;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    fitCanvas(simCanvas);
    fitCanvas(estCanvas);
    scale = (simCanvas.clientWidth || 480) / WORLD_W;
    draw();
  }

  function begin(ctx, canvas) {
    var k = (canvas.width / WORLD_W);
    ctx.setTransform(k, 0, 0, k, 0, 0);             // 之後都用公尺當單位畫
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);
    return 1 / (k / dpr);                           // 一個 CSS px 等於幾公尺
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCar(ctx, pose, px, outlineOnly) {
    var L = CAR_LENGTH, Wd = CAR_WIDTH;
    ctx.save();
    ctx.translate(pose.x, pose.y);
    ctx.rotate(pose.th);
    if (outlineOnly) {
      roundRect(ctx, -L / 2, -Wd / 2, L, Wd, 0.5);
      ctx.globalAlpha = 0.16; ctx.fillStyle = colors.accent; ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.5 * px; ctx.stroke();
      ctx.beginPath();                               // 車頭方向的小箭頭
      ctx.moveTo(L / 2 - 0.5, 0); ctx.lineTo(L / 2 - 1.5, -0.55); ctx.lineTo(L / 2 - 1.5, 0.55); ctx.closePath();
      ctx.fillStyle = colors.accent; ctx.fill();
      ctx.restore();
      return;
    }
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)'; ctx.shadowBlur = 6 * dpr; ctx.shadowOffsetY = 1.5 * dpr;
    roundRect(ctx, -L / 2, -Wd / 2, L, Wd, 0.55);
    ctx.fillStyle = colors.accent; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = colors['loc-glass'];
    ctx.beginPath();                                 // 前擋風玻璃
    ctx.moveTo(0.95, -0.78); ctx.lineTo(0.35, -0.66); ctx.lineTo(0.35, 0.66); ctx.lineTo(0.95, 0.78);
    ctx.quadraticCurveTo(1.2, 0, 0.95, -0.78); ctx.fill();
    ctx.beginPath();                                 // 後擋風玻璃
    ctx.moveTo(-1.5, -0.74); ctx.lineTo(-1.05, -0.64); ctx.lineTo(-1.05, 0.64); ctx.lineTo(-1.5, 0.74);
    ctx.quadraticCurveTo(-1.68, 0, -1.5, -0.74); ctx.fill();
    ctx.fillStyle = '#fff';                          // 車頭燈
    ctx.fillRect(L / 2 - 0.22, -Wd / 2 + 0.2, 0.14, 0.34);
    ctx.fillRect(L / 2 - 0.22, Wd / 2 - 0.54, 0.14, 0.34);
    ctx.beginPath(); ctx.arc(-0.35, 0, 0.42, 0, Math.PI * 2);            // 車頂的光達
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath(); ctx.arc(-0.35, 0, 0.17, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent; ctx.fill();
    ctx.restore();
  }

  function drawStreet() {
    var ctx = simCtx, px = begin(ctx, simCanvas), i, k;
    ctx.fillStyle = colors['loc-ground'];
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.fillStyle = colors['loc-road'];
    ROADS.forEach(function (r) { ctx.fillRect(r[0], r[1], r[2] - r[0], r[3] - r[1]); });

    // 車道中線（虛線），到路口前停止
    ctx.strokeStyle = colors['loc-mark']; ctx.lineWidth = 0.16; ctx.setLineDash([1.4, 1.4]);
    ctx.beginPath();
    [[0, 6.6], [20.4, 27.6], [41.4, 48]].forEach(function (s) { ctx.moveTo(s[0], 18); ctx.lineTo(s[1], 18); });
    [13.5, 34.5].forEach(function (x) {
      ctx.moveTo(x, 0); ctx.lineTo(x, 10.6);
      ctx.moveTo(x, 25.4); ctx.lineTo(x, 36);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 斑馬線
    ctx.fillStyle = colors['loc-mark'];
    CROSSINGS.forEach(function (c) {
      for (k = 0; k < 8; k++) {
        ctx.fillRect(c[0] - 2.8, 14.5 + k * 0.95, 2.2, 0.42);
        ctx.fillRect(c[1] + 0.6, 14.5 + k * 0.95, 2.2, 0.42);
      }
      for (k = 0; k < 7; k++) {
        ctx.fillRect(c[0] + 0.45 + k * 0.95, 11.2, 0.42, 2.2);
        ctx.fillRect(c[0] + 0.45 + k * 0.95, 22.6, 0.42, 2.2);
      }
    });

    ctx.fillStyle = colors['loc-parked'];
    PARKED.forEach(function (b) { roundRect(ctx, b[0], b[1], b[2] - b[0], b[3] - b[1], 0.45); ctx.fill(); });
    ctx.fillStyle = colors['loc-tree'];
    TREES.forEach(function (t) { ctx.beginPath(); ctx.arc(t[0], t[1], TREE_R, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = colors['loc-building']; ctx.strokeStyle = colors['loc-building-edge']; ctx.lineWidth = px;
    BUILDINGS.forEach(function (b) {
      ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
      ctx.strokeRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
    });

    // 光束與打到的點
    var c = Math.cos(truth.th), s = Math.sin(truth.th);
    ctx.strokeStyle = colors.accent; ctx.lineWidth = px; ctx.globalAlpha = 0.09;
    ctx.beginPath();
    for (i = 0; i < BEAMS; i += 2) {
      var r = scan.range[i] || MAX_RANGE;
      var bx = COS[i] * r, by = SIN[i] * r;
      ctx.moveTo(truth.x, truth.y);
      ctx.lineTo(truth.x + c * bx - s * by, truth.y + s * bx + c * by);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.95; ctx.fillStyle = colors.accent;
    var d = 2.6 * px;
    for (i = 0; i < BEAMS; i++) {
      if (!scan.range[i]) continue;
      ctx.fillRect(truth.x + c * scan.px[i] - s * scan.py[i] - d / 2, truth.y + s * scan.px[i] + c * scan.py[i] - d / 2, d, d);
    }
    ctx.globalAlpha = 1;

    // 車子被建築擋住、跟不上滑鼠時，標出滑鼠實際的位置
    if (target) {
      var tx = target.x - truth.x, ty = target.y - truth.y;
      if (pendingSpawn || tx * tx + ty * ty > 4) {
        ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.5 * px; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.arc(target.x, target.y, 5 * px, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    drawCar(ctx, truth, px, false);
  }

  function drawEstimate() {
    var ctx = estCtx, px = begin(ctx, estCanvas), i;

    ctx.strokeStyle = colors.rule; ctx.lineWidth = px; ctx.globalAlpha = 0.5;      // 每 6 公尺一格
    ctx.beginPath();
    for (i = 6; i < WORLD_W; i += 6) { ctx.moveTo(i, 0); ctx.lineTo(i, WORLD_H); }
    for (i = 6; i < WORLD_H; i += 6) { ctx.moveTo(0, i); ctx.lineTo(WORLD_W, i); }
    ctx.stroke();

    var d = 1.8 * px;                                                              // 累積的點雲地圖
    ctx.globalAlpha = 0.55; ctx.fillStyle = colors.secondary;
    for (i = 0; i < mapPts.length; i += 2) ctx.fillRect(mapPts[i] - d / 2, mapPts[i + 1] - d / 2, d, d);

    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.globalAlpha = 0.9; ctx.strokeStyle = colors.tertiary; ctx.lineWidth = 1.5 * px;   // 真實軌跡（對照）
    ctx.setLineDash([5 * px, 5 * px]);
    ctx.beginPath();
    for (i = 0; i < truePath.length; i += 2) ctx.lineTo(truePath[i], truePath[i + 1]);
    ctx.lineTo(truth.x, truth.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 1; ctx.strokeStyle = colors.accent; ctx.lineWidth = 2.5 * px;       // 估測軌跡
    ctx.beginPath();
    for (i = 0; i < estPath.length; i += 2) ctx.lineTo(estPath[i], estPath[i + 1]);
    ctx.lineTo(est.x, est.y);
    ctx.stroke();

    var c = Math.cos(est.th), s = Math.sin(est.th);                                // 目前這一幀掃描
    d = 2.4 * px;
    ctx.fillStyle = colors.accent; ctx.globalAlpha = 0.9;
    for (i = 0; i < BEAMS; i++) {
      if (!scan.range[i]) continue;
      ctx.fillRect(est.x + c * scan.px[i] - s * scan.py[i] - d / 2, est.y + s * scan.px[i] + c * scan.py[i] - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
    drawCar(ctx, est, px, true);
  }

  function draw() {
    if (!truth || !simCanvas.width) return;
    drawStreet();
    drawEstimate();
    var drift = Math.sqrt((est.x - truth.x) * (est.x - truth.x) + (est.y - truth.y) * (est.y - truth.y));
    if (statDist) statDist.textContent = travelled.toFixed(1) + ' m';
    if (statDrift) statDrift.textContent = drift.toFixed(2) + ' m';
  }

  /* ---------- 動畫迴圈：只有在需要時才跑 ---------- */
  var running = false, lastFrame = 0;
  var auto = false, autoIndex = 0, autoDir = 1, visible = false;

  function advanceAuto(dt) {
    var goal = ROUTE[autoIndex];
    if (!target) target = { x: truth.x, y: truth.y };
    var dx = goal[0] - target.x, dy = goal[1] - target.y;
    var dist = Math.sqrt(dx * dx + dy * dy), move = AUTO_SPEED * dt;
    if (dist <= move) {
      target = { x: goal[0], y: goal[1] };
      if (autoIndex + autoDir < 0 || autoIndex + autoDir >= ROUTE.length) autoDir = -autoDir;
      autoIndex += autoDir;
    } else {
      target = { x: target.x + (dx / dist) * move, y: target.y + (dy / dist) * move };
    }
  }

  function frame(now) {
    var dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0.016;
    lastFrame = now;
    if (auto && visible) advanceAuto(dt);

    var moved = false;
    if (target && !pendingSpawn) {
      for (var k = 0; k < MAX_STEPS_PER_FRAME; k++) {
        if (!driveStep()) break;
        moved = true;
      }
    }
    draw();

    if ((auto && visible) || (target && moved)) requestAnimationFrame(frame);
    else { running = false; lastFrame = 0; }
  }

  function wake() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  /* ---------- 事件 ---------- */
  function pointTo(e) {
    var r = simCanvas.getBoundingClientRect();
    if (!r.width) return;
    target = {
      x: Math.max(0, Math.min(WORLD_W, (e.clientX - r.left) / r.width * WORLD_W)),
      y: Math.max(0, Math.min(WORLD_H, (e.clientY - r.top) / r.height * WORLD_H))
    };
    if (pendingSpawn) {
      if (!isFree(target.x, target.y)) { draw(); return; }      // 還在建築上：先只顯示滑鼠位置
      truth = { x: target.x, y: target.y, th: truth.th };       // 車子直接出現在滑鼠的位置
      resetOdometry();
      pendingSpawn = false;
      draw();
    }
    wake();
  }

  stage.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') pointTo(e); });
  stage.addEventListener('pointerenter', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = simCanvas.getBoundingClientRect();
    if (r.width) {
      // 滑鼠從別的地方進來時，不讓車子從原地衝過去，改成在滑鼠的位置重新開始；
      // 只是稍微滑出去又回來（離車子很近）就接著原本的軌跡繼續
      var dx = (e.clientX - r.left) / r.width * WORLD_W - truth.x;
      var dy = (e.clientY - r.top) / r.height * WORLD_H - truth.y;
      pendingSpawn = dx * dx + dy * dy > RESPAWN_DIST * RESPAWN_DIST;
    }
    pointTo(e);
  });
  stage.addEventListener('pointerleave', function (e) {
    if (e.pointerType !== 'mouse') return;
    target = null;
    pendingSpawn = false;
    draw();
  });

  var resetBtn = card.querySelector('.loc-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      resetOdometry();
      draw();
    });
  }

  document.addEventListener('themechange', function () { readColors(); draw(); });
  if (window.ResizeObserver) new ResizeObserver(resize).observe(simCanvas);
  else window.addEventListener('resize', resize);

  // 觸控裝置：看得見卡片時自動行駛（系統設定「減少動態效果」時不自動播放）
  var touchOnly = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (touchOnly && !reduceMotion && window.IntersectionObserver) {
    auto = true;
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) wake();
    }, { threshold: 0.25 }).observe(stage);
  }

  /* ---------- 開始 ---------- */
  truth = { x: START.x, y: START.y, th: START.th };
  readColors();
  resetOdometry();
  resize();
})();
