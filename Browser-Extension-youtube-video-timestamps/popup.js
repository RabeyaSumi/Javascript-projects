document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveBookmark");

  saveButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;

      chrome.scripting.executeScript(
        { target: { tabId: tab.id }, files: ["content.js"] },
        () => {
          chrome.tabs.sendMessage(tab.id, { action: "getVideoInfo" }, (response) => {
            if (response?.videoId) saveBookmark(response.videoId, response.currentTime);
            else console.error("Failed to get video info.");
          });
        }
      );
    });
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const videoId = new URLSearchParams(new URL(tabs[0].url).search).get("v");
    if (videoId) displayBookmarks(videoId);
  });
});

function saveBookmark(videoId, currentTime) {
  chrome.storage.sync.get([videoId], (data) => {
    const bookmarks = data[videoId] || [];
    if (!bookmarks.includes(currentTime)) {
      bookmarks.push(currentTime);
      chrome.storage.sync.set({ [videoId]: bookmarks }, () => displayBookmarks(videoId));
    }
  });
}

function deleteBookmark(videoId, time) {
  chrome.storage.sync.get([videoId], (data) => {
    const updated = (data[videoId] || []).filter((t) => t !== time);
    chrome.storage.sync.set({ [videoId]: updated }, () => displayBookmarks(videoId));
  });
}

function displayBookmarks(videoId) {
  chrome.storage.sync.get([videoId], (data) => {
    const bookmarksList = document.getElementById("bookmarksList");
    bookmarksList.innerHTML = "";
    (data[videoId] || []).sort((a, b) => a - b).forEach((time) => {
      const listItem = document.createElement("li");

      const timeLink = document.createElement("span");
      timeLink.textContent = `Bookmark at ${time}s`;
      timeLink.className = "bookmark-time";
      timeLink.onclick = () => {
        chrome.tabs.update({ url: `https://www.youtube.com/watch?v=${videoId}&t=${time}s` });
      };

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-btn";
      deleteButton.onclick = () => deleteBookmark(videoId, time);

      listItem.append(timeLink, deleteButton);
      bookmarksList.appendChild(listItem);
    });
  });
}
