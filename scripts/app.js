(async function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const postListEl = document.getElementById("post-list");
  const tagCloudEl = document.getElementById("tag-cloud");
  const recentListEl = document.getElementById("recent-list");
  const categoryLinks = document.querySelectorAll(".category-link");

  if (!postListEl || !tagCloudEl || !recentListEl) return;

  let posts = [];
  let activeCategory = "all";

  try {
    const res = await fetch("data/posts/index.json");
    posts = await res.json();
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderPosts();
    renderSidebar();
  } catch (err) {
    postListEl.innerHTML = "<p class=\"glass post-card\">文章索引加载失败，请确认 data/posts/index.json 存在。</p>";
  }

  categoryLinks.forEach((link) => {
    link.addEventListener("click", (ev) => {
      ev.preventDefault();
      activeCategory = link.dataset.category || "all";
      categoryLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
      renderPosts();
    });
  });

  function renderPosts() {
    const filtered =
      activeCategory === "all"
        ? posts
        : posts.filter((post) => post.category === activeCategory);

    if (!filtered.length) {
      postListEl.innerHTML = "<p class=\"glass post-card\">当前分类还没有文章，去写下今天的收获吧。</p>";
      return;
    }

    postListEl.innerHTML = filtered
      .map((post, idx) => {
        const views = Number(localStorage.getItem(`post_views_${post.slug}`) || 0);
        const likes = Number(localStorage.getItem(`post_likes_${post.slug}`) || 0);
        return `
          <article class="post-card glass fade-up" style="animation-delay:${idx * 0.08}s">
            <h2><a href="post.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
            <p class="post-meta">${escapeHtml(post.date)} · ${escapeHtml(post.category)} · ${views} 阅读 · ${likes} 点赞</p>
            <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="tag-cloud">
              ${post.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderSidebar() {
    const allTags = posts.flatMap((post) => post.tags || []);
    const countMap = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    tagCloudEl.innerHTML = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([tag, count]) => `<span class="tag">#${escapeHtml(tag)} (${count})</span>`)
      .join("");

    recentListEl.innerHTML = posts
      .slice(0, 6)
      .map(
        (post) =>
          `<li><a href="post.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a><br /><small>${escapeHtml(post.date)}</small></li>`
      )
      .join("");
  }

  function escapeHtml(raw) {
    return String(raw)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();