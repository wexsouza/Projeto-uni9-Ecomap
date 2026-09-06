(function () {
  "use strict";

  var apiUrl = window.WALLE_API_URL || "/api/walle/analisar";
  var widget = document.createElement("section");
  widget.className = "walle-widget";
  widget.setAttribute("aria-label", "Assistente WALL-E");
  widget.innerHTML = [
    '<div class="walle-greeting" role="status">Ola! Eu sou o WALL-E, a inteligencia artificial do EcoMap. Posso ajudar a identificar materiais reciclaveis.</div>',
    '<div class="walle-panel" id="walle-panel">',
    '  <div class="walle-heading">',
    "    <div><h2>WALL-E</h2><p>Envie uma imagem para identificar o material.</p></div>",
    '    <button class="walle-close" type="button" aria-label="Fechar">&times;</button>',
    "  </div>",
    '  <div class="walle-actions">',
    '    <label class="walle-upload">Tirar foto<input class="walle-camera" type="file" accept="image/*" capture="environment" /></label>',
    '    <label class="walle-upload">Escolher imagem<input class="walle-gallery" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>',
    "  </div>",
    '  <div class="walle-status" role="status"></div>',
    '  <div class="walle-result" hidden></div>',
    '  <div class="walle-chat">',
    '    <p class="walle-chat-title">Duvidas sobre reciclagem</p>',
    '    <div class="walle-faqs" aria-label="Perguntas frequentes">',
    '      <button type="button" data-faq="vidro">Como descartar vidro?</button>',
    '      <button type="button" data-faq="metal">Como descartar metal?</button>',
    '      <button type="button" data-faq="plastico">Como descartar plastico?</button>',
    '      <button type="button" data-faq="papel">Como descartar papel?</button>',
    '      <button type="button" data-faq="eletronico">Como descartar eletronicos?</button>',
    '      <button type="button" data-faq="organico">Como descartar organicos?</button>',
    '      <button type="button" data-faq="perigoso">Como descartar pilhas e oleo?</button>',
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

  var faqAnswers = {
    vidro: "Separe garrafas e potes de vidro, retire tampas e lave se necessario. Envolva cacos em papel ou caixa identificada e leve ao ponto de coleta; nao coloque vidro quebrado solto no saco.",
    metal: "Lave latas e embalagens metalicas, seque e amasse quando for seguro. Separe objetos cortantes e leve tudo a um ponto de coleta ou cooperativa.",
    plastico: "Esvazie, lave e seque garrafas, potes e embalagens plasticas. Retire o excesso de residuos, tampe se possivel e encaminhe para coleta seletiva.",
    papel: "Mantenha jornais, caixas e folhas secos e limpos. Dobre as caixas, retire fitas e plastifique menos; papel molhado ou engordurado deve ir para o rejeito.",
    eletronico: "Nao descarte eletronicos no lixo comum. Separe pilhas, baterias e cabos e leve o equipamento a um ponto de coleta ou loja que receba lixo eletronico.",
    organico: "Separe restos de alimentos do reciclavel. Use compostagem para cascas e residuos vegetais quando houver essa opcao; carnes e outros itens dependem da regra local.",
    perigoso: "Tinta, medicamento, oleo, lampada, pilha e bateria precisam de pontos especiais. Mantenha a embalagem fechada e consulte o ponto de coleta do seu municipio."
  };

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
      var data = await response.json();
      if (!response.ok) throw new Error(data.erro || "Nao foi possivel analisar a imagem.");
      showResult(data);
      status.textContent = "Analise concluida.";
    } catch (error) {
      status.textContent = error.message || "Nao foi possivel conectar ao WALL-E.";
    }
  }

  imageInputs.forEach(function (input) { input.addEventListener("change", function () { analyzeImage(input); }); });

  function isRecyclingQuestion(question) {
    return /recicl|residu|lixo|material|plast|papel|metal|vidro|eletron|textil|coleta|descarte|limp|separ/i.test(question);
  }

  function addChatMessage(text, className) {
    var message = document.createElement("p");
    message.className = "walle-chat-message " + className;
    message.textContent = text;
    chatLog.appendChild(message);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function normalizeQuestion(question) {
    return question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function getFaqAnswer(question) {
    var normalized = normalizeQuestion(question);
    var materials = Object.keys(faqAnswers);
    for (var index = 0; index < materials.length; index += 1) {
      if (normalized.indexOf(materials[index]) !== -1) return faqAnswers[materials[index]];
    }
    return "";
  }

  function answerFaq(question) {
    var answer = getFaqAnswer(question);
    if (!answer) return false;
    addChatMessage(answer, "is-walle");
    return true;
  }

  faqButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var question = button.textContent;
      addChatMessage(question, "is-user");
      answerFaq(question);
    });
  });

  chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var question = chatInput.value.trim();
    if (!question) return;
    addChatMessage(question, "is-user");
    chatInput.value = "";
    if (answerFaq(question)) return;
    if (!isRecyclingQuestion(question)) {
      addChatMessage("Posso responder apenas sobre identificacao, separacao e reciclagem de materiais.", "is-walle");
      return;
    }
    addChatMessage("Vou verificar isso sobre reciclagem...", "is-walle");
    try {
      var response = await fetch(window.WALLE_CHAT_URL || "/api/walle/pergunta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pergunta: question }) });
      var data = await response.json();
      if (!response.ok) throw new Error(data.erro || "Nao foi possivel responder agora.");
      chatLog.lastChild.textContent = data.resposta;
    } catch (error) { chatLog.lastChild.textContent = "No momento, use a identificacao por imagem ou consulte o ponto de coleta local."; }
  });
})();