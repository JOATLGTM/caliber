/** @typedef {{ name: string; email: string; phone: string; location: string; targetRoles: string[]; skills: string[]; resumeText?: string }} Profile */

/** @typedef {{ filled: number; matched: string[] }} FillResult */

const SKIP_INPUT_TYPES = new Set([
  "hidden",
  "file",
  "submit",
  "button",
  "checkbox",
  "radio",
  "image",
]);

/** Labels we never autofill (questions, EEO, uploads, etc.) */
const SKIP_LABEL =
  /resume|cover letter|\bcv\b|gender|race|veteran|disability|linkedin|github|portfolio|website|employer|job title|authorized to work|sponsor|visa|country where you|working in for the role|previously employed|attach|dropbox|salary expectation|how did you hear|referr/i;

/** @param {Profile} profile @param {string} first @param {string} last */
function buildFieldRules(profile, first, last) {
  return [
    { key: "firstName", test: /first\s*name/i, value: first },
    { key: "lastName", test: /last\s*name/i, value: last },
    { key: "name", test: /^name$|^full\s*name$/i, value: profile.name },
    { key: "email", test: /^email$/i, value: profile.email },
    { key: "phone", test: /^phone$|^mobile$|^telephone$/i, value: profile.phone },
    {
      key: "location",
      test: /^location$|^city$|^location \(city\)$|where are you currently located/i,
      value: profile.location,
    },
  ].filter((r) => r.value?.trim());
}

/** @param {ParentNode} root */
function* walkRoots(root) {
  yield root;
  if (root instanceof Element) {
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot) yield* walkRoots(el.shadowRoot);
    }
  }
}

/** @returns {Generator<HTMLInputElement | HTMLTextAreaElement>} */
function* iterTextInputs() {
  for (const root of walkRoots(document)) {
    for (const el of root.querySelectorAll("input, textarea, [role='textbox']")) {
      if (el instanceof HTMLInputElement) {
        if (SKIP_INPUT_TYPES.has(el.type)) continue;
        if (el.classList.contains("select__input")) continue;
        if (el.id === "country") continue;
        yield el;
      } else if (el instanceof HTMLTextAreaElement) {
        yield el;
      }
    }
  }
}

/**
 * @param {HTMLInputElement | HTMLTextAreaElement | HTMLElement} el
 * @param {string} value
 */
function setFieldValue(el, value) {
  if (!value?.trim()) return false;

  if (el instanceof HTMLElement && el.isContentEditable) {
    if (el.textContent?.trim()) return false;
    el.focus();
    el.textContent = value;
    el.dispatchEvent(
      new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }),
    );
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return false;
  if (el.value?.trim()) return false;
  if (el.disabled || el.readOnly) return false;

  const proto =
    el instanceof HTMLInputElement
      ? window.HTMLInputElement.prototype
      : window.HTMLTextAreaElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;

  el.dispatchEvent(
    new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }),
  );
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));
  return true;
}

/** @param {string} raw */
function normalizeLabel(raw) {
  return raw
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** @param {Element} labelEl */
function findInputForLabel(labelEl) {
  const forId = labelEl.getAttribute("for");
  if (forId) {
    const byId = document.getElementById(forId);
    if (byId instanceof HTMLInputElement || byId instanceof HTMLTextAreaElement) {
      return byId;
    }
  }

  const container =
    labelEl.closest('[class*="field"], [class*="Field"], fieldset, li, div') ??
    labelEl.parentElement;

  return container?.querySelector(
    'input:not([type="hidden"]):not([type="file"]):not(.select__input), textarea, [role="textbox"]',
  );
}

/**
 * Primary strategy: read labels on the page, map to profile fields, fill only matches.
 * @param {Profile} profile
 * @returns {FillResult}
 */
function fillFromPageLabels(profile) {
  const { first, last } = splitName(profile);
  const rules = buildFieldRules(profile, first, last);
  /** @type {Set<Element>} */
  const usedInputs = new Set();
  /** @type {string[]} */
  const matched = [];
  let filled = 0;

  for (const root of walkRoots(document)) {
    for (const labelEl of root.querySelectorAll("label, legend")) {
      const raw = labelEl.textContent?.trim() ?? "";
      if (!raw || raw.length > 80) continue;
      const label = normalizeLabel(raw);
      if (!label || SKIP_LABEL.test(label)) continue;

      for (const rule of rules) {
        if (!rule.test.test(label)) continue;
        const input = findInputForLabel(labelEl);
        if (!input || usedInputs.has(input)) break;
        if (setFieldValue(/** @type {HTMLInputElement} */ (input), rule.value)) {
          filled++;
          matched.push(rule.key);
          usedInputs.add(input);
        }
        break;
      }
    }
  }

  // Inputs with aria-label but no <label> (common on Ashby/Greenhouse embeds)
  for (const input of iterTextInputs()) {
    if (usedInputs.has(input)) continue;
    const aria = normalizeLabel(input.getAttribute("aria-label") ?? "");
    if (!aria || SKIP_LABEL.test(aria)) continue;

    for (const rule of rules) {
      if (!rule.test.test(aria)) continue;
      if (setFieldValue(input, rule.value)) {
        filled++;
        matched.push(rule.key);
        usedInputs.add(input);
      }
      break;
    }
  }

  return { filled, matched };
}

/**
 * Fallback for known ATS field names/ids when labels aren't wired up.
 * @param {Profile} profile
 * @returns {FillResult}
 */
function fillKnownAtsFields(profile) {
  const { first, last } = splitName(profile);
  /** @type {Set<Element>} */
  const used = new Set();
  /** @type {string[]} */
  const matched = [];
  let filled = 0;

  /** @param {string} selector @param {string} value @param {string} key */
  function trySel(selector, value, key) {
    if (!value) return;
    try {
      for (const root of walkRoots(document)) {
        for (const el of root.querySelectorAll(selector)) {
          if (used.has(el)) continue;
          if (setFieldValue(/** @type {HTMLInputElement} */ (el), value)) {
            filled++;
            matched.push(key);
            used.add(el);
          }
        }
      }
    } catch {
      // invalid selector
    }
  }

  trySel("#first_name", first, "firstName");
  trySel("#last_name", last, "lastName");
  trySel("#email", profile.email, "email");
  trySel("#phone", profile.phone, "phone");
  trySel("#candidate-location", profile.location, "location");
  trySel('input[name*="systemfield_name"]', profile.name, "name");
  trySel('input[name*="systemfield_email"]', profile.email, "email");
  trySel('input[name*="systemfield_location"]', profile.location, "location");
  trySel('input[type="email"]', profile.email, "email");
  trySel('input[type="tel"]', profile.phone, "phone");
  trySel('input[autocomplete="given-name"]', first, "firstName");
  trySel('input[autocomplete="family-name"]', last, "lastName");
  trySel('input[autocomplete="email"]', profile.email, "email");

  return { filled, matched };
}

/** @param {Profile} profile */
function splitName(profile) {
  const parts = profile.name.trim().split(/\s+/);
  const first = parts[0] ?? "";
  return { first, last: parts.slice(1).join(" ") || first };
}

/** @param {Profile} profile @returns {FillResult} */
function fillForm(profile) {
  const primary = fillFromPageLabels(profile);
  const fallback = fillKnownAtsFields(profile);

  const matched = [...new Set([...primary.matched, ...fallback.matched])];
  return {
    filled: primary.filled + fallback.filled,
    matched,
  };
}

window.__caliberFill = fillForm;

if (!window.__caliberAutofillReady) {
  window.__caliberAutofillReady = true;
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "CALIBER_FILL") return;
    sendResponse(fillForm(message.profile));
  });
}
