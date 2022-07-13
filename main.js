//finding all inputs in popup
const thumbnailInputElement = document.getElementById('thumbnailInput');
const titleInputElement = document.getElementById('titleInput');
const channelNameInputElement = document.getElementById('channelNameInput');
const numInputElement = document.getElementById('numInput');

//placing previous/default values from storage
chrome.storage.local.get('thumbnailInputValue', result => {
  if (result['thumbnailInputValue'] === undefined) thumbnailInputElement.defaultValue = "";
  else thumbnailInputElement.defaultValue = result['thumbnailInputValue'];
});
chrome.storage.local.get('titleInputValue', result => {
  if (result['titleInputValue'] === undefined)  titleInputElement.defaultValue = "";
  else  titleInputElement.defaultValue = result['titleInputValue'];
});
chrome.storage.local.get('channelNameInputValue', result => {
  if (result['channelNameInputValue'] === undefined) channelNameInputElement.defaultValue = "";
  else channelNameInputElement.defaultValue = result['channelNameInputValue'];
});
chrome.storage.local.get('numInputValue', result => {
  if (result['numInputValue'] === undefined) numInputElement.defaultValue = "1";
  else numInputElement.defaultValue = result['numInputValue'];
});

//start listen to all changes to inputs and updating fake video
thumbnailInput.addEventListener("input", async () => {
  chrome.storage.local.set({"thumbnailInputValue": thumbnailInputElement.value}, () => {});
  startScript();
});
titleInput.addEventListener("input", async () => {
  chrome.storage.local.set({"titleInputValue": titleInputElement.value}, () => {});
  startScript();
});
channelNameInput.addEventListener("input", async () => {
  chrome.storage.local.set({"channelNameInputValue": channelNameInputElement.value}, () => {});
  startScript();
});
numInput.addEventListener("input", async () => {
  chrome.storage.local.set({"numInputValue": numInputElement.value}, () => {});
  startScript();
});

// const saveOriginal

//main function that is called for all changes
const startScript = async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    // args: [titleInputValue, channelNameInputValue, thumbnailInputValue],
    function: applyChanges,
  });
}

//main function that is called for all changes
startScript();

//
const applyChanges = async () => {
  if (window.location.href === 'https://www.youtube.com/') {
    
  //getting values from storage
    const returnValueFromStorage = async (key) => {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, function (result) {
          if (result[key] === undefined) {
            console.log("No value found");
            reject();
          } else {
            resolve(result[key]);
          }
        });
      });
    };

    //index of video that will be replaced
    const indexOfVideoToReplace = await returnValueFromStorage('numInputValue') - 1;

    //div with chosen video
    const videoDiv = document.querySelectorAll("ytd-rich-grid-media")[indexOfVideoToReplace].children["dismissible"];

    //getting avatar of the account in case of "Get avatar from account" checkbox
    const avatarFromTopbar = document.querySelectorAll("#avatar-btn")[0].children[0].children[0];

    //finding all components of the video
    const thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
    const title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0];
    const channelName = videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0].children[0];
    const avatar = videoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];

    //applying all fake changes to video
    thumbnail.src = await returnValueFromStorage('thumbnailInputValue');
    title.textContent = await returnValueFromStorage('titleInputValue');
    channelName.textContent = await returnValueFromStorage('channelNameInputValue');
    avatar.src = avatarFromTopbar.src;
  }
}

// const thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
// const avatar = videoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];
// const title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0]; 
// const channelName = videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0].children[0];

// const badge = videoDiv.children["details"].children["meta"].getElementsByTagName("ytd-video-meta-block")[0].children["metadata"].children["byline-container"].getElementsByTagName("ytd-channel-name")[0].getElementsByTagName("ytd-badge-supported-renderer")[0];