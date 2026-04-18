function showVector(vectorName, contextKey) {
  const vectorData = getVectorData(vectorName, contextKey);
  if (!vectorData) {
    return;
  }

  const supportedBrowsers = ["chrome", "firefox", "safari"];
  const tags = data[contextKey].tags;

  let { code, url } = vectorData;

  if (tags[0].tag === "*") {
    const replacement = vectorName === "custom tags" ? "xss" : vectorName;
    const wildcardPattern = /[*]/gi;

    code = code.replace(wildcardPattern, replacement);

    if (url) {
      url = url.replace(wildcardPattern, replacement);
    }
  }

  const hash = vectorData.hash ? vectorData.hash : "";
  const context = vectorData.context ? vectorData.context : "html";

  const demoUrl =
    typeof url === "string" && url.startsWith("https://")
      ? url
      : "https://portswigger-labs.net/xss/xss.php?context=" +
        encodeHTML(context) +
        "&x=" +
        encodeURIComponent(code) +
        hash;

  const escapedContextKey = contextKey.replaceAll(
    /([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g,
    "\\$1"
  );

  const detailsElement = document.querySelector(`details#${escapedContextKey}`);
  if (!detailsElement) {
    return;
  }

  const linkElement = detailsElement.querySelector("div > a");
  if (linkElement) {
    linkElement.href = demoUrl;
    linkElement.textContent = code;
  }

  const browsersContainer = detailsElement.querySelector(".browsers");
  if (!browsersContainer) {
    return;
  }

  while (browsersContainer.firstChild) {
    browsersContainer.removeChild(browsersContainer.firstChild);
  }

  const browserSupportList = vectorData.browsers || [];

  supportedBrowsers.forEach((browserName) => {
    const isSupported = browserSupportList.includes(browserName);

    const icon = document.createElement("img");
    icon.className = isSupported ? browserName : "disabled";
    icon.src = `../images/browser-logos/${encodeHTML(browserName)}.svg`;
    icon.alt = isSupported
      ? `${browserName} supported`
      : `${browserName} not supported`;

    browsersContainer.appendChild(icon);
  });
}

function filter() {
  const eventFilterElement = document.getElementById("eventFilter");
  const tagFilterElement = document.getElementById("tagFilter");
  const browserFilterElement = document.getElementById("browserFilter");
  const searchTypeElement = document.getElementById("searchType");
  const regexInputElement = document.getElementById("regex");

  const selectedEventFilter = eventFilterElement.value;
  const selectedTagFilter = tagFilterElement.value;
  const selectedBrowserFilter = browserFilterElement.value;

  const changeEvent = new Event("change");

  const selectedEventTexts = Array.from(eventFilterElement.options)
    .filter((option) => option.selected)
    .map((option) => option.text);

  const selectedTagTexts = Array.from(tagFilterElement.options)
    .filter((option) => option.selected)
    .map((option) => option.text);

  const selectedBrowserSelectors = Array.from(browserFilterElement.options)
    .filter((option) => option.selected)
    .map((option) => "." + option.text.toLowerCase());

  const detailsElements = document.querySelectorAll("details");
  const searchType = searchTypeElement.value;
  const regexPattern = regexInputElement.value;

  for (let i = 0; i < detailsElements.length; i++) {
    const details = detailsElements[i];

    if (!details.id) {
      continue;
    }

    let hide = false;

    const eventId = details.id;
    const matchesEventFilter =
      selectedEventFilter === "All events" ||
      eventId === selectedEventFilter ||
      selectedEventTexts.includes(eventId);

    if (!matchesEventFilter) {
      hide = true;
    }

    const matchesBrowserFilter =
      selectedBrowserFilter === "All browsers" ||
      (selectedBrowserSelectors.length &&
        details.querySelector(selectedBrowserSelectors.join(",")));

    if (!matchesBrowserFilter) {
      hide = true;
    }

    const tagSelectElement = details.querySelector("select");

    if (!tagSelectElement) {
      details.className = hide ? "hidden" : "";
      continue;
    }

    if (selectedTagFilter === "All tags") {
      tagSelectElement.selectedIndex = 0;
      tagSelectElement.dispatchEvent(changeEvent);
    } else if (
      data[eventId] &&
      data[eventId].tags.find(
        (tagInfo) =>
          tagInfo.tag === selectedTagFilter ||
          tagInfo.tag === "*" ||
          selectedTagTexts.includes(tagInfo.tag)
      )
    ) {
      tagSelectElement.value = selectedTagFilter;
      tagSelectElement.dispatchEvent(changeEvent);

      if (tagSelectElement.selectedIndex === -1) {
        hide = true;
      }
    } else if (data[eventId] && data[eventId].tags[0] === "*") {
      tagSelectElement.value = selectedTagFilter;
      tagSelectElement.dispatchEvent(changeEvent);
    } else {
      hide = true;
    }

    if (regexPattern.length && !hide) {
      try {
        const regexp = new RegExp(regexPattern);

        if (searchType === "tag") {
          const options = Array.from(tagSelectElement.options);
          const matchedOption = options.find((option) =>
            regexp.test(option.text)
          );

          if (!matchedOption) {
            hide = true;
          }
        } else if (searchType === "event") {
          if (!regexp.test(eventId)) {
            hide = true;
          }
        } else if (searchType === "code") {
          const codeElement = details.querySelector("div > a");
          const options = Array.from(tagSelectElement.options);

          const matchedOption = options.find((option) => {
            if (!codeElement) {
              return false;
            }

            const substitutedCode = codeElement.innerText
              .replaceAll("<xss", "<" + option.text)
              .replaceAll("</xss", "</" + option.text);

            return regexp.test(substitutedCode);
          });

          if (!matchedOption) {
            hide = true;
          }
        }
      } catch (error) {
        console.log("Error in regex search:", error);
      }
    }

    details.className = hide ? "hidden" : "";
  }
}

function encodeHTML(value) {
  const stringValue = String(value);

  return stringValue.replace(/[<>'"&]/gi, (character) => {
    return {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
    }[character];
  });
}

function getVectorData(tagName, eventId) {
  const tagEntries = data[eventId].tags;

  for (let i = 0; i < tagEntries.length; i++) {
    if (tagEntries[i].tag === tagName || tagEntries[i].tag === "*") {
      return tagEntries[i];
    }
  }

  return null;
}

function onLinkClick(event) {
  const element = event.currentTarget;
  const text = String(element.href);

  copyToClipboard(text, element);

  element.classList.add("success");
  setTimeout(() => {
    element.classList.remove("success");
  }, 1000);
}

function onCopyClick(event) {
  const button = event.currentTarget;
  const textToCopy = button.parentNode.previousElementSibling.textContent;

  copyToClipboard(textToCopy, button);

  button.classList.add("success");
  setTimeout(() => {
    button.classList.remove("success");
  }, 1000);
}

function copyToClipboard(text, element) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;

  element.insertAdjacentElement("afterend", textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  element.parentNode.removeChild(textarea);
}

function buildCodeFromWildcard(templateCode) {
  const tagFilterElement = document.getElementById("tagFilter");

  const selectedTags = Array.from(tagFilterElement.options)
    .filter((option) => option.selected)
    .map((option) => option.value);

  const result = [];
  const tagSet = new Set();

  for (const eventId in data) {
    const tagEntries = data[eventId].tags;

    for (let i = 0; i < tagEntries.length; i++) {
      const tagName = tagEntries[i].tag;

      if (tagName === "*") {
        continue;
      }

      if (selectedTags.includes("All tags") || selectedTags.includes(tagName)) {
        tagSet.add(tagName);
      }
    }
  }

  const tags = Array.from(tagSet);

  for (let i = 0; i < tags.length; i++) {
    const tagName = tags[i].replace("custom tags", "xss");
    result.push(templateCode.replace(/[*]/gi, tagName));
  }

  return result;
}

document.getElementById("tagFilter").addEventListener("change", filter);
document.getElementById("eventFilter").addEventListener("change", filter);
document.getElementById("browserFilter").addEventListener("change", filter);
document.querySelector(".searchPanel button").addEventListener("click", filter);

document.getElementById("regex").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    document.querySelector(".searchPanel button").click();
  }
});

document
  .querySelector(".exportButtons button:first-child")
  .addEventListener("click", function () {
    const options = Array.from(
      document.getElementById("tagFilter").options
    ).slice(1);

    const tags = options
      .map((option) => option.value.replace("custom tags", "xss"))
      .sort()
      .join("\n");

    copyToClipboard(tags, this);
  });

document
  .querySelector(".exportButtons button:nth-child(2)")
  .addEventListener("click", function () {
    const options = Array.from(
      document.getElementById("eventFilter").options
    ).slice(1);

    const events = options
      .map((option) => (option.value ? option.value : option.text))
      .sort()
      .join("\n");

    copyToClipboard(events, this);
  });

document
  .querySelector(".exportButtons button:nth-child(3)")
  .addEventListener("click", function () {
    const payloads = new Set();

    const tagFilterElement = document.getElementById("tagFilter");
    const selectedTags = Array.from(tagFilterElement.options)
      .filter((option) => option.selected)
      .map((option) => (option.value ? option.value : option.text));

    for (const eventId in data) {
      const element = document.getElementById(eventId);

      if (element && element.classList.contains("hidden")) {
        continue;
      }

      const tagEntries = data[eventId].tags;

      for (let j = 0; j < tagEntries.length; j++) {
        const tagInfo = tagEntries[j];

        if (tagInfo.tag === "*") {
          const expandedPayloads = buildCodeFromWildcard(tagInfo.code);

          for (let k = 0; k < expandedPayloads.length; k++) {
            payloads.add(expandedPayloads[k]);
          }
        } else if (
          selectedTags.includes("All tags") ||
          selectedTags.includes(tagInfo.tag)
        ) {
          payloads.add(tagInfo.code);
        }
      }
    }

    copyToClipboard(Array.from(payloads).sort().join("\n"), this);
  });

Array.from(document.querySelectorAll(".tagSelect")).forEach((select) => {
  select.addEventListener("change", function () {
    showVector(this.value, this.dataset.event);
  });
});

Array.from(document.querySelectorAll(".xss-cheat-sheet-button--copy")).forEach(
  (button) => {
    button.addEventListener("click", onCopyClick);
  }
);

Array.from(document.querySelectorAll(".xss-cheat-sheet-button--link")).forEach(
  (button) => {
    button.addEventListener("click", onLinkClick);
  }
);

if (location.hash && location.hash.slice(1) === "pdf") {
  const firstEventHandlersContainer = document.querySelector(
    "details.xss-cheat-sheet-container-eventhandlers > div > div"
  );

  if (firstEventHandlersContainer) {
    firstEventHandlersContainer.style.display = "none";
  }

  const pdfDownload = document.querySelector(".pdfDownload");
  if (pdfDownload) {
    pdfDownload.style.display = "none";
  }

  const breadcrumbs = document.querySelector(".ps-breadcrumbs");
  if (breadcrumbs) {
    breadcrumbs.style.display = "none";
  }

  const summaryContainer = document.querySelector(
    "details summary + div > div"
  );
  if (summaryContainer) {
    summaryContainer.style.display = "none";
  }

  Array.from(document.querySelectorAll(".downloadedFrom")).forEach((el) => {
    el.style.display = "block";
  });

  Array.from(document.querySelectorAll("select")).forEach((el) => {
    el.style.visibility = "hidden";
    el.style.width = "10px";
  });

  Array.from(document.querySelectorAll("button")).forEach((el) => {
    el.style.visibility = "hidden";
    el.style.width = "10px";
  });

  Array.from(document.querySelectorAll("p"))
    .filter((el) => el.textContent === "Copy:")
    .forEach((el) => {
      el.style.visibility = "hidden";
      el.style.height = "10px";
      el.style.width = "10px";
    });

  Array.from(document.querySelectorAll("p"))
    .filter((el) => el.textContent === "Tag:")
    .forEach((el) => {
      el.style.visibility = "hidden";
      el.style.height = "10px";
      el.style.width = "10px";
    });

  const stylesheet = document.styleSheets[0];
  stylesheet.addRule("summary:after", "background: none !important");
  stylesheet.addRule(
    ".xss-cheat-sheet-container-eventhandlers > div > details > div > details > div",
    "grid-template-columns: 100px 3fr 10px 6fr 10px;"
  );
  stylesheet.addRule(
    ".xss-cheat-sheet-container-eventhandlers > div > details > div > div:first-child",
    "grid-template-columns: 100px 3fr 10px 6fr 10px;"
  );

  const header = document.createElement("header");
  header.id = "top";
  header.className = "page-header";

  const containerDiv = document.createElement("div");
  containerDiv.className = "container";

  const logo = document.createElement("a");
  logo.className = "logo";
  logo.href = "/";

  containerDiv.append(logo);
  header.append(containerDiv);

  const mainContainer = document.querySelector(".maincontainer");
  if (mainContainer) {
    mainContainer.prepend(header);
  }

  const cmsElement = document.querySelector("cms");
  if (cmsElement) {
    cmsElement.remove();
  }

  document.body.append(header.cloneNode(true));
}
