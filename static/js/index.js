window.HELP_IMPROVE_VIDEOJS = false;

function setMoreWorksOpen(isOpen) {
  const dropdown = document.getElementById("moreWorksDropdown");
  const button = document.querySelector(".more-works-btn");

  if (!dropdown || !button) {
    return;
  }

  dropdown.classList.toggle("show", isOpen);
  button.classList.toggle("active", isOpen);
  button.setAttribute("aria-expanded", String(isOpen));

  if (!isOpen) {
    button.focus();
  }
}

function toggleMoreWorks(forceState) {
  const dropdown = document.getElementById("moreWorksDropdown");

  if (!dropdown) {
    return;
  }

  const nextState =
    typeof forceState === "boolean" ? forceState : !dropdown.classList.contains("show");
  setMoreWorksOpen(nextState);
}

async function copyBibTeX() {
  const bibtexElement = document.getElementById("bibtex-code");
  const button = document.getElementById("copyBibtexButton");
  const label = button ? button.querySelector(".copy-text") : null;
  const status = document.getElementById("copyStatus");

  if (!bibtexElement || !button || !label || !status) {
    return;
  }

  const content = bibtexElement.textContent.trim();

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content);
    } else {
      fallbackCopy(content);
    }

    button.classList.add("copied");
    label.textContent = "Copied";
    status.textContent = "BibTeX copied to clipboard.";
    window.setTimeout(() => {
      button.classList.remove("copied");
      label.textContent = "Copy";
      status.textContent = "";
    }, 1800);
  } catch (error) {
    try {
      fallbackCopy(content);
      button.classList.add("copied");
      label.textContent = "Copied";
      status.textContent = "BibTeX copied to clipboard.";
      window.setTimeout(() => {
        button.classList.remove("copied");
        label.textContent = "Copy";
        status.textContent = "";
      }, 1800);
    } catch (fallbackError) {
      status.textContent = "Copy failed.";
      console.error("Failed to copy BibTeX:", fallbackError);
    }
  }
}

function fallbackCopy(content) {
  const tempInput = document.createElement("textarea");
  tempInput.value = content;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function updateScrollToTopButton() {
  const button = document.querySelector(".scroll-to-top");

  if (!button) {
    return;
  }

  button.classList.toggle("visible", window.scrollY > 320);
}

function initCarousel() {
  if (typeof bulmaCarousel === "undefined") {
    return;
  }

  bulmaCarousel.attach(".carousel", {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4500,
    pagination: true,
  });
}

function bindEvents() {
  const moreWorksButton = document.querySelector(".more-works-btn");
  const closeButton = document.querySelector(".close-btn");
  const scrollButton = document.querySelector(".scroll-to-top");
  const copyButton = document.getElementById("copyBibtexButton");
  const worksContainer = document.querySelector(".more-works-container");

  if (moreWorksButton) {
    moreWorksButton.addEventListener("click", () => toggleMoreWorks());
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => toggleMoreWorks(false));
  }

  if (scrollButton) {
    scrollButton.addEventListener("click", scrollToTop);
  }

  if (copyButton) {
    copyButton.addEventListener("click", copyBibTeX);
  }

  document.addEventListener("click", (event) => {
    if (worksContainer && !worksContainer.contains(event.target)) {
      toggleMoreWorks(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleMoreWorks(false);
    }
  });

  window.addEventListener("scroll", updateScrollToTopButton, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  initCarousel();
  updateScrollToTopButton();
});
