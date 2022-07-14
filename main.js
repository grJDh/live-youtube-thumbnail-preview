//finding all inputs in popup
const thumbnailInputElement = document.getElementById('thumbnailInput');
const titleInputElement = document.getElementById('titleInput');
const channelNameInputElement = document.getElementById('channelNameInput');
const numInputElement = document.getElementById('numInput');
const randomPositionCheckboxElement = document.getElementById('randomPositionCheckbox');

//placing previous/default values from storage to inputs
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
chrome.storage.local.get('randomPositionCheckboxValue', result => {
  if (result['randomPositionCheckboxValue'] === undefined) randomPositionCheckboxElement.checked = false;
  else randomPositionCheckboxElement.checked = result['randomPositionCheckboxValue'];

  if (randomPositionCheckboxElement.checked) numInputLabel.style.visibility = "hidden";
});

//starting to listen to all changes to inputs and updating details in video
thumbnailInput.addEventListener("input", async () => {
  chrome.storage.local.set({"thumbnailInputValue": thumbnailInputElement.value}, () => {});
  // startScript();
});
titleInput.addEventListener("input", async () => {
  chrome.storage.local.set({"titleInputValue": titleInputElement.value}, () => {});
  // startScript();
});
channelNameInput.addEventListener("input", async () => {
  chrome.storage.local.set({"channelNameInputValue": channelNameInputElement.value}, () => {});
  // startScript();
});
numInput.addEventListener("input", async () => {
  chrome.storage.local.set({"numInputValue": numInputElement.value}, () => {});
  // startScript();
});
randomPositionCheckbox.addEventListener("input", async () => {
  chrome.storage.local.set({"randomPositionCheckboxValue": randomPositionCheckboxElement.checked}, () => {});

  if (randomPositionCheckboxElement.checked) numInputLabel.style.visibility = "hidden";
  else numInputLabel.style.visibility = "visible";
  // startScript();
});

//applying changes to video on click
applyChangesButton.addEventListener("click", () => {
  startScript();
});

// head function that is called for all changes and calls main function
const startScript = async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    // args: [titleInputValue, channelNameInputValue, thumbnailInputValue],
    function: applyChanges,
  });
}

//main function that finds all components of the video and changes them with values from inputs
const applyChanges = async () => {

  //getting values from storage
  const getValueFromStorage = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        if (result[key] === undefined) {
          reject("No value found");
        } else {
          resolve(result[key]);
        }
      });
    });
  };

  const saveOriginalVideo = value => {
    chrome.storage.local.set({"originalVideo": value}, () => {
      // console.log(value.index)
    });
  }

  const checkIfVideoIndexChanged = async (indexOfVideoToReplace) => {
    const savedVideoDetails = await getValueFromStorage('originalVideo');
    const previuosIndexOfVideoToReplace = savedVideoDetails.index;

    // console.log(previuosIndexOfVideoToReplace+1, indexOfVideoToReplace+1)

    if (previuosIndexOfVideoToReplace !== undefined && previuosIndexOfVideoToReplace !== indexOfVideoToReplace) {
      const oldVideoDiv = document.querySelectorAll("ytd-rich-grid-media")[previuosIndexOfVideoToReplace].children["dismissible"];
      const oldThumbnail = oldVideoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
      const oldTitle = oldVideoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0];
      const oldChannelName = oldVideoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0].children[0];
      const oldAvatar = oldVideoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];

      oldThumbnail.src = savedVideoDetails.thumbnail;
      oldTitle.textContent = savedVideoDetails.title;
      oldChannelName.textContent = savedVideoDetails.channelName;
      oldAvatar.src = savedVideoDetails.avatar;
    }
  };

  const returnIndexOfVideo = async () => {
    const chooseRandomVideo = await getValueFromStorage('randomPositionCheckboxValue');

    if (chooseRandomVideo) {
      const allVideos = document.querySelectorAll("ytd-rich-grid-media");

      let randomIndex = Math.floor(Math.random() * (allVideos.length / 2));

      await checkIfVideoIndexChanged(randomIndex);

      return randomIndex;

    } else {
      const chosenIndex = await getValueFromStorage('numInputValue') - 1;

      await checkIfVideoIndexChanged(chosenIndex);

      return chosenIndex;
    }
  }

  //does user wants to replace random video
  //index of video that will be replaced
  const indexOfVideoToReplace = await returnIndexOfVideo()


  if (window.location.href === 'https://www.youtube.com/') {

    //div with chosen video
    const videoDiv = document.querySelectorAll("ytd-rich-grid-media")[indexOfVideoToReplace].children["dismissible"];

    //getting avatar of the account in case of "Get avatar from account" checkbox
    const avatarFromTopbar = document.querySelectorAll("#avatar-btn")[0].children[0].children[0];

    //finding all components of the video
    const thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
    const title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0];
    const channelName = videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0].children[0];
    const avatar = videoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];

    saveOriginalVideo({
      index: indexOfVideoToReplace,
      thumbnail: thumbnail.src,
      title: title.textContent,
      channelName: channelName.textContent,
      avatar: avatar.src,
    });

    //applying all fake changes to video
    thumbnail.src = await getValueFromStorage('thumbnailInputValue');
    title.textContent = await getValueFromStorage('titleInputValue');
    channelName.textContent = await getValueFromStorage('channelNameInputValue');
    avatar.src = avatarFromTopbar.src;
  }
}

// const badge = videoDiv.children["details"].children["meta"].getElementsByTagName("ytd-video-meta-block")[0].children["metadata"].children["byline-container"].getElementsByTagName("ytd-channel-name")[0].getElementsByTagName("ytd-badge-supported-renderer")[0];