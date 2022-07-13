applyTitle.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: applyNewTitle,
  });
});

const applyNewTitle = () => {
  const n = 0;

  if (window.location.href === 'https://www.youtube.com/') {
    const primaryDiv = document.querySelectorAll("div.ytd-two-column-browse-results-renderer")[0];

    const contentDiv = primaryDiv.children[0].children["contents"];

    const rowDiv = contentDiv.children[n]
    // [0] - первая строка, [1] - вторая, итд

    const videoDiv = rowDiv.children[0].children[n].children[0].children[0].children["dismissible"];
    // [0] - первое видео, [1] - второе, итд

    const title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0]; 

    title.textContent = "Right Title"
  }
}

// const thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
// const avatar = videoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];
// const title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0]; 
// const channelName = videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0].children[0];

// const badge = videoDiv.children["details"].children["meta"].getElementsByTagName("ytd-video-meta-block")[0].children["metadata"].children["byline-container"].getElementsByTagName("ytd-channel-name")[0].getElementsByTagName("ytd-badge-supported-renderer")[0];