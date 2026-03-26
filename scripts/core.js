(function () {
  const STORAGE_KEY = "summer_blog_settings_v1";
  const defaultSettings = {
    background: {
      id: "sea-video",
      type: "video",
      src: "https://cdn.coverr.co/videos/coverr-view-over-the-blue-sea-1570/1080p.mp4"
    },
    cursorSize: 40,
    trailDensity: 10,
    trailColor: "#7dd8ff",
    clickColor: "#9ad9ff",
    audio: {
      musicOn: false,
      ambientOn: false,
      musicVolume: 0.35,
      ambientVolume: 0.45
    }
  };

  const presets = [
    {
      id: "sea-video",
      label: "动态海浪",
      type: "video",
      src: "https://cdn.coverr.co/videos/coverr-view-over-the-blue-sea-1570/1080p.mp4"
    },
    {
      id: "cloud-video",
      label: "流云天空",
      type: "video",
      src: "https://cdn.coverr.co/videos/coverr-clouds-against-blue-sky-1609/1080p.mp4"
    },
    {
      id: "dusk-image",
      label: "黄昏天色",
      type: "image",
      src: "assets/images/dusk-sky.svg"
    },
    {
      id: "shore-image",
      label: "静态海景",
      type: "image",
      src: "assets/images/shoreline.svg"
    }
  ];

  function loadSettings() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!data) return structuredClone(defaultSettings);
      return {
        ...structuredClone(defaultSettings),
        ...data,
        audio: {
          ...defaultSettings.audio,
          ...(data.audio || {})
        }
      };
    } catch (err) {
      return structuredClone(defaultSettings);
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  const settings = loadSettings();
  const isMobile = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
  const dom = {
    bgVideo: document.getElementById("bg-video"),
    bgImage: document.getElementById("bg-image"),
    panel: document.getElementById("settings-panel"),
    openSettings: document.getElementById("open-settings"),
    closeSettings: document.getElementById("close-settings"),
    presetGrid: document.getElementById("preset-grid"),
    uploadBg: document.getElementById("upload-bg"),
    cursor: document.getElementById("custom-cursor"),
    fxCanvas: document.getElementById("fx-canvas"),
    cursorSize: document.getElementById("cursor-size"),
    trailDensity: document.getElementById("trail-density"),
    trailColor: document.getElementById("trail-color"),
    clickColor: document.getElementById("click-color"),
    content: document.getElementById("parallax-content"),
    musicAudio: document.getElementById("music-audio"),
    ambientAudio: document.getElementById("ambient-audio"),
    musicBtn: document.getElementById("toggle-music"),
    ambientBtn: document.getElementById("toggle-ambient"),
    musicVolume: document.getElementById("music-volume"),
    ambientVolume: document.getElementById("ambient-volume"),
    audioTip: document.getElementById("audio-tip")
  };

  function applyBackground(bg) {
    if (!dom.bgVideo || !dom.bgImage) return;
    if (bg.type === "video") {
      dom.bgVideo.src = bg.src;
      dom.bgVideo.style.display = "block";
      dom.bgImage.style.backgroundImage = "none";
      dom.bgVideo.play().catch(() => {
        dom.bgImage.style.backgroundImage =
          "linear-gradient(160deg, #75c7f1 0%, #abdff6 38%, #ffd4b4 100%)";
      });
    } else {
      dom.bgVideo.pause();
      dom.bgVideo.removeAttribute("src");
      dom.bgVideo.style.display = "none";
      dom.bgImage.style.backgroundImage = `url(${bg.src})`;
    }
  }

  function renderPresetButtons() {
    if (!dom.presetGrid) return;
    dom.presetGrid.innerHTML = "";
    presets.forEach((preset) => {
      const btn = document.createElement("button");
      btn.className = "preset-btn" + (settings.background.id === preset.id ? " active" : "");
      btn.textContent = preset.label;
      btn.addEventListener("click", () => {
        settings.background = { ...preset };
        saveSettings(settings);
        applyBackground(settings.background);
        renderPresetButtons();
      });
      dom.presetGrid.appendChild(btn);
    });
  }

  function initPanel() {
    if (!dom.panel || !dom.openSettings || !dom.closeSettings) return;
    dom.openSettings.addEventListener("click", () => {
      dom.panel.classList.add("open");
      dom.panel.setAttribute("aria-hidden", "false");
    });
    dom.closeSettings.addEventListener("click", () => {
      dom.panel.classList.remove("open");
      dom.panel.setAttribute("aria-hidden", "true");
    });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        dom.panel.classList.remove("open");
        dom.panel.setAttribute("aria-hidden", "true");
      }
    });
  }

  function initBackgroundUpload() {
    if (!dom.uploadBg) return;
    dom.uploadBg.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) {
        alert("文件较大，建议 4MB 以内，避免本地存储失败。");
        return;
      }
      const dataUrl = await fileToDataUrl(file);
      settings.background = {
        id: "user-upload",
        label: "自定义背景",
        type: file.type.startsWith("video") ? "video" : "image",
        src: dataUrl
      };
      saveSettings(settings);
      applyBackground(settings.background);
      renderPresetButtons();
    });
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function initParallax() {
    if (!dom.content || isMobile) return;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      dom.content.style.transform = `translateY(${y * 0.06}px)`;
      if (dom.bgVideo) {
        dom.bgVideo.style.transform = `translateY(${y * 0.02}px) scale(1.03)`;
      }
      if (dom.bgImage) {
        dom.bgImage.style.transform = `translateY(${y * 0.02}px) scale(1.03)`;
      }
    });
  }

  function initCursorControls() {
    if (!dom.cursorSize || !dom.trailDensity || !dom.trailColor || !dom.clickColor) return;
    dom.cursorSize.value = String(settings.cursorSize);
    dom.trailDensity.value = String(settings.trailDensity);
    dom.trailColor.value = settings.trailColor;
    dom.clickColor.value = settings.clickColor;
    updateCursorStyles();

    dom.cursorSize.addEventListener("input", () => {
      settings.cursorSize = Number(dom.cursorSize.value);
      updateCursorStyles();
      saveSettings(settings);
    });
    dom.trailDensity.addEventListener("input", () => {
      settings.trailDensity = Number(dom.trailDensity.value);
      saveSettings(settings);
    });
    dom.trailColor.addEventListener("input", () => {
      settings.trailColor = dom.trailColor.value;
      saveSettings(settings);
    });
    dom.clickColor.addEventListener("input", () => {
      settings.clickColor = dom.clickColor.value;
      saveSettings(settings);
    });
  }

  function updateCursorStyles() {
    document.documentElement.style.setProperty("--cursor-size", `${settings.cursorSize}px`);
  }

  function initCursorAndFx() {
    if (isMobile || !dom.cursor || !dom.fxCanvas) return;
    const ctx = dom.fxCanvas.getContext("2d");
    const particles = [];
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let lastEmit = 0;

    function resize() {
      dom.fxCanvas.width = window.innerWidth;
      dom.fxCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    window.addEventListener("mousemove", (ev) => {
      pointerX = ev.clientX;
      pointerY = ev.clientY;
      dom.cursor.style.left = `${pointerX}px`;
      dom.cursor.style.top = `${pointerY}px`;

      const now = performance.now();
      if (now - lastEmit > Math.max(10, 220 - settings.trailDensity * 10)) {
        particles.push(makeParticle(pointerX, pointerY, settings.trailColor, 1.2));
        lastEmit = now;
      }
    });

    window.addEventListener("click", (ev) => {
      for (let i = 0; i < 16; i += 1) {
        particles.push(makeParticle(ev.clientX, ev.clientY, settings.clickColor, 1.8, true));
      }
    });

    function tick() {
      ctx.clearRect(0, 0, dom.fxCanvas.width, dom.fxCanvas.height);
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  function makeParticle(x, y, color, speed = 1, burst = false) {
    const angle = burst ? Math.random() * Math.PI * 2 : Math.random() * 0.9 + Math.PI * 0.55;
    const mag = (Math.random() * 1.2 + 0.4) * speed;
    return {
      x,
      y,
      vx: Math.cos(angle) * mag,
      vy: Math.sin(angle) * mag,
      radius: Math.random() * 2.2 + 1,
      life: Math.random() * 0.45 + 0.45,
      color
    };
  }

  function initAudio() {
    if (
      !dom.musicAudio ||
      !dom.ambientAudio ||
      !dom.musicBtn ||
      !dom.ambientBtn ||
      !dom.musicVolume ||
      !dom.ambientVolume
    ) {
      return;
    }

    dom.musicVolume.value = String(settings.audio.musicVolume);
    dom.ambientVolume.value = String(settings.audio.ambientVolume);
    dom.musicAudio.volume = settings.audio.musicVolume;
    dom.ambientAudio.volume = settings.audio.ambientVolume;
    refreshAudioButtons();

    let unlocked = false;
    const unlock = () => {
      unlocked = true;
      if (settings.audio.musicOn) playSafe(dom.musicAudio);
      if (settings.audio.ambientOn) playSafe(dom.ambientAudio);
      if (dom.audioTip) {
        dom.audioTip.textContent = "音频已解锁，可随时开关与调节音量。";
      }
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });

    dom.musicBtn.addEventListener("click", () => {
      settings.audio.musicOn = !settings.audio.musicOn;
      if (settings.audio.musicOn) {
        if (!unlocked) {
          if (dom.audioTip) dom.audioTip.textContent = "请先点击页面任意位置解锁音频播放。";
        } else {
          playSafe(dom.musicAudio);
        }
      } else {
        dom.musicAudio.pause();
      }
      refreshAudioButtons();
      saveSettings(settings);
    });

    dom.ambientBtn.addEventListener("click", () => {
      settings.audio.ambientOn = !settings.audio.ambientOn;
      if (settings.audio.ambientOn) {
        if (!unlocked) {
          if (dom.audioTip) dom.audioTip.textContent = "请先点击页面任意位置解锁音频播放。";
        } else {
          playSafe(dom.ambientAudio);
        }
      } else {
        dom.ambientAudio.pause();
      }
      refreshAudioButtons();
      saveSettings(settings);
    });

    dom.musicVolume.addEventListener("input", () => {
      settings.audio.musicVolume = Number(dom.musicVolume.value);
      dom.musicAudio.volume = settings.audio.musicVolume;
      saveSettings(settings);
    });

    dom.ambientVolume.addEventListener("input", () => {
      settings.audio.ambientVolume = Number(dom.ambientVolume.value);
      dom.ambientAudio.volume = settings.audio.ambientVolume;
      saveSettings(settings);
    });

    dom.musicAudio.addEventListener("error", () => {
      if (dom.audioTip) dom.audioTip.textContent = "未找到音乐文件：assets/audio/bgm.mp3。";
    });
    dom.ambientAudio.addEventListener("error", () => {
      if (dom.audioTip) dom.audioTip.textContent = "未找到环境音文件：assets/audio/ambient.mp3。";
    });
  }

  function playSafe(audioEl) {
    audioEl.play().catch(() => {
      if (dom.audioTip) dom.audioTip.textContent = "浏览器阻止了自动播放，请再次点击按钮。";
    });
  }

  function refreshAudioButtons() {
    dom.musicBtn.textContent = settings.audio.musicOn ? "暂停音乐" : "播放音乐";
    dom.ambientBtn.textContent = settings.audio.ambientOn ? "暂停环境音" : "播放环境音";
  }

  function init() {
    applyBackground(settings.background);
    renderPresetButtons();
    initPanel();
    initBackgroundUpload();
    initParallax();
    initCursorControls();
    initCursorAndFx();
    initAudio();
  }

  window.SummerBlogCore = {
    settings,
    saveSettings,
    loadSettings,
    presets
  };

  init();
})();