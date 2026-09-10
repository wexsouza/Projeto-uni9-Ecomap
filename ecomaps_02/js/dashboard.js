/* ==========================================================
   ECOMAPS — dashboard.js
   Protege os painéis (só entra logado), mostra o nome/perfil
   do usuário da sessão e faz o logout.
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // Descobre qual painel está aberto pelo nome do arquivo
  var ehColetor = window.location.pathname.indexOf('dashboard-coletor') !== -1;
  var tipoEsperado = ehColetor ? 'coletor' : 'doador';

  var sessao = sessaoObter();

  // Sem sessão (ou tipo errado) => volta para o login
  if (!sessao || sessao.tipo !== tipoEsperado) {
    window.location.replace('login.html');
    return;
  }

  // Busca os dados completos do usuário no localStorage
  var chave = ehColetor ? DB_KEYS.coletores : DB_KEYS.doadores;
  var usuario = dbLer(chave).find(function (u) { return u.id === sessao.id; });

  if (!usuario) {
    sessaoEncerrar();
    window.location.replace('login.html');
    return;
  }

  /** Preenche um elemento se ele existir na página */
  function setar(id, valor) {
    var el = document.getElementById(id);
    if (el) el.textContent = valor || '—';
  }

  setar('nomeUsuario', usuario.nome);
  setar('pNome', usuario.nome);
  setar('pTelefone', usuario.telefone);
  setar('pEndereco', usuario.endereco);
  setar('pEmail', usuario.email);
  setar('pCpf', usuario.cpf);
  setar('pEstadoCivil', usuario.estadoCivil);

  // Cards do painel: mostram uma explicação do que fariam na versão final
  document.querySelectorAll('.dash-card').forEach(function (card) {
    card.addEventListener('click', function () {
      mostrarAlerta(card.getAttribute('data-info'), 'info');
    });
  });

  // Botão SAIR: remove a sessão e volta ao login
  var btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', function () {
      sessaoEncerrar();
      window.location.href = 'login.html';
    });
  }
});
