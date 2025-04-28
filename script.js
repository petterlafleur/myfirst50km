// 1. First add this polyline decoder function (required for Strava maps)
function decodePolyline(encoded) {
    const points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push([lat * 1e-5, lng * 1e-5]);
    }
    return points;
  }

const accessToken = "3591f024b3233c096ddfd4d2d2fed29d5cbabcd8"; // Paste your real access token here

fetch('https://www.strava.com/api/v3/athlete/activities', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    const workoutsContainer = document.getElementById("workouts");
    workoutsContainer.innerHTML = ""; // Clear previous content
  
    data.forEach(workout => {
      const card = document.createElement("div");
      card.className = "workout-card";
  
      // Add basic workout info
      card.innerHTML = `
        <h3>${workout.name}</h3>
        <p><strong>Distance:</strong> ${(workout.distance / 1000).toFixed(1)} km</p>
        <p><strong>Elevation:</strong> ${workout.total_elevation_gain || 0} m</p>
        <p><strong>Time:</strong> ${Math.floor(workout.moving_time / 60)} min</p>
        <p><strong>Date:</strong> ${new Date(workout.start_date).toLocaleDateString()}</p>
      `;
  
      // Add map if available
      if (workout.map && workout.map.summary_polyline) {
        const mapContainer = document.createElement("div");
        mapContainer.className = "map-container";
        mapContainer.style.height = "200px";
        mapContainer.style.margin = "10px 0";
        card.appendChild(mapContainer);
  
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const map = L.map(mapContainer).setView([0, 0], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
  
          try {
            const latlngs = decodePolyline(workout.map.summary_polyline);
            const polyline = L.polyline(latlngs, { color: 'red' }).addTo(map);
            map.fitBounds(polyline.getBounds());
          } catch (e) {
            console.error("Map error:", e);
            mapContainer.innerHTML = "<p>Map unavailable</p>";
          }
        }, 100);
      }
  
      workoutsContainer.appendChild(card);
    });
  })
  .catch(error => console.error('Error:', error));