const apiKey = "7ef1bfc84f07e68280f6bcaf6842d4c8"; // <-- REPLACE with your OpenWeatherMap key

function setRefreshing(isRefreshing) {
    const refreshBtn = document.getElementById('refreshWeather');
    if (!refreshBtn) return;
    if (isRefreshing) {
        refreshBtn.classList.add('refreshing');
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Refreshing…';
    } else {
        refreshBtn.classList.remove('refreshing');
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh Weather';
    }
}

function getWeather() {
    setRefreshing(true);
    const errorEl = document.getElementById('error');
    if (errorEl) errorEl.innerText = '';

    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        setRefreshing(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(showPosition, (err) => {
        showError('Geolocation error: ' + err.message);
        setRefreshing(false);
    });
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(async response => {
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                const message = data?.message || 'Unknown error';
                throw new Error(`OpenWeatherMap request failed (${response.status}) - ${message}`);
            }
            return data;
        })
        .then(async data => {
            const cityName = data.name || 'Unknown';
            let countryCode = (data.sys?.country || '').toLowerCase();

            if (!countryCode && data.coord?.lat != null && data.coord?.lon != null) {
                try {
                    const geoURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${data.coord.lat}&lon=${data.coord.lon}&limit=1&appid=${apiKey}`;
                    const geoRes = await fetch(geoURL);
                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        if (Array.isArray(geoData) && geoData.length > 0 && geoData[0].country) {
                            countryCode = geoData[0].country.toLowerCase();
                        }
                    }
                } catch (err) {
                    console.warn('Reverse geocoding failed:', err);
                }
            }

            if (!countryCode) {
                countryCode = 'in';
            }

            const temperature = data.main?.temp ?? '--';
            const description = data.weather?.[0]?.description || '--';
            const humidity = data.main?.humidity ?? null;
            const humidityText = humidity != null ? `${humidity}%` : '--';

            const feelsLike = data.main?.feels_like ?? '--';
            const tempMin = data.main?.temp_min ?? '--';
            const tempMax = data.main?.temp_max ?? '--';
            const pressure = data.main?.pressure ?? '--';
            const windSpeed = data.wind?.speed ?? '--';
            const clouds = data.clouds?.all ?? '--';
            const visibility = data.visibility ?? '--';

            const locationHeader = document.getElementById('locationHeader');
            if (locationHeader) {
                locationHeader.innerText = `Welcome to ${cityName}`;
            }
            document.getElementById('location').innerText = `Location: ${cityName}`;
            document.getElementById('temperature').innerText = `Temperature: ${temperature}°C`;
            document.getElementById('description').innerText = `Weather: ${description}`;
            document.getElementById('humidity').innerText = `Humidity: ${humidityText}`;
            document.getElementById('wind').innerText = `Wind: ${windSpeed} m/s`;
            document.getElementById('timezone').innerText = `Timezone: ${data.timezone ?? '--'}`;

            if (window.updateNewsForLocation) {
                window.updateNewsForLocation(cityName, countryCode);
            }

            let altitudeText = 'unknown altitude';
            if (data.coord?.lat != null && data.coord?.lon != null) {
                try {
                    const elevResp = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${data.coord.lat},${data.coord.lon}`);
                    if (elevResp.ok) {
                        const elevData = await elevResp.json();
                        if (Array.isArray(elevData.results) && elevData.results.length > 0) {
                            altitudeText = `${Math.round(elevData.results[0].elevation)}m`;
                        }
                    }
                } catch (e) {
                    console.warn('Elevation API failed:', e);
                    altitudeText = 'unavailable';
                }
            }

            const humidityDesc = humidity != null ? (humidity >= 70 ? 'humid today' : 'not much humid') : 'humidity unknown';
            const weatherSummary = `It's ${temperature}°C with ${description}, ${humidityDesc}, altitude ${altitudeText}.`;
            const summaryEl = document.getElementById('weatherSummary');
            if (summaryEl) {
                summaryEl.innerText = weatherSummary;
            }

            const rainKeywords = /rain|drizzle|shower|thunderstorm|snow/i;
            const willRain = rainKeywords.test(description);
            const rainText = willRain ? 'It looks like rain is likely; bring an umbrella.' : 'Rain is unlikely now, but stay prepared in changing weather.';
            const windSpeedNum = parseFloat(windSpeed) || 0;
            const windText = windSpeedNum >= 10 ? 'Wind is strong enough to feel breezy.' : 'Wind is mild.';
            const cloudText = clouds !== '--' ? `Cloud cover is about ${clouds}%` : 'Cloud information not available.';

            const insightText = `It's ${temperature}°C (feels like ${feelsLike}°C, ranging from ${tempMin}°C to ${tempMax}°C), with ${description}, ${humidityDesc}. Pressure is ${pressure} hPa, wind at ${windSpeed} m/s, ${cloudText}, visibility ${visibility} m, altitude ${altitudeText}. ${rainText} ${windText}`;
            const insightEl = document.getElementById('weatherInsightText');
            if (insightEl) {
                insightEl.innerText = insightText;
            }

            document.getElementById('visibility').innerText = `Visibility: ${data.visibility ?? '--'} m`;
            const sunriseTs = data.sys?.sunrise;
            const sunsetTs = data.sys?.sunset;
            const sunrise = sunriseTs ? new Date(sunriseTs * 1000).toLocaleTimeString() : '--';
            const sunset = sunsetTs ? new Date(sunsetTs * 1000).toLocaleTimeString() : '--';
            document.getElementById('sunrise').innerText = `Sunrise: ${sunrise}`;
            document.getElementById('sunset').innerText = `Sunset: ${sunset}`;

            applyDayNightTheme(sunriseTs, sunsetTs, data.timezone);
            setRefreshing(false);
        })
        .catch(err => {
            setRefreshing(false);
            showError('Could not load weather data: ' + err.message);
            console.error(err);
        });
}

function applyDayNightTheme(sunriseTs, sunsetTs, timezoneOffset) {
    const body = document.body;
    const nowUtc = Math.floor(Date.now() / 1000);
    const localNow = nowUtc + (timezoneOffset || 0);

    if (!sunriseTs || !sunsetTs || localNow < sunriseTs || localNow >= sunsetTs) {
        body.classList.add('theme-night');
        body.classList.remove('theme-day');
        body.style.background = 'linear-gradient(135deg, #071026, #0d2042)';
        body.style.color = '#e9efff';
        return;
    }

    body.classList.add('theme-day');
    body.classList.remove('theme-night');

    const progress = (localNow - sunriseTs) / (sunsetTs - sunriseTs);
    const curve = Math.sin(Math.PI * Math.max(0, Math.min(1, progress)));
    const startL = 45 + curve * 30;
    const endL = 30 + curve * 35;

    body.style.background = `linear-gradient(135deg, hsl(210, 85%, ${startL}%) 0%, hsl(205, 90%, ${endL}%) 100%)`;
    body.style.color = '#14243c';
}

function initMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-rain-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const fontSize = 18; // visible matrix size
    let columns = Math.floor(width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * height / fontSize));

    const updateSize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        const newColumns = Math.floor(width / fontSize);
        if (newColumns !== columns) {
            columns = newColumns;
            drops.length = columns;
            for (let i = 0; i < columns; i++) {
                if (drops[i] === undefined) drops[i] = Math.floor(Math.random() * height / fontSize);
            }
        }
    };

    window.addEventListener('resize', updateSize);

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px Courier New, monospace`;
        ctx.fillStyle = '#66ff66';

        for (let i = 0; i < columns; i++) {
            const text = Math.random() > 0.5 ? '0' : '1';
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            ctx.fillText(text, x, y);

            if (y > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        requestAnimationFrame(draw);
    };

    draw();
}

function formatTwoDigits(num) {
    return String(num).padStart(2, '0');
}

function updateDigitalClock() {
    const now = new Date();
    const h = formatTwoDigits(now.getHours());
    const m = formatTwoDigits(now.getMinutes());
    const s = formatTwoDigits(now.getSeconds());
    const timeString = `${h}:${m}:${s}`;

    const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
    const dateString = now.toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const timeEl = document.getElementById('digitalTime');
    const dateEl = document.getElementById('digitalDate');
    const dayEl = document.getElementById('digitalDay');

    const progressBar = document.getElementById('dayProgressBar');
    const progressLabel = document.getElementById('dayProgressLabel');

    if (timeEl) timeEl.textContent = timeString;
    if (dateEl) dateEl.textContent = dateString;
    if (dayEl) dayEl.textContent = weekday;

    const totalSeconds = 24 * 60 * 60;
    const elapsedSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const progressPercent = Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));

    if (progressBar) {
        progressBar.style.width = `${progressPercent.toFixed(2)}%`;
    }
    if (progressLabel) {
        progressLabel.textContent = `Day progress: ${progressPercent.toFixed(2)}%`;
    }
}

function showError(msg) {
    const errorEl = document.getElementById('error');
    if (errorEl) errorEl.innerText = msg;
}

function playBlipSound() {
    try {
        const blip = new Audio('blip.mp3');
        blip.volume = 0.85;
        blip.play().catch(() => {
            // some browsers require interaction, this is already called on click so should work
        });
    } catch (err) {
        console.warn('Blip sound cannot be played', err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const refresh = document.getElementById('refreshWeather');
    if (refresh) {
        refresh.addEventListener('click', () => {
            playBlipSound();
            getWeather();
        });
    }

    // Only initialize matrix rain on Choti.html, not on Choti1.html
    if (window.location.pathname.includes('Choti.html')) {
        initMatrixRain();
    }
    updateDigitalClock();
    setInterval(updateDigitalClock, 1000);

    getWeather();
});
