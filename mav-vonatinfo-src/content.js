try {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("./inject.js");
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
} catch (err) {
  console.error("Hiba:", err);
}
