const API_KEY = "b850c45f9ef843cfb9dcc2ce17abcea5"; // replace with your NewsAPI key

async function fetchNews({ country = 'in', query = '' } = {}) {
  const endpoint = 'https://newsapi.org/v2/top-headlines';
  const params = new URLSearchParams({ apiKey: API_KEY, pageSize: 12 });

  if (country) {
    params.set('country', country.toLowerCase());
  }

  if (query) {
    params.set('q', query);
    params.delete('country');
  }

  const response = await fetch(`${endpoint}?${params.toString()}`);
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NewsAPI status ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.articles ?? [];
}

function renderNews(articles) {
  const container = document.getElementById('newsContainer');
  const info = document.getElementById('newsInfo');

  if (!container) return;

  container.innerHTML = '';
  if (info) {
    info.innerText = articles.length > 0 ? `Showing ${articles.length} headlines` : 'No news available for the selected location.';
  }

  if (articles.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'no-news';
    empty.textContent = 'No news items found.';
    container.appendChild(empty);
    return;
  }

  articles.forEach(article => {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.innerHTML = `
      <div class="news-image" style="background-image: url('${article.urlToImage || 'https://via.placeholder.com/320x180?text=No+Image'}')"></div>
      <div class="news-content">
        <h3>${article.title || 'Untitled'}</h3>
        <p>${article.description || (article.content ? article.content.slice(0, 120) + '...' : 'No description')}</p>
        <a href="${article.url}" target="_blank" rel="noopener noreferrer">Read More</a>
      </div>
    `;
    container.appendChild(card);
  });
}

window.updateNewsForLocation = async (locationName = '', countryCode = 'in') => {
  const label = document.getElementById('newsLocationLabel');
  const info = document.getElementById('newsInfo');

  if (label) {
    label.textContent = locationName ? `News: ${locationName} (${countryCode?.toUpperCase() || 'Global'})` : `News: ${countryCode?.toUpperCase() || 'Global'}`;
  }

  if (info) {
    info.textContent = '';
  }

  try {
    let articles = [];
    let sourceDescription = 'top headlines by country';

    if (countryCode) {
      articles = await fetchNews({ country: countryCode });
    }

    if (articles.length === 0 && locationName) {
      sourceDescription = 'local search by place name';
      articles = await fetchNews({ query: locationName });
    }

    if (articles.length === 0 && locationName && locationName.includes(' ')) {
      const fallbackName = locationName.split(',')[0].trim();
      if (fallbackName && fallbackName !== locationName) {
        sourceDescription = 'nearest place fallback';
        articles = await fetchNews({ query: fallbackName });
      }
    }

    if (articles.length === 0) {
      sourceDescription = 'global headlines fallback';
      articles = await fetchNews({ country: '' });
    }

    if (info) {
      info.innerText = `Showing ${articles.length} headlines (${sourceDescription})`;
    }

    renderNews(articles);
  } catch (err) {
    console.error('News fetching error:', err);
    if (info) {
      // info.textContent = 'Unable to load news right now.';
    }
    const container = document.getElementById('newsSection');
    if (container) {
      // container.remove();


    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  if (window.updateNewsForLocation) {
    window.updateNewsForLocation('Global', 'in');
  }
});