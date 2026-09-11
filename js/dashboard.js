document.addEventListener('DOMContentLoaded', function () {
  var coletor = window.location.pathname.indexOf('dashboard-coletor') !== -1; var esperado = coletor ? 'coletor' : 'doador'; var sessao = sessaoObter(); if (!sessao || sessao.tipo !== esperado) { window.location.replace('login.html'); return; }
  var chave = coletor ? DB_KEYS.coletores : DB_KEYS.doadores; var usuario = dbLer(chave).find(function (u) { return u.id === sessao.id; }); if (!usuario) { sessaoEncerrar(); window.location.replace('login.html'); return; }
  function preencher(id, valor) { var el = document.getElementById(id); if (el) el.textContent = valor || '—'; }
  preencher('nomeUsuario', usuario.nome); document.querySelectorAll('[data-user-name]').forEach(function (el) { el.textContent = usuario.nome.split(' ')[0]; }); preencher('pNome', usuario.nome); preencher('pTelefone', usuario.telefone); preencher('pEndereco', usuario.endereco); preencher('pEmail', usuario.email); preencher('pCpf', usuario.cpf); preencher('pEstadoCivil', usuario.estadoCivil); preencher('profileName', usuario.nome);
  document.querySelectorAll('.dash-card').forEach(function (card) { card.addEventListener('click', function () { mostrarAlerta(card.getAttribute('data-info'), 'info'); }); });
  var sair = document.getElementById('btnSair'); if (sair) sair.addEventListener('click', function () { sessaoEncerrar(); window.location.href = 'login.html'; });
});
