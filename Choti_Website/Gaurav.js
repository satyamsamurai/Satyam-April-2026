const apiKey = "7ef1bfc84f07e68280f6bcaf6842d4c8";

function setRefreshing(isRefreshing) {
    const btn = document.getElementById('refreshWeather');
    if (!btn) return;

    btn.disabled = isRefreshing;
    btn.textContent = isRefreshing ? 'Fetching...' : 'Refresh Location';
}

function getWeather() {
    setRefreshing(true);
    showError('');

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

    // Format coordinates
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';

    const formattedLat = Math.abs(lat).toFixed(4);
    const formattedLon = Math.abs(lon).toFixed(4);

    const coordText = `${formattedLat}° ${latDir}, ${formattedLon}° ${lonDir}`;

    document.getElementById('coordinates').innerHTML =
        `<strong>Coordinates: ${coordText}</strong>`;

    // Fetch location name using weather API
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const city = data.name || "Unknown location";
            document.getElementById('greeting').innerText =
                `Hi Gaurav, You are in ${city}`;
        })
        .catch(() => {
            document.getElementById('greeting').innerText =
                `Hi Gaurav, Location unavailable`;
        })
        .finally(() => {
            setRefreshing(false);
        });
}

function showError(msg) {
    const el = document.getElementById('error');
    if (el) el.innerText = msg;
}

window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('refreshWeather');
    if (btn) {
        btn.addEventListener('click', getWeather);
    }

    getWeather();
});