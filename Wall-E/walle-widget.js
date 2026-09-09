(function () {
  "use strict";

  var apiUrl = window.WALLE_API_URL || "/api/walle/analisar";
  var widget = document.createElement("section");
  widget.className = "walle-widget";
  widget.setAttribute("aria-label", "Assistente WALL-E");
  widget.innerHTML = [
    '<div class="walle-greeting" role="status">Ola! Eu sou o WALL-E. Posso conversar sobre reciclagem, sustentabilidade e descarte consciente.</div>',
    '<div class="walle-panel" id="walle-panel">',
    '  <div class="walle-heading">',
    '    <div class="walle-title"><span class="walle-orbit"><img src="logo%20EcoMap/logo.jpeg" alt=""></span><div><h2>WALL-E</h2><p>Seu guia para escolhas mais sustentaveis.</p></div></div>',
    '    <button class="walle-close" type="button" aria-label="Fechar">&times;</button>',
    "  </div>",
    '  <div class="walle-actions">',
    '    <label class="walle-upload">Tirar foto<input class="walle-camera" type="file" accept="image/*" capture="environment" /></label>',
    '    <label class="walle-upload">Escolher imagem<input class="walle-gallery" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>',
    "  </div>",
    '  <div class="walle-status" role="status"></div>',
    '  <div class="walle-result" hidden></div>',
    '  <div class="walle-chat">',
    '    <p class="walle-chat-title">Sustentabilidade no dia a dia</p>',
    '    <div class="walle-faqs" aria-label="Perguntas frequentes">',
    '      <button type="button" data-faq="vidro">Como descartar vidro?</button>',
    '      <button type="button" data-faq="metal">Como descartar metal?</button>',
    '      <button type="button" data-faq="plastico">Como descartar plastico?</button>',
    '      <button type="button" data-faq="papel">Como descartar papel?</button>',
    '      <button type="button" data-faq="eletronico">Como descartar eletronicos?</button>',
    '      <button type="button" data-faq="organico">Como descartar organicos?</button>',
    '      <button type="button" data-faq="perigoso">Como descartar pilhas e oleo?</button>',
    '      <button class="walle-about-button" type="button" data-faq="quem-somos">Quem somos nos?</button>',
    '    </div>',
    '    <div class="walle-chat-log" role="log"></div>',
    '    <form class="walle-chat-form"><input type="text" placeholder="Ex.: como preparar o plastico?" aria-label="Pergunta sobre reciclagem"><button type="submit" aria-label="Enviar pergunta">&rarr;</button></form>',
    "  </div>",
    "</div>",
    '<button class="walle-trigger" type="button" aria-expanded="false" aria-controls="walle-panel" aria-label="Abrir WALL-E">WALL-E</button>'
  ].join("");

  document.body.appendChild(widget);

  var panel = widget.querySelector(".walle-panel");
  var trigger = widget.querySelector(".walle-trigger");
  var close = widget.querySelector(".walle-close");
  var imageInputs = widget.querySelectorAll("input[type=file]");
  var status = widget.querySelector(".walle-status");
  var result = widget.querySelector(".walle-result");
  var chatLog = widget.querySelector(".walle-chat-log");
  var chatForm = widget.querySelector(".walle-chat-form");
  var chatInput = chatForm.querySelector("input");
  var faqButtons = widget.querySelectorAll("[data-faq]");

  window.setTimeout(function () {
    widget.querySelector(".walle-greeting").classList.add("is-hidden");
  }, 5000);

  function setOpen(open) {
    panel.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
  }

  function showResult(data) {
    var recyclable = data.reciclavel === true ? "Sim" : data.reciclavel === false ? "Nao" : "Nao foi possivel confirmar";
    result.innerHTML = [
      "<strong>", data.objeto || "Material nao identificado", "</strong><br>",
      "Categoria: ", data.categoria || "indeterminada", "<br>",
      "Reciclavel: ", recyclable, "<br>",
      "Preparo: ", data.preparo || "Consulte o ponto local.", "<br>",
      "Destino: ", data.destino || "Consulte o ponto local."
    ].join("");
    result.hidden = false;
  }

  trigger.addEventListener("click", function () {
    setOpen(!panel.classList.contains("is-open"));
  });
  close.addEventListener("click", function () { setOpen(false); });

  async function analyzeImage(input) {
    if (!input.files.length) return;
    var formData = new FormData();
    formData.append("imagem", input.files[0]);
    result.hidden = true;
    status.textContent = "WALL-E esta analisando a imagem...";

    try {
      var response = await fetch(apiUrl, { method: "POST", body: formData });
      var data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.erro || "Nao foi possivel analisar a imagem.");
      showResult(data);
      status.textContent = "Analise concluida.";
    } catch (error) {
      status.textContent = error.message || "Nao foi possivel conectar ao WALL-E.";
    }
  }

  imageInputs.forEach(function (input) { input.addEventListener("change", function () { analyzeImage(input); }); });

  async function readJsonResponse(response) {
    var body = await response.text();
    if (!body.trim()) throw new Error("O servidor nao retornou uma resposta. Verifique se o backend esta online.");
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error("O servidor retornou uma resposta invalida.");
    }
  }

  function addChatMessage(text, className) {
    var message = document.createElement("p");
    message.className = "walle-chat-message " + className;
    message.textContent = text;
    chatLog.appendChild(message);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  faqButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var question = button.textContent;
      submitQuestion(question);
    });
  });

  async function submitQuestion(question) {
    if (!question) return;
    addChatMessage(question, "is-user");
    addChatMessage("Vou pensar nisso...", "is-walle");
    try {
      var response = await fetch(window.WALLE_CHAT_URL || "/api/walle/pergunta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pergunta: question }) });
      var data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.erro || "Nao foi possivel responder agora.");
      chatLog.lastChild.textContent = data.resposta;
    } catch (error) { chatLog.lastChild.textContent = "No momento, use a identificacao por imagem ou consulte o ponto de coleta local."; }
  }

  chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var question = chatInput.value.trim();
    chatInput.value = "";
    submitQuestion(question);
  });
})();