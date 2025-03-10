function clearResultsList() {
  var searchResults = document.getElementById("search-results");
  var searchResultsDiv = document.getElementById("searchResultsDiv");
  searchResults.innerHTML = "";
  searchResultsDiv.classList.remove("active");
}

function clearInput() {
  const searchInputWeb = document.getElementById("searchInputWeb");
  const searchInput = document.getElementById("searchInput");

  searchInputWeb.value = "";
  searchInput.value = "";
}

function searchResultClicked(aElement) {
  const overlayElement = document.getElementById("searchOverlay");
  const overlayElementWeb = document.getElementById("searchOverlayWeb");

  const linkId = aElement.id;
  const targetElement = document.getElementById(linkId);

  overlayElement.classList.remove("active");
  overlayElementWeb.classList.remove("active");
  clearInput();
  clearResultsList();

  window.location.hash = `#${linkId}`;
  const detailsElement = targetElement.parentElement.parentElement.parentElement.parentElement;

  // const xpathExpression = `//p[@id='${linkId}']/ancestor::details[0]`;
  // const result = document.evaluate(xpathExpression, document, null, XPathResult.ANY_TYPE, null);
  // const detailsElement = result.iterateNext();
  // detailsElement.setAttribute('open', true);
  setTimeout(() => {
    window.scrollBy({
      top: -250,
      behavior: "smooth",
    });
    detailsElement.setAttribute("open", true);
  }, 0);
}

function displaySearchResults(results, links) {
  var searchResults = document.getElementById("search-results");
  var searchResultsWeb = document.getElementById("search-results-web");
  var searchResultsDiv = document.getElementById("searchResultsDiv");

  if (results.length) {
    // Are there any results?

    searchResultsDiv.classList.add("active");
    var appendString = "";

    for (let i = 0; i < results.length; i++) {
      // Iterate over the results
      let item = links[results[i].ref];

      let title = item.displayName || item.shortDescription;

      appendString += '<li><div class="searchResultItem"><span class="searchResultTitle">' + title + "</span>";

      const siteUrl = new URL(window.location.href);
      const permalink = `${siteUrl.origin}#${item.name}`;

      appendString += `<div class="searchResultLinks"><a href="${item.url}" onclick="return clearInput();">קח אותי ליוזמה</a> / <a onclick="searchResultClicked(${item.name})">עוד מידע</a></div></div></li>`;
    }

    searchResults.innerHTML = appendString;
    searchResultsWeb.innerHTML = appendString;
  } else {
    searchResults.innerHTML = "<li>לא נמצאו תוצאות</li>";
    searchResultsWeb.innerHTML = "<li>לא נמצאו תוצאות</li>";
    searchResultsDiv.classList.remove("active");
  }
}

function prepareIndex() {
  let linksOnly = {};
  var idx = lunr(function () {
    this.use(lunr.multiLanguage("en", "he"));

    this.field("displayName");
    this.field("description");
    this.field("shortDescription");

    window.israelLinks.forEach((category) => {
      // Add the data to lunr

      const CategoryEntry = {
        id: category.name,
        name: category.name,
        displayName: category.displayName,
        description: category.description,
        subCategories: category.subCategories,
      };

      category.subCategories.forEach((subCategory) => {
        const subCategoryEntry = {
          id: subCategory.name,
          displayName: subCategory.displayName,
        };

        subCategoryEntry.links = subCategory.links.forEach((link) => {
          const linkEntry = {
            id: link.name,
            displayName: link.displayName,
            shortDescription: link.shortDescription,
            description: link.description,
          };

          linksOnly[link.name] = link;
        });
      });
    });

    Object.values(linksOnly).forEach((link) => {
      const linkEntry = {
        id: link.name,
        displayName: link.displayName,
        shortDescription: link.shortDescription,
        description: link.description,
      };

      this.add(linkEntry);
    });
  });

  window.linksOnly = linksOnly;
  window.idx = idx;
}

const hebrewMapping = { // taken from https://github.com/ai/convert-layout/blob/master/he.json
  'q': '/',
  'w': '\'',
  'e': 'ק',
  'r': 'ר',
  't': 'א',
  'y': 'ט',
  'u': 'ו',
  'i': 'ן',
  'o': 'ם',
  'p': 'פ',
  '[': ']',
  '{': '}',
  ']': '[',
  '}': '{',
  '\\': '\\',
  '|': '|',
  'a': 'ש',
  's': 'ד',
  'd': 'ג',
  'f': 'כ',
  'g': 'ע',
  'h': 'י',
  'j': 'ח',
  'k': 'ל',
  'l': 'ך',
  ';': 'ף',
  ':': ':',
  '\'': ',',
  '\"': '\"',
  'z': 'ז',
  'x': 'ס',
  'c': 'ב',
  'v': 'ה',
  'b': 'נ',
  'n': 'מ',
  'm': 'צ',
  ',': 'ת',
  '<': '>',
  '.': 'ץ',
  '>': '<',
  '/': '.',
  '?': '?',
  ' ': ' ',
  '-': '-',
  '_': '_',
}

function mapStringToHebrew(s) {
  s = s.toLowerCase()
  const chars = [...s]
  if (chars.some(c => !hebrewMapping.hasOwnProperty(c))) {
    return null
  }

  const mapped = chars.map(c => hebrewMapping[c]).join('')
  return mapped === s ? null : mapped
}

function search(searchTerm) {
  if (searchTerm) {
    let results = window.idx.search(`*${searchTerm}*`);
    if (results.length === 0) {
      const mappedSearchTerm = mapStringToHebrew(searchTerm);
      if (mappedSearchTerm) {
        results = window.idx.search(`*${mappedSearchTerm}*`);
      }
    }
    displaySearchResults(results, window.linksOnly);

    if (window.location.hostname.indexOf("localhost") < 0) {
      mixpanel.track(`Search`, {
        searchTerm,
      });
    }
  } else {
    clearResultsList();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  prepareIndex();
  const mobileSearchButton = document.getElementById("mobileSearchButton");
  const overlayElement = document.getElementById("searchOverlay");
  const overlayElementWeb = document.getElementById("searchOverlayWeb");
  const searchInput = document.getElementById("searchInput");
  const searchInputWeb = document.getElementById("searchInputWeb");
  const searchDiv = document.getElementById("searchDiv");
  const pageHeader = document.getElementsByClassName("pageHeader");
  var searchResultsDiv = document.getElementById("searchResultsDiv");

  mobileSearchButton.addEventListener("click", function () {
    overlayElement.classList.add("active");
  });

  searchInputWeb.addEventListener("input", function (event) {
    const searchTerm = event.target.value.trim();

    if (searchTerm) {
      overlayElementWeb.classList.add("active");
    } else {
      overlayElementWeb.classList.remove("active");
    }
    search(searchTerm);
  });

  searchInput.addEventListener("input", function (event) {
    const searchTerm = event.target.value;
    search(searchTerm);
  });

  searchInput.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
  });

  searchDiv.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
  });

  overlayElementWeb.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.id === "searchOverlayWeb") {
      clearPopup();
    }
  });
  // searchResultsDiv.addEventListener("click", function(event) {

  //     event.preventDefault();
  //     event.stopPropagation();
  // });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      clearPopup();
    }
  });

  overlayElement.addEventListener("click", function () {
    overlayElement.classList.remove("active");
  });

  const clearPopup = () => {
    overlayElement.classList.remove("active");
    overlayElementWeb.classList.remove("active");
    const searchInputWeb = document.getElementById("searchInputWeb");
    const searchInput = document.getElementById("searchInput");
    searchInputWeb.value = "";
    searchInput.value = "";
  };
});
