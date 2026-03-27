(async function () {
    const titleEl = document.getElementById("post-title");
    const metaEl = document.getElementById("post-meta");
    const tagsEl = document.getElementById("post-tags");
    const contentEl = document.getElementById("post-content");
    const viewsEl = document.getElementById("post-views");
    const likesEl = document.getElementById("post-likes");
    const likeBtn = document.getElementById("like-btn");
    const commentForm = document.getElementById("comment-form");
    const commentList = document.getElementById("comment-list");
    const commentName = document.getElementById("comment-name");
    const commentContent = document.getElementById("comment-content");

    const slug = new URLSearchParams(window.location.search).get("slug");
    if (!slug) {
        renderMissing("缺少 slug 参数，无法定位文章。");
        return;
    }

    try {
        const indexRes = await fetch("data/posts/index.json");
        const posts = await indexRes.json();
        const post = posts.find((item) => item.slug === slug);
        if (!post) {
            renderMissing("文章不存在或索引未更新。");
            return;
        }

        const markdownRes = await fetch(`data/posts/${encodeURIComponent(slug)}.md`);
        const markdown = await markdownRes.text();

        document.title = `${post.title} | 夏屿手札`;
        titleEl.textContent = post.title;
        metaEl.textContent = `${post.date} · ${post.category}`;
        tagsEl.innerHTML = (post.tags || []).map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("");

        marked.setOptions({
            gfm: true,
            breaks: true,
            highlight(code, lang) {
                if (window.hljs && lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return window.hljs ? hljs.highlightAuto(code).value : code;
            }
        });

        contentEl.innerHTML = marked.parse(markdown);
        if (window.hljs) {
            document.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));
        }

        initStats(post.slug);
        initComments(post.slug);
    } catch (err) {
        renderMissing("文章加载失败，请检查 data/posts 下的 Markdown 文件。");
    }

    function renderMissing(msg) {
        if (titleEl) titleEl.textContent = "文章未找到";
        if (contentEl) contentEl.innerHTML = `<p>${escapeHtml(msg)}</p>`;
    }

    function initStats(postSlug) {
        const viewsKey = `post_views_${postSlug}`;
        const likesKey = `post_likes_${postSlug}`;
        const likedKey = `post_liked_once_${postSlug}`;

        let views = Number(localStorage.getItem(viewsKey) || 0) + 1;
        localStorage.setItem(viewsKey, String(views));

        let likes = Number(localStorage.getItem(likesKey) || 0);
        const liked = localStorage.getItem(likedKey) === "1";

        viewsEl.textContent = `${views} 阅读`;
        likesEl.textContent = `${likes} 点赞`;
        if (liked) likeBtn.disabled = true;

        likeBtn.addEventListener("click", () => {
            if (localStorage.getItem(likedKey) === "1") return;
            likes += 1;
            likesEl.textContent = `${likes} 点赞`;
            localStorage.setItem(likesKey, String(likes));
            localStorage.setItem(likedKey, "1");
            likeBtn.disabled = true;
            likeBtn.textContent = "已点赞";
        });
    }

    function initComments(postSlug) {
        const commentsKey = `post_comments_${postSlug}`;
        const comments = JSON.parse(localStorage.getItem(commentsKey) || "[]");
        renderCommentList(comments);

        commentForm.addEventListener("submit", (ev) => {
            ev.preventDefault();
            const name = commentName.value.trim();
            const content = commentContent.value.trim();
            if (!name || !content) return;

            comments.unshift({
                name,
                content,
                time: new Date().toLocaleString("zh-CN")
            });
            localStorage.setItem(commentsKey, JSON.stringify(comments.slice(0, 50)));
            renderCommentList(comments);
            commentForm.reset();
        });
    }

    function renderCommentList(comments) {
        commentList.innerHTML = comments
            .map(
                (item) => `
          <li>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.time)}</small>
            <p>${escapeHtml(item.content)}</p>
          </li>
        `
            )
            .join("");
        if (!comments.length) {
            commentList.innerHTML = "<li>还没有留言，成为第一个写下感想的人吧。</li>";
        }
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