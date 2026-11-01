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
-->

<header class="hero">
  <div class="container hero-inner">
    <img class="hero-photo" src="{{ site.logo | relative_url }}" alt="Portrait of {{ site.title }}" width="168" height="168">
    <h1 class="hero-title">{{ site.title }}</h1>
    <p class="hero-subtitle">{{ site.description }}</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="{{ '/assets/doc/CV.pdf' | relative_url }}" target="_blank" rel="noopener noreferrer">View CV</a>
      <a class="btn btn-secondary" href="mailto:kklb1716@gmail.com">Email me</a>
    </div>
    <ul class="hero-social">
      <li><a class="icon-btn" href="https://github.com/ouotingwei" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fa-brands fa-github" aria-hidden="true"></i></a></li>
      <li><a class="icon-btn" href="https://www.linkedin.com/in/tingweiouo/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i></a></li>
      <li><a class="icon-btn" href="https://www.youtube.com/@weiweiwei-2001" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fa-brands fa-youtube" aria-hidden="true"></i></a></li>
    </ul>
  </div>
</header>

<div class="container bio" markdown="1">

Hi! I’m Wade, a Master’s student in Robotics at [National Yang Ming Chiao Tung University (NYCU)](https://www.nycu.edu.tw/nycu/en/index), advised by [Prof. Kuu-Young Young](https://robotics.nycu.edu.tw/tw/teachers/show.php?num=14&page=2) in the Human and Machine Lab. I received my B.S. in Mechanical Engineering from NYCU in 2023. I have also worked as a Research Intern with the Self-Driving Car Team at the [ITRI](https://www.itri.org.tw/english/index.aspx) Mechanical and Mechatronics Systems Research Laboratories (MMSL), supervised by [Prof. Chieh-Chih Wang](https://sites.google.com/site/chiehchihbobwang/home?authuser=0) and Dr. Victor Lu.

My research focuses on efficient and robust robot perception, particularly localization and mapping. I believe good research ideas often come from the corner cases that real-world deployment exposes, and that a system is only as useful as its ability to keep working when those cases occur.

I expect to graduate in February 2027 and am looking for PhD positions. Feel free to reach out!

</div>

<!-- ===== News（內容來自 _data/news.yml） ===== -->
<section class="band band-gray" id="news">
  <div class="container">
    <h2 class="section-title">News</h2>
    <ol class="news">
      {% for item in site.data.news limit:5 %}
      <li class="news-item">
        <span class="news-date">{{ item.date }}</span>
        <span class="news-text">{% if item.link %}<a href="{{ item.link }}" target="_blank" rel="noopener noreferrer">{{ item.text }}</a>{% else %}{{ item.text }}{% endif %}</span>
      </li>
      {% endfor %}
    </ol>
  </div>
</section>

<!-- ===== Research ===== -->
<section class="band" id="research">
  <div class="container">
    <h2 class="section-title">Research</h2>

    <h3 class="subsection-title">Publications</h3>

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
          <a class="pill" href="https://ouotingwei.github.io/DescPP_website" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-globe" aria-hidden="true"></i>Demo</a>
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
          <a class="pill" href="https://www.youtube.com/watch?v=wHcWzOcoMPM" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube" aria-hidden="true"></i>Video</a>
        </div>
      </div>
    </article>

    <h3 class="subsection-title">Articles</h3>

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
          <a class="pill" href="https://www.scitw.cc/posts/AI-Robit" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-newspaper" aria-hidden="true"></i>Article</a>
        </div>
      </div>
    </article>
  </div>
</section>

<!-- ===== Projects ===== -->
<section class="band band-gray" id="projects">
  <div class="container">
    <h2 class="section-title">Side projects</h2>

    <div class="tiles">
      <!-- ORB+FeatureBooster -->
      <article class="tile">
        <div class="tile-media">
          <video src="assets/video/orb_fb.mp4" autoplay muted loop playsinline preload="metadata" aria-label="ORB-SLAM + FeatureBooster demo"></video>
        </div>
        <div class="tile-body">
          <h3 class="tile-title">ORB-SLAM + FeatureBooster</h3>
          <p class="tile-desc">This project integrates ORB-SLAM2 with FeatureBooster to enhance feature matching ability. We also implemented model quantization to reduce memory footprint for edge GPUs.</p>
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
          <h3 class="tile-title">Extended Multi-camera ORB-SLAM3</h3>
          <p class="tile-desc">Implementation of MAVIS-SLAM with ROS integration, enhancing robustness in challenging scenarios such as camera occlusion and severe illumination changes.</p>
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
          <h3 class="tile-title">Reinforcement Learning-based FPV Racing Car</h3>
          <p class="tile-desc">Implemented Proximal Policy Optimization (PPO) to learn an end-to-end control policy. The agent learns to navigate directly from raw image inputs.</p>
        </div>
      </article>

      <!-- Undergraduate project -->
      <article class="tile">
        <div class="tile-media">
          <video src="assets/video/undergraduate_rpoject.mp4" autoplay muted loop playsinline preload="metadata" aria-label="Visual SLAM in dynamic environments demo"></video>
        </div>
        <div class="tile-body">
          <h3 class="tile-title">Visual SLAM in Dynamic Environments</h3>
          <p class="tile-desc">I mentored undergraduate students (2025) on a project to improve the robustness of Visual SLAM in dynamic scenes. We integrated YOLOv8 semantic segmentation into ORB-SLAM2 to detect and remove feature points on moving objects, particularly humans, thereby reducing their adverse impact on front-end camera pose estimation.</p>
        </div>
      </article>

      <!-- HL Project -->
      <article class="tile">
        <div class="tile-media media--contain">
          <video src="assets/video/hl.mp4" autoplay muted loop playsinline preload="metadata" aria-label="Plasma spraying system demo"></video>
        </div>
        <div class="tile-body">
          <h3 class="tile-title">Development of an Autonomous Plasma Spraying System</h3>
          <p class="tile-desc">This project was developed during my time as a System Development Engineer at Hong Lang Technology Co., Ltd. The goal was to build an automated plasma-spraying system. The work involved surface reconstruction, robotic arm path planning, and user I/O interface and visualization.</p>
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
          <h3 class="tile-title">Development of a Mobile Robot Platform for TDK Robocon</h3>
          <p class="tile-desc">During my time with the NYCU iTron Robotics Team, our group developed a robot capable of autonomous navigation, basketball shooting, and bowling. I was responsible for LiDAR localization and chassis control.</p>
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
    <h2 class="section-title">Experience</h2>

    <h3 class="subsection-title">Education</h3>
    <div class="timeline">
      <div class="tl-item">
        <span class="tl-date">2023 – Present <span class="badge">Current</span></span>
        <div class="tl-body">
          <span class="tl-org">National Yang Ming Chiao Tung University (NYCU)</span>
          <span class="tl-role">Graduate Degree Program of Robotics</span>
          <span class="tl-note">formerly National Chiao Tung University (NCTU)</span>
        </div>
        <img class="tl-logo" src="assets/pic/nycu.png" loading="lazy" alt="NYCU">
      </div>

      <div class="tl-item">
        <span class="tl-date">2019 – 2023</span>
        <div class="tl-body">
          <span class="tl-org">National Yang Ming Chiao Tung University (NYCU)</span>
          <span class="tl-role">Bachelor of Science in Mechanical Engineering</span>
          <span class="tl-note">formerly National Chiao Tung University (NCTU)</span>
        </div>
        <img class="tl-logo" src="assets/pic/nycu.png" loading="lazy" alt="NYCU">
      </div>
    </div>

    <h3 class="subsection-title">Industry experience &amp; services</h3>
    <div class="timeline">
      <div class="tl-item">
        <span class="tl-date">2026 – Present <span class="badge">Current</span></span>
        <div class="tl-body">
          <span class="tl-org">Industrial Technology Research Institute (ITRI) – MMSL</span>
          <span class="tl-role">Intern</span>
          <span class="tl-desc">Integrating learning-based point cloud registration into a production HD mapping pipeline to improve robustness over classical scan matching in challenging environments.</span>
        </div>
      </div>

      <div class="tl-item">
        <span class="tl-date">2023 – 2024</span>
        <div class="tl-body">
          <span class="tl-org">Hong Lang Technology Co., Ltd.</span>
          <span class="tl-role">Automation System Development Engineer</span>
          <span class="tl-desc">Developed automated machinery systems to modernize traditional footwear manufacturing processes for industrial-scale production.</span>
        </div>
      </div>

      <div class="tl-item">
        <span class="tl-date">2020 – 2021</span>
        <div class="tl-body">
          <span class="tl-org">NYCU iTron Robotics Team</span>
          <span class="tl-role">Team Leader</span>
          <span class="tl-desc">Led the design, software-hardware integration, and competition deployment of customized robotic platforms.</span>
        </div>
      </div>
    </div>

    <h3 class="subsection-title">Teaching experience</h3>
    <div class="timeline">
      <div class="tl-item">
        <span class="tl-date">Spring 2025</span>
        <div class="tl-body">
          <span class="tl-org">NYCU</span>
          <span class="tl-role">Teaching Assistant, 535311: Robotics</span>
        </div>
      </div>
    </div>

    <!-- Honors and Scholarships（已改成新版樣式，要顯示時把註解拿掉即可）
    <h3 class="subsection-title">Honors and scholarships</h3>
    <div class="timeline">
      <div class="tl-item">
        <span class="tl-date">2026</span>
        <div class="tl-body">
          <span class="tl-org">NYCU</span>
          <span class="tl-role">Graduate Research Scholarship (NYCU Robotics)</span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2025</span>
        <div class="tl-body">
          <span class="tl-org">NYCU</span>
          <span class="tl-role">NSTC Graduate Student International Conference Travel Grant</span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2025</span>
        <div class="tl-body">
          <span class="tl-org">NYCU</span>
          <span class="tl-role">Graduate Research Scholarship (NYCU Robotics)</span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2024</span>
        <div class="tl-body">
          <span class="tl-org">NYCU</span>
          <span class="tl-role">Graduate Research Scholarship (NYCU Robotics)</span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2023</span>
        <div class="tl-body">
          <span class="tl-org">NYCU</span>
          <span class="tl-role">Master's Program Entrance Scholarship (First place)</span>
        </div>
      </div>
      <div class="tl-item">
        <span class="tl-date">2021</span>
        <div class="tl-body">
          <span class="tl-org">NYCU</span>
          <span class="tl-role">26th TDK Robocon: Honorable Mention (Autonomous Robotics)</span>
        </div>
      </div>
    </div>
    -->
  </div>
</section>

<!-- ===== More：Daily papers + 足跡地圖 ===== -->
<section class="band band-gray" id="more">
  <div class="container">
    <h2 class="section-title">More</h2>
    <div class="more-grid">
      <div class="card card-link">
        <span class="card-icon"><i class="fa-solid fa-newspaper" aria-hidden="true"></i></span>
        <h3 class="card-title">Daily arXiv Digest</h3>
        <p class="card-desc">New robotics, SLAM and computer vision papers on arXiv, summarized every day.</p>
        <a class="btn btn-secondary btn-sm" href="https://ouotingwei.github.io/daily-arXiv-ai-enhanced/" target="_blank" rel="noopener noreferrer">Open the digest</a>
      </div>
      <div class="card card-map">
        <div class="card-map-head">
          <h3 class="card-title">Footprints</h3>
          <p class="card-desc">Conferences, my lab, and places I've traveled. Hover or tap a dot to see a photo.</p>
        </div>
        <div id="travel-map" role="img" aria-label="World map of places I have visited"></div>
      </div>
    </div>
  </div>
</section>
