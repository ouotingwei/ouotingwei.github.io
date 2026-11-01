---
layout: default
title: Home
---

<!--
  元件說明（新增內容時照抄即可）：
  - 論文 / 文章：.feature（大卡片，左縮圖右文字）
  - 專案：.tile（兩欄磁磚，上縮圖下文字）
  - 學歷 / 經歷 / 教學：.tl-item，進行中的在日期後加 <span class="badge">Current</span>
  - 連結按鈕：<a class="pill"><i class="..."></i>文字</a>
    圖示：arXiv = fa-solid fa-file-lines、GitHub = fa-brands fa-github、
          網站 = fa-solid fa-globe、YouTube = fa-brands fa-youtube、文章 = fa-solid fa-newspaper
  - 直式影片在 media 容器加 media--contain，避免被裁切

  中英切換：
  - 要翻譯的文字寫兩份：<span lang="en">English</span><span lang="zh-Hant">中文</span>
  - 整段（例如自我介紹）就用兩個 <div lang="en"> / <div lang="zh-Hant"> 包起來
  - 不需要翻譯的（論文標題、作者、期刊名）只寫一份、不加 lang，兩種語言都會顯示
  - News 的中文寫在 _data/news.yml 的 text_zh
  所有樣式都在 assets/css/style.scss
-->

<header class="hero">
  <div class="container hero-inner">
    <!-- 照片在左；名字、簡介、按鈕、社群圖示在右，整塊與下方自介左緣對齊 -->
    <div class="hero-layout">
      <img class="hero-photo" src="{{ site.logo | relative_url }}" alt="Portrait of {{ site.title }}" width="176" height="176">
      <div class="hero-main">
        <h1 class="hero-title">{{ site.title }}</h1>
        <p class="hero-subtitle">
          <span lang="en">{{ site.description }}</span>
          <span lang="zh-Hant">陽明交大機器人碩士生，研究機器人的定位與建圖。</span>
        </p>
        <!-- 按鈕與社群圖示排在同一行 -->
        <div class="hero-cta">
          <div class="hero-actions">
            <a class="btn btn-primary" href="{{ '/assets/doc/CV.pdf' | relative_url }}" target="_blank" rel="noopener noreferrer"><span lang="en">View CV</span><span lang="zh-Hant">查看履歷</span></a>
            <a class="btn btn-secondary" href="mailto:kklb1716@gmail.com"><span lang="en">Email me</span><span lang="zh-Hant">寄信給我</span></a>
          </div>
          <ul class="hero-social">
            <li><a class="icon-btn" href="https://github.com/ouotingwei" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fa-brands fa-github" aria-hidden="true"></i></a></li>
            <li><a class="icon-btn" href="https://www.linkedin.com/in/tingweiouo/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i></a></li>
            <li><a class="icon-btn" href="https://www.youtube.com/@weiweiwei-2001" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fa-brands fa-youtube" aria-hidden="true"></i></a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</header>

<!-- ===== 自我介紹 ===== -->
<div class="container bio">
  <div lang="en">
    <p>Hi! I’m Wade, a Master’s student in Robotics at <a href="https://www.nycu.edu.tw/nycu/en/index">National Yang Ming Chiao Tung University (NYCU)</a>, advised by <a href="https://robotics.nycu.edu.tw/tw/teachers/show.php?num=14&amp;page=2">Prof. Kuu-Young Young</a> in the Human and Machine Lab. I received my B.S. in Mechanical Engineering from NYCU in 2023. I have also worked as a Research Intern with the Self-Driving Car Team at the <a href="https://www.itri.org.tw/english/index.aspx">ITRI</a> Mechanical and Mechatronics Systems Research Laboratories (MMSL), supervised by <a href="https://sites.google.com/site/chiehchihbobwang/home?authuser=0">Prof. Chieh-Chih Wang</a> and Dr. Victor Lu.</p>
    <p>My research focuses on efficient and robust robot perception, particularly localization and mapping. I believe good research ideas often come from the corner cases that real-world deployment exposes, and that a system is only as useful as its ability to keep working when those cases occur.</p>
    <p>I expect to graduate in February 2027 and am looking for PhD positions. Feel free to reach out!</p>
  </div>
  <div lang="zh-Hant">
    <p>嗨！我是 Wade，目前就讀<a href="https://www.nycu.edu.tw/">國立陽明交通大學（NYCU）</a>機器人碩士學位學程，在人機實驗室（Human and Machine Lab）由<a href="https://robotics.nycu.edu.tw/tw/teachers/show.php?num=14&amp;page=2">楊谷洋教授</a>指導。我於 2023 年取得陽明交大機械工程學系學士學位，也曾在<a href="https://www.itri.org.tw/">工研院</a>機械與機電系統研究所（MMSL）的自駕車團隊擔任研究實習生，由<a href="https://sites.google.com/site/chiehchihbobwang/home?authuser=0">王傑智教授</a>與 Victor Lu 博士指導。</p>
    <p>我的研究聚焦於高效且穩健的機器人感知，特別是定位與建圖。我相信好的研究想法，往往來自實際部署時才會暴露出的極端情況；而一個系統真正的價值，在於這些情況發生時，它還能不能持續運作。</p>
    <p>我預計於 2027 年 2 月畢業，目前正在尋找博士班機會，歡迎與我聯繫！</p>
  </div>
</div>

<!-- ===== News（內容來自 _data/news.yml） ===== -->
<section class="band band-gray" id="news">
  <div class="container">
    <h2 class="section-title"><span lang="en">News</span><span lang="zh-Hant">最新消息</span></h2>
    <ol class="news">
      {% for item in site.data.news limit:5 %}
      {% if item.text_zh %}
        {% capture news_text %}<span lang="en">{{ item.text }}</span><span lang="zh-Hant">{{ item.text_zh }}</span>{% endcapture %}
      {% else %}
        {% assign news_text = item.text %}
      {% endif %}
      <li class="news-item">
        <span class="news-date">{{ item.date }}</span>
        <span class="news-text">{% if item.link %}<a href="{{ item.link }}" target="_blank" rel="noopener noreferrer">{{ news_text }}</a>{% else %}{{ news_text }}{% endif %}</span>
      </li>
      {% endfor %}
    </ol>
  </div>
</section>

<!-- ===== Research ===== -->
<section class="band" id="research">
  <div class="container">
    <h2 class="section-title"><span lang="en">Research</span><span lang="zh-Hant">研究</span></h2>

    <h3 class="subsection-title"><span lang="en">Publications</span><span lang="zh-Hant">論文發表</span></h3>

    <!-- Desc++ -->
    <article class="feature">
      <div class="feature-media">
        <video src="assets/video/descpp.mp4" autoplay muted loop playsinline preload="metadata" aria-label="Desc++ demo"></video>
      </div>
      <div class="feature-body">
        <h4 class="feature-title">Desc++: Efficient Descriptor Enhancement for Data Association in Existing Visual SLAM Systems</h4>
        <p class="feature-authors"><span class="me">Ting-Wei Ou</span>, H.T. Lin, and Kuu-Young Young</p>
        <p class="feature-venue">IEEE Access, 2026</p>
        <div class="pills">
          <a class="pill" href="https://arxiv.org/abs/2607.11099" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-file-lines" aria-hidden="true"></i>arXiv</a>
          <a class="pill" href="https://github.com/ouotingwei/DescPP.git" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i>GitHub</a>
          <a class="pill" href="https://ouotingwei.github.io/DescPP_website" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-globe" aria-hidden="true"></i><span lang="en">Demo</span><span lang="zh-Hant">展示網站</span></a>
        </div>
      </div>
    </article>

    <!-- SMC 2025 -->
    <article class="feature">
      <div class="feature-media">
        <video src="assets/video/hotspot.mp4" autoplay muted loop playsinline preload="metadata" aria-label="Disinfection robot demo"></video>
      </div>
      <div class="feature-body">
        <h4 class="feature-title">Development of an Autonomous Mobile Robotic System for Efficient and Precise Disinfection</h4>
        <p class="feature-authors"><span class="me">Ting-Wei Ou</span>, J.H. Jiang, G.L. Huang, and Kuu-Young Young</p>
        <p class="feature-venue">IEEE International Conference on Systems, Man, and Cybernetics (SMC), Oct 2025, Vienna, Austria</p>
        <div class="pills">
          <a class="pill" href="https://arxiv.org/abs/2507.11270" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-file-lines" aria-hidden="true"></i>arXiv</a>
          <a class="pill" href="https://www.youtube.com/watch?v=wHcWzOcoMPM" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube" aria-hidden="true"></i><span lang="en">Video</span><span lang="zh-Hant">影片</span></a>
        </div>
      </div>
    </article>

    <h3 class="subsection-title"><span lang="en">Articles</span><span lang="zh-Hant">文章</span></h3>

    <!-- Scientific American -->
    <article class="feature">
      <div class="feature-media">
        <img src="assets/pic/ai_assistant.jpg" loading="lazy" alt="Scientific American article pages">
      </div>
      <div class="feature-body">
        <h4 class="feature-title">Creating an AI Assistant for Industrial Robots</h4>
        <p class="feature-authors">J.Y. Long, Yu Wang, <span class="me">Ting-Wei Ou</span>, and Kuu-Young Young</p>
        <p class="feature-venue">Scientific American (Taiwan Edition), May 2024</p>
        <div class="pills">
          <a class="pill" href="https://www.scitw.cc/posts/AI-Robit" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-newspaper" aria-hidden="true"></i><span lang="en">Article</span><span lang="zh-Hant">閱讀文章</span></a>
        </div>
      </div>
    </article>
  </div>
</section>

<!-- ===== Projects ===== -->
<section class="band band-gray" id="projects">
  <div class="container">
    <h2 class="section-title"><span lang="en">Side projects</span><span lang="zh-Hant">其他專案</span></h2>

    <div class="tiles">
      <!-- ORB+FeatureBooster -->
      <article class="tile">
        <div class="tile-media">
          <video src="assets/video/orb_fb.mp4" autoplay muted loop playsinline preload="metadata" aria-label="ORB-SLAM + FeatureBooster demo"></video>
        </div>
        <div class="tile-body">
          <h3 class="tile-title">ORB-SLAM + FeatureBooster</h3>
          <p class="tile-desc">
            <span lang="en">This project integrates ORB-SLAM2 with FeatureBooster to enhance feature matching ability. We also implemented model quantization to reduce memory footprint for edge GPUs.</span>
            <span lang="zh-Hant">本專案將 ORB-SLAM2 與 FeatureBooster 整合，以提升特徵匹配能力；我們也實作了模型量化，降低在邊緣 GPU 上的記憶體用量。</span>
          </p>
          <div class="pills">
            <a class="pill" href="https://github.com/ouotingwei/ORB-SLAM2-FeatureBooster" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i>GitHub</a>
            <a class="pill" href="https://www.youtube.com/watch?v=GHhYdiVRHz4" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube" aria-hidden="true"></i>YouTube</a>
          </div>
        </div>
      </article>

      <!-- MAVIS -->
      <article class="tile">
        <div class="tile-media">
          <video src="assets/video/mavis.mp4" autoplay muted loop playsinline preload="metadata" aria-label="Multi-camera ORB-SLAM3 demo"></video>
        </div>
        <div class="tile-body">
          <h3 class="tile-title"><span lang="en">Extended Multi-camera ORB-SLAM3</span><span lang="zh-Hant">多相機擴充版 ORB-SLAM3</span></h3>
          <p class="tile-desc">
            <span lang="en">Implementation of MAVIS-SLAM with ROS integration, enhancing robustness in challenging scenarios such as camera occlusion and severe illumination changes.</span>
            <span lang="zh-Hant">實作 MAVIS-SLAM 並整合 ROS，提升系統在相機遮擋、劇烈光照變化等困難情境下的穩健性。</span>
          </p>
          <div class="pills">
            <a class="pill" href="https://github.com/ouotingwei/mavis_ros.git" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i>GitHub</a>
            <a class="pill" href="https://www.youtube.com/watch?v=Ie2tCVeXMDU" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube" aria-hidden="true"></i>YouTube</a>
          </div>
        </div>
      </article>

      <!-- PPO -->
      <article class="tile">
        <div class="tile-media">
          <video src="assets/video/ppo.mp4" autoplay muted loop playsinline preload="metadata" aria-label="RL racing car demo"></video>
        </div>
        <div class="tile-body">
          <h3 class="tile-title"><span lang="en">Reinforcement Learning-based FPV Racing Car</span><span lang="zh-Hant">以強化學習控制的 FPV 賽車</span></h3>
          <p class="tile-desc">
            <span lang="en">Implemented Proximal Policy Optimization (PPO) to learn an end-to-end control policy. The agent learns to navigate directly from raw image inputs.</span>
            <span lang="zh-Hant">以近端策略最佳化（PPO）學習端到端的控制策略，讓代理人直接從原始影像輸入學會導航。</span>
          </p>
        </div>
      </article>

      <!-- Undergraduate project -->
      <article class="tile">
        <div class="tile-media">
          <video src="assets/video/undergraduate_rpoject.mp4" autoplay muted loop playsinline preload="metadata" aria-label="Visual SLAM in dynamic environments demo"></video>
        </div>
        <div class="tile-body">
          <h3 class="tile-title"><span lang="en">Visual SLAM in Dynamic Environments</span><span lang="zh-Hant">動態環境中的視覺 SLAM</span></h3>
          <p class="tile-desc">
            <span lang="en">I mentored undergraduate students (2025) on a project to improve the robustness of Visual SLAM in dynamic scenes. We integrated YOLOv8 semantic segmentation into ORB-SLAM2 to detect and remove feature points on moving objects, particularly humans, thereby reducing their adverse impact on front-end camera pose estimation.</span>
            <span lang="zh-Hant">我在 2025 年指導大學部學生進行這個專案，目標是提升視覺 SLAM 在動態場景中的穩健性。我們將 YOLOv8 語意分割整合進 ORB-SLAM2，偵測並移除移動物體（特別是行人）上的特徵點，降低它們對前端相機位姿估測的負面影響。</span>
          </p>
        </div>
      </article>

      <!-- HL Project -->
      <article class="tile">
        <div class="tile-media media--contain">
          <video src="assets/video/hl.mp4" autoplay muted loop playsinline preload="metadata" aria-label="Plasma spraying system demo"></video>
        </div>
        <div class="tile-body">
          <h3 class="tile-title"><span lang="en">Development of an Autonomous Plasma Spraying System</span><span lang="zh-Hant">自動化電漿噴塗系統開發</span></h3>
          <p class="tile-desc">
            <span lang="en">This project was developed during my time as a System Development Engineer at Hong Lang Technology Co., Ltd. The goal was to build an automated plasma-spraying system. The work involved surface reconstruction, robotic arm path planning, and user I/O interface and visualization.</span>
            <span lang="zh-Hant">這是我在 Hong Lang Technology Co., Ltd. 擔任系統開發工程師期間的專案，目標是打造一套自動化電漿噴塗系統。工作內容包含曲面重建、機械手臂路徑規劃，以及使用者 I/O 介面與視覺化。</span>
          </p>
          <!-- <div class="pills">
            <a class="pill" href="https://www.youtube.com/watch?v=sccCDnw98aE" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube" aria-hidden="true"></i>YouTube</a>
          </div> -->
        </div>
      </article>

      <!-- iTron -->
      <article class="tile">
        <div class="tile-media">
          <video src="assets/video/itron.mp4" autoplay muted loop playsinline preload="metadata" aria-label="TDK Robocon robot demo"></video>
        </div>
        <div class="tile-body">
          <h3 class="tile-title"><span lang="en">Development of a Mobile Robot Platform for TDK Robocon</span><span lang="zh-Hant">TDK 盃機器人競賽移動平台開發</span></h3>
          <p class="tile-desc">
            <span lang="en">During my time with the NYCU iTron Robotics Team, our group developed a robot capable of autonomous navigation, basketball shooting, and bowling. I was responsible for LiDAR localization and chassis control.</span>
            <span lang="zh-Hant">在陽明交大 iTron 機器人隊期間，我們團隊開發了一台能自主導航、投籃與打保齡球的機器人，我負責光達定位與底盤控制。</span>
          </p>
          <div class="pills">
            <a class="pill" href="https://github.com/ouotingwei/autonomous-basketball-and-bowling-vehicle.git" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i>GitHub</a>
            <a class="pill" href="https://www.youtube.com/watch?v=ZmdiB1q2GPI" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube" aria-hidden="true"></i>YouTube</a>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>

<!-- ===== Experience ===== -->
<section class="band" id="experience">
  <div class="container">
    <h2 class="section-title"><span lang="en">Experience</span><span lang="zh-Hant">經歷</span></h2>

    <h3 class="subsection-title"><span lang="en">Education</span><span lang="zh-Hant">學歷</span></h3>
    <div class="timeline">
      <div class="tl-item">
        <span class="tl-date">2023 – <span lang="en">Present</span><span lang="zh-Hant">至今</span> <span class="badge"><span lang="en">Current</span><span lang="zh-Hant">目前</span></span></span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">National Yang Ming Chiao Tung University (NYCU)</span><span lang="zh-Hant">國立陽明交通大學（NYCU）</span></span>
          <span class="tl-role"><span lang="en">Graduate Degree Program of Robotics</span><span lang="zh-Hant">機器人碩士學位學程</span></span>
          <span class="tl-note"><span lang="en">formerly National Chiao Tung University (NCTU)</span><span lang="zh-Hant">前身為國立交通大學（NCTU）</span></span>
        </div>
        <img class="tl-logo" src="assets/pic/nycu.png" loading="lazy" alt="NYCU">
      </div>

      <div class="tl-item">
        <span class="tl-date">2019 – 2023</span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">National Yang Ming Chiao Tung University (NYCU)</span><span lang="zh-Hant">國立陽明交通大學（NYCU）</span></span>
          <span class="tl-role"><span lang="en">Bachelor of Science in Mechanical Engineering</span><span lang="zh-Hant">機械工程學系 學士</span></span>
          <span class="tl-note"><span lang="en">formerly National Chiao Tung University (NCTU)</span><span lang="zh-Hant">前身為國立交通大學（NCTU）</span></span>
        </div>
        <img class="tl-logo" src="assets/pic/nycu.png" loading="lazy" alt="NYCU">
      </div>
    </div>

    <h3 class="subsection-title"><span lang="en">Industry experience &amp; services</span><span lang="zh-Hant">業界經歷與服務</span></h3>
    <div class="timeline">
      <div class="tl-item">
        <span class="tl-date">2026 – <span lang="en">Present</span><span lang="zh-Hant">至今</span> <span class="badge"><span lang="en">Current</span><span lang="zh-Hant">目前</span></span></span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">Industrial Technology Research Institute (ITRI) – MMSL</span><span lang="zh-Hant">工業技術研究院（ITRI）機械與機電系統研究所</span></span>
          <span class="tl-role"><span lang="en">Intern</span><span lang="zh-Hant">實習生</span></span>
          <span class="tl-desc"><span lang="en">Integrating learning-based point cloud registration into a production HD mapping pipeline to improve robustness over classical scan matching in challenging environments.</span><span lang="zh-Hant">將基於學習的點雲對位方法整合進實際運作中的高精地圖建置流程，在困難環境中取得比傳統掃描匹配更好的穩健性。</span></span>
        </div>
      </div>

      <div class="tl-item">
        <span class="tl-date">2023 – 2024</span>
        <div class="tl-body">
          <span class="tl-org">Hong Lang Technology Co., Ltd.</span>
          <span class="tl-role"><span lang="en">Automation System Development Engineer</span><span lang="zh-Hant">自動化系統開發工程師</span></span>
          <span class="tl-desc"><span lang="en">Developed automated machinery systems to modernize traditional footwear manufacturing processes for industrial-scale production.</span><span lang="zh-Hant">開發自動化機械系統，推動傳統製鞋流程現代化，以達到工業規模的量產。</span></span>
        </div>
      </div>

      <div class="tl-item">
        <span class="tl-date">2020 – 2021</span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">NYCU iTron Robotics Team</span><span lang="zh-Hant">陽明交大 iTron 機器人隊</span></span>
          <span class="tl-role"><span lang="en">Team Leader</span><span lang="zh-Hant">隊長</span></span>
          <span class="tl-desc"><span lang="en">Led the design, software-hardware integration, and competition deployment of customized robotic platforms.</span><span lang="zh-Hant">帶領客製化機器人平台的設計、軟硬體整合與競賽部署。</span></span>
        </div>
      </div>
    </div>

    <h3 class="subsection-title"><span lang="en">Teaching experience</span><span lang="zh-Hant">教學經歷</span></h3>
    <div class="timeline">
      <div class="tl-item">
        <span class="tl-date"><span lang="en">Spring 2025</span><span lang="zh-Hant">2025 春季</span></span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">NYCU</span><span lang="zh-Hant">陽明交大</span></span>
          <span class="tl-role"><span lang="en">Teaching Assistant, 535311: Robotics</span><span lang="zh-Hant">助教，535311：機器人學</span></span>
        </div>
      </div>
    </div>

    <!-- Honors and Scholarships（已改成新版樣式，要顯示時把註解拿掉即可）
    <h3 class="subsection-title"><span lang="en">Honors and scholarships</span><span lang="zh-Hant">榮譽與獎學金</span></h3>
    <div class="timeline">
      <div class="tl-item">
        <span class="tl-date">2026</span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">NYCU</span><span lang="zh-Hant">陽明交大</span></span>
          <span class="tl-role"><span lang="en">Graduate Research Scholarship (NYCU Robotics)</span><span lang="zh-Hant">研究生研究獎學金（陽明交大機器人學程）</span></span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2025</span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">NYCU</span><span lang="zh-Hant">陽明交大</span></span>
          <span class="tl-role"><span lang="en">NSTC Graduate Student International Conference Travel Grant</span><span lang="zh-Hant">國科會補助研究生出席國際學術會議</span></span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2025</span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">NYCU</span><span lang="zh-Hant">陽明交大</span></span>
          <span class="tl-role"><span lang="en">Graduate Research Scholarship (NYCU Robotics)</span><span lang="zh-Hant">研究生研究獎學金（陽明交大機器人學程）</span></span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2024</span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">NYCU</span><span lang="zh-Hant">陽明交大</span></span>
          <span class="tl-role"><span lang="en">Graduate Research Scholarship (NYCU Robotics)</span><span lang="zh-Hant">研究生研究獎學金（陽明交大機器人學程）</span></span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2023</span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">NYCU</span><span lang="zh-Hant">陽明交大</span></span>
          <span class="tl-role"><span lang="en">Master's Program Entrance Scholarship (First place)</span><span lang="zh-Hant">碩士班入學獎學金（第一名）</span></span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2021</span>
        <div class="tl-body">
          <span class="tl-org"><span lang="en">NYCU</span><span lang="zh-Hant">陽明交大</span></span>
          <span class="tl-role"><span lang="en">26th TDK Robocon: Honorable Mention (Autonomous Robotics)</span><span lang="zh-Hant">第 26 屆 TDK 盃機器人競賽 自動組佳作</span></span>
        </div>
      </div>
    </div>
    -->
  </div>
</section>

<!-- ===== More：Daily papers + 台灣時間 + 足跡地圖 ===== -->
<section class="band band-gray" id="more">
  <div class="container">
    <h2 class="section-title"><span lang="en">More</span><span lang="zh-Hant">更多</span></h2>
    <div class="more-grid">
      <!-- 左欄：Daily arXiv + 台灣時間（包成一欄，右邊地圖不受影響） -->
      <div class="more-col">
        <div class="card card-link">
          <span class="card-icon"><i class="fa-solid fa-newspaper" aria-hidden="true"></i></span>
          <h3 class="card-title"><span lang="en">Daily arXiv Digest</span><span lang="zh-Hant">每日 arXiv 論文摘要</span></h3>
          <p class="card-desc">
            <span lang="en">New robotics, SLAM and computer vision papers on arXiv, summarized every day.</span>
            <span lang="zh-Hant">每天整理 arXiv 上最新的機器人、SLAM 與電腦視覺論文摘要。</span>
          </p>
          <a class="btn btn-secondary btn-sm" href="https://ouotingwei.github.io/daily-arXiv-ai-enhanced/" target="_blank" rel="noopener noreferrer"><span lang="en">Open the digest</span><span lang="zh-Hant">開啟摘要</span></a>
        </div>

        <!-- 台灣時間時鐘：狀態文字可在頁尾 script 的 statusFor() 修改 -->
        <div class="card card-clock" id="tw-clock">
          <span class="card-icon"><i class="fa-solid fa-clock" aria-hidden="true"></i></span>
          <h3 class="card-title"><span lang="en">My local time</span><span lang="zh-Hant">我的當地時間</span></h3>
          <p class="clock-time"><span class="clock-hm">--:--</span><span class="clock-s">:--</span></p>
          <p class="clock-date">Hsinchu, Taiwan · UTC+8</p>
          <p class="clock-status"><span class="clock-dot" aria-hidden="true"></span><span class="clock-status-text">&nbsp;</span></p>
          <p class="clock-diff">&nbsp;</p>
        </div>
      </div>
      <div class="card card-map">
        <div class="card-map-head">
          <h3 class="card-title"><span lang="en">Footprints</span><span lang="zh-Hant">足跡</span></h3>
          <p class="card-desc">
            <span lang="en">Conferences, my lab, and places I've traveled. Hover or tap a dot to see a photo.</span>
            <span lang="zh-Hant">參加過的會議、我的實驗室，以及旅行去過的地方。把滑鼠移到圓點上（或點一下）就能看到照片。</span>
          </p>
        </div>
        <div id="travel-map" role="img" aria-label="World map of places I have visited"></div>
      </div>
    </div>
  </div>
</section>

<!-- ===== 台灣時間時鐘 script ===== -->
<script>
  (function () {
    var card = document.getElementById('tw-clock');
    if (!card) return;
    var root = document.documentElement;
    var hmEl = card.querySelector('.clock-hm');
    var sEl = card.querySelector('.clock-s');
    var dateEl = card.querySelector('.clock-date');
    var statusEl = card.querySelector('.clock-status-text');
    var diffEl = card.querySelector('.clock-diff');
    var TW_OFFSET_MIN = 8 * 60; // 台灣固定 UTC+8，沒有夏令時間
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var WEEK_ZH = { Sun: '週日', Mon: '週一', Tue: '週二', Wed: '週三', Thu: '週四', Fri: '週五', Sat: '週六' };
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Taipei', hourCycle: 'h23',
      weekday: 'short', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    // 依台灣時間決定狀態；想改作息或文字就改這裡
    // 回傳 [狀態, 英文, 中文]；狀態：active = 綠點（會閃）、break = 橘點、asleep = 灰點
    function statusFor(h, weekday) {
      var weekend = (weekday === 'Sat' || weekday === 'Sun');
      if (h >= 2 && h < 8) return ['asleep', 'Probably asleep. I’ll reply in the morning.', '應該在睡覺，早上會回覆。'];
      if (weekend) {
        if (h < 2)  return ['active', 'Late-night weekend coding', '週末深夜寫程式中'];
        if (h < 10) return ['asleep', 'Weekend morning, still waking up', '週末早上，還在慢慢醒來'];
        return ['break', 'Weekend. Replies may be a bit slower.', '週末，回覆可能會慢一點。'];
      }
      if (h < 2)  return ['active', 'Night-owl mode: reading papers', '夜貓模式：讀論文中'];
      if (h < 9)  return ['break', 'Starting the day', '準備開始新的一天'];
      if (h < 12) return ['active', 'Probably in the lab', '應該在實驗室'];
      if (h < 13) return ['break', 'Lunch break', '午餐時間'];
      if (h < 18) return ['active', 'Probably in the lab', '應該在實驗室'];
      if (h < 19) return ['break', 'Dinner break', '晚餐時間'];
      return ['active', 'Evening: coding and reading papers', '晚上：寫程式、讀論文'];
    }

    function diffText(zh) {
      var visitor = -new Date().getTimezoneOffset();
      var d = TW_OFFSET_MIN - visitor;
      if (d === 0) return zh ? '和你在同一個時區' : 'Same time zone as you';
      var abs = Math.abs(d), h = Math.floor(abs / 60), m = abs % 60;
      var num = h + (m ? '.' + Math.round(m / 6) : '');
      if (zh) return (d > 0 ? '比你快 ' : '比你慢 ') + num + ' 小時';
      return num + (h === 1 && !m ? ' hour' : ' hours') + (d > 0 ? ' ahead of you' : ' behind you');
    }

    function tick() {
      var zh = root.getAttribute('data-lang') === 'zh';
      var p = {};
      fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var h = parseInt(p.hour, 10) % 24;
      hmEl.textContent = (h < 10 ? '0' + h : h) + ':' + p.minute;
      sEl.textContent = ':' + p.second;
      dateEl.textContent = zh
        ? p.month + ' 月 ' + p.day + ' 日（' + WEEK_ZH[p.weekday] + '）· 台灣新竹（UTC+8）'
        : p.weekday + ', ' + MONTHS[parseInt(p.month, 10) - 1] + ' ' + p.day + ' · Hsinchu, Taiwan (UTC+8)';
      var st = statusFor(h, p.weekday);
      card.setAttribute('data-state', st[0]);
      statusEl.textContent = zh ? st[2] : st[1];
      diffEl.textContent = diffText(zh);
    }

    tick();
    setInterval(tick, 1000);
    document.addEventListener('langchange', tick);
  })();
</script>