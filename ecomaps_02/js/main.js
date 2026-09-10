/* ==========================================================
   ECOMAPS — main.js
   Funções compartilhadas por todas as páginas:
   - "banco de dados" simulado no localStorage
   - controle de sessão
   - máscaras de CPF e telefone
   - validações e mensagens visuais
   - menu hambúrguer

   ATENÇÃO (protótipo): o localStorage NÃO é seguro.
   As senhas são gravadas em texto puro apenas para permitir os testes.
   Em produção, use backend + banco de dados + hash de senha.
   ========================================================== */

/* ---------- Chaves usadas no localStorage ---------- */
var DB_KEYS = {
  doadores: 'ecomaps_doadores',
  coletores: 'ecomaps_coletores',
  sessao: 'ecomaps_sessao',
  lembrar: 'ecomaps_lembrar'
};

/* ---------- Leitura / escrita no "banco" ---------- */
function dbLer(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave)) || [];
  } catch (e) {
    return [];
  }
}
function dbSalvar(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista));
}

/** Adiciona um usuário na lista de doadores ou coletores */
function dbAdicionarUsuario(tipo, usuario) {
  var chave = tipo === 'coletor' ? DB_KEYS.coletores : DB_KEYS.doadores;
  var lista = dbLer(chave);
  lista.push(usuario);
  dbSalvar(chave, lista);
}

/** Verifica se já existe alguém com o mesmo e-mail (ou CPF) */
function dbExiste(tipo, email, cpf) {
  var chave = tipo === 'coletor' ? DB_KEYS.coletores : DB_KEYS.doadores;
  return dbLer(chave).some(function (u) {
    var mesmoEmail = u.email.toLowerCase() === String(email).toLowerCase();
    var mesmoCpf = cpf ? somenteNumeros(u.cpf || '') === somenteNumeros(cpf) : false;
    return mesmoEmail || mesmoCpf;
  });
}

/* ---------- Sessão do usuário logado ---------- */
function sessaoSalvar(dados) {
  localStorage.setItem(DB_KEYS.sessao, JSON.stringify(dados));
}
function sessaoObter() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEYS.sessao));
  } catch (e) {
    return null;
  }
}
function sessaoEncerrar() {
  localStorage.removeItem(DB_KEYS.sessao);
}

/* ---------- Utilidades ---------- */
function somenteNumeros(valor) {
  return String(valor).replace(/\D/g, '');
}

/** Máscara de telefone brasileiro: (00) 00000-0000 */
function mascaraTelefone(valor) {
  var v = somenteNumeros(valor).slice(0, 11);
  if (v.length <= 2) return v.replace(/^(\d{0,2})/, '($1');
  if (v.length <= 6) return v.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
  if (v.length <= 10) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

/** Máscara de CPF: 000.000.000-00 */
function mascaraCPF(valor) {
  var v = somenteNumeros(valor).slice(0, 11);
  v = v.replace(/^(\d{3})(\d)/, '$1.$2');
  v = v.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  return v;
}

/** Aplica a máscara enquanto o usuário digita */
function aplicarMascara(input, fn) {
  if (!input) return;
  input.addEventListener('input', function () {
    input.value = fn(input.value);
  });
}

/* ---------- Validações ---------- */
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(email).trim());
}
function telefoneValido(tel) {
  var n = somenteNumeros(tel);
  return n.length === 10 || n.length === 11;
}
/** Valida o CPF pelos dígitos verificadores (algoritmo oficial) */
function cpfValido(cpf) {
  var n = somenteNumeros(cpf);
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  var soma = 0, i, resto;
  for (i = 0; i < 9; i++) soma += parseInt(n.charAt(i), 10) * (10 - i);
  resto = (soma * 10) % 11 % 10;
  if (resto !== parseInt(n.charAt(9), 10)) return false;
  soma = 0;
  for (i = 0; i < 10; i++) soma += parseInt(n.charAt(i), 10) * (11 - i);
  resto = (soma * 10) % 11 % 10;
  return resto === parseInt(n.charAt(10), 10);
}

/* ---------- Mensagens visuais (sem usar alert) ---------- */
/** Mostra a mensagem de erro embaixo de um campo */
function mostrarErro(idCampo, idErro, mensagem) {
  var campo = document.getElementById(idCampo);
  var erro = document.getElementById(idErro);
  if (campo) campo.classList.add('invalid');
  if (erro) erro.textContent = mensagem;
}
/** Limpa todos os erros do formulário */
function limparErros(form) {
  form.querySelectorAll('.invalid').forEach(function (el) { el.classList.remove('invalid'); });
  form.querySelectorAll('.error').forEach(function (el) { el.textContent = ''; });
}
/** Alerta no topo do card: tipo = 'erro' | 'sucesso' | 'info' */
function mostrarAlerta(mensagem, tipo) {
  var box = document.getElementById('alerta');
  if (!box) return;
  box.hidden = false;
  box.className = 'alert alert-' + (tipo || 'info');
  box.textContent = mensagem;
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function esconderAlerta() {
  var box = document.getElementById('alerta');
  if (box) box.hidden = true;
}

/* ---------- Menu hambúrguer + ano do rodapé ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('btnMenu');
  var nav = document.getElementById('mainNav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var aberto = nav.classList.toggle('open');
      btn.classList.toggle('open', aberto);
      btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    // Fecha o menu ao clicar em um link (mobile)
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        btn.classList.remove('open');
      });
    });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
});
