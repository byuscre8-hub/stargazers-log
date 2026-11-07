const repositoryList = document.querySelector("#repository-list");
const listStatus = document.querySelector("#list-status");

function formatStarredDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Starred date unavailable";
  }

  return `Starred ${new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date)}`;
}

function renderRepositories(repositories) {
  repositoryList.replaceChildren();

  for (const repository of repositories) {
    if (
      typeof repository.name !== "string" ||
      typeof repository.description !== "string" ||
      typeof repository.url !== "string"
    ) {
      throw new Error("Repository data is missing a name, description, or URL.");
    }

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
    repositoryList.append(item);
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

loadRepositories();
