// Prevent scrollbar flash on refresh (loading lock)
document.documentElement.classList.add("is-loading");
window.addEventListener("load", () => {
  document.documentElement.classList.remove("is-loading");
});

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
    document.body.style.overflow = "";
    overlay.remove();
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

// DOMContentLoaded: ScrollReveal + Active Nav + Modals
document.addEventListener("DOMContentLoaded", () => {
  // ScrollReveal
  if (typeof ScrollReveal !== "undefined") {
    const sr = ScrollReveal({
      origin: "bottom",
      distance: "60px",
      duration: 1000,
      delay: 200,
      reset: false,
    });

    sr.reveal(".section__text__p1, .title", { interval: 100 });

    sr.reveal(".skill-card", {
      interval: 150,
      distance: "100px",
      scale: 0.85,
      easing: "cubic-bezier(0.5, 0, 0, 1)",
      viewFactor: 0.2,
    });

    sr.reveal(".details-container", { interval: 200 });
  }


  // Description Modal
  const descOverlay = document.getElementById("descOverlay");
  const descClose = document.getElementById("descClose");
  const descTitle = document.getElementById("descTitle");
  const descText = document.getElementById("descText");

  const openDesc = (title, text) => {
    if (!descOverlay || !descTitle || !descText) return;

    descTitle.textContent = title || "Project Description";
    descText.textContent = text || "No description provided.";

    descOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  const closeDesc = () => {
    if (!descOverlay) return;
    descOverlay.style.display = "none";
    document.body.style.overflow = "";
  };

  window.viewDescription = (btn, text) => {
    const title =
      btn?.closest(".details-container")?.querySelector(".project-title")
        ?.textContent || "Project Description";
    openDesc(title, text);
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
    openDesc(title, text);
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

  // Observe sections for underline update
  const observer = new IntersectionObserver(
    (entries) => {
      if (manualTargetId) {
        const reachedTarget = entries.some(
          (e) => e.isIntersecting && e.target.id === manualTargetId
        );

        if (reachedTarget) {
          setActive(manualTargetId);
          manualTargetId = null;
        }
        return;
      }

      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setActive(visible.target.id);
    },
    { threshold: [0.25, 0.4, 0.55, 0.7, 0.85] }
  );

  sections.forEach((section) => observer.observe(section));

  // Correct underline on refresh
  const currentHash = window.location.hash.replace("#", "");
  setActive(currentHash || "profile");

  // Close hamburger when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu || !icon || !hamburgerMenu) return;

    const clickedInside = hamburgerMenu.contains(e.target);

    if (menu.classList.contains("open") && !clickedInside) {
      closeMenu();
    }
  });
});
