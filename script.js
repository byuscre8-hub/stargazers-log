const repositoryList = document.querySelector("#repository-list");
const listStatus = document.querySelector("#list-status");
const searchInput = document.querySelector("#repository-search");
let repositories = [];

function formatStarredDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Starred date unavailable";
  }

  return `Starred ${new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date)}`;
}

function validateRepositories(data) {
  if (!Array.isArray(data)) {
    throw new Error("Repository data must be a list.");
  }

  return data.map((repository) => {
function renderRepositories(repositories) {
  const validatedRepositories = repositories.map((repository) => {
    if (
      repository === null ||
      typeof repository !== "object" ||
      typeof repository.name !== "string" ||
      typeof repository.description !== "string" ||
      typeof repository.url !== "string"
    ) {
      throw new Error("Repository data is missing a name, description, or URL.");
    }

    let url;
    try {
      url = new URL(repository.url);
    } catch {
      throw new Error("Repository data contains an invalid URL.");
    }

    if (
      url.origin !== "https://github.com" ||
      url.username ||
      url.password ||
      !/^\/[^/]+\/[^/]+\/?$/.test(url.pathname) ||
      url.search ||
      url.hash
    ) {
      throw new Error("Repository URLs must point to a GitHub repository.");
    }

    return { ...repository, url: url.href };
  });
}

function renderRepositories() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const matches = repositories.filter((repository) => {
    const searchableText = `${repository.name} ${repository.description}`.toLocaleLowerCase();
    return searchableText.includes(query);
  });
  const fragment = document.createDocumentFragment();

  for (const repository of matches) {
  const fragment = document.createDocumentFragment();

  for (const repository of validatedRepositories) {
    const item = document.createElement("li");
    item.className = "repository-card";

    const link = document.createElement("a");
    link.href = repository.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = repository.name;

    const description = document.createElement("p");
    description.className = "repository-description";
    description.textContent = repository.description;

    const date = document.createElement("p");
    date.className = "repository-date";
    date.textContent = formatStarredDate(repository.starred_at);

    item.append(link, description, date);
    fragment.append(item);
  }

  repositoryList.replaceChildren(fragment);
  if (matches.length === 0) {
    listStatus.textContent = query
      ? "No repositories match your search."
      : "No starred repositories yet.";
  } else {
    const resultLabel = matches.length === 1 ? "repository" : "repositories";
    listStatus.textContent = query
      ? `${matches.length} of ${repositories.length} ${resultLabel} match your search.`
      : `${repositories.length} starred ${resultLabel}.`;
  }
  listStatus.textContent = repositories.length
    ? `${repositories.length} starred ${repositories.length === 1 ? "repository" : "repositories"}`
    : "No starred repositories yet.";
  listStatus.dataset.state = "loaded";
}

async function loadRepositories() {
  try {
    const response = await fetch("./events.json");
    if (!response.ok) {
      throw new Error(`Could not load repositories (HTTP ${response.status}).`);
    }

    repositories = validateRepositories(await response.json());
    searchInput.disabled = false;
    renderRepositories();
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    listStatus.textContent = `Unable to load starred repositories: ${message}`;
    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a list.");
    }

    renderRepositories(repositories);
  } catch (error) {
    listStatus.textContent = `Unable to load starred repositories: ${error.message}`;
    listStatus.dataset.state = "error";
  }
}

searchInput.addEventListener("input", renderRepositories);
loadRepositories();
