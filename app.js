
/* RELO - Multiple image galleries, filters and navigation */
(() => {
  "use strict";

  const products = Array.isArray(window.RELO_PRODUCTS)
    ? window.RELO_PRODUCTS
    : [];

  const grid = document.getElementById("productGrid");
  const search = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");
  const sort = document.getElementById("sortFilter");
  const count = document.getElementById("resultsCount");
  const empty = document.getElementById("emptyState");
  const title = document.getElementById("collectionTitle");
  const intro = document.getElementById("collectionIntro");

  const money = p => {
    if (p.price === "" || p.price == null) {
      return "See retailer for price";
    }

    const n = Number(p.price);
    if (!Number.isFinite(n)) return String(p.price);

    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: p.currency || "INR",
        maximumFractionDigits: 0
      }).format(n);
    } catch {
      return `${p.currency || "INR"} ${n}`;
    }
  };

  const validUrl = u =>
    typeof u === "string" && /^https?:\/\//i.test(u);

  function imageList(p) {
    const arr = Array.isArray(p.imageUrls)
      ? p.imageUrls.filter(validUrl)
      : [];

    if (arr.length) return arr;
    return validUrl(p.imageUrl) ? [p.imageUrl] : [];
  }

  function gallery(p) {
    const box = document.createElement("div");
    box.className = "product-gallery";

    const urls = imageList(p);
    let i = 0;

    const img = document.createElement("img");
    img.className = "gallery-image";
    img.alt = p.name || "Product";
    img.loading = "eager";
    img.fetchPriority = "auto";
    img.decoding = "async";

    const placeholder = document.createElement("span");
    placeholder.className = "product-placeholder";
    placeholder.textContent = "RELO";

    const prev = document.createElement("button");
    prev.className = "gallery-arrow prev";
    prev.type = "button";
    prev.textContent = "‹";
    prev.setAttribute("aria-label", "Previous image");

    const next = document.createElement("button");
    next.className = "gallery-arrow next";
    next.type = "button";
    next.textContent = "›";
    next.setAttribute("aria-label", "Next image");

    const dots = document.createElement("div");
    dots.className = "gallery-dots";

    function show() {
      if (!urls.length) {
        if (!box.contains(placeholder)) box.append(placeholder);
        return;
      }

      placeholder.remove();

      img.alt = `${p.name || "Product"} image ${i + 1} of ${urls.length}`;

      if (img.src !== urls[i]) {
        img.src = urls[i];
      }

      if (!box.contains(img)) box.append(img);

      prev.hidden = next.hidden = urls.length < 2;

      dots.querySelectorAll("button").forEach((b, j) => {
        b.classList.toggle("active", j === i);
      });
    }

    urls.forEach((_, j) => {
      const d = document.createElement("button");
      d.type = "button";
      d.className = "gallery-dot";
      d.setAttribute("aria-label", `Show image ${j + 1}`);

      d.addEventListener("click", () => {
        i = j;
        show();
      });

      dots.append(d);
    });

    prev.addEventListener("click", () => {
      i = (i - 1 + urls.length) % urls.length;
      show();
    });

    next.addEventListener("click", () => {
      i = (i + 1) % urls.length;
      show();
    });

    if (urls.length) {
      box.append(img, prev, next, dots);
      show();

      // Preload the next image after the first image loads.
      img.onload = () => {
        if (urls.length > 1) {
          const nextImage = new Image();
          nextImage.src = urls[(i + 1) % urls.length];
        }
      };
    } else {
      box.append(placeholder);
    }
    
    let start = null;

    box.addEventListener("touchstart", e => {
      start = e.touches[0].clientX;
    }, { passive: true });

    box.addEventListener("touchend", e => {
      if (start === null || urls.length < 2) return;

      const dx = e.changedTouches[0].clientX - start;

      if (Math.abs(dx) > 35) {
        i = (i + (dx < 0 ? 1 : -1) + urls.length) % urls.length;
        show();
      }

      start = null;
    }, { passive: true });

    return box;
  }

  function card(p) {
    const article = document.createElement("article");
    article.className = "product-card";

    const info = document.createElement("div");
    info.className = "product-info";

    const meta = document.createElement("div");
    meta.className = "product-meta";
    meta.textContent = `${p.category || ""} · ${p.platform || ""}`;

    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = p.name || "";

    const desc = document.createElement("p");
    desc.className = "product-description";
    desc.textContent = p.description || "";

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = money(p);

    const link = document.createElement("a");
    link.className = "shop-link";
    link.textContent = "View product ↗";

    if (validUrl(p.affiliateUrl)) {
      link.href = p.affiliateUrl;
      link.target = "_blank";
      link.rel = "sponsored nofollow noopener noreferrer";

      link.addEventListener("click", () => {
        try {
          const k = "relo_affiliate_clicks";
          const d = JSON.parse(localStorage.getItem(k) || "{}");
          d[p.id] = (d[p.id] || 0) + 1;
          localStorage.setItem(k, JSON.stringify(d));
        } catch (_) {}
      });
    } else {
      link.href = "#";
      link.classList.add("disabled");
      link.textContent = "Add affiliate link";
      link.addEventListener("click", e => e.preventDefault());
    }

    bottom.append(price, link);
    info.append(meta, name, desc, bottom);
    article.append(gallery(p), info);

    return article;
  }

  function hashCategory() {
    const m = location.hash.match(/^#category\/(.+)$/i);
    return m ? decodeURIComponent(m[1]) : "All";
  }

  function heading() {
    const c = hashCategory();

    if (c !== "All") {
      category.value = [...category.options].some(
        o => o.value === c || o.text === c
      ) ? c : "All";

      title.textContent = `${c} finds`;
      intro.textContent = `Explore our ${c.toLowerCase()} collection.`;
    } else {
      title.textContent = "Fresh finds, thoughtfully picked.";
      intro.textContent = "Discover fashion finds, everyday essentials and pieces you'll love.";
    }
  }

  function render() {
    const q = search.value.trim().toLowerCase();
    const c = category.value;

    let list = products.filter(p => p.active !== false);

    if (c !== "All") {
      list = list.filter(p => p.category === c);
    }

    if (q) {
      list = list.filter(p =>
        [p.name, p.description, p.category, p.platform, ...(p.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (sort.value === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    if (sort.value === "price-low") {
      list.sort((a, b) =>
        (Number(a.price) || Infinity) - (Number(b.price) || Infinity)
      );
    }

    if (sort.value === "price-high") {
      list.sort((a, b) =>
        (Number(b.price) || -Infinity) - (Number(a.price) || -Infinity)
      );
    }

    if (sort.value === "featured") {
      list.sort((a, b) =>
        Number(!!b.featured) - Number(!!a.featured)
      );
    }

    grid.replaceChildren(...list.map(card));

    count.textContent =
      `${list.length} ${list.length === 1 ? "product" : "products"}`;

    empty.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
  }

  [search, category, sort].forEach(e => {
    e.addEventListener("input", render);
  });

  document.getElementById("clearFilters").addEventListener("click", () => {
    search.value = "";
    category.value = "All";
    sort.value = "featured";

    if (location.hash.startsWith("#category/")) {
      history.replaceState(null, "", "#shop");
    }

    heading();
    render();
  });

  window.addEventListener("hashchange", () => {
    heading();
    render();
  });

  const mb = document.getElementById("mobileMenu");
  const mn = document.getElementById("mobileNav");

  mb.addEventListener("click", () => {
    const open = mn.classList.toggle("open");
    mb.setAttribute("aria-expanded", String(open));
  });

  mn.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mn.classList.remove("open");
      mb.setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("year").textContent =
    new Date().getFullYear();

  heading();
  render();
})();
