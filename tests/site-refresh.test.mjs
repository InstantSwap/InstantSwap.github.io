import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "static/css/index.css"), "utf8");
const js = fs.readFileSync(path.join(root, "static/js/index.js"), "utf8");

function createClassList(initialNames = []) {
  const names = new Set(initialNames);

  return {
    add(...values) {
      for (const value of values) {
        names.add(value);
      }
    },
    remove(...values) {
      for (const value of values) {
        names.delete(value);
      }
    },
    contains(value) {
      return names.has(value);
    },
    toggle(value, force) {
      const shouldAdd = force === undefined ? !names.has(value) : Boolean(force);

      if (shouldAdd) {
        names.add(value);
      } else {
        names.delete(value);
      }

      return shouldAdd;
    },
  };
}

function createHarness(options = {}) {
  const documentListeners = new Map();
  const windowListeners = new Map();
  const timers = [];
  const execCommands = [];
  const clipboardAttempts = [];
  let createdElementCount = 0;

  function createElement({ id = null, classNames = [], textContent = "" } = {}) {
    const attributes = new Map();
    const listeners = new Map();

    return {
      id,
      value: "",
      textContent,
      classList: createClassList(classNames),
      children: [],
      parentNode: null,
      addEventListener(type, handler) {
        listeners.set(type, handler);
      },
      dispatch(type, event = {}) {
        const handler = listeners.get(type);
        if (handler) {
          return handler(event);
        }

        return undefined;
      },
      setAttribute(name, value) {
        attributes.set(name, String(value));
      },
      getAttribute(name) {
        return attributes.has(name) ? attributes.get(name) : null;
      },
      appendChild(child) {
        this.children.push(child);
        child.parentNode = this;
      },
      removeChild(child) {
        this.children = this.children.filter((entry) => entry !== child);
        child.parentNode = null;
      },
      focus() {
        document.activeElement = this;
      },
      querySelector(selector) {
        if (selector === ".copy-text") {
          return this.copyText || null;
        }

        return null;
      },
      select() {
        this.wasSelected = true;
      },
    };
  }

  const elements = {
    moreWorksButton: createElement({ classNames: ["more-works-btn"] }),
    dropdown: createElement({ id: "moreWorksDropdown", classNames: ["more-works-dropdown"] }),
    closeButton: createElement({ classNames: ["close-btn"] }),
    scrollButton: createElement({ classNames: ["scroll-to-top"] }),
    worksContainer: createElement({ classNames: ["more-works-container"] }),
    heroCopyButton: createElement({ id: "copyBibtexHeroButton", classNames: ["copy-bibtex-hero-btn"] }),
    copyButton: createElement({ id: "copyBibtexButton", classNames: ["copy-bibtex-btn"] }),
    heroCopyText: createElement({ classNames: ["copy-text"], textContent: "BibTeX" }),
    copyText: createElement({ classNames: ["copy-text"], textContent: "Copy" }),
    copyStatus: createElement({ id: "copyStatus", textContent: "" }),
    bibtex: createElement({ id: "bibtex-code", textContent: "@article{test}" }),
  };

  elements.heroCopyButton.copyText = elements.heroCopyText;
  elements.copyButton.copyText = elements.copyText;
  elements.moreWorksButton.setAttribute("aria-expanded", "false");
  elements.worksContainer.contains = (target) =>
    [
      elements.worksContainer,
      elements.moreWorksButton,
      elements.dropdown,
      elements.closeButton,
    ].includes(target);

  const document = {
    activeElement: null,
    body: createElement({ id: "body" }),
    addEventListener(type, handler) {
      documentListeners.set(type, handler);
    },
    dispatch(type, event = {}) {
      const handler = documentListeners.get(type);
      if (handler) {
        handler(event);
      }
    },
    querySelector(selector) {
      switch (selector) {
        case ".more-works-btn":
          return elements.moreWorksButton;
        case ".close-btn":
          return elements.closeButton;
        case ".scroll-to-top":
          return elements.scrollButton;
        case ".more-works-container":
          return elements.worksContainer;
        default:
          return null;
      }
    },
    getElementById(id) {
      switch (id) {
        case "moreWorksDropdown":
          return elements.dropdown;
        case "copyBibtexButton":
          return elements.copyButton;
        case "copyBibtexHeroButton":
          return elements.heroCopyButton;
        case "copyStatus":
          return elements.copyStatus;
        case "bibtex-code":
          return elements.bibtex;
        default:
          return null;
      }
    },
    createElement() {
      createdElementCount += 1;
      return createElement({ id: `generated-${createdElementCount}` });
    },
    execCommand(command) {
      execCommands.push(command);
      return true;
    },
  };

  const windowObject = {
    scrollY: 0,
    addEventListener(type, handler) {
      windowListeners.set(type, handler);
    },
    scrollToCalls: [],
    scrollTo(payload) {
      this.scrollToCalls.push(payload);
    },
    setTimeout(callback, delay) {
      timers.push({ callback, delay });
      return timers.length;
    },
  };

  const navigator = {
    clipboard: {
      async writeText(value) {
        clipboardAttempts.push(value);

        if (options.clipboardRejects) {
          throw new Error("clipboard denied");
        }
      },
    },
  };

  const context = vm.createContext({
    window: windowObject,
    document,
    navigator,
    bulmaCarousel: {
      attach() {
        return [];
      },
    },
    console: {
      error() {},
    },
    setTimeout: windowObject.setTimeout.bind(windowObject),
  });

  vm.runInContext(js, context);

  return {
    context,
    document,
    elements,
    timers,
    execCommands,
    clipboardAttempts,
    windowObject,
  };
}

test("homepage uses a single body and main layout", () => {
  assert.equal((html.match(/<body\b/g) || []).length, 1);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
});

test("homepage uses the new floating more works pattern instead of navbar", () => {
  assert.match(html, /class="more-works-container"/);
  assert.match(html, /id="moreWorksDropdown"/);
  assert.doesNotMatch(html, /<nav\b/);
});

test("homepage keeps the InstantSwap research sections", () => {
  for (const heading of ["Abstract", "Method", "Comparison", "Gallery", "BibTeX"]) {
    assert.match(html, new RegExp(`>${heading}<`));
  }
  assert.match(html, /InstantSwap: Fast Customized Concept Swapping across Sharp Shape Differences/);
});

test("homepage removes placeholder content and broken asset paths", () => {
  for (const placeholder of ["PAPER_TITLE", "YOUR_", "TODO:"]) {
    assert.doesNotMatch(html, new RegExp(placeholder));
  }
  assert.doesNotMatch(html, /<h1[^>]*>\s*Academic Project Page\s*<\/h1>/);
  assert.doesNotMatch(html, /static\\/);
});

test("homepage includes the new utility interactions", () => {
  assert.match(html, /class="scroll-to-top"/);
  assert.match(html, /class="copy-bibtex-btn"/);
  assert.match(js, /function toggleMoreWorks/);
  assert.match(js, /function copyBibTeX/);
});

test("homepage removes the top eyebrow, adds BibTeX CTA, and gives the title more room to wrap naturally", () => {
  assert.doesNotMatch(html, /<p class="eyebrow">ICLR 2025<\/p>/);
  assert.match(html, /id="copyBibtexHeroButton"/);
  assert.match(html, />\s*BibTeX\s*</);
  assert.match(css, /font-size:\s*clamp\(1\.95rem,\s*3\.9vw,\s*3\.45rem\)\s*!important;/);
  assert.match(css, /max-width:\s*22ch;/);
});

test("homepage uses inline SVG for hero and utility icons instead of icon fonts", () => {
  assert.doesNotMatch(html, /fontawesome\.all\.min\.css|academicons\.min\.css/);
  assert.doesNotMatch(html, /<i class="/);
  assert.match(html, /class="scroll-to-top"[\s\S]*?<svg/);
  assert.match(html, /class="more-works-btn"[\s\S]*?<svg/);
  assert.match(html, /copyBibtexHeroButton[\s\S]*?<svg/);
  assert.match(html, />\s*Paper\s*<\/span>/);
  assert.match(html, />\s*Code\s*<\/span>/);
});

test("site assets use the refreshed style layer without demo-only sections", () => {
  assert.match(css, /\.more-works-container/);
  assert.match(css, /\.scroll-to-top/);
  assert.doesNotMatch(css, /related-works-btn/);
  assert.doesNotMatch(js, /JkaxUblCGz0|sample\.pdf/);
});

test("homepage local static assets exist", () => {
  const localAssets = new Set(
    [...html.matchAll(/(?:src|href)="(static\/[^"]+)"/g)].map((match) => match[1]),
  );

  assert.ok(localAssets.size > 0);

  for (const assetPath of localAssets) {
    assert.ok(fs.existsSync(path.join(root, assetPath)), `Missing asset: ${assetPath}`);
  }
});

test("toggleMoreWorks updates state and restores focus on close", () => {
  const { context, document, elements } = createHarness();

  context.toggleMoreWorks(true);
  assert.ok(elements.dropdown.classList.contains("show"));
  assert.equal(elements.moreWorksButton.getAttribute("aria-expanded"), "true");

  context.toggleMoreWorks(false);
  assert.ok(!elements.dropdown.classList.contains("show"));
  assert.equal(elements.moreWorksButton.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, elements.moreWorksButton);
});

test("copyBibTeX falls back when clipboard write rejects and announces success", async () => {
  const { context, elements, execCommands, timers, clipboardAttempts } = createHarness({
    clipboardRejects: true,
  });

  await context.copyBibTeX();

  assert.equal(clipboardAttempts.length, 1);
  assert.deepEqual(execCommands, ["copy"]);
  assert.ok(elements.copyButton.classList.contains("copied"));
  assert.equal(elements.copyText.textContent, "Copied");
  assert.equal(elements.copyStatus.textContent, "BibTeX copied to clipboard.");
  assert.equal(timers.length, 1);

  timers[0].callback();
  assert.equal(elements.copyText.textContent, "Copy");
});

test("updateScrollToTopButton reflects page scroll position", () => {
  const { context, elements, windowObject } = createHarness();

  windowObject.scrollY = 500;
  context.updateScrollToTopButton();
  assert.ok(elements.scrollButton.classList.contains("visible"));

  windowObject.scrollY = 40;
  context.updateScrollToTopButton();
  assert.ok(!elements.scrollButton.classList.contains("visible"));
});

test("hero BibTeX CTA triggers copy behavior when clicked", async () => {
  const { context, elements, clipboardAttempts } = createHarness();

  context.bindEvents();
  await elements.heroCopyButton.dispatch("click", { currentTarget: elements.heroCopyButton });

  assert.equal(clipboardAttempts.length, 1);
  assert.equal(elements.heroCopyText.textContent, "Copied");
});
