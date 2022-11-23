//if popup is opened at wrong url, display warning message
const checkURL = async () => {
  const validURLs = [
    "youtube.com/",
    "youtube.com/feed/subscriptions",
    "youtube.com/results?search_query=",
    "youtube.com/watch?v=",
  ];

  //add mobile url

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
const thumbnailURLInputElement = document.getElementById("thumbnailURLInput");
const thumbnailURLInputLabelElement = document.getElementById("thumbnailURLInputLabel");
const thumbnailUploadAreaElement = document.getElementById("thumbnailUploadArea");
const thumbnailUploadInputElement = document.getElementById("thumbnailUploadInput");
const thumbnailPreviewElement = document.getElementById("thumbnailPreview");
// const thumbnailPreviewTextElement = document.getElementById("thumbnailPreviewText");
const hoverPreviewTextElement = document.getElementById("hoverPreviewText");

const titleInputElement = document.getElementById("titleInput");

const channelNameInputElement = document.getElementById("channelNameInput");

const numInputLabelElement = document.getElementById("numInputLabel");
const numInputElement = document.getElementById("numInput");

const avatarUploadAreaElement = document.getElementById("avatarUploadArea");
const avatarUploadInputElement = document.getElementById("avatarUploadInput");
const avatarPreviewElement = document.getElementById("avatarPreview");

const badgeCheckboxElement = document.getElementById("badgeCheckbox");
const useDefaultAvatarCheckboxElement = document.getElementById("useDefaultAvatarCheckbox");
const randomPositionCheckboxElement = document.getElementById("randomPositionCheckbox");

const imageSourceRadios = document.querySelectorAll('input[name="imageSource"]');
const imageLocalRadioElement = document.getElementById("imageLocalRadio");
const imageURLRadioElement = document.getElementById("imageURLRadio");
const applyChangesButtonElement = document.getElementById("applyChangesButton");

//placing previous/default values from storage to inputs
const readInputValueFromStorageAndPlaceDefaultValue = (valueName, element, defaultValue = "") => {
  chrome.storage.local.get(valueName, result => {
    if (result[valueName] === undefined) element.defaultValue = defaultValue;
    else element.defaultValue = result[valueName];
  });
};
const readCheckboxValueFromStorageAndToggleRemoved = (
  valueName,
  element,
  toggledElement,
  defaultValue = false,
  remove = true
) => {
  chrome.storage.local.get(valueName, result => {
    if (result[valueName] === undefined) element.checked = defaultValue;
    else element.checked = result[valueName];

    if (element.checked) {
      if (remove) toggledElement.classList.add("removed");
      else toggledElement.classList.remove("removed");
    }
  });
};
const readImageValueFromStorageAndPlaceItInImageSrc = (valueName, element) => {
  chrome.storage.local.get(valueName, result => {
    if (result[valueName] !== undefined) {
      element.classList.remove("removed");

      element.src = result[valueName];
    }
  });
};

readInputValueFromStorageAndPlaceDefaultValue("thumbnailURLInputValue", thumbnailURLInputElement, "");
readInputValueFromStorageAndPlaceDefaultValue("titleInputValue", titleInputElement, "");
readInputValueFromStorageAndPlaceDefaultValue("channelNameInputValue", channelNameInputElement, "");
readInputValueFromStorageAndPlaceDefaultValue("numInputValue", numInputElement, "3");

readCheckboxValueFromStorageAndToggleRemoved(
  "useDefaultAvatarCheckboxValue",
  useDefaultAvatarCheckboxElement,
  avatarUploadAreaElement,
  true,
  true
);
readCheckboxValueFromStorageAndToggleRemoved(
  "randomPositionCheckboxValue",
  randomPositionCheckboxElement,
  numInputLabelElement,
  false,
  true
);

readImageValueFromStorageAndPlaceItInImageSrc("thumbnailUploadInputValue", thumbnailPreviewElement);
readImageValueFromStorageAndPlaceItInImageSrc("avatarUploadInputValue", avatarPreviewElement);

chrome.storage.local.get("imageSourceValue", result => {
  switch (result["imageSourceValue"]) {
    case "url":
      imageURLRadioElement.checked = true;
      thumbnailUploadAreaElement.classList.add("removed");
      break;
    case "image":
      imageLocalRadioElement.checked = true;
      thumbnailURLInputLabelElement.classList.add("removed");
      break;
    default:
      imageLocalRadioElement.checked = true;
      thumbnailURLInputLabelElement.classList.add("removed");
      break;
  }
});
chrome.storage.local.get("badgeCheckboxValue", result => {
  if (result["badgeCheckboxValue"] === undefined) badgeCheckboxElement.checked = false;
  else badgeCheckboxElement.checked = result["badgeCheckboxValue"];
});

//starting to listen to all changes in inputs and updating details in video
const listenToChangesAndUpdateStorage = (element, valueName) => {
  element.addEventListener("input", async () => {
    chrome.storage.local.set({ [valueName]: element.value }, () => {});
  });
};
const listenToChangesUpdateStorageAndRemoveElement = (element, valueName, toggledElement, remove = true) => {
  element.addEventListener("input", async () => {
    chrome.storage.local.set({ [valueName]: element.checked }, () => {});

    if (remove) {
      if (element.checked) toggledElement.classList.add("removed");
      else toggledElement.classList.remove("removed");
    } else {
      if (element.checked) toggledElement.classList.remove("removed");
      else toggledElement.classList.add("removed");
    }
  });
};

listenToChangesAndUpdateStorage(thumbnailURLInputElement, "thumbnailURLInputValue");
listenToChangesAndUpdateStorage(titleInputElement, "titleInputValue");
listenToChangesAndUpdateStorage(channelNameInputElement, "channelNameInputValue");
listenToChangesAndUpdateStorage(numInputElement, "numInputValue");
listenToChangesAndUpdateStorage(badgeCheckboxElement, "badgeCheckboxValue");

listenToChangesUpdateStorageAndRemoveElement(
  useDefaultAvatarCheckboxElement,
  "useDefaultAvatarCheckboxValue",
  avatarUploadAreaElement,
  true
);
listenToChangesUpdateStorageAndRemoveElement(
  randomPositionCheckboxElement,
  "randomPositionCheckboxValue",
  numInputLabelElement,
  true
);

badgeCheckboxElement.addEventListener("input", async () => {
  chrome.storage.local.set({ ["badgeCheckboxValue"]: badgeCheckboxElement.checked }, () => {});
});
imageSourceRadios.forEach(radio =>
  radio.addEventListener("input", async () => {
    chrome.storage.local.set({ imageSourceValue: radio.value }, () => {});

    if (radio.value === "url") {
      thumbnailUploadAreaElement.classList.add("removed");
      thumbnailURLInputLabelElement.classList.remove("removed");
    } else {
      thumbnailUploadAreaElement.classList.remove("removed");
      thumbnailURLInputLabelElement.classList.add("removed");
    }
  })
);

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

  updatePreview(thumbnailUploadInputElement.files[0], "thumbnailUploadInputValue", thumbnailPreviewElement);
};
avatarUploadAreaElement.ondrop = event => {
  avatarUploadInputElement.files = event.dataTransfer.files;

  updatePreview(avatarUploadInputElement.files[0], "avatarUploadInputValue", avatarPreviewElement);
};

thumbnailUploadInputElement.addEventListener("change", event =>
  updatePreview(event.target.files[0], "thumbnailUploadInputValue", thumbnailPreviewElement)
);
thumbnailPreviewElement.addEventListener("contextmenu", event => removePreview(event, thumbnailPreviewElement));
hoverPreviewTextElement.addEventListener("contextmenu", event => removePreview(event, thumbnailPreviewElement));

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
        home: 8,
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

  //do we use uploaded image or from an URL?
  const returnImageToUse = async () => {
    const isSourceOfImageIsURL = await getValueFromStorage("imageFromURLCheckboxValue");

    if (isSourceOfImageIsURL) {
      const imageToUse = await getValueFromStorage("thumbnailURLInputValue");
      return imageToUse;
    } else {
      const imageToUse = await getValueFromStorage("thumbnailUploadInputValue");
      return imageToUse;
    }
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

  let videoDiv = undefined;
  let title = undefined;
  let avatar = undefined;
  let thumbnail = undefined;
  let channelName = undefined;

  //finding all components of the video
  if (page === "home") {
    videoDiv = document.querySelectorAll("ytd-rich-grid-media")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0].children[0];
    avatar = videoDiv.children["details"].getElementsByTagName("a")[0].children[0].children[0];
    thumbnail = videoDiv.getElementsByTagName("yt-image")[0].children[0];
    channelName =
      videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0]
        .children[0];
  } else if (page === "subs") {
    videoDiv = document.querySelectorAll("ytd-grid-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
    thumbnail = videoDiv.getElementsByTagName("yt-image")[0].children[0];
    channelName =
      videoDiv.getElementsByTagName("ytd-channel-name")[0].children["container"].children["text-container"].children[0]
        .children[0];
  } else if (page === "search") {
    videoDiv = document.querySelectorAll("ytd-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("a")[0];
    avatar = videoDiv.querySelectorAll("#channel-info")[0].querySelectorAll("yt-img-shadow")[0].children[0];
    thumbnail = videoDiv.getElementsByTagName("yt-image")[0].children[0];
    channelName = videoDiv.querySelectorAll("#channel-info")[0].querySelectorAll("yt-formatted-string")[0].children[0];
  } else if (page === "video") {
    videoDiv = document.querySelectorAll("ytd-compact-video-renderer")[indexOfVideoToReplace].children["dismissible"];
    title = videoDiv.getElementsByTagName("h3")[0].getElementsByTagName("span")[0];
    thumbnail = videoDiv.getElementsByTagName("yt-image")[0].children[0];
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
  avatar.src = avatarImage;

  //placing or removing badge
  const showBadge = await getValueFromStorage("badgeCheckboxValue");
  let badge = videoDiv.getElementsByClassName("badge badge-style-type-verified")[0];
  let badgeWrapper = videoDiv.querySelector("#byline-container");

  if (showBadge) {
    if (!badge && badgeWrapper.getElementsByTagName("img").length === 0) {
      const badgeIcon = document.createElement("img");
      badgeIcon.src = chrome.runtime.getURL("badge.svg");
      badgeIcon.style.width = "16px";
      badgeIcon.style.marginLeft = "4px";
      badgeIcon.style.marginTop = "2px";
      badgeWrapper.appendChild(badgeIcon);
    }
  } else {
    badge.style.visibility = "hidden";
  }
};
