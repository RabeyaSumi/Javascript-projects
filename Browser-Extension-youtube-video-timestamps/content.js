chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideoInfo") {
    const video = document.querySelector("video");
    if (video) {
      sendResponse({
        videoId: new URLSearchParams(window.location.search).get("v"),
        currentTime: Math.floor(video.currentTime)
      });
    }
  }
  return true; // Keep the response channel open
});
