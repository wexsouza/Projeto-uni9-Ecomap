/* ==========================================================
   ECOMAPS — login.js
   Controla o seletor DOADOR/COLETOR e o login real,
   comparando os dados digitados com o que está no localStorage.
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {
  var tipoAtual = 'doador'; // tipo selecionado no seletor

  var tabDoador = document.getElementById('tabDoador');
  var tabColetor = document.getElementById('tabColetor');
  var titulo = document.getElementById('loginTitulo');
  var texto = document.getElementById('loginTexto');
  var labelId = document.getElementById('labelIdentificador');
  var inputId = document.getElementById('identificador');
  var inputSenha = document.getElementById('senha');
  var lembrar = document.getElementById('lembrar');
  var linkCadastro = document.getElementById('linkCadastro');
  var form = document.getElementById('formLogin');

  /* Textos de cada tipo de usuário */
  var TEXTOS = {
    doador: {
      titulo: 'Acesse sua conta',
      texto: 'Entre para gerenciar seus materiais e solicitar coletas.',
      label: 'E-mail ou telefone',
      placeholder: 'voce@email.com ou (11) 99999-9999',
      linkTexto: 'Criar conta de doador',
      linkHref: 'cadastro-doador.html'
    },
    coletor: {
      titulo: 'Acesse sua conta de coletor',
      texto: 'Entre para gerenciar suas coletas e materiais.',
      label: 'CPF ou e-mail',
      placeholder: '000.000.000-00 ou voce@email.com',
      linkTexto: 'Criar conta de coletor',
      linkHref: 'cadastro-coletor.html'
    }
  };

  /** Atualiza o formulário conforme o tipo escolhido */
  function selecionarTipo(tipo) {
    tipoAtual = tipo;
    var t = TEXTOS[tipo];
    titulo.textContent = t.titulo;
    texto.textContent = t.texto;
    labelId.textContent = t.label;
    inputId.placeholder = t.placeholder;
    linkCadastro.textContent = t.linkTexto;
    linkCadastro.setAttribute('href', t.linkHref);

    tabDoador.classList.toggle('active', tipo === 'doador');
    tabColetor.classList.toggle('active', tipo === 'coletor');
    tabDoador.setAttribute('aria-selected', tipo === 'doador');
    tabColetor.setAttribute('aria-selected', tipo === 'coletor');

    esconderAlerta();
    limparErros(form);
    preencherLembrado();
  }

  tabDoador.addEventListener('click', function () { selecionarTipo('doador'); });
  tabColetor.addEventListener('click', function () { selecionarTipo('coletor'); });

  /* Se o cadastro acabou de ser feito, mostra a mensagem de sucesso.
     A flag é gravada em cadastro.js via sessionStorage. */
  var msg = sessionStorage.getItem('ecomaps_msg');
  if (msg) {
    mostrarAlerta(msg, 'sucesso');
    sessionStorage.removeItem('ecomaps_msg');
    var tipoCad = sessionStorage.getItem('ecomaps_msg_tipo');
    if (tipoCad === 'coletor') selecionarTipo('coletor');
    sessionStorage.removeItem('ecomaps_msg_tipo');
  }

  /* "Lembrar meus dados": preenche o identificador salvo */
  function preencherLembrado() {
    var salvo = null;
    try { salvo = JSON.parse(localStorage.getItem(DB_KEYS.lembrar)); } catch (e) {}
    if (salvo && salvo.tipo === tipoAtual) {
      inputId.value = salvo.identificador;
      lembrar.checked = true;
    } else {
      inputId.value = '';
      lembrar.checked = false;
    }
  }
  preencherLembrado();

  /* ---------- Envio do formulário: login real ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    limparErros(form);
    esconderAlerta();

    var identificador = inputId.value.trim();
    var senha = inputSenha.value;
    var valido = true;

    if (!identificador) {
      mostrarErro('identificador', 'erroIdentificador', 'Informe seu ' + TEXTOS[tipoAtual].label.toLowerCase() + '.');
      valido = false;
    }
    if (!senha) {
      mostrarErro('senha', 'erroSenha', 'Informe sua senha.');
      valido = false;
    }
    if (!valido) return;

    // Busca o usuário na lista correspondente do localStorage
    var chave = tipoAtual === 'coletor' ? DB_KEYS.coletores : DB_KEYS.doadores;
    var lista = dbLer(chave);
    var busca = identificador.toLowerCase();
    var buscaNumeros = somenteNumeros(identificador);

    var usuario = lista.find(function (u) {
      var porEmail = u.email && u.email.toLowerCase() === busca;
      var porTelefone = buscaNumeros && u.telefone && somenteNumeros(u.telefone) === buscaNumeros;
      var porCpf = buscaNumeros && u.cpf && somenteNumeros(u.cpf) === buscaNumeros;
      return porEmail || porTelefone || porCpf;
    });

    // Só entra se o usuário existir E a senha estiver correta
    if (!usuario || usuario.senha !== senha) {
      mostrarAlerta('E-mail, telefone, CPF ou senha incorretos.', 'erro');
      return;
    }

    // Guarda a sessão do usuário logado
    sessaoSalvar({
      tipo: tipoAtual,
      id: usuario.id,
      nome: usuario.nome,
      logadoEm: new Date().toISOString()
    });

    // "Lembrar meus dados"
    if (lembrar.checked) {
      localStorage.setItem(DB_KEYS.lembrar, JSON.stringify({ tipo: tipoAtual, identificador: identificador }));
    } else {
      localStorage.removeItem(DB_KEYS.lembrar);
    }

    // Redireciona para o dashboard correto
    window.location.href = tipoAtual === 'coletor' ? 'dashboard-coletor.html' : 'dashboard-doador.html';
  });
});
