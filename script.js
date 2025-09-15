const response = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ city, days, interests, budget, notes })
});
const data = await response.json();

if (data.content) {
  document.querySelector('.itinerary').innerHTML = data.content;
  document.getElementById('result').style.display = 'block';
} else {
  showError(data.error || "Erro desconhecido");
}
