//if popup is opened at wrong url, display warning message
const checkURL = async () => {
  const validURLs =[
    'https://www.youtube.com/',
    'https://www.youtube.com/feed/subscriptions',
    'https://www.youtube.com/results?search_query=',
    'https://www.youtube.com/watch?v=',
  ];

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const matches = validURLs.filter(url => tab.url.includes(url));

  if (matches.length === 0) {
    const mainElement = document.getElementById('main');
    const wrongUrlTextElement = document.getElementById('wrongUrlText');
    mainElement.classList.add("removed");
    wrongUrlTextElement.classList.remove("removed");
  }
}

checkURL();

//finding all inputs in popup
const thumbnailInputElement = document.getElementById('thumbnailInput');
const thumbnailInputLabelElement = document.getElementById('thumbnailInputLabel');
const imageUploadAreaElement = document.getElementById('imageUploadArea');
const imageInputElement = document.getElementById('imageInput');
const imagePreviewElement = document.getElementById("imagePreview");
const titleInputElement = document.getElementById('titleInput');
const channelNameInputElement = document.getElementById('channelNameInput');
const numInputElement = document.getElementById('numInput');
const randomPositionCheckboxElement = document.getElementById('randomPositionCheckbox');
const imageFromURLCheckboxElement = document.getElementById('imageFromURLCheckbox');

//placing previous/default values from storage to inputs
chrome.storage.local.get('imageInputValue', result => {
  if (result['imageInputValue'] !== undefined) {
    imagePreviewElement.classList.remove("removed");
    imagePreviewText.classList.add("removed");

    imagePreviewElement.src = result['imageInputValue'];
  }
});
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

  if (randomPositionCheckboxElement.checked) numInputLabel.classList.add("removed");
});
chrome.storage.local.get('imageFromURLCheckboxValue', result => {
  if (result['imageFromURLCheckboxValue'] === undefined) imageFromURLCheckboxElement.checked = false;
  else imageFromURLCheckboxElement.checked = result['imageFromURLCheckboxValue'];

  if (imageFromURLCheckboxElement.checked) imageUploadAreaElement.classList.add("removed")
  else thumbnailInputLabelElement.classList.add("removed")
});

//starting to listen to all changes to inputs and updating details in video
thumbnailInputElement.addEventListener("input", async () => {
  chrome.storage.local.set({"thumbnailInputValue": thumbnailInputElement.value}, () => {});
});
titleInputElement.addEventListener("input", async () => {
  chrome.storage.local.set({"titleInputValue": titleInputElement.value}, () => {});
});
channelNameInputElement.addEventListener("input", async () => {
  chrome.storage.local.set({"channelNameInputValue": channelNameInputElement.value}, () => {});
});
numInputElement.addEventListener("input", async () => {
  chrome.storage.local.set({"numInputValue": numInputElement.value}, () => {});
});
randomPositionCheckboxElement.addEventListener("input", async () => {
  chrome.storage.local.set({"randomPositionCheckboxValue": randomPositionCheckboxElement.checked}, () => {});

  if (randomPositionCheckboxElement.checked) numInputLabel.classList.add("removed");
  else numInputLabel.classList.remove("removed");
});
imageFromURLCheckboxElement.addEventListener("input", async () => {
  chrome.storage.local.set({"imageFromURLCheckboxValue": imageFromURLCheckboxElement.checked}, () => {});

  if (imageFromURLCheckboxElement.checked) {
    imageUploadAreaElement.classList.add("removed")
    thumbnailInputLabelElement.classList.remove("removed")
  }
  else {
    imageUploadAreaElement.classList.remove("removed")
    thumbnailInputLabelElement.classList.add("removed")
  }
});

//image upload
const preventDefaults = event => {
  event.preventDefault()
  event.stopPropagation()
}
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  imageUploadAreaElement.addEventListener(eventName, preventDefaults)
})

// ['dragenter', 'dragover'].forEach(eventName => {
//   imageUploadAreaElement.addEventListener(eventName, highlight)
// })
// ['dragleave', 'drop'].forEach(eventName => {
//   imageUploadAreaElement.addEventListener(eventName, unhighlight)
// })
// function highlight() {
//   imageUploadAreaElement.classList.add('highlight')
// }
// function unhighlight() {
//   imageUploadAreaElement.classList.remove('highlight')
// }

// imageUploadAreaElement.addEventListener('drop', onDrop);

imageUploadAreaElement.ondrop = event => {
  imageInputElement.files = event.dataTransfer.files;

  updateImagePreview(imageInputElement.files[0]);
};

imageInputElement.addEventListener('change', event => updateImagePreview(event.target.files[0]));

const updateImagePreview = async (file) => {
  if (file) {
    imagePreviewElement.classList.remove("removed");
    imagePreviewText.classList.add("removed");

    const reader = new FileReader();
    reader.onloadend = () => {
      imagePreviewElement.src = reader.result;

      // console.log(reader.result)

      chrome.storage.local.set({"imageInputValue": reader.result}, () => {});
    }

    reader.readAsDataURL(file);
  } else {
    imagePreviewElement.classList.add("removed");
    imagePreviewText.classList.remove("removed");
  }
}

//applying changes to video on click
applyChangesButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let page = "";

  //what youtube page is user on?
  if (tab.url.includes('https://www.youtube.com/watch?v=')) page = "video";
  else if (tab.url.includes('https://www.youtube.com/feed/subscriptions')) page = "subs";
  else if (tab.url.includes('https://www.youtube.com/results?search_query=')) page = "search";
  else if (tab.url === 'https://www.youtube.com/') page = "home";

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [page],
    function: applyChanges,
  });
});

//main function that finds all components of the video and changes them with values from inputs
const applyChanges = async (page) => {

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

  //returning either random index or selected by user
  const returnIndexOfVideo = async () => {
    const isRandomPosition = await getValueFromStorage('randomPositionCheckboxValue');

    if (isRandomPosition) {
      const maxRandomNumberBasedOnURL = {
        "home": 12,
        "subs": 18,
        "search": 4,
        "video": 9,
      };
      
      // const allVideos = document.querySelectorAll("ytd-rich-grid-media");

      const randomIndex = Math.floor(Math.random() * maxRandomNumberBasedOnURL[page]);

      // await checkIfVideoIndexChanged(randomIndex);

      return randomIndex;

    } else {
      const chosenIndex = await getValueFromStorage('numInputValue') - 1;

      // await checkIfVideoIndexChanged(chosenIndex);

      return chosenIndex;
    }
  }

  const returnImageToUse = async () => {
    const isSourceOfImageIsURL = await getValueFromStorage('imageFromURLCheckboxValue');

    if (isSourceOfImageIsURL) {
      const imageToUse = await getValueFromStorage('thumbnailInputValue')
      return imageToUse;
    } else {
      const imageToUse = await getValueFromStorage('imageInputValue');
      return imageToUse;
    }
  }

  const indexOfVideoToReplace = await returnIndexOfVideo();
  const whatImageToUse = await returnImageToUse();
  const avatarFromTopbar = document.querySelectorAll("#avatar-btn")[0].children[0].children[0];

  let videoDiv = undefined;
  let title = undefined;
  let avatar = undefined; 
  let thumbnail = undefined;
  let channelName = undefined;

  //finding components of the video
  if (page === 'home') {
    videoDiv = document.querySelectorAll("ytd-rich-grid-media")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0];
    avatar = videoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];
    thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
    channelName = videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0].children[0];  
  }
  else if (page === 'subs') {
    videoDiv = document.querySelectorAll("ytd-grid-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
    thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
    channelName = videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0].children[0];  
  }
  else if (page === 'search') {
    videoDiv = document.querySelectorAll("ytd-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
    avatar = videoDiv.querySelectorAll("#channel-info")[0].querySelectorAll("yt-img-shadow")[0].children[0];
    thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
    channelName = videoDiv.querySelectorAll("#channel-info")[0].querySelectorAll("yt-formatted-string")[0].children[0];
  }
  else if (page === 'video') {
    videoDiv = document.querySelectorAll("ytd-compact-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("span")[0];
    thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
    channelName = videoDiv.querySelectorAll("yt-formatted-string")[0];
  }
  
  // saveOriginalVideo({
  //   index: indexOfVideoToReplace,
  //   thumbnail: thumbnail.src,
  //   title: title.textContent,
  //   channelName: channelName.textContent,
  //   avatar: avatar.src,
  // });

  //applying all fake changes to video
  thumbnail.src = whatImageToUse;
  title.textContent = await getValueFromStorage('titleInputValue');
  channelName.textContent = await getValueFromStorage('channelNameInputValue');
  avatar.src = avatarFromTopbar.src;
}

// const badge = videoDiv.children["details"].children["meta"].getElementsByTagName("ytd-video-meta-block")[0].children["metadata"].children["byline-container"].getElementsByTagName("ytd-channel-name")[0].getElementsByTagName("ytd-badge-supported-renderer")[0];