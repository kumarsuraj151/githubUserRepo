let repositories = [];

async function performSearch() {
    const inputtag = document.getElementById('searchInput');
    const username = inputtag.value;

    if (username.trim() === '') {
        alert('Please enter a GitHub username.');
        return;
    }

    const userData = await fetchUserData(username);

    if (userData) {
        displayResults(userData);
        inputtag.value = '';
    } else {
        alert(`User not found: ${username}`);
    }
}

async function fetchUserData(username) {
    const apiUrl = `https://api.github.com/users/${username}`;
    const response = await fetch(apiUrl);

    if (response.ok) {
        return await response.json();
    } else {
        console.error('Error fetching user data:', response.status);
        return null;
    }
}

async function fetchRepositories(username, page = 1, perPage = 10) {
    console.log(page)
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
    const response = await fetch(apiUrl);

    if (response.ok) {
        const data = await response.json();
        repositories = []
        repositories = repositories.concat(data)
        console.log(repositories, repositories.length)
        displayPage(page, username, repositories)
    } else {
        console.log("some error")
        console.error('Error fetching repositories:', response.status);
        return [];
    }
}


async function displayResults(userData) {
    const resultsContainer = document.getElementById('userResult');
    resultsContainer.innerHTML = '';

    const avatar = `<img class="avatar" src="${userData.avatar_url}" alt="${userData.login}">`;
    const userInfo = `<div class="user-info">
                          <p class="username"><strong>${userData.login}</strong></p>
                          <p class="name">Name: ${userData.name || 'Not provided'}</p>
                          <p class="followers">Followers: ${userData.followers}</p>
                          <p class="repos">Public Repositories: ${userData.public_repos}</p>
                      </div>`;

    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    resultItem.innerHTML = avatar + userInfo;
    resultsContainer.appendChild(resultItem);

    repositories = await fetchRepositories(userData.login);
}


function displayPage(page, username, repositories) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    if (repositories.length === 0) {
        const noRepoMessage = document.createElement('p');
        noRepoMessage.textContent = 'No repositories found.';
        resultsContainer.appendChild(noRepoMessage);
        return;
    }

    const repoList = document.createElement('div'); // Change from 'ul' to 'div'
    repoList.classList.add('repo-list-container'); // Add a container class

    repositories.forEach(repo => {
        const card = document.createElement('div');
        card.classList.add('repo-card');

        const repoLink = document.createElement('a');
        repoLink.href = repo.html_url;
        repoLink.target = '_blank';
        repoLink.textContent = repo.name || '(Unnamed repository)';

        card.appendChild(repoLink);
        repoList.appendChild(card);
    });

    resultsContainer.appendChild(repoList);
    displayPaginationControls(page, username);
}


function displayPaginationControls(currentPage, username) {
    const resultsContainer = document.getElementById('searchResults');
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');

    const numPages = Math.ceil(repositories.length / 10);
    console.log(numPages)
    const pageButton = document.createElement('button');
    pageButton.textContent = 'Next page';
    pageButton.addEventListener('click', () => {
        fetchRepositories(username, currentPage + 1, 10)
    });
    resultsContainer.appendChild(pageButton)
}
