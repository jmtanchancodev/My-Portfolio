// Prevent scrollbar flash on refresh (loading lock)
document.documentElement.classList.add("is-loading");

// ══════════════════════════════════════════════
// DARK MODE TOGGLE
// ══════════════════════════════════════════════
(function initTheme() {
  const html = document.documentElement;
  const saved = localStorage.getItem("theme");
  // Default is always light unless explicitly saved as dark
  const theme = saved === "dark" ? "dark" : "light";

  html.dataset.theme = theme;

  const updateIcons = (t) => {
    document.querySelectorAll(".theme-icon").forEach(icon => {
      icon.classList.remove("fa-moon", "fa-sun");
      icon.classList.add(t === "dark" ? "fa-sun" : "fa-moon");
    });
  };

  updateIcons(theme);

  document.addEventListener("DOMContentLoaded", () => {
    updateIcons(html.dataset.theme);

    document.querySelectorAll(".theme-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const next = html.dataset.theme === "dark" ? "light" : "dark";

        // Spin all icons, swap icon midway through spin
        document.querySelectorAll(".theme-icon").forEach(icon => {
          icon.classList.remove("is-spinning");
          // Force reflow to restart animation
          void icon.offsetWidth;
          icon.classList.add("is-spinning");

          // Swap icon class at midpoint (40% of 320ms ≈ 128ms)
          setTimeout(() => {
            icon.classList.remove("fa-moon", "fa-sun");
            icon.classList.add(next === "dark" ? "fa-sun" : "fa-moon");
          }, 128);

          icon.addEventListener("animationend", () => {
            icon.classList.remove("is-spinning");
          }, { once: true });
        });

        html.classList.add("theme-transitioning");
        html.dataset.theme = next;
        localStorage.setItem("theme", next);

        setTimeout(() => html.classList.remove("theme-transitioning"), 320);
      });
    });
  });
})();

/** * UPDATED SCROLLBAR LOGIC:
 * We remove the loading lock when the page is fully loaded,
 * but we also add a 2.5-second failsafe for mobile users on slow networks.
 */
const removeLoadingLock = () => {
  document.documentElement.classList.remove("is-loading");
};

window.addEventListener("load", removeLoadingLock);
setTimeout(removeLoadingLock, 2500); // Failsafe: unlock scroll after 2.5s regardless of asset status


// HAMBURGER MENU (with close anim)
function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  if (!menu || !icon) return;

  // If menu is opening
  if (!menu.classList.contains("open")) {
    menu.classList.remove("closing");
    menu.classList.add("open");
    icon.classList.add("open");
    return;
  }

  // If menu is closing (play animation)
  menu.classList.add("closing");
  menu.classList.remove("open");
  icon.classList.remove("open");

  // After animation ends, remove closing state
  setTimeout(() => {
    menu.classList.remove("closing");
  }, 260);
}

// VIEW FULL IMAGE (modal overlay)
function viewFullImage(button) {
  const projectImg = button
    .closest(".details-container")
    ?.querySelector(".project-img");

  if (!projectImg) return;

  const fullImageUrl =
    projectImg.getAttribute("data-full-image") || projectImg.src;

  // Pause the carousel this button belongs to
  const carouselInner = button.closest("[data-carousel]");
  if (carouselInner) carouselInner.dispatchEvent(new CustomEvent("modal:open"));

  // Create overlay
  const overlay = document.createElement("div");
  overlay.classList.add("image-overlay");
  document.body.appendChild(overlay);

  // Prevent background scroll
  document.body.style.overflow = "hidden";

  // Create full image container
  const fullImageContainer = document.createElement("div");
  fullImageContainer.classList.add("full-image-container");
  overlay.appendChild(fullImageContainer);

  // Create full image
  const fullImage = document.createElement("img");
  fullImage.src = fullImageUrl;
  fullImageContainer.appendChild(fullImage);

  // Create close button
  const closeButton = document.createElement("span");
  closeButton.classList.add("close-button");
  closeButton.innerHTML = "&times;";
  fullImageContainer.appendChild(closeButton);

  // Close functionality
  const close = () => {
    // Play closing animations
    overlay.style.animation = "overlayFadeOut 220ms ease forwards";
    fullImageContainer.style.animation = "imageHide 200ms cubic-bezier(0.4, 0, 1, 1) forwards";

    setTimeout(() => {
      document.body.style.overflow = "";
      overlay.remove();
      // Resume the carousel
      if (carouselInner) carouselInner.dispatchEvent(new CustomEvent("modal:close"));
    }, 220);
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target === closeButton) close();
  });

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") close();
    },
    { once: true }
  );
}

// Opens the certificate image in the same full-screen overlay modal
function openCertImage(src) {
  const overlay = document.createElement("div");
  overlay.classList.add("image-overlay");
  overlay.style.animation = "overlayFadeIn 220ms ease forwards";
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const fullImageContainer = document.createElement("div");
  fullImageContainer.classList.add("full-image-container");
  overlay.appendChild(fullImageContainer);

  const fullImage = document.createElement("img");
  fullImage.src = src;
  fullImage.style.animation = "imageReveal 300ms cubic-bezier(0.2, 0.8, 0.2, 1) 60ms both";
  fullImageContainer.appendChild(fullImage);

  const closeButton = document.createElement("span");
  closeButton.innerHTML = "&times;";
  closeButton.classList.add("close-modal-btn");
  overlay.appendChild(closeButton);

  function close() {
    overlay.style.animation = "overlayFadeIn 180ms ease reverse forwards";
    setTimeout(() => {
      document.body.removeChild(overlay);
      document.body.style.overflow = "";
    }, 180);
  }

  closeButton.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); }, { once: true });
}
document.addEventListener("DOMContentLoaded", () => {
  // ScrollReveal
  if (typeof ScrollReveal !== "undefined") {
    const sr = ScrollReveal({
      origin: "bottom",
      distance: "60px",
      duration: 500,
      delay: 80,
      reset: false,
    });

    sr.reveal(".section__text__p1, .title", { interval: 100 });

    sr.reveal(".skill-card", {
      interval: 80,
      distance: "40px",
      scale: 0.92,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      viewFactor: 0.1,
    });

    // Only reveal About Me cards — carousel project cards excluded
    // to prevent double-animation conflict with carousel transitions
    sr.reveal(".about-containers .details-container", { interval: 150 });
  }


  // Description Modal
  const descOverlay = document.getElementById("descOverlay");
  const descClose = document.getElementById("descClose");
  const descTitle = document.getElementById("descTitle");
  const descText = document.getElementById("descText");

  const openDesc = (title, text, sourceCarousel) => {
    if (!descOverlay || !descTitle || !descText) return;

    descTitle.textContent = title || "Project Description";
    descText.textContent = text || "No description provided.";

    descOverlay.classList.remove("is-closing");
    descOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";

    // Pause the originating carousel
    if (sourceCarousel) sourceCarousel.dispatchEvent(new CustomEvent("modal:open"));
    descOverlay._sourceCarousel = sourceCarousel || null;
  };

  const closeDesc = () => {
    if (!descOverlay) return;

    descOverlay.classList.remove("is-open");
    descOverlay.classList.add("is-closing");

    setTimeout(() => {
      descOverlay.classList.remove("is-closing");
      descOverlay.style.display = "none";
      // Reset display so is-open flex works next time
      descOverlay.style.display = "";
      document.body.style.overflow = "";

      // Resume the originating carousel
      if (descOverlay._sourceCarousel) {
        descOverlay._sourceCarousel.dispatchEvent(new CustomEvent("modal:close"));
        descOverlay._sourceCarousel = null;
      }
    }, 220);
  };

  window.viewDescription = (btn, text) => {
    const title =
      btn?.closest(".details-container")?.querySelector(".project-title")
        ?.textContent || "Project Description";
    const sourceCarousel = btn?.closest("[data-carousel]") || null;
    openDesc(title, text, sourceCarousel);
  };

  // New recommended way: <button class="project-desc-btn" data-title="" data-description="">
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".project-desc-btn");
    if (!btn) return;

    const title =
      btn.dataset.title ||
      btn.closest(".details-container")?.querySelector(".project-title")
        ?.textContent ||
      "Project Description";

    const text = btn.dataset.description || "";
    const sourceCarousel = btn.closest("[data-carousel]") || null;
    openDesc(title, text, sourceCarousel);
  });

  descClose?.addEventListener("click", closeDesc);
  descOverlay?.addEventListener("click", (e) => {
    if (e.target === descOverlay) closeDesc();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDesc();
  });

  // Active nav underline on scroll
  const sections = document.querySelectorAll("section");
  const navLinksDesktop = document.querySelectorAll(".nav-links a");
  const navLinksMobile = document.querySelectorAll(".menu-links a");
  const navLinks = [...navLinksDesktop, ...navLinksMobile];

  let manualTargetId = null;

  const setActive = (id) => {
    navLinksDesktop.forEach((link) => link.classList.remove("active"));
    navLinksDesktop.forEach((link) => {
      if (link.getAttribute("href") === `#${id}`) link.classList.add("active");
    });
  };

  // Hamburger close helpers
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  const hamburgerMenu = document.querySelector(".hamburger-menu");

  const closeMenu = () => {
    if (!menu || !icon) return;

    // play close anim if your CSS supports .closing
    if (menu.classList.contains("open")) {
      menu.classList.add("closing");
      menu.classList.remove("open");
      icon.classList.remove("open");

      setTimeout(() => {
        menu.classList.remove("closing");
      }, 260);
    }
  };

  // Click nav links: underline + close hamburger
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      manualTargetId = link.getAttribute("href").replace("#", "");
      setActive(manualTargetId);
      closeMenu();
    });
  });

  // Observe sections for underline update — scroll-position based
  // IntersectionObserver struggles with very tall sections (e.g. Projects)
  // when scrolling back up. Direct scroll position is more reliable.

  const sectionList = Array.from(sections);

  const updateActiveFromScroll = () => {
    if (manualTargetId) return;

    const navHeight = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height')) || 100;

    // Find the section whose top edge is closest to (but not below) the
    // trigger point — 30% down from the top of the viewport.
    const triggerY = window.scrollY + navHeight + window.innerHeight * 0.15;

    let active = sectionList[0];
    for (const section of sectionList) {
      if (section.offsetTop <= triggerY) {
        active = section;
      }
    }
    if (active) setActive(active.id);
  };

  window.addEventListener("scroll", updateActiveFromScroll, { passive: true });

  // Also keep a minimal IntersectionObserver to handle the manualTargetId
  // (nav click) case — clears the lock once we reach the clicked section
  const observer = new IntersectionObserver(
    (entries) => {
      if (!manualTargetId) return;
      const reachedTarget = entries.some(
        (e) => e.isIntersecting && e.target.id === manualTargetId
      );
      if (reachedTarget) {
        setActive(manualTargetId);
        manualTargetId = null;
      }
    },
    { threshold: 0, rootMargin: "-10% 0px -85% 0px" }
  );

  sections.forEach((section) => observer.observe(section));

  // Run once on load to set correct initial state
  updateActiveFromScroll();

  // Correct underline on hash refresh
  const currentHash = window.location.hash.replace("#", "");
  if (currentHash) setActive(currentHash);

  // Close hamburger when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu || !icon || !hamburgerMenu) return;

    const clickedInside = hamburgerMenu.contains(e.target);

    if (menu.classList.contains("open") && !clickedInside) {
      closeMenu();
    }
  });
});

// ══════════════════════════════════════════════
// CAROUSEL — auto-play + arrows + dots
// Layout: carousel-nav = [arrow][viewport][arrow]
// Slide widths are derived from the viewport's
// actual rendered offsetWidth, so 100% always
// refers to the correct clipping container.
// ══════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  const SLIDE_INTERVAL = 3500;
  const GAP_PX        = 24;   // matches CSS gap: 1.5rem at 16px base

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const viewport    = carousel.querySelector(".carousel-viewport");
    const track       = carousel.querySelector(".carousel-track");
    const dotsWrap    = carousel.querySelector(".carousel-dots");
    const btnLeft     = carousel.querySelector(".carousel-arrow-left");
    const btnRight    = carousel.querySelector(".carousel-arrow-right");
    if (!viewport || !track) return;

    // Per-carousel interval override via data-interval attribute
    const slideInterval = parseInt(carousel.dataset.interval) || SLIDE_INTERVAL;

    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    const total  = slides.length;
    let current  = 0;
    let timer    = null;

    // How many slides fit in the viewport at this breakpoint
    function visibleCount() {
      const w = window.innerWidth;
      if (w <= 600)  return 1;
      if (w <= 1200) return 2;
      return 3;
    }

    // Compute exact pixel width for one slide based on viewport width
    function computeSlideWidth() {
      const vis       = visibleCount();
      const vpWidth   = viewport.offsetWidth;
      const totalGaps = GAP_PX * (vis - 1);
      return (vpWidth - totalGaps) / vis;
    }

    // Apply slide width to every slide via inline style
    function applySlideWidths() {
      const sw = computeSlideWidth();
      slides.forEach(s => { s.style.width = sw + "px"; s.style.flex = "0 0 " + sw + "px"; });
      return sw;
    }

    // Build dots based on reachable positions (total - visibleCount + 1)
    // Called on init and on resize so dot count stays correct
    function buildDots() {
      dotsWrap.innerHTML = "";
      const maxStep = Math.max(0, total - visibleCount());
      const dotCount = maxStep + 1;
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement("button");
        dot.className = "carousel-dot" + (i === current ? " active" : "");
        dot.setAttribute("aria-label", "Slide " + (i + 1));
        dot.addEventListener("click", () => { goTo(i); resetTimer(); });
        dotsWrap.appendChild(dot);
      }
    }
    // Show/hide arrows — only when more slides exist than visible
    function updateArrows() {
      const show = total > visibleCount();
      if (btnLeft)  btnLeft.style.display  = show ? "flex" : "none";
      if (btnRight) btnRight.style.display = show ? "flex" : "none";
    }

    function goTo(index) {
      const vis     = visibleCount();
      const maxStep = Math.max(0, total - vis);

      // Clamp index and wrap
      current = Math.min(Math.max(((index % total) + total) % total, 0), maxStep);

      const sw     = applySlideWidths();
      const offset = current * (sw + GAP_PX);
      track.style.transform = "translateX(-" + offset + "px)";

      // Update active dot — re-query live since buildDots may have rebuilt them
      Array.from(dotsWrap.querySelectorAll(".carousel-dot"))
        .forEach((d, i) => d.classList.toggle("active", i === current));
      updateArrows();
    }

    function next() {
      const maxStep = Math.max(0, total - visibleCount());
      goTo(current >= maxStep ? 0 : current + 1);
    }

    function prev() {
      const maxStep = Math.max(0, total - visibleCount());
      goTo(current <= 0 ? maxStep : current - 1);
    }

    function startTimer() { timer = setInterval(next, slideInterval); }
    function stopTimer()  { clearInterval(timer); }
    function resetTimer() { stopTimer(); startTimer(); }

    // Arrow clicks
    if (btnLeft)  btnLeft.addEventListener("click",  () => { prev(); resetTimer(); });
    if (btnRight) btnRight.addEventListener("click", () => { next(); resetTimer(); });

    // Pause on hover — but not if a modal has paused us
    let modalPaused = false;

    carousel.addEventListener("mouseenter", () => { if (!modalPaused) stopTimer(); });
    carousel.addEventListener("mouseleave", () => { if (!modalPaused) startTimer(); });

    // Pause when an image or description modal opens from this carousel
    carousel.addEventListener("modal:open",  () => { modalPaused = true;  stopTimer(); });
    carousel.addEventListener("modal:close", () => { modalPaused = false; startTimer(); });

    // Init — set widths first, build correct dots, then reveal slides
    applySlideWidths();
    buildDots();
    slides.forEach(s => { s.style.visibility = "visible"; });
    goTo(0);
    startTimer();

    // Recalculate after all assets load (fonts/images can shift layout)
    window.addEventListener("load", () => goTo(current));

    // Recalculate on window resize (debounced) — rebuild dots too
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildDots();
        goTo(current);
      }, 120);
    });
  });
});