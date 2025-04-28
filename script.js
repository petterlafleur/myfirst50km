const accessToken = "3591f024b3233c096ddfd4d2d2fed29d5cbabcd8"; // Paste your real access token here

fetch('https://www.strava.com/api/v3/athlete/activities', {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})
.then(response => response.json())
.then(data => {
  const workoutsContainer = document.getElementById("workouts");
  workoutsContainer.innerHTML = ""; // Clear old fake ones

  data.forEach(workout => {
    const card = document.createElement("div");
    card.className = "workout-card";

    // mini map URL (optional)
    const mapUrl = workout.map && workout.map.summary_polyline
      ? `https://maps.googleapis.com/maps/api/staticmap?size=400x200&path=enc:${workout.map.summary_polyline}&key=YOUR_GOOGLE_MAPS_API_KEY`
      : '';

    card.innerHTML = `
      <h3>${workout.name}</h3>
      <p><strong>Distance:</strong> ${(workout.distance / 1000).toFixed(1)} km</p>
      <p><strong>Elevation Gain:</strong> ${workout.total_elevation_gain || 0} m</p>
      <p><strong>Time:</strong> ${Math.floor(workout.moving_time / 60)} min</p>
      <p><strong>Date:</strong> ${new Date(workout.start_date).toLocaleDateString()}</p>
      ${mapUrl ? `<img src="${mapUrl}" alt="Workout Map" style="width:100%; border-radius:10px; margin-top:10px;">` : ''}
    `;
    workoutsContainer.appendChild(card);
  });
})
.catch(error => console.error('Error fetching activities:', error));
