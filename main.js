// chrome.storage.local.clear();

//TODO: remove and place badge in search doesn't work
//TODO: restore video that was replaced after replacing again
//TODO: add and test mobile youtube

//if popup is opened at wrong url, display warning message
const checkURL = async () => {
  const validURLs = [
    "youtube.com/",
    "youtube.com/feed/subscriptions",
    "youtube.com/results?search_query=",
    "youtube.com/watch?v=",
  ];

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const matches = validURLs.filter(url => tab.url.includes(url));

  if (matches.length === 0) {
    const mainElement = document.getElementsByClassName("main")[0];
    const wrongUrlTextElement = document.getElementById("wrongUrlText");
    mainElement.classList.add("removed");
    wrongUrlTextElement.classList.remove("removed");
  }
};

checkURL();

//finding all required elements
const thumbnailURLInputElement = document.getElementById("thumbnailURLInput");
const thumbnailURLInputDivElement = document.getElementById("thumbnailURLInputDiv");
const thumbnailURLInputLabelElement = document.getElementById("thumbnailURLInput");
const thumbnailUploadAreaElement = document.getElementById("thumbnailUploadArea");
const thumbnailUploadInputElement = document.getElementById("thumbnailUploadInput");
const localThumbnailPreviewElement = document.getElementById("localThumbnailPreview");
const URLThumbnailPreviewElement = document.getElementById("URLThumbnailPreview");

const titleInputElement = document.getElementById("titleInput");

const channelNameInputElement = document.getElementById("channelNameInput");

const numInputLabelElement = document.getElementById("numInputLabel");
const numInputElement = document.getElementById("numInput");

const avatarUploadAreaElement = document.getElementById("avatarUploadArea");
const avatarUploadInputElement = document.getElementById("avatarUploadInput");
const avatarPreviewElement = document.getElementById("avatarPreview");
const avatarCheckboxElement = document.getElementById("avatarCheckbox");

const userAvatarElement = document.getElementById("userAvatar");

const badgeCheckboxElement = document.getElementById("badgeCheckbox");
const useDefaultAvatarCheckboxElement = document.getElementById("useDefaultAvatarCheckbox");
const randomPositionCheckboxElement = document.getElementById("randomPositionCheckbox");

const imageSourceRadios = document.querySelectorAll('input[name="imageSource"]');
const imageLocalRadioElement = document.getElementById("imageLocalRadio");
const imageURLRadioElement = document.getElementById("imageURLRadio");
const applyChangesButtonElement = document.getElementById("applyChangesButton");

//finding elements required for localization
const imageLocalRadioLabelElement = document.getElementById("imageLocalRadioLabel");
const imageURLRadioLabelElement = document.getElementById("imageURLRadioLabel");
const thumbnailURLInputLabelTextElement = document.getElementById("thumbnailURLInputLabelText");
const emptyPreviewTextThumbnailElement = document.getElementsByClassName("emptyPreviewText")[0];
const emptyPreviewTextAvatarElement = document.getElementsByClassName("emptyPreviewText")[1];
const titleLabelTextElement = document.getElementById("titleLabelText");
const channelNameLabelTextElement = document.getElementById("channelNameLabelText");
// const placeBadgeSwitchElement = document.getElementsByClassName("switch-label")[0].getElementsByTagName("p")[0];
// const avatarSourceSwitchElement = document.getElementsByClassName("switch-label")[1].getElementsByTagName("p")[0];
// const randomPositionSwitchElement = document.getElementsByClassName("switch-label")[2].getElementsByTagName("p")[0];
const numInputLabelTextElement = document.getElementById("numInputLabelText");
const wrongUrlTextElement = document.getElementById("wrongUrlText");

//localization
imageLocalRadioLabelElement.textContent = chrome.i18n.getMessage("imageLocalRadioLabel");
imageURLRadioLabelElement.textContent = chrome.i18n.getMessage("imageURLRadioLabel");
thumbnailURLInputLabelTextElement.textContent = chrome.i18n.getMessage("thumbnailURLInputLabelText");
// emptyPreviewTextThumbnailElement.textContent = chrome.i18n.getMessage("emptyPreviewTextThumbnail");
// emptyPreviewTextAvatarElement.textContent = chrome.i18n.getMessage("emptyPreviewTextAvatar");
// hoverPreviewTextLMBElement.textContent = chrome.i18n.getMessage("hoverPreviewTextLMB");
// hoverPreviewTextRMBElement.textContent = chrome.i18n.getMessage("hoverPreviewTextRMB");
titleLabelTextElement.textContent = chrome.i18n.getMessage("titleLabelText");
channelNameLabelTextElement.textContent = chrome.i18n.getMessage("channelNameLabelText");
// placeBadgeSwitchElement.textContent = chrome.i18n.getMessage("placeBadgeSwitch");
// avatarSourceSwitchElement.textContent = chrome.i18n.getMessage("avatarSourceSwitch");
// randomPositionSwitchElement.textContent = chrome.i18n.getMessage("randomPositionSwitch");
numInputLabelTextElement.textContent = chrome.i18n.getMessage("numInputLabelText");
applyChangesButtonElement.textContent = chrome.i18n.getMessage("applyChangesButton");
wrongUrlTextElement.textContent = chrome.i18n.getMessage("wrongUrlText");

//placing previous/default values from storage to inputs
const readInputValueFromStorageAndPlaceDefaultValue = (valueName, element, defaultValue = "", checkbox = false) => {
  chrome.storage.local.get(valueName, result => {
    if (checkbox) {
      if (result[valueName] === undefined) {
        element.checked = defaultValue;
        chrome.storage.local.set({ [valueName]: defaultValue }, () => {});
      } else element.checked = result[valueName];
    } else {
      if (result[valueName] === undefined) {
        element.defaultValue = defaultValue;
        chrome.storage.local.set({ [valueName]: defaultValue }, () => {});
      } else element.defaultValue = result[valueName];
    }
  });
};
// const readCheckboxValueFromStorageAndToggleRemoved = (
//   valueName,
//   element,
//   toggledElement,
//   defaultValue = false,
//   remove = true
// ) => {
//   chrome.storage.local.get(valueName, result => {
//     if (result[valueName] === undefined) {
//       element.checked = defaultValue;
//       chrome.storage.local.set({ [valueName]: defaultValue }, () => {});
//     } else element.checked = result[valueName];

//     if (element.checked) {
//       if (remove) toggledElement.classList.add("removed");
//       else toggledElement.classList.remove("removed");
//     }
//   });
// };
const readImageValueFromStorageAndPlaceItInImageSrc = (valueName, element) => {
  chrome.storage.local.get(valueName, result => {
    if (result[valueName] !== undefined) {
      element.classList.remove("removed");
      element.src = result[valueName];
    } else {
      chrome.storage.local.set({ [valueName]: "" }, () => {});
    }
  });
};

// readInputValueFromStorageAndPlaceDefaultValue("thumbnailURLInputValue", thumbnailURLInputElement, "");
readInputValueFromStorageAndPlaceDefaultValue("titleInputValue", titleInputElement, "");
readInputValueFromStorageAndPlaceDefaultValue("channelNameInputValue", channelNameInputElement, "");
readInputValueFromStorageAndPlaceDefaultValue("numInputValue", numInputElement, "3");
readInputValueFromStorageAndPlaceDefaultValue(
  "randomPositionCheckboxValue",
  randomPositionCheckboxElement,
  false,
  true
);

// readCheckboxValueFromStorageAndToggleRemoved(
//   "useDefaultAvatarCheckboxValue",
//   useDefaultAvatarCheckboxElement,
//   avatarUploadAreaElement,
//   true,
//   true
// );
// readCheckboxValueFromStorageAndToggleRemoved(
//   "randomPositionCheckboxValue",
//   randomPositionCheckboxElement,
//   numInputLabelElement,
//   false,
//   true
// );

readImageValueFromStorageAndPlaceItInImageSrc("thumbnailUploadInputValue", localThumbnailPreviewElement);
readImageValueFromStorageAndPlaceItInImageSrc("avatarUploadInputValue", avatarPreviewElement);

chrome.storage.local.get("imageSourceValue", result => {
  switch (result["imageSourceValue"]) {
    case "url":
      imageURLRadioElement.checked = true;
      thumbnailUploadAreaElement.classList.add("removed");
      break;
    case "image":
      imageLocalRadioElement.checked = true;
      thumbnailURLInputDivElement.classList.add("removed");
      break;
    default:
      imageLocalRadioElement.checked = true;
      thumbnailURLInputDivElement.classList.add("removed");
      chrome.storage.local.set({ ["imageSourceValue"]: "image" }, () => {});
      break;
  }
});
chrome.storage.local.get("thumbnailURLInputValue", result => {
  if (result["thumbnailURLInputValue"] === undefined) {
    thumbnailURLInputElement.defaultValue = "";
    chrome.storage.local.set({ ["thumbnailURLInputValue"]: "" }, () => {});
  } else thumbnailURLInputElement.defaultValue = result["thumbnailURLInputValue"];

  URLThumbnailPreviewElement.src = result["thumbnailURLInputValue"];
});
chrome.storage.local.get("badgeCheckboxValue", result => {
  if (result["badgeCheckboxValue"] === undefined) {
    badgeCheckboxElement.checked = false;
    chrome.storage.local.set({ ["badgeCheckboxValue"]: false }, () => {});
  } else {
    badgeCheckboxElement.checked = result["badgeCheckboxValue"];
  }
});

const readAvatarCheckboxValueFromStorageAndUpdateAvatarImage = async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [],
    function: () => {
      const userAvatarSrc = document.getElementById("img").src;
      chrome.storage.local.set({ ["userAvatarSrc"]: userAvatarSrc }, () => {});
    },
  });

  chrome.storage.local.get("useDefaultAvatarCheckboxValue", result => {
    avatarCheckboxElement.checked = result["useDefaultAvatarCheckboxValue"];

    if (avatarCheckboxElement.checked) {
      avatarUploadInputElement.disabled = true;
      avatarUploadAreaElement.classList.remove("upload-area");
      avatarUploadAreaElement.style.border = "1px solid black";

      chrome.storage.local.get("userAvatarSrc", result => {
        avatarPreviewElement.src = result["userAvatarSrc"];
      });
      chrome.storage.local.get("avatarUploadInputValue", result => {
        userAvatarElement.src = result["avatarUploadInputValue"];
      });
    } else {
      avatarUploadInputElement.disabled = false;
      avatarUploadAreaElement.classList.add("upload-area");
      avatarUploadAreaElement.style.border = "1px dashed black";

      chrome.storage.local.get("avatarUploadInputValue", result => {
        avatarPreviewElement.src = result["avatarUploadInputValue"];
      });
      chrome.storage.local.get("userAvatarSrc", result => {
        userAvatarElement.src = result["userAvatarSrc"];
      });
    }
  });
};
readAvatarCheckboxValueFromStorageAndUpdateAvatarImage();

//starting to listen to all changes in inputs and updating details in video
const listenToChangesAndUpdateStorage = (element, valueName, checkbox = false) => {
  element.addEventListener("input", async () => {
    if (checkbox) chrome.storage.local.set({ [valueName]: element.checked }, () => {});
    else chrome.storage.local.set({ [valueName]: element.value }, () => {});
  });
};
// const listenToChangesUpdateStorageAndRemoveElement = (element, valueName, toggledElement, remove = true) => {
//   element.addEventListener("input", async () => {
//     chrome.storage.local.set({ [valueName]: element.checked }, () => {});

//     if (remove) {
//       if (element.checked) toggledElement.classList.add("removed");
//       else toggledElement.classList.remove("removed");
//     } else {
//       if (element.checked) toggledElement.classList.remove("removed");
//       else toggledElement.classList.add("removed");
//     }
//   });
// };

// listenToChangesAndUpdateStorage(thumbnailURLInputElement, "thumbnailURLInputValue");
listenToChangesAndUpdateStorage(titleInputElement, "titleInputValue");
listenToChangesAndUpdateStorage(channelNameInputElement, "channelNameInputValue");
listenToChangesAndUpdateStorage(numInputElement, "numInputValue");
listenToChangesAndUpdateStorage(badgeCheckboxElement, "badgeCheckboxValue", true);
listenToChangesAndUpdateStorage(randomPositionCheckboxElement, "randomPositionCheckboxValue", true);

const listenToAvatarSourceChangesUpdateStorageAndUpdateStyle = () => {
  avatarCheckboxElement.addEventListener("input", async () => {
    chrome.storage.local.set({ ["useDefaultAvatarCheckboxValue"]: avatarCheckboxElement.checked }, () => {});

    if (avatarCheckboxElement.checked) {
      avatarUploadInputElement.disabled = true;
      avatarUploadAreaElement.classList.remove("upload-area");
      avatarUploadAreaElement.style.border = "1px solid black";

      chrome.storage.local.get("userAvatarSrc", result => {
        avatarPreviewElement.src = result["userAvatarSrc"];
      });
      chrome.storage.local.get("avatarUploadInputValue", result => {
        userAvatarElement.src = result["avatarUploadInputValue"];
      });
    } else {
      avatarUploadInputElement.disabled = false;
      avatarUploadAreaElement.classList.add("upload-area");
      avatarUploadAreaElement.style.border = "1px dashed black";

      chrome.storage.local.get("avatarUploadInputValue", result => {
        avatarPreviewElement.src = result["avatarUploadInputValue"];
      });
      chrome.storage.local.get("userAvatarSrc", result => {
        userAvatarElement.src = result["userAvatarSrc"];
      });
    }
  });
};
listenToAvatarSourceChangesUpdateStorageAndUpdateStyle();

// listenToChangesUpdateStorageAndRemoveElement(
//   useDefaultAvatarCheckboxElement,
//   "useDefaultAvatarCheckboxValue",
//   avatarUploadAreaElement,
//   true
// );
// listenToChangesUpdateStorageAndRemoveElement(
//   randomPositionCheckboxElement,
//   "randomPositionCheckboxValue",
//   numInputLabelElement,
//   true
// );

// badgeCheckboxElement.addEventListener("input", async () => {
//   chrome.storage.local.set({ ["badgeCheckboxValue"]: badgeCheckboxElement.checked }, () => {});
// });
imageSourceRadios.forEach(radio =>
  radio.addEventListener("input", async () => {
    chrome.storage.local.set({ imageSourceValue: radio.value }, () => {});

    if (radio.value === "url") {
      thumbnailUploadAreaElement.classList.add("removed");
      thumbnailURLInputDivElement.classList.remove("removed");
    } else {
      thumbnailUploadAreaElement.classList.remove("removed");
      thumbnailURLInputDivElement.classList.add("removed");
    }
  })
);
// element.addEventListener("input", async () => {
//   if (checkbox) chrome.storage.local.set({ [valueName]: element.checked }, () => {});
//   else chrome.storage.local.set({ [valueName]: element.value }, () => {});
// });

thumbnailURLInputElement.addEventListener("input", async () => {
  URLThumbnailPreviewElement.src = thumbnailURLInputElement.value;
  chrome.storage.local.set({ ["thumbnailURLInputValue"]: thumbnailURLInputElement.value }, () => {});
});

//preview upload
const preventDefaults = event => {
  event.preventDefault();
  event.stopPropagation();
};
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  thumbnailUploadAreaElement.addEventListener(eventName, preventDefaults);
  avatarUploadAreaElement.addEventListener(eventName, preventDefaults);
});

const updatePreview = async (file, value, element) => {
  if (file) {
    element.classList.remove("removed");

    const reader = new FileReader();
    reader.onloadend = () => {
      element.src = reader.result;

      chrome.storage.local.set({ [value]: reader.result }, () => {});
    };

    reader.readAsDataURL(file);
  } else {
    element.classList.add("removed");
  }
};
const removePreview = (event, element) => {
  event.preventDefault();
  element.classList.add("removed");
  element.src = "";
};

thumbnailUploadAreaElement.ondrop = event => {
  thumbnailUploadInputElement.files = event.dataTransfer.files;

  updatePreview(thumbnailUploadInputElement.files[0], "thumbnailUploadInputValue", localThumbnailPreviewElement);
};
avatarUploadAreaElement.ondrop = event => {
  avatarUploadInputElement.files = event.dataTransfer.files;

  updatePreview(avatarUploadInputElement.files[0], "avatarUploadInputValue", avatarPreviewElement);
};

thumbnailUploadInputElement.addEventListener("change", event =>
  updatePreview(event.target.files[0], "thumbnailUploadInputValue", localThumbnailPreviewElement)
);
localThumbnailPreviewElement.addEventListener("contextmenu", event =>
  removePreview(event, localThumbnailPreviewElement)
);
// hoverPreviewTextElement.addEventListener("contextmenu", event => removePreview(event, localThumbnailPreviewElement));

avatarUploadInputElement.addEventListener("change", event =>
  updatePreview(event.target.files[0], "avatarUploadInputValue", avatarPreviewElement)
);
avatarPreviewElement.addEventListener("contextmenu", event => removePreview(event, avatarPreviewElement));

//applying changes to video on click
applyChangesButtonElement.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let page = "";

  //what youtube page is user on?
  if (tab.url.includes("youtube.com/watch?v=")) page = "video";
  else if (tab.url.includes("youtube.com/feed/subscriptions")) page = "subs";
  else if (tab.url.includes("youtube.com/results?search_query=")) page = "search";
  else page = "home";

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
          console.error("No value found for " + key);
          reject();
        } else {
          resolve(result[key]);
        }
      });
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

  const maxRandomNumberBasedOnURL = {
    home: 8,
    subs: 18,
    search: 4,
    video: 9,
  };

  //returning either random index or selected by user
  const returnIndexOfVideo = async () => {
    // console.log(111);
    const isRandomPosition = await getValueFromStorage("randomPositionCheckboxValue");

    if (isRandomPosition) {
      const randomIndex = Math.floor(Math.random() * maxRandomNumberBasedOnURL[page]);

      // await checkIfVideoIndexChanged(randomIndex);

      return randomIndex;
    } else {
      const chosenIndex = (await getValueFromStorage("numInputValue")) - 1;

      // await checkIfVideoIndexChanged(chosenIndex);

      return chosenIndex;
    }
  };

  //do we use uploaded image or from an URL?
  const returnImageToUse = async () => {
    const imageSource = await getValueFromStorage("imageSourceValue");

    if (imageSource === "url") return await getValueFromStorage("thumbnailURLInputValue");
    else return await getValueFromStorage("thumbnailUploadInputValue");
  };

  //do we use uploaded avatar or from current user?
  const returnAvatarToUse = async () => {
    const useDefaultAvatar = await getValueFromStorage("useDefaultAvatarCheckboxValue");

    if (useDefaultAvatar) {
      return document.querySelectorAll("#avatar-btn")[0].children[0].children[0].src;
    } else {
      const avatarToUse = await getValueFromStorage("avatarUploadInputValue");
      return avatarToUse;
    }
  };

  const indexOfVideoToReplace = await returnIndexOfVideo();
  const whatImageToUse = await returnImageToUse();
  const avatarImage = await returnAvatarToUse();

  const saveOriginalVideo = value => {
    // chrome.storage.local.set({ originalVideo: value }, () => {
    //   // console.log(value.index)
    // });
    // console.log(value);
  };

  saveOriginalVideo(indexOfVideoToReplace);

  let videoDiv = undefined;
  let title = undefined;
  let avatar = undefined;
  let thumbnail = undefined;
  let channelName = undefined;
  let badge = undefined;
  let badgeWrapper = undefined;

  //finding all components of the video
  if (page === "home") {
    videoDiv = document.querySelectorAll("ytd-rich-grid-media")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0];
    avatar = videoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];
    thumbnail = videoDiv.getElementsByTagName("yt-image")[0].children[0];
    channelName =
      videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0]
        .children[0];
    badge = videoDiv.getElementsByClassName("badge badge-style-type-verified")[0];
    badgeWrapper = videoDiv.querySelector("#byline-container");
  } else if (page === "subs") {
    videoDiv = document.querySelectorAll("ytd-grid-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
    thumbnail = videoDiv.getElementsByTagName("yt-image")[0].children[0];
    channelName =
      videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0]
        .children[0];
    badge = videoDiv.getElementsByClassName("badge badge-style-type-verified")[0];
    badgeWrapper = videoDiv.querySelector("#byline-container");
  } else if (page === "search") {
    videoDiv = document.querySelectorAll("ytd-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
    avatar = videoDiv.querySelectorAll("#channel-info")[0].querySelectorAll("yt-img-shadow")[0].children[0];
    thumbnail = videoDiv.getElementsByTagName("yt-image")[0].children[0];
    channelName = videoDiv.querySelectorAll("#channel-info")[0].querySelectorAll("yt-formatted-string")[0].children[0];
    badge = videoDiv.getElementsByClassName("badge badge-style-type-verified")[0];
    badgeWrapper = videoDiv.querySelector("#channel-name");
  } else if (page === "video") {
    videoDiv = document.querySelectorAll("ytd-compact-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("span")[0];
    thumbnail = videoDiv.getElementsByTagName("yt-image")[0].children[0];
    channelName = videoDiv.querySelectorAll("yt-formatted-string")[0];
    badge = videoDiv.getElementsByClassName("badge badge-style-type-verified")[0];
    badgeWrapper = videoDiv.querySelector("#byline-container");
  }

  // saveOriginalVideo({`
  //   index: indexOfVideoToReplace,
  //   thumbnail: thumbnail.src,
  //   title: title.textContent,
  //   channelName: channelName.textContent,
  //   avatar: avatar.src,
  // });

  // console.log(videoDiv, thumbnail, title, channelName, avatar);

  //applying all fake changes to video
  thumbnail.src = whatImageToUse;
  title.textContent = await getValueFromStorage("titleInputValue");
  channelName.textContent = await getValueFromStorage("channelNameInputValue");
  if (page === "search" || page === "home") avatar.src = avatarImage;

  //placing or removing badge
  const showBadge = await getValueFromStorage("badgeCheckboxValue");

  console.log(videoDiv);
  console.log(badge);
  console.log(badgeWrapper);

  if (showBadge) {
    if (badge === undefined && badgeWrapper.getElementsByTagName("img").length === 0) {
      const badgeIcon = document.createElement("img");
      badgeIcon.src = chrome.runtime.getURL("badge.svg");
      badgeIcon.style.width = "16px";
      badgeIcon.style.marginLeft = "4px";
      badgeIcon.style.marginTop = "2px";
      badgeWrapper.appendChild(badgeIcon);
    } else {
      if (badge === undefined) badgeWrapper.getElementsByTagName("img")[0].style.visibility = "visible";
      else badge.style.visibility = "visible";
    }
  } else {
    if (badge === undefined) badgeWrapper.getElementsByTagName("img")[0].style.visibility = "hidden";
    else badge.style.visibility = "hidden";
  }
};
