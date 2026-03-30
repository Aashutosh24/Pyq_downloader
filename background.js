// Smart PYQ Finder — Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log("Smart PYQ Finder Extension Installed");
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getStatus") {
    sendResponse({ status: "active" });
  }
  return true;
});
