(function () {
  "use strict";

  var apiBase = window.WALLE_API_BASE || (window.location.protocol === "file:" ? "http://127.0.0.1:5000" : "");
  var apiUrl = window.WALLE_API_URL || apiBase + "/api/walle/analisar";
  var widget = document.createElement("section");
  widget.className = "walle-widget";
  widget.setAttribute("aria-label", "Assistente WALL-E");
  widget.innerHTML = [
    '<div class="walle-backdrop" aria-hidden="true"></div>',
    '<div class="walle-greeting" role="status">Ola! Eu sou o WALL-E. Posso conversar sobre reciclagem, sustentabilidade e descarte consciente.</div>',
    '<div class="walle-panel" id="walle-panel">',
    '  <div class="walle-topbar"><span class="walle-topbrand"><span class="walle-topdot"></span> EcoMap <b>/</b> Assistente IA</span><button class="walle-close" type="button" aria-label="Fechar WALL-E">&times;</button></div>',
    '  <div class="walle-layout">',
    '  <aside class="walle-identity">',
    '    <div class="walle-visual"><span class="walle-visual-ring"></span><span class="walle-visual-core"><img src="logo%20EcoMap/logo.jpeg" alt=""></span><i class="walle-leaf">+</i></div>',
    '    <div class="walle-identity-copy"><span class="walle-kicker">Assistente ambiental</span><h2>WALL-E</h2><p>Seu guia para escolhas mais sustentaveis.</p><span class="walle-status-pill"><span></span> Online</span></div>',
    '    <div class="walle-about"><strong>O que eu faco</strong><p>Identifico materiais, explico praticas sustentaveis e ajudo voce a usar o EcoMap.</p></div>',
    '  </aside>',
    '  <section class="walle-conversation">',
    '    <div class="walle-heading">',
    '      <span class="walle-eyebrow">EcoMap intelligence</span><h1>Ola! Eu sou o WALL-E <span class="walle-sprout">+</span></h1><p>Seu assistente para escolhas mais sustentaveis.</p><span class="walle-question">Como posso ajudar voce hoje?</span>',
    '    </div>',
    '    <div class="walle-quick-grid" aria-label="Acoes rapidas">',
    '      <button class="walle-quick-card" type="button" data-action="identify"><span class="walle-quick-icon">&#x267B;</span><span><b>Identificar material</b><small>Tire uma foto e descubra o material.</small></span><em>&rarr;</em></button>',
    '      <button class="walle-quick-card" type="button" data-action="points"><span class="walle-quick-icon">&#x25C9;</span><span><b>Encontrar pontos de coleta</b><small>Encontre locais de descarte proximos.</small></span><em>&rarr;</em></button>',
    '      <button class="walle-quick-card" type="button" data-action="sustainability"><span class="walle-quick-icon">+</span><span><b>Duvidas sobre sustentabilidade</b><small>Pergunte sobre reciclagem e meio ambiente.</small></span><em>&rarr;</em></button>',
    '      <button class="walle-quick-card" type="button" data-action="ecomap"><span class="walle-quick-icon">?</span><span><b>Como usar o EcoMap?</b><small>Entenda cadastro, doador e coletor.</small></span><em>&rarr;</em></button>',
    '    </div>',
    '    <div class="walle-examples"><span>Exemplos de perguntas</span><div><button type="button" data-question="O que e esse material?">O que e esse material?</button><button type="button" data-question="Quais sao os pontos de coleta perto de mim?">Pontos de coleta perto de mim</button><button type="button" data-question="Como funciona o cadastro?">Como funciona o cadastro?</button><button type="button" data-question="O que posso reciclar?">O que posso reciclar?</button><button type="button" data-question="Me explique o ODS 12">Me explique o ODS 12</button></div></div>',
    '    <div class="walle-media-area">',
    '      <div class="walle-actions">',
    '        <label class="walle-upload"><span class="walle-action-icon">&#x25C9;</span><span><b>Tirar foto</b><small>Use a camera</small></span><input class="walle-camera" type="file" accept="image/*" capture="environment" /></label>',
    '        <label class="walle-upload"><span class="walle-action-icon">&#x25A3;</span><span><b>Escolher imagem</b><small>Da sua galeria</small></span><input class="walle-gallery" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>',
    '      </div>',
    '      <div class="walle-preview" hidden><img alt="Previa da imagem selecionada"><span class="walle-preview-name"></span><button class="walle-analyze" type="button">Analisar imagem</button></div>',
    '    </div>',
    '    <div class="walle-status" role="status"></div>',
    '    <div class="walle-result" hidden></div>',
    '    <div class="walle-chat">',
    '      <div class="walle-chat-log" role="log" aria-live="polite"></div>',
    '      <form class="walle-chat-form"><span class="walle-input-mark">&#9671;</span><input type="text" placeholder="Digite sua mensagem aqui..." aria-label="Mensagem para o WALL-E"><button type="submit" aria-label="Enviar pergunta">&uarr;</button></form>',
    '    </div>',
    '  </section>',
    '  </div>',
    "</div>",
    '<button class="walle-trigger" type="button" aria-expanded="false" aria-controls="walle-panel" aria-label="Abrir WALL-E"><span class="walle-trigger-orbit"><img src="logo%20EcoMap/logo.jpeg" alt=""></span><span>WALL-E</span></button>'
  ].join("");

  document.body.appendChild(widget);

  var panel = widget.querySelector(".walle-panel");
  var trigger = widget.querySelector(".walle-trigger");
  var close = widget.querySelector(".walle-close");
  var backdrop = widget.querySelector(".walle-backdrop");
  var imageInputs = widget.querySelectorAll("input[type=file]");
  var preview = widget.querySelector(".walle-preview");
  var previewImage = preview.querySelector("img");
  var previewName = preview.querySelector(".walle-preview-name");
  var analyzeButton = widget.querySelector(".walle-analyze");
  var status = widget.querySelector(".walle-status");
  var result = widget.querySelector(".walle-result");
  var chatLog = widget.querySelector(".walle-chat-log");
  var chatForm = widget.querySelector(".walle-chat-form");
  var chatInput = chatForm.querySelector("input");
  var selectedImage = null;
  window.setTimeout(function () {
    widget.querySelector(".walle-greeting").classList.add("is-hidden");
  }, 5000);

  function setOpen(open) {
    panel.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("walle-modal-open", open);
    if (open) chatInput.focus();
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
  backdrop.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") setOpen(false); });

  async function analyzeImage() {
    if (!selectedImage) return;
    var formData = new FormData();
    formData.append("imagem", selectedImage);
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

  imageInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      if (!input.files.length) return;
      selectedImage = input.files[0];
      previewImage.src = URL.createObjectURL(selectedImage);
      previewName.textContent = selectedImage.name;
      preview.hidden = false;
      status.textContent = "Imagem pronta para analise.";
    });
  });
  analyzeButton.addEventListener("click", analyzeImage);

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

  async function submitQuestion(question) {
    if (!question) return;
    addChatMessage(question, "is-user");
    addChatMessage("Vou pensar nisso...", "is-walle");
    try {
      var response = await fetch(window.WALLE_CHAT_URL || apiBase + "/api/walle/pergunta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pergunta: question }) });
      var data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.erro || "Nao foi possivel responder agora.");
      chatLog.lastChild.textContent = data.resposta;
    } catch (error) { chatLog.lastChild.textContent = error.message || "Nao foi possivel conectar ao WALL-E. Inicie o backend Flask e verifique a chave da OpenAI."; }
  }

  widget.querySelectorAll("[data-question]").forEach(function (button) {
    button.addEventListener("click", function () {
      chatInput.value = button.getAttribute("data-question");
      chatInput.focus();
    });
  });

  widget.querySelectorAll("[data-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      var action = button.getAttribute("data-action");
      if (action === "identify") {
        widget.querySelector(".walle-camera").click();
      } else {
        var questions = {
          points: "Quais sao os pontos de coleta perto de mim?",
          sustainability: "Quero tirar duvidas sobre sustentabilidade.",
          ecomap: "Como funciona o EcoMap, o cadastro, o doador e o coletor?"
        };
        chatInput.value = questions[action];
        chatInput.focus();
      }
    });
  });

  chatForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var question = chatInput.value.trim();
    chatInput.value = "";
    submitQuestion(question);
  });
})();