 // background service worker
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg && msg.type === 'openSearch' && msg.query) {
    const q = encodeURIComponent(msg.query);
    // Open a small popup window with Google search
    chrome.windows.create({
      url: `https://www.google.com/search?q=${q}`,
      type: 'popup',
      width: 900,
      height: 700
    });
  }
});
