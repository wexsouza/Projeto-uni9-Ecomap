var DB_KEYS = { doadores: 'ecomaps_doadores', coletores: 'ecomaps_coletores', sessao: 'ecomaps_sessao', lembrar: 'ecomaps_lembrar' };
function dbLer(chave) { try { return JSON.parse(localStorage.getItem(chave)) || []; } catch (e) { return []; } }
function dbSalvar(chave, lista) { localStorage.setItem(chave, JSON.stringify(lista)); }
function dbAdicionarUsuario(tipo, usuario) { var chave = tipo === 'coletor' ? DB_KEYS.coletores : DB_KEYS.doadores; var lista = dbLer(chave); lista.push(usuario); dbSalvar(chave, lista); }
function dbExiste(tipo, email, cpf) { var chave = tipo === 'coletor' ? DB_KEYS.coletores : DB_KEYS.doadores; return dbLer(chave).some(function (u) { return (u.email || '').toLowerCase() === String(email).toLowerCase() || (cpf && somenteNumeros(u.cpf || '') === somenteNumeros(cpf)); }); }
function sessaoSalvar(dados) { localStorage.setItem(DB_KEYS.sessao, JSON.stringify(dados)); }
function sessaoObter() { try { return JSON.parse(localStorage.getItem(DB_KEYS.sessao)); } catch (e) { return null; } }
function sessaoEncerrar() { localStorage.removeItem(DB_KEYS.sessao); }
function somenteNumeros(valor) { return String(valor).replace(/\D/g, ''); }
function mascaraTelefone(valor) { var v = somenteNumeros(valor).slice(0, 11); if (v.length <= 2) return v.replace(/^(\d{0,2})/, '($1'); if (v.length <= 6) return v.replace(/^(\d{2})(\d{0,4})/, '($1) $2'); if (v.length <= 10) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3'); return v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3'); }
function mascaraCPF(valor) { var v = somenteNumeros(valor).slice(0, 11); v = v.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2'); return v; }
function aplicarMascara(input, fn) { if (input) input.addEventListener('input', function () { input.value = fn(input.value); }); }
function emailValido(email) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(email).trim()); }
function telefoneValido(tel) { var n = somenteNumeros(tel); return n.length === 10 || n.length === 11; }
function cpfValido(cpf) { var n = somenteNumeros(cpf); if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false; var soma = 0, i, resto; for (i = 0; i < 9; i += 1) soma += Number(n[i]) * (10 - i); resto = soma * 10 % 11 % 10; if (resto !== Number(n[9])) return false; soma = 0; for (i = 0; i < 10; i += 1) soma += Number(n[i]) * (11 - i); resto = soma * 10 % 11 % 10; return resto === Number(n[10]); }
function mostrarErro(idCampo, idErro, mensagem) { var campo = document.getElementById(idCampo); var erro = document.getElementById(idErro); if (campo) campo.classList.add('invalid'); if (erro) erro.textContent = mensagem; }
function limparErros(form) { form.querySelectorAll('.invalid').forEach(function (el) { el.classList.remove('invalid'); }); form.querySelectorAll('.error').forEach(function (el) { el.textContent = ''; }); }
function mostrarAlerta(mensagem, tipo) { var box = document.getElementById('alerta'); if (!box) return; box.hidden = false; box.className = 'alert alert-' + (tipo || 'info'); box.textContent = mensagem; }
function esconderAlerta() { var box = document.getElementById('alerta'); if (box) box.hidden = true; }
document.addEventListener('DOMContentLoaded', function () { var btn = document.getElementById('btnMenu'); var nav = document.getElementById('mainNav'); if (btn && nav) btn.addEventListener('click', function () { var aberto = nav.classList.toggle('open'); btn.classList.toggle('open', aberto); btn.setAttribute('aria-expanded', String(aberto)); }); var ano = document.getElementById('ano'); if (ano) ano.textContent = new Date().getFullYear(); });
