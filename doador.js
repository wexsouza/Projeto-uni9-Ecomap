(function () {
  "use strict";

  var defaultCenter = [-23.5505, -46.6333];
  var saoPauloBounds = L.latLngBounds([-25.35, -53.15], [-19.70, -44.00]);
  var saoPauloViewbox = "-53.15,-19.70,-44.00,-25.35";
  var materialColors = { plastico: "#e2b93b", papel: "#8ca6b5", metal: "#7b858c", vidro: "#4d9f83", eletronico: "#8066a8", textil: "#d47755" };
  var collectionPoints = [
    { name: "Garrafas PET disponiveis", type: "Plastico · doador proximo", position: [-23.548, -46.638], color: materialColors.plastico },
    { name: "Caixas de papelao", type: "Papel · doador proximo", position: [-23.555, -46.628], color: materialColors.papel },
    { name: "Latas separadas", type: "Metal · doador proximo", position: [-23.544, -46.625], color: materialColors.metal }
  ];

  var map = L.map("donor-map", {
    zoomControl: false,
    maxBounds: saoPauloBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 7
  }).setView(defaultCenter, 14);
  L.control.zoom({ position: "bottomright" }).addTo(map);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution: "&copy; OpenStreetMap &copy; CARTO", subdomains: "abcd", maxZoom: 19 }).addTo(map);

  function markerIcon(color) {
    return L.divIcon({ className: "", html: '<span class="map-donation-marker" style="background:' + color + '"></span>', iconSize: [24, 24], iconAnchor: [12, 12] });
  }

  function isSaoPauloState(place) {
    var address = place.address || {};
    var state = (address.state || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    var country = (address.country_code || "").toLowerCase();
    return state === "sao paulo" && (!country || country === "br");
  }

  collectionPoints.forEach(function (point) {
    var marker = L.marker(point.position, { icon: markerIcon(point.color) }).addTo(map);
    marker.bindPopup("<strong>" + point.name + "</strong><br>" + point.type + "<br><button class=\"map-select\">Ver disponibilizacao</button>");
    marker.on("popupopen", function () {
      var button = document.querySelector(".map-select");
      if (button) button.addEventListener("click", function () { document.querySelector(".map-status").textContent = point.name + " selecionado"; marker.closePopup(); });
    });
  });

  async function geocode(address, city, cep) {
    var normalizedCep = cep.replace(/\D/g, "");
    var queries = [
      address + ", " + city + ", Sao Paulo - SP, Brasil, " + normalizedCep,
      address + ", " + city + ", Sao Paulo - SP, Brasil"
    ];

    for (var index = 0; index < queries.length; index += 1) {
      var params = "format=jsonv2&addressdetails=1&limit=1&bounded=1&viewbox=" + saoPauloViewbox + "&q=" + encodeURIComponent(queries[index]);
      var response = await fetch("https://nominatim.openstreetmap.org/search?" + params);
      var places = await response.json();
      if (!places.length) continue;

      var position = [Number(places[0].lat), Number(places[0].lon)];
      if (!saoPauloBounds.contains(position) || !isSaoPauloState(places[0])) throw new Error("Esse endereco fica fora do estado de Sao Paulo.");
      return position;
    }

    throw new Error("Endereco nao encontrado. Confira rua, numero e CEP.");
  }

  var status = document.querySelector(".map-status");

  document.querySelectorAll("[data-scroll]").forEach(function (button) {
    button.addEventListener("click", function () { document.getElementById(button.dataset.scroll).scrollIntoView({ behavior: "smooth" }); });
  });

  document.querySelector("#donation-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    var name = document.querySelector("#material-name").value.trim();
    var type = document.querySelector("#material-type").value;
    var address = document.querySelector("#donation-address").value.trim();
    var city = document.querySelector("#donation-city").value.trim();
    var cep = document.querySelector("#donation-cep").value.trim();
    var formStatus = document.querySelector("#donation-status");
    if (!name || !type || !address || !city || !cep) return;
    if (!/^\d{5}-?\d{3}$/.test(cep)) {
      formStatus.textContent = "Informe um CEP valido no formato 00000-000.";
      return;
    }
    formStatus.textContent = "Localizando o ponto da sua disponibilizacao...";
    try {
      var position = await geocode(address, city, cep);
      var marker = L.marker(position, { icon: markerIcon(materialColors[type]) }).addTo(map);
      marker.bindPopup("<strong>" + name + "</strong><br>Material: " + type + "<br>Disponibilizado aqui").openPopup();
      map.setView(position, 16);
      status.textContent = "Novo material no mapa";
      formStatus.textContent = "Material disponibilizado com sucesso.";
      document.querySelector("#donation-form").reset();
    } catch (error) { formStatus.textContent = error.message || "Nao foi possivel adicionar o material."; }
  });
})();