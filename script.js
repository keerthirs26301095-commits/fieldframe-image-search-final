
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const results = document.getElementById("results");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const searchButton = document.getElementById("searchButton");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const topic = input.value.trim();

  if (!topic) {
    resultCount.textContent = "Please enter a topic to search.";
    input.focus();
    return;
  }

  results.replaceChildren();
  emptyState.hidden = true;
  resultCount.textContent = "Searching for images...";
  searchButton.disabled = true;

  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: topic + " filetype:bitmap",
      gsrnamespace: "6",
      gsrlimit: "20",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "500",
      format: "json",
      origin: "*"
    });

    const response = await fetch(
      "https://commons.wikimedia.org/w/api.php?" + params
    );

    if (!response.ok) {
      throw new Error("Image search failed");
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});

    const images = pages.filter(page =>
      page.imageinfo?.[0]?.thumburl ||
      page.imageinfo?.[0]?.url
    );

    if (images.length === 0) {
      emptyState.hidden = false;
      emptyState.querySelector(".empty-title").textContent =
        "No images found";
      emptyState.querySelector(".empty-copy").textContent =
        "Try searching for another topic.";
      resultCount.textContent = "No results found.";
      return;
    }

    images.forEach(page => {
      const info = page.imageinfo[0];

      const card = document.createElement("article");
      card.className = "image-card";

      const image = document.createElement("img");
      image.src = info.thumburl || info.url;
      image.alt = page.title.replace(/^File:/, "");
      image.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent = page.title.replace(/^File:/, "");

      const link = document.createElement("a");
      link.href = info.descriptionurl ||
        "https://commons.wikimedia.org/wiki/" +
        encodeURIComponent(page.title);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View image source";

      card.append(image, caption, link);
      results.appendChild(card);
    });

    resultCount.textContent =
      `Showing ${images.length} results for "${topic}"`;

  } catch (error) {
    emptyState.hidden = false;
    emptyState.querySelector(".empty-title").textContent =
      "Search couldn't be completed";
    emptyState.querySelector(".empty-copy").textContent =
      "Check your internet connection and try again.";
    resultCount.textContent = "Something went wrong.";
  } finally {
    searchButton.disabled = false;
  }
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    input.value = chip.textContent.trim();
    form.requestSubmit();
  });
});
