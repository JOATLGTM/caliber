/** Run autofill on a tab (called from popup via service worker). */
async function runFillOnTab(tabId, profile) {
  if (!chrome.scripting?.executeScript) {
    throw new Error(
      "Scripting API unavailable. Remove and re-load the extension at chrome://extensions.",
    );
  }

  await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    files: ["content.js"],
  });

  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func: (payload) => {
      if (typeof window.__caliberFill === "function") {
        return window.__caliberFill(payload);
      }
      return { filled: 0, matched: [] };
    },
    args: [profile],
  });

  let filled = 0;
  /** @type {Set<string>} */
  const matched = new Set();
  for (const frame of results) {
    const r = frame.result;
    if (r && typeof r === "object") {
      filled += r.filled ?? 0;
      for (const key of r.matched ?? []) matched.add(key);
    } else if (typeof r === "number") {
      filled += r;
    }
  }
  return { filled, matched: [...matched] };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "CALIBER_FILL_TAB") return;

  runFillOnTab(message.tabId, message.profile)
    .then(({ filled, matched }) => sendResponse({ ok: true, filled, matched }))
    .catch((err) =>
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : "Fill failed",
      }),
    );

  return true;
});
