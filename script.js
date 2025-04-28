const accessToken = "3591f024b3233c096ddfd4d2d2fed29d5cbabcd8"; // Paste your real access token here

fetch('https://www.strava.com/api/v3/athlete/activities', {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})
.then(response => response.json())
.then(data => {
  const workoutsContainer = document.getElementById("workouts");
  workoutsContainer.innerHTML = "";

  data.forEach(workout => {
    const card = document.createElement("div");
    card.className = "workout-card";

    // Add text content first
    card.innerHTML = `
      <h3>${workout.name}</h3>
      <p><strong>Distance:</strong> ${(workout.distance / 1000).toFixed(1)} km</p>
      <p><strong>Elevation Gain:</strong> ${workout.total_elevation_gain || 0} m</p>
      <p><strong>Time:</strong> ${Math.floor(workout.moving_time / 60)} min</p>
      <p><strong>Date:</strong> ${new Date(workout.start_date).toLocaleDateString()}</p>
    `;

    // Add map if available
    if (workout.map && workout.map.summary_polyline) {
      const mapContainer = document.createElement("div");
      mapContainer.style.height = "200px";
      mapContainer.style.marginTop = "10px";
      card.appendChild(mapContainer);
      
      // Initialize map after the container is added to DOM
      setTimeout(() => {
        const map = L.map(mapContainer).setView([0, 0], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        const latlngs = L.Polyline.fromEncoded(workout.map.summary_polyline).getLatLngs();
        const polyline = L.polyline(latlngs, { color: 'red' }).addTo(map);
        map.fitBounds(polyline.getBounds());
      }, 0);
    }

    workoutsContainer.appendChild(card);
  });
})
.catch(error => console.error('Error fetching activities:', error));