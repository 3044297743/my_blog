(function () {
    const STORAGE_KEY = "summer_blog_settings_v1";
    const presets = [
        {
            id: "summer-pockets",
            label: "summer pockets",
            type: "image",
            src: "assets/images/__sys_tm_bg01c.png"
        },
        {
            id: "water-sky",
            label: "水天一色",
            type: "image",
            src: "assets/images/__sys_tm_bg05.png"
        }
    ];

    const defaultSettings = {
        background: {
            ...presets[0]
        },
        cursorSize: 40,
        trailDensity: 10,
        trailColor: "#7dd8ff",
        clickColor: "#9ad9ff",
        audio: {
            musicOn: false,
            musicVolume: 0.35,
            dockCollapsed: false
        }
    };

    function normalizeBackground(background) {
        if (!background || !background.id) {
            return { ...presets[0] };
        }

        // 兼容旧版本的视频预设，自动迁移到新的静态图默认项。
        if (background.id === "sea-video" || background.id === "cloud-video") {
            return { ...presets[0] };
        }

        const matchedPreset = presets.find((preset) => preset.id === background.id);
        if (matchedPreset) {
            return { ...matchedPreset };
        }

        return background;
    }

    function loadSettings() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (!data) return structuredClone(defaultSettings);
            const merged = {
                ...structuredClone(defaultSettings),
                ...data,
                audio: {
                    ...defaultSettings.audio,
                    ...(data.audio || {})
                }
            };

            merged.background = normalizeBackground(merged.background);
            return merged;
        } catch (err) {
            return structuredClone(defaultSettings);
        }
    }

    function saveSettings(settings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    const settings = loadSettings();
    const isMobile = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPowerDevice =
        (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) ||
        (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4);
    const shouldReduceEffects = isMobile || prefersReducedMotion || lowPowerDevice;
    const dom = {
        bgLayer: document.getElementById("bg-layer"),
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
        audioDock: document.getElementById("audio-dock"),
        audioDockToggle: document.getElementById("audio-dock-toggle"),
        musicAudio: document.getElementById("music-audio"),
        musicBtn: document.getElementById("toggle-music"),
        musicVolume: document.getElementById("music-volume"),
        audioTip: document.getElementById("audio-tip")
    };

    function syncBackgroundLayerHeight() {
        if (!dom.bgLayer) return;
        const doc = document.documentElement;
        const body = document.body;
        const pageHeight = Math.max(
            window.innerHeight,
            doc?.scrollHeight || 0,
            body?.scrollHeight || 0,
            doc?.offsetHeight || 0,
            body?.offsetHeight || 0
        );
        dom.bgLayer.style.height = `${pageHeight}px`;
    }

    function initBackgroundLayer() {
        syncBackgroundLayerHeight();
        window.addEventListener("resize", syncBackgroundLayerHeight, { passive: true });
        window.addEventListener("load", syncBackgroundLayerHeight);

        if (typeof ResizeObserver === "function") {
            const observer = new ResizeObserver(syncBackgroundLayerHeight);
            if (document.body) observer.observe(document.body);
            observer.observe(document.documentElement);
        }
    }

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
        if (!dom.content || shouldReduceEffects) return;

        let latestY = window.scrollY;
        let ticking = false;

        dom.content.style.willChange = "transform";
        if (dom.bgVideo) dom.bgVideo.style.willChange = "transform";
        if (dom.bgImage) dom.bgImage.style.willChange = "transform";

        const update = () => {
            const y = latestY;
            dom.content.style.transform = `translate3d(0, ${y * 0.05}px, 0)`;
            ticking = false;
        };

        window.addEventListener(
            "scroll",
            () => {
                latestY = window.scrollY;
                if (!ticking) {
                    ticking = true;
                    requestAnimationFrame(update);
                }
            },
            { passive: true }
        );
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
        if (shouldReduceEffects || !dom.cursor || !dom.fxCanvas) return;
        const ctx = dom.fxCanvas.getContext("2d");
        if (!ctx) return;

        const particles = [];
        const MAX_PARTICLES = 140;
        let pointerX = window.innerWidth / 2;
        let pointerY = window.innerHeight / 2;
        let lastEmit = 0;
        let rafId = 0;
        let isPageHidden = false;

        function resize() {
            dom.fxCanvas.width = window.innerWidth;
            dom.fxCanvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        const pushParticle = (particle) => {
            if (particles.length >= MAX_PARTICLES) {
                particles.shift();
            }
            particles.push(particle);
        };

        window.addEventListener(
            "mousemove",
            (ev) => {
                pointerX = ev.clientX;
                pointerY = ev.clientY;
                dom.cursor.style.left = `${pointerX}px`;
                dom.cursor.style.top = `${pointerY}px`;

                const now = performance.now();
                if (now - lastEmit > Math.max(16, 240 - settings.trailDensity * 11)) {
                    pushParticle(makeParticle(pointerX, pointerY, settings.trailColor, 1.1));
                    lastEmit = now;
                }
            },
            { passive: true }
        );

        window.addEventListener(
            "click",
            (ev) => {
                for (let i = 0; i < 16; i += 1) {
                    pushParticle(makeParticle(ev.clientX, ev.clientY, settings.clickColor, 1.7, true));
                }
            },
            { passive: true }
        );

        document.addEventListener("visibilitychange", () => {
            isPageHidden = document.hidden;
            if (isPageHidden && rafId) {
                cancelAnimationFrame(rafId);
                rafId = 0;
                return;
            }
            if (!isPageHidden && !rafId) {
                rafId = requestAnimationFrame(tick);
            }
        });

        function tick() {
            if (isPageHidden) return;

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
            ctx.globalAlpha = 1;
            rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);
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
        if (!dom.musicAudio || !dom.musicBtn || !dom.musicVolume) {
            return;
        }

        dom.musicVolume.value = String(settings.audio.musicVolume);
        dom.musicAudio.volume = settings.audio.musicVolume;
        refreshAudioButtons();

        let unlocked = false;
        const unlock = () => {
            unlocked = true;
            if (settings.audio.musicOn) playSafe(dom.musicAudio);
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

        dom.musicVolume.addEventListener("input", () => {
            settings.audio.musicVolume = Number(dom.musicVolume.value);
            dom.musicAudio.volume = settings.audio.musicVolume;
            saveSettings(settings);
        });

        dom.musicAudio.addEventListener("error", () => {
            if (dom.audioTip) dom.audioTip.textContent = "未找到音乐文件：assets/audio/bgm.mp3。";
        });
    }

    function applyAudioDockState() {
        if (!dom.audioDock || !dom.audioDockToggle) return;
        const collapsed = Boolean(settings.audio.dockCollapsed);
        dom.audioDock.classList.toggle("collapsed", collapsed);
        dom.audioDockToggle.textContent = collapsed ? "展开" : "收起";
        dom.audioDockToggle.setAttribute("aria-expanded", String(!collapsed));
        dom.audioDockToggle.setAttribute("aria-label", collapsed ? "展开播放器" : "隐藏播放器");
    }

    function initAudioDock() {
        if (!dom.audioDock || !dom.audioDockToggle) return;
        applyAudioDockState();
        dom.audioDockToggle.addEventListener("click", () => {
            settings.audio.dockCollapsed = !settings.audio.dockCollapsed;
            applyAudioDockState();
            saveSettings(settings);
        });
    }

    function playSafe(audioEl) {
        audioEl.play().catch(() => {
            if (dom.audioTip) dom.audioTip.textContent = "浏览器阻止了自动播放，请再次点击按钮。";
        });
    }

    function refreshAudioButtons() {
        dom.musicBtn.textContent = settings.audio.musicOn ? "暂停音乐" : "播放音乐";
    }

    function init() {
        initBackgroundLayer();
        applyBackground(settings.background);
        renderPresetButtons();
        initPanel();
        initBackgroundUpload();
        initParallax();
        initCursorControls();
        initCursorAndFx();
        initAudioDock();
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