const repositoryGrid = document.getElementById("repositories-grid");
const repositoryStatus = document.getElementById("repositories-status");
const repositoryError = document.getElementById("repositories-error");
const repositoryErrorMessage = document.getElementById(
  "repositories-error-message",
);
const repositoryRetry = document.getElementById("repositories-retry");
const themeToggle = document.getElementById("repositories-theme-toggle");
const repositoryDisplayConfig = {
  // Add repository names here to keep them out of the public listing.
  hiddenRepositories: ["expensify-web", "taskly-web", "me", "vishalvnair124"],
  flutterRepositories: ["clima", "weather-app", "flutter-calculator"],
};
const hiddenRepositoryNames = new Set(
  repositoryDisplayConfig.hiddenRepositories.map((name) => name.toLowerCase()),
);
const flutterRepositoryNames = new Set(
  repositoryDisplayConfig.flutterRepositories.map((name) => name.toLowerCase()),
);
const languageCachePrefix = "github-repo-languages:";
const repositoryListCacheKey = "github-repositories:v1";
const repositoryCacheMaxAge = 60 * 60 * 1000;
const githubApiUrl =
  "https://api.github.com/users/vishalvnair124/repos?type=owner&sort=updated&per_page=100";
let githubLanguageRateLimited = false;
let githubRepositoryRateLimited = false;
let browserStorageUnavailable = false;

function readStorage(key) {
  if (browserStorageUnavailable) {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    browserStorageUnavailable = true;
    console.error(`Unable to read browser storage key "${key}".`, error);
    return null;
  }
}

function writeStorage(key, value) {
  if (browserStorageUnavailable) {
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch (error) {
    browserStorageUnavailable = true;
    console.error(`Unable to save browser storage key "${key}".`, error);
  }
}

function isFlutterRepository(repositoryName, detectedLanguages = []) {
  return (
    flutterRepositoryNames.has(repositoryName.toLowerCase()) ||
    detectedLanguages.some((name) => name.toLowerCase() === "dart")
  );
}

function renderRepositoryLanguages(container, repositoryName, languages) {
  if (languages.length === 0) {
    container.textContent = "No languages detected";
    return;
  }

  const isFlutter = isFlutterRepository(repositoryName, languages);
  const displayedLanguages = isFlutter ? ["Flutter"] : languages.slice(0, 3);
  const additionalLanguageCount = isFlutter
    ? 0
    : languages.length - displayedLanguages.length;

  container.title = isFlutter
    ? `Flutter project (Dart): ${languages.join(", ")}`
    : `Languages: ${languages.join(", ")}`;
  container.replaceChildren(
    ...displayedLanguages.map((name) => {
      const badge = document.createElement("span");
      badge.className = "repo-language";
      badge.textContent = name;
      return badge;
    }),
  );

  if (additionalLanguageCount > 0) {
    const moreLanguages = document.createElement("span");
    moreLanguages.className = "repo-language repo-language-more";
    moreLanguages.textContent = `+${additionalLanguageCount}`;
    moreLanguages.setAttribute(
      "aria-label",
      `${additionalLanguageCount} more languages`,
    );
    container.append(moreLanguages);
  }
}

function getCachedRepositoryLanguages(repositoryName) {
  const cachedLanguages = readStorage(
    `${languageCachePrefix}${repositoryName.toLowerCase()}`,
  );
  if (!cachedLanguages) {
    return null;
  }

  try {
    const parsedLanguages = JSON.parse(cachedLanguages);
    return Array.isArray(parsedLanguages) &&
      parsedLanguages.every((language) => typeof language === "string")
      ? parsedLanguages
      : null;
  } catch (error) {
    console.error(
      `Unable to read cached languages for ${repositoryName}.`,
      error,
    );
    return null;
  }
}

function getCachedRepositories() {
  const cachedRepositories = readStorage(repositoryListCacheKey);
  if (!cachedRepositories) {
    return null;
  }

  try {
    const parsedCache = JSON.parse(cachedRepositories);
    const repositories = Array.isArray(parsedCache)
      ? parsedCache
      : parsedCache?.repositories;
    if (!Array.isArray(repositories)) {
      return null;
    }

    const savedAt = Array.isArray(parsedCache) ? 0 : parsedCache.savedAt;
    const age = Date.now() - savedAt;
    return {
      repositories: repositories.filter(
        (repository) =>
          repository &&
          typeof repository.name === "string" &&
          typeof repository.full_name === "string" &&
          typeof repository.html_url === "string" &&
          typeof repository.languages_url === "string",
      ),
      isFresh: Number.isFinite(savedAt) && age >= 0 && age <= repositoryCacheMaxAge,
    };
  } catch (error) {
    console.error("Unable to read the cached GitHub repository list.", error);
    return null;
  }
}

function cacheRepositories(repositories) {
  try {
    writeStorage(
      repositoryListCacheKey,
      JSON.stringify({ savedAt: Date.now(), repositories }),
    );
  } catch (error) {
    console.error("Unable to serialize the GitHub repository list.", error);
  }
}

function renderRepositories(repositories, cacheState = "live") {
  const visibleRepositories = repositories.filter(
    (repository) =>
      !hiddenRepositoryNames.has(repository.name.toLowerCase()),
  );

  if (visibleRepositories.length === 0) {
    repositoryStatus.textContent = "No public repositories were found.";
    return;
  }

  const cards = visibleRepositories.map(createRepositoryCard);
  repositoryGrid.replaceChildren(...cards);
  repositoryStatus.textContent =
    cacheState === "fresh"
      ? `Showing ${visibleRepositories.length} saved public repositories.`
      : cacheState === "fallback"
        ? githubRepositoryRateLimited
          ? `GitHub's API rate limit has been reached. Showing ${visibleRepositories.length} saved repositories.`
          : `GitHub is unavailable. Showing ${visibleRepositories.length} saved repositories.`
        : `Showing ${visibleRepositories.length} public repositories.`;

  if ("IntersectionObserver" in window) {
    const languageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            loadRepositoryLanguages(entry.target);
          }
        });
      },
      { rootMargin: "250px" },
    );

    cards.forEach((card) => languageObserver.observe(card));
  } else {
    cards.forEach(loadRepositoryLanguages);
  }
}

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );
  themeToggle.querySelector(".theme-toggle-label").textContent = isDark
    ? "Light mode"
    : "Dark mode";
  writeStorage("mode", isDark ? "dark" : "light");
}

function createRepositoryCard(repository) {
  const card = document.createElement("article");
  card.className = "repo-card";

  const preview = document.createElement("img");
  preview.className = "repo-preview";
  preview.src = `https://opengraph.githubassets.com/1/${repository.full_name}`;
  preview.alt = `GitHub preview for ${repository.name}`;
  preview.addEventListener(
    "error",
    () => {
      preview.src = "./media/projects/github-repo-preview.png";
      preview.alt = "Vishal V Nair's GitHub profile preview";
    },
    { once: true },
  );

  const title = document.createElement("h2");
  title.className = "repo-title";
  title.textContent = repository.name;

  const description = document.createElement("p");
  description.className = "repo-description";
  description.textContent =
    repository.description || "No description provided.";
  description.title = repository.description || "No description provided.";

  const languages = document.createElement("div");
  languages.className = "repo-languages";
  languages.setAttribute("aria-label", "Languages used");
  const cachedLanguages = getCachedRepositoryLanguages(repository.name);
  const isKnownFlutterRepository = isFlutterRepository(repository.name);
  if (cachedLanguages) {
    renderRepositoryLanguages(languages, repository.name, cachedLanguages);
  } else if (isKnownFlutterRepository) {
    renderRepositoryLanguages(languages, repository.name, ["Dart"]);
  } else if (repository.language) {
    renderRepositoryLanguages(languages, repository.name, [repository.language]);
  } else {
    languages.textContent = "Loading languages...";
  }

  const stats = document.createElement("p");
  stats.className = "repo-details";
  stats.textContent = `★ ${repository.stargazers_count} · Forks ${repository.forks_count}`;

  const link = document.createElement("a");
  link.className = "project-link repo-link";
  link.href = repository.html_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View Repository";

  card.append(preview, title, description, languages, stats, link);

  card.dataset.languagesUrl = repository.languages_url;
  card.dataset.repositoryName = repository.name;
  card.dataset.primaryLanguage = repository.language || "";
  return card;
}

async function loadRepositoryLanguages(card) {
  const languages = card.querySelector(".repo-languages");
  const repositoryName = card.dataset.repositoryName;
  if (githubLanguageRateLimited) {
    return;
  }

  const cachedLanguages = getCachedRepositoryLanguages(repositoryName);
  if (cachedLanguages) {
    renderRepositoryLanguages(languages, repositoryName, cachedLanguages);
    return;
  }

  try {
    const response = await fetch(card.dataset.languagesUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      if (
        response.status === 429 ||
        (response.status === 403 &&
          response.headers.get("x-ratelimit-remaining") === "0")
      ) {
        githubLanguageRateLimited = true;
        if (!card.dataset.primaryLanguage) {
          languages.textContent = "No language data available";
        }
        return;
      }
      throw new Error(
        `GitHub API request failed (${response.status} ${response.statusText}).`,
      );
    }

    const languageBytes = await response.json();
    if (
      languageBytes === null ||
      typeof languageBytes !== "object" ||
      Array.isArray(languageBytes)
    ) {
      throw new Error("GitHub returned an unexpected language list.");
    }

    const detectedLanguages = Object.entries(languageBytes)
      .filter(([, bytes]) => typeof bytes === "number" && bytes > 0)
      .sort(([, firstBytes], [, secondBytes]) => secondBytes - firstBytes)
      .map(([name]) => name);

    if (detectedLanguages.length === 0) {
      languages.textContent = "No languages detected";
      return;
    }

    writeStorage(
      `${languageCachePrefix}${repositoryName.toLowerCase()}`,
      JSON.stringify(detectedLanguages),
    );
    renderRepositoryLanguages(languages, repositoryName, detectedLanguages);
  } catch (error) {
    console.error(
      `Unable to load languages for ${repositoryName}.`,
      error,
    );
    const primaryLanguage = card.dataset.primaryLanguage;
    if (primaryLanguage) {
      renderRepositoryLanguages(languages, repositoryName, [primaryLanguage]);
    } else {
      languages.textContent = "Language details unavailable";
      languages.classList.add("repo-languages-error");
    }
  }
}

async function loadRepositories() {
  repositoryStatus.hidden = false;
  repositoryStatus.textContent = "Loading public repositories...";
  repositoryError.hidden = true;
  repositoryGrid.replaceChildren();
  githubRepositoryRateLimited = false;
  const cachedRepositories = getCachedRepositories();
  if (cachedRepositories?.isFresh) {
    renderRepositories(cachedRepositories.repositories, "fresh");
    return;
  }

  try {
    const repositories = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await fetch(`${githubApiUrl}&page=${page}`, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!response.ok) {
        if (
          response.status === 429 ||
          (response.status === 403 &&
            response.headers.get("x-ratelimit-remaining") === "0")
        ) {
          githubRepositoryRateLimited = true;
        }
        throw new Error(
          `GitHub API request failed (${response.status} ${response.statusText}).`,
        );
      }

      const pageRepositories = await response.json();
      if (!Array.isArray(pageRepositories)) {
        throw new Error("GitHub returned an unexpected repository list.");
      }

      repositories.push(...pageRepositories);
      hasMorePages = pageRepositories.length === 100;
      page += 1;
    }

    cacheRepositories(repositories);
    renderRepositories(repositories);
  } catch (error) {
    if (!githubRepositoryRateLimited) {
      console.error("Unable to load public GitHub repositories.", error);
    }
    if (cachedRepositories) {
      renderRepositories(cachedRepositories.repositories, "fallback");
      return;
    }

    repositoryStatus.hidden = true;
    repositoryErrorMessage.textContent = githubRepositoryRateLimited
      ? "GitHub's public API rate limit has been reached. Please try again after it resets."
      : "Could not load repositories from GitHub. Check your connection and try again.";
    repositoryError.hidden = false;
  }
}

const savedMode = readStorage("mode");
applyTheme(savedMode !== "light");
themeToggle.addEventListener("click", () => {
  applyTheme(!document.body.classList.contains("dark"));
});
repositoryRetry.addEventListener("click", loadRepositories);
loadRepositories();
