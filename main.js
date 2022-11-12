//if popup is opened at wrong url, display warning message
const checkURL = async () => {
  const validURLs = [
    "https://www.youtube.com/",
    "https://www.youtube.com/feed/subscriptions",
    "https://www.youtube.com/results?search_query=",
    "https://www.youtube.com/watch?v=",
  ];

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const matches = validURLs.filter(url => tab.url.includes(url));

  if (matches.length === 0) {
    const mainElement = document.querySelector("main");
    const wrongUrlTextElement = document.getElementById("wrongUrlText");
    mainElement.classList.add("removed");
    wrongUrlTextElement.classList.remove("removed");
  }
};

checkURL();

//finding all inputs in popup
const thumbnailInputElement = document.getElementById("thumbnailInput");
const thumbnailInputLabelElement = document.getElementById("thumbnailInputLabel");
const imageUploadAreaElement = document.getElementById("imageUploadArea");
const imageInputElement = document.getElementById("imageInput");
const imagePreviewElement = document.getElementById("imagePreview");
const titleInputElement = document.getElementById("titleInput");
const channelNameInputElement = document.getElementById("channelNameInput");
const numInputLabelElement = document.getElementById("numInputLabel");
const numInputElement = document.getElementById("numInput");
const useDefaultAvatarCheckboxElement = document.getElementById("useDefaultAvatarCheckbox");
const randomPositionCheckboxElement = document.getElementById("randomPositionCheckbox");
// const badgeCheckboxElement = document.getElementById("badgeCheckbox");
const imageSourceRadios = document.querySelectorAll('input[name="imageSource"]');
const imageLocalRadioElement = document.getElementById("imageLocalRadio");
const imageURLRadioElement = document.getElementById("imageURLRadio");

//placing previous/default values from storage to inputs
chrome.storage.local.get("imageInputValue", result => {
  if (result["imageInputValue"] !== undefined) {
    imagePreviewElement.classList.remove("removed");
    imagePreviewText.classList.add("removed");

    imagePreviewElement.src = result["imageInputValue"];
  }
});
chrome.storage.local.get("thumbnailInputValue", result => {
  if (result["thumbnailInputValue"] === undefined) thumbnailInputElement.defaultValue = "";
  else thumbnailInputElement.defaultValue = result["thumbnailInputValue"];
});
chrome.storage.local.get("titleInputValue", result => {
  if (result["titleInputValue"] === undefined) titleInputElement.defaultValue = "";
  else titleInputElement.defaultValue = result["titleInputValue"];
});
chrome.storage.local.get("channelNameInputValue", result => {
  if (result["channelNameInputValue"] === undefined) channelNameInputElement.defaultValue = "";
  else channelNameInputElement.defaultValue = result["channelNameInputValue"];
});
chrome.storage.local.get("numInputValue", result => {
  if (result["numInputValue"] === undefined) numInputElement.defaultValue = "1";
  else numInputElement.defaultValue = result["numInputValue"];
});
chrome.storage.local.get("useDefaultAvatarCheckboxValue", result => {
  if (result["useDefaultAvatarCheckboxValue"] === undefined) useDefaultAvatarCheckboxElement.checked = false;
  else useDefaultAvatarCheckboxElement.checked = result["useDefaultAvatarCheckboxValue"];

  if (useDefaultAvatarCheckboxElement.checked) lol.classList.remove("removed");
});
chrome.storage.local.get("randomPositionCheckboxValue", result => {
  if (result["randomPositionCheckboxValue"] === undefined) randomPositionCheckboxElement.checked = false;
  else randomPositionCheckboxElement.checked = result["randomPositionCheckboxValue"];

  if (randomPositionCheckboxElement.checked) numInputLabelElement.classList.add("removed");
});
// chrome.storage.local.get("badgeCheckboxValue", result => {
//   if (result["badgeCheckboxValue"] === undefined) badgeCheckboxElement.checked = false;
//   else badgeCheckboxElement.checked = result["badgeCheckboxValue"];
// });
chrome.storage.local.get("imageSourceValue", result => {
  switch (result["imageSourceValue"]) {
    case "url":
      imageURLRadioElement.checked = true;
      imageUploadAreaElement.classList.add("removed");
      break;
    case "image":
      imageLocalRadioElement.checked = true;
      thumbnailInputLabelElement.classList.add("removed");
      break;
    default:
      imageLocalRadioElement.checked = true;
      thumbnailInputLabelElement.classList.add("removed");
      break;
  }
});

//starting to listen to all changes to inputs and updating details in video
thumbnailInputElement.addEventListener("input", async () => {
  chrome.storage.local.set({ thumbnailInputValue: thumbnailInputElement.value }, () => {});
});
titleInputElement.addEventListener("input", async () => {
  chrome.storage.local.set({ titleInputValue: titleInputElement.value }, () => {});
});
channelNameInputElement.addEventListener("input", async () => {
  chrome.storage.local.set({ channelNameInputValue: channelNameInputElement.value }, () => {});
});
numInputElement.addEventListener("input", async () => {
  chrome.storage.local.set({ numInputValue: numInputElement.value }, () => {});
});

useDefaultAvatarCheckboxElement.addEventListener("input", async () => {
  chrome.storage.local.set({ useDefaultAvatarCheckboxValue: useDefaultAvatarCheckboxElement.checked }, () => {});

  if (useDefaultAvatarCheckboxElement.checked) lol.classList.add("removed");
  else lol.classList.remove("removed");
});
randomPositionCheckboxElement.addEventListener("input", async () => {
  chrome.storage.local.set({ randomPositionCheckboxValue: randomPositionCheckboxElement.checked }, () => {});

  if (randomPositionCheckboxElement.checked) numInputLabelElement.classList.add("removed");
  else numInputLabelElement.classList.remove("removed");
});
// badgeCheckboxElement.addEventListener("input", async () => {
//   chrome.storage.local.set({ badgeCheckboxValue: badgeCheckboxElement.checked }, () => {});
// });
imageSourceRadios.forEach(radio =>
  radio.addEventListener("input", async () => {
    chrome.storage.local.set({ imageSourceValue: radio.value }, () => {});

    if (radio.value === "url") {
      imageUploadAreaElement.classList.add("removed");
      thumbnailInputLabelElement.classList.remove("removed");
    } else {
      imageUploadAreaElement.classList.remove("removed");
      thumbnailInputLabelElement.classList.add("removed");
    }
  })
);

//preview upload
const preventDefaults = event => {
  event.preventDefault();
  event.stopPropagation();
};
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  imageUploadAreaElement.addEventListener(eventName, preventDefaults);
});

imageUploadAreaElement.ondrop = event => {
  imageInputElement.files = event.dataTransfer.files;

  updateImagePreview(imageInputElement.files[0]);
};

imageInputElement.addEventListener("change", event => updateImagePreview(event.target.files[0]));
imagePreviewElement.addEventListener("contextmenu", event => removeImagePreview(event));

const removeImagePreview = event => {
  event.preventDefault();
  imagePreviewElement.classList.add("removed");
  imagePreviewText.classList.remove("removed");
  imagePreviewElement.src = "";
};

const updateImagePreview = async file => {
  if (file) {
    imagePreviewElement.classList.remove("removed");
    imagePreviewText.classList.add("removed");

    const reader = new FileReader();
    reader.onloadend = () => {
      imagePreviewElement.src = reader.result;

      chrome.storage.local.set({ imageInputValue: reader.result }, () => {});
    };

    reader.readAsDataURL(file);
  } else {
    imagePreviewElement.classList.add("removed");
    imagePreviewText.classList.remove("removed");
  }
};

//applying changes to video on click
applyChangesButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let page = "";

  //what youtube page is user on?
  if (tab.url.includes("https://www.youtube.com/watch?v=")) page = "video";
  else if (tab.url.includes("https://www.youtube.com/feed/subscriptions")) page = "subs";
  else if (tab.url.includes("https://www.youtube.com/results?search_query=")) page = "search";
  else if (tab.url === "https://www.youtube.com/") page = "home";

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [page],
    function: applyChanges,
  });
});

//main function that finds all components of the video and changes them with values from inputs
const applyChanges = async page => {
  //getting values from storage
  const getValueFromStorage = async key => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, result => {
        if (result[key] === undefined) {
          reject("No value found");
        } else {
          resolve(result[key]);
        }
      });
    });
  };

  const saveOriginalVideo = value => {
    chrome.storage.local.set({ originalVideo: value }, () => {
      // console.log(value.index)
    });
  };

  const checkIfVideoIndexChanged = async indexOfVideoToReplace => {
    const savedVideoDetails = await getValueFromStorage("originalVideo");
    const previuosIndexOfVideoToReplace = savedVideoDetails.index;

    // console.log(previuosIndexOfVideoToReplace+1, indexOfVideoToReplace+1)

    if (previuosIndexOfVideoToReplace !== undefined && previuosIndexOfVideoToReplace !== indexOfVideoToReplace) {
      const oldVideoDiv =
        document.querySelectorAll("ytd-rich-grid-media")[previuosIndexOfVideoToReplace].children["dismissible"];
      const oldThumbnail = oldVideoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
      const oldTitle = oldVideoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0];
      const oldChannelName =
        oldVideoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"]
          .children[0].children[0];
      const oldAvatar = oldVideoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];

      oldThumbnail.src = savedVideoDetails.thumbnail;
      oldTitle.textContent = savedVideoDetails.title;
      oldChannelName.textContent = savedVideoDetails.channelName;
      oldAvatar.src = savedVideoDetails.avatar;
    }
  };

  //returning either random index or selected by user
  const returnIndexOfVideo = async () => {
    const isRandomPosition = await getValueFromStorage("randomPositionCheckboxValue");

    if (isRandomPosition) {
      const maxRandomNumberBasedOnURL = {
        home: 12,
        subs: 18,
        search: 4,
        video: 9,
      };

      // const allVideos = document.querySelectorAll("ytd-rich-grid-media");

      const randomIndex = Math.floor(Math.random() * maxRandomNumberBasedOnURL[page]);

      // await checkIfVideoIndexChanged(randomIndex);

      return randomIndex;
    } else {
      const chosenIndex = (await getValueFromStorage("numInputValue")) - 1;

      // await checkIfVideoIndexChanged(chosenIndex);

      return chosenIndex;
    }
  };

  const returnImageToUse = async () => {
    const isSourceOfImageIsURL = await getValueFromStorage("imageFromURLCheckboxValue");

    if (isSourceOfImageIsURL) {
      const imageToUse = await getValueFromStorage("thumbnailInputValue");
      return imageToUse;
    } else {
      const imageToUse = await getValueFromStorage("imageInputValue");
      return imageToUse;
    }
  };

  const indexOfVideoToReplace = await returnIndexOfVideo();
  const whatImageToUse = await returnImageToUse();
  const avatarFromTopbar = document.querySelectorAll("#avatar-btn")[0].children[0].children[0];

  let videoDiv = undefined;
  let title = undefined;
  let avatar = undefined;
  let thumbnail = undefined;
  let channelName = undefined;
  let badgeWrapper = undefined;
  let badge = undefined;

  //finding components of the video
  if (page === "home") {
    videoDiv = document.querySelectorAll("ytd-rich-grid-media")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0];
    avatar = videoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];
    thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
    channelName =
      videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0]
        .children[0];
    // badgeWrapper = videoDiv
    //   .getElementsByTagName("ytd-channel-name")[0]
    //   .getElementsByTagName("ytd-badge-supported-renderer")[0];
    // badge = videoDiv.getElementsByClassName("badge badge-style-type-verified")[0];
  } else if (page === "subs") {
    videoDiv = document.querySelectorAll("ytd-grid-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
    thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
    channelName =
      videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0]
        .children[0];
  } else if (page === "search") {
    videoDiv = document.querySelectorAll("ytd-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
    avatar = videoDiv.querySelectorAll("#channel-info")[0].querySelectorAll("yt-img-shadow")[0].children[0];
    thumbnail = videoDiv.getElementsByTagName("yt-img-shadow")[0].children[0];
    channelName = videoDiv.querySelectorAll("#channel-info")[0].querySelectorAll("yt-formatted-string")[0].children[0];
  } else if (page === "video") {
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
  title.textContent = await getValueFromStorage("titleInputValue");
  channelName.textContent = await getValueFromStorage("channelNameInputValue");
  avatar.src = avatarFromTopbar.src;

  // const showBadge = await getValueFromStorage("badgeCheckboxValue");
  // if (showBadge) {
  //   badgeWrapper.removeAttribute("hidden");
  //   const badgeIcon = document.createElement("div");
  //   badgeIcon.classList.add('badge', 'badge-style-type-verified', 'style-scope', 'ytd-badge-supported-renderer');
  //   // <div><p>Hi!</p></div>
  //   badgeIcon.innerHTML =
  //     '<yt-icon class="style-scope ytd-badge-supported-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;" class="style-scope yt-icon"><g class="style-scope yt-icon"><path d="M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M9.8,17.3l-4.2-4.1L7,11.8l2.8,2.7L17,7.4 l1.4,1.4L9.8,17.3z" class="style-scope yt-icon"></path></g></svg></yt-icon><span class="style-scope ytd-badge-supported-renderer"></span><tp-yt-paper-tooltip position="top" class="style-scope ytd-badge-supported-renderer" role="tooltip" tabindex="-1" style="left: 60.075px; top: -4.5px;"><div id="tooltip" class="style-scope tp-yt-paper-tooltip hidden" style-target="tooltip">Подтверждено</div></tp-yt-paper-tooltip>';
  //   // '<div class="badge badge-style-type-verified style-scope ytd-badge-supported-renderer" aria-label="Подтверждено"><yt-icon class="style-scope ytd-badge-supported-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;" class="style-scope yt-icon"><g class="style-scope yt-icon"><path d="M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M9.8,17.3l-4.2-4.1L7,11.8l2.8,2.7L17,7.4 l1.4,1.4L9.8,17.3z" class="style-scope yt-icon"></path></g></svg></yt-icon><span class="style-scope ytd-badge-supported-renderer"></span><tp-yt-paper-tooltip position="top" class="style-scope ytd-badge-supported-renderer" role="tooltip" tabindex="-1" style="left: 60.075px; top: -4.5px;"><div id="tooltip" class="style-scope tp-yt-paper-tooltip hidden" style-target="tooltip">Подтверждено</div></tp-yt-paper-tooltip></div>';
  //   badgeWrapper.appendChild(badgeIcon);
  // } else badge.style.visibility = "hidden";

  // badge = videoDiv.getElementsByClassName("badge badge-style-type-verified")[0];
};

// const badgeWrapper = document.querySelectorAll("ytd-rich-grid-media")[1].children["dismissible"].getElementsByTagName("ytd-channel-name")[0].getElementsByTagName("ytd-badge-supported-renderer")[0];
// badgeWrapper.removeAttribute("hidden");

{
  /* <ytd-badge-supported-renderer class="style-scope ytd-channel-name" system-icons="">
<div class="badge badge-style-type-verified style-scope ytd-badge-supported-renderer" aria-label="Подтверждено"><yt-icon class="style-scope ytd-badge-supported-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;" class="style-scope yt-icon"><g class="style-scope yt-icon"><path d="M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M9.8,17.3l-4.2-4.1L7,11.8l2.8,2.7L17,7.4 l1.4,1.4L9.8,17.3z" class="style-scope yt-icon"></path></g></svg></yt-icon><span class="style-scope ytd-badge-supported-renderer"></span><tp-yt-paper-tooltip position="top" class="style-scope ytd-badge-supported-renderer" role="tooltip" tabindex="-1" style="left: 45.9417px; top: -4.5px;"><div id="tooltip" class="style-scope tp-yt-paper-tooltip hidden" style-target="tooltip">
  Подтверждено
</div>
</tp-yt-paper-tooltip></div><dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>

<ytd-badge-supported-renderer
      class="style-scope ytd-channel-name"
      system-icons=""
    >
      <div
        class="badge badge-style-type-verified style-scope ytd-badge-supported-renderer"
        aria-label="Подтверждено"
      >
        <yt-icon class="style-scope ytd-badge-supported-renderer"
          ><svg
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            focusable="false"
            style="pointer-events: none; display: block; width: 100%; height: 100%"
            class="style-scope yt-icon"
          >
            <g class="style-scope yt-icon">
              <path
                d="M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M9.8,17.3l-4.2-4.1L7,11.8l2.8,2.7L17,7.4 l1.4,1.4L9.8,17.3z"
                class="style-scope yt-icon"
              ></path>
            </g></svg></yt-icon
        ><span class="style-scope ytd-badge-supported-renderer"></span
        ><tp-yt-paper-tooltip
          position="top"
          class="style-scope ytd-badge-supported-renderer"
          role="tooltip"
          tabindex="-1"
          style="left: 45.9417px; top: -4.5px"
          ><div
            id="tooltip"
            class="style-scope tp-yt-paper-tooltip hidden"
            style-target="tooltip"
          >
            Подтверждено
          </div>
        </tp-yt-paper-tooltip>
      </div>
      <dom-repeat
        id="repeat"
        as="badge"
        class="style-scope ytd-badge-supported-renderer"
        ><template is="dom-repeat"></template></dom-repeat
    ></ytd-badge-supported-renderer>

<svg viewBox="0 0 24 24" style="pointer-events:none;display:block;width:100%;height:100%" class="style-scope yt-icon"><g class="style-scope yt-icon"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM9.8 17.3l-4.2-4.1L7 11.8l2.8 2.7L17 7.4l1.4 1.4-8.6 8.5z" class="style-scope yt-icon"/></g></svg>

svg.setAttribute("viewBox", "0 0 24 24")
svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
svg.setAttribute("focusable", "false")
svg.setAttribute("style", "pointer-events: none; display: block; width: 100%; height: 100%;")
svg.setAttribute("class", "style-scope yt-icon")  */
}
