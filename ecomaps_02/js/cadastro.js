/* ==========================================================
   ECOMAPS — cadastro.js
   Cuida dos DOIS formulários de cadastro (doador e coletor).
   Aplica máscaras, valida os campos e salva no localStorage.
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {
  var formDoador = document.getElementById('formDoador');
  var formColetor = document.getElementById('formColetor');

  /* Máscaras aplicadas enquanto o usuário digita */
  aplicarMascara(document.getElementById('telefone'), mascaraTelefone);
  aplicarMascara(document.getElementById('cpf'), mascaraCPF);

  /** Gera um identificador simples para o usuário */
  function novoId() {
    return 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  }

  /** Valida senha + confirmação (regra usada nos dois cadastros) */
  function validarSenhas(senha, senha2) {
    var ok = true;
    if (!senha) {
      mostrarErro('senha', 'erroSenha', 'Informe uma senha.');
      ok = false;
    } else if (senha.length < 6) {
      mostrarErro('senha', 'erroSenha', 'A senha deve ter no mínimo 6 caracteres.');
      ok = false;
    }
    if (!senha2) {
      mostrarErro('senha2', 'erroSenha2', 'Confirme a senha.');
      ok = false;
    } else if (senha && senha !== senha2) {
      mostrarErro('senha2', 'erroSenha2', 'As senhas não são iguais.');
      ok = false;
    }
    return ok;
  }

  /** Sucesso: guarda a mensagem e volta para o login */
  function finalizar(tipo) {
    sessionStorage.setItem('ecomaps_msg', 'Cadastro realizado com sucesso! Faça login para continuar.');
    sessionStorage.setItem('ecomaps_msg_tipo', tipo);
    mostrarAlerta('Cadastro realizado com sucesso! Redirecionando para o login...', 'sucesso');
    setTimeout(function () { window.location.href = 'login.html'; }, 1400);
  }

  /* ====================== CADASTRO DOADOR ====================== */
  if (formDoador) {
    formDoador.addEventListener('submit', function (e) {
      e.preventDefault();
      limparErros(formDoador);
      esconderAlerta();

      var nome = document.getElementById('nome').value.trim();
      var telefone = document.getElementById('telefone').value.trim();
      var endereco = document.getElementById('endereco').value.trim();
      var email = document.getElementById('email').value.trim();
      var senha = document.getElementById('senha').value;
      var senha2 = document.getElementById('senha2').value;
      var ok = true;

      if (nome.length < 3) { mostrarErro('nome', 'erroNome', 'Informe seu nome completo.'); ok = false; }
      if (!telefone) { mostrarErro('telefone', 'erroTelefone', 'Informe seu telefone.'); ok = false; }
      else if (!telefoneValido(telefone)) { mostrarErro('telefone', 'erroTelefone', 'Telefone inválido. Ex: (11) 99999-9999'); ok = false; }
      if (endereco.length < 5) { mostrarErro('endereco', 'erroEndereco', 'Informe seu endereço completo.'); ok = false; }
      if (!email) { mostrarErro('email', 'erroEmail', 'Informe seu e-mail.'); ok = false; }
      else if (!emailValido(email)) { mostrarErro('email', 'erroEmail', 'E-mail inválido.'); ok = false; }
      if (!validarSenhas(senha, senha2)) ok = false;
      if (!ok) { mostrarAlerta('Corrija os campos destacados para continuar.', 'erro'); return; }

      if (dbExiste('doador', email)) {
        mostrarErro('email', 'erroEmail', 'Já existe um doador com este e-mail.');
        mostrarAlerta('Este e-mail já está cadastrado como doador.', 'erro');
        return;
      }

      // Salva no localStorage (protótipo: senha em texto puro apenas para testes)
      dbAdicionarUsuario('doador', {
        id: novoId(), tipo: 'doador', nome: nome, telefone: telefone,
        endereco: endereco, email: email, senha: senha,
        criadoEm: new Date().toISOString()
      });

      finalizar('doador');
    });
  }

  /* ====================== CADASTRO COLETOR ====================== */
  if (formColetor) {
    formColetor.addEventListener('submit', function (e) {
      e.preventDefault();
      limparErros(formColetor);
      esconderAlerta();

      var nome = document.getElementById('nome').value.trim();
      var cpf = document.getElementById('cpf').value.trim();
      var email = document.getElementById('email').value.trim();
      var telefone = document.getElementById('telefone').value.trim();
      var endereco = document.getElementById('endereco').value.trim();
      var estadoCivil = document.getElementById('estadoCivil').value;
      var senha = document.getElementById('senha').value;
      var senha2 = document.getElementById('senha2').value;
      var ok = true;

      if (nome.length < 3) { mostrarErro('nome', 'erroNome', 'Informe seu nome completo.'); ok = false; }
      if (!cpf) { mostrarErro('cpf', 'erroCpf', 'Informe seu CPF.'); ok = false; }
      else if (!cpfValido(cpf)) { mostrarErro('cpf', 'erroCpf', 'CPF inválido. Use o formato 000.000.000-00'); ok = false; }
      if (!email) { mostrarErro('email', 'erroEmail', 'Informe seu e-mail.'); ok = false; }
      else if (!emailValido(email)) { mostrarErro('email', 'erroEmail', 'E-mail inválido.'); ok = false; }
      if (!telefone) { mostrarErro('telefone', 'erroTelefone', 'Informe seu telefone.'); ok = false; }
      else if (!telefoneValido(telefone)) { mostrarErro('telefone', 'erroTelefone', 'Telefone inválido. Ex: (11) 99999-9999'); ok = false; }
      if (endereco.length < 5) { mostrarErro('endereco', 'erroEndereco', 'Informe seu endereço completo.'); ok = false; }
      if (!estadoCivil) { mostrarErro('estadoCivil', 'erroEstadoCivil', 'Selecione seu estado civil.'); ok = false; }
      if (!validarSenhas(senha, senha2)) ok = false;
      if (!ok) { mostrarAlerta('Corrija os campos destacados para continuar.', 'erro'); return; }

      if (dbExiste('coletor', email, cpf)) {
        mostrarAlerta('Já existe um coletor com este e-mail ou CPF.', 'erro');
        return;
      }

      dbAdicionarUsuario('coletor', {
        id: novoId(), tipo: 'coletor', nome: nome, cpf: cpf, email: email,
        telefone: telefone, endereco: endereco, estadoCivil: estadoCivil,
        senha: senha, criadoEm: new Date().toISOString()
      });

      finalizar('coletor');
    });
  }
});
