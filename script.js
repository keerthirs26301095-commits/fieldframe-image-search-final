
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");

searchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const query = searchInput.value.trim();

  // Ignore empty searches
  if (query === "") {
    return;
  }

  // Clear old results
  results.innerHTML = "";
  resultCount.textContent = "";

  const url =
    "https://commons.wikimedia.org/w/api.php" +
    "?action=query" +
    "&generator=search" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6" +
    "&gsrlimit=12" +
    "&prop=imageinfo" +
    "&iiprop=url" +
    "&iiurlwidth=400" +
    "&format=json" +
    "&origin=*";

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch images");
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});

    pages.forEach(function (page) {
      const imageInfo = page.imageinfo?.[0];

      if (!imageInfo) {
        return;
      }

      const card = document.createElement("article");
      card.className = "image-card";

      const image = document.createElement("img");
      image.src = imageInfo.thumburl || imageInfo.url;
      image.alt = page.title.replace("File:", "");
      image.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent = page.title.replace("File:", "");

      card.appendChild(image);
      card.appendChild(caption);
      results.appendChild(card);
    });

    const totalCards = results.children.length;

    resultCount.textContent = totalCards > 0
      ? `Showing ${totalCards} images for "${query}".`
      : `No images found for "${query}".`;

  } catch (error) {
    console.error("Image search failed:", error);
    resultCount.textContent =
      "Unable to load images. Please try again.";
  }
});
