const apiUrlInput = document.getElementById("apiUrl");
const tokenInput = document.getElementById("token");
const fillBtn = document.getElementById("fill");
const statusEl = document.getElementById("status");
const settingsLink = document.getElementById("settingsLink");

async function loadSettings() {
  const { apiUrl, token } = await chrome.storage.sync.get(["apiUrl", "token"]);
  apiUrlInput.value = apiUrl || "http://localhost:3000";
  tokenInput.value = token || "";
  settingsLink.href = `${apiUrlInput.value.replace(/\/$/, "")}/settings`;
}

async function saveSettings() {
  await chrome.storage.sync.set({
    apiUrl: apiUrlInput.value.replace(/\/$/, ""),
    token: tokenInput.value.trim(),
  });
}

function isFillableTab(url) {
  if (!url) return false;
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
    return false;
  }
  // Caliber app tabs — get token there, fill elsewhere
  if (/localhost:3000|127\.0\.0\.1:3000/.test(url)) {
    return false;
  }
  return url.startsWith("http://") || url.startsWith("https://");
}

apiUrlInput.addEventListener("change", saveSettings);
tokenInput.addEventListener("change", saveSettings);

fillBtn.addEventListener("click", async () => {
  statusEl.textContent = "Fetching profile…";
  fillBtn.disabled = true;

  try {
    await saveSettings();
    const apiUrl = apiUrlInput.value.replace(/\/$/, "");
    const token = tokenInput.value.trim();
    if (!token) {
      statusEl.textContent = "Add your access token from Caliber Settings.";
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      statusEl.textContent = "No active tab.";
      return;
    }

    if (!isFillableTab(tab.url)) {
      statusEl.textContent =
        "Open the company's apply form in this tab first (e.g. jobs.lever.co, boards.greenhouse.io, jobs.ashbyhq.com).";
      return;
    }

    const res = await fetch(`${apiUrl}/api/extension/autofill`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      statusEl.textContent = data.error || `Request failed (${res.status})`;
      return;
    }

    statusEl.textContent = "Filling form…";

    const result = await chrome.runtime.sendMessage({
      type: "CALIBER_FILL_TAB",
      tabId: tab.id,
      profile: data,
    });

    if (!result?.ok) {
      statusEl.textContent = result?.error || "Fill failed";
      return;
    }

    const fieldLabels = {
      name: "Name",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      location: "Location",
    };
    const filledLabels = (result.matched ?? [])
      .map((key) => fieldLabels[key] || key)
      .join(", ");

    if (result.filled > 0) {
      statusEl.textContent = `Filled ${result.filled} field(s): ${filledLabels}. Review before submitting.`;
    } else if (!data.name && !data.email) {
      statusEl.textContent =
        "Profile is empty. Add name and email in Caliber → Profile, then retry.";
    } else {
      statusEl.textContent =
        "No matching fields on this page. Labels must match Name, Email, Phone, or Location.";
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fill failed";
    if (msg.includes("Could not establish connection")) {
      statusEl.textContent =
        "Extension error — go to chrome://extensions and click Reload on Caliber Apply Autofill.";
    } else if (msg.includes("Cannot access contents of")) {
      statusEl.textContent =
        "Can't access this page. Use a normal apply form (Greenhouse / Lever / Ashby).";
    } else {
      statusEl.textContent = msg;
    }
  } finally {
    fillBtn.disabled = false;
  }
});

loadSettings();
