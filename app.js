let map;
let geojsonLayer;
let stateData = [];
let stateLayers = {};
let highlightedState = null;
const defaultStyle = {
  color: "#3388ff",
  weight: 1,
  fillColor: "#3388ff",
  fillOpacity: 0.2
};
const highlightStyle = {
  color: "#ff0000",
  weight: 2,
  fillColor: "#ff6666",
  fillOpacity: 0.6
};
const hoverStyle = {
  weight: 2,
  color: "#ffa500",
  fillColor: "#ffcc80",
  fillOpacity: 0.7
};
function getRandomPopulation() {
  return Math.floor(Math.random() * (50000000 - 5000000 + 1)) + 5000000;
}
function initMap() {
  map = L.map("map", {
    zoomControl: true
  }).setView([22.5937, 78.9629], 5);
  if (window.innerWidth <= 768) {
    map.zoomControl.setPosition("bottomright");
  }
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  document.getElementById("loading").style.display = "block";
  fetch("data/india_states.geojson")
    .then(res => res.json())
    .then(data => {
      data.features.forEach(f => {
        f.properties.population = getRandomPopulation();
      });
      stateData = data.features;
      geojsonLayer = L.geoJSON(data, {
        style: defaultStyle,
        onEachFeature: function (feature, layer) {
          const stateName = feature.properties.NAME_1;
          const stateKey = stateName.toLowerCase();
          stateLayers[stateKey] = layer;
          layer.bindPopup(stateName);
          layer.on("mouseover", function () {
            if (!highlightedState || highlightedState !== stateKey) {
              layer.setStyle(hoverStyle);
            }
          });
          layer.on("mouseout", function () {
            if (!highlightedState || highlightedState !== stateKey) {
              layer.setStyle(defaultStyle);
            } else {
              layer.setStyle(highlightStyle);
            }
          });
        }
      }).addTo(map);

      updateSidebar();
      document.getElementById("loading").style.display = "none";
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    })
    .catch(err => {
      console.error("Error loading GeoJSON:", err);
      document.getElementById("loading").innerText = "Error loading data!";
    });
}

function updateSidebar() {
  document.getElementById("total-states").innerText = stateData.length;
  const randomStates = stateData
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  const list = document.getElementById("random-states");
  list.innerHTML = "";
  randomStates.forEach(state => {
    const li = document.createElement("li");
    li.innerText = `${state.properties.NAME_1} - Pop: ${state.properties.population}`;
    list.appendChild(li);
  });
}
function searchState() {
  const query = document.getElementById("search").value.toLowerCase();
  Object.values(stateLayers).forEach(layer => {
    layer.setStyle(defaultStyle);
  });
  const match = stateData.find(
    s => s.properties.NAME_1.toLowerCase() === query
  );
  if (match) {
    const stateName = match.properties.NAME_1.toLowerCase();
    const layer = stateLayers[stateName];
    layer.setStyle(highlightStyle);
    if (layer.bringToFront) layer.bringToFront();
    map.fitBounds(layer.getBounds());
    document.getElementById("state-info").innerHTML = `
      <h4>${match.properties.NAME_1}</h4>
      <p>Population: ${match.properties.population}</p>
    `;
    highlightedState = stateName;
  } else {
    document.getElementById("state-info").innerHTML =
      "<p>No matching state found.</p>";
  }
}
function clearSearch() {
  document.getElementById("search").value = "";
  document.getElementById("state-info").innerHTML = "";
  Object.values(stateLayers).forEach(layer => {
    layer.setStyle(defaultStyle);
  });
  highlightedState = null;
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("search-btn").addEventListener("click", searchState);
  document.getElementById("clear-btn").addEventListener("click", clearSearch);
  initMap();
});

// Mobile Sidebar Toggle
const menuBtn = document.getElementById("menu-toggle");
const closeBtn = document.getElementById("close-sidebar");
const sidebar = document.getElementById("sidebar");
menuBtn.addEventListener("click", () => {
  sidebar.classList.add("active");
  menuBtn.classList.add("hidden");
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
});
closeBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
  menuBtn.classList.remove("hidden");
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
});
