(function(){
  function renderLogin(){
    const main = document.getElementById('main');
    DOM.clearChildren(main);

    const container = DOM.createEl('div',{class:'container'});
    const card = DOM.createEl('div',{class:'card'});
    const title = DOM.createEl('div',{class:'h1',text:'Login'});
    const form = DOM.createEl('div',{class:'form-row column'});

    const inputEmail = DOM.createEl('input',{attrs:{type:'email',placeholder:'Email'}});
    const errEmail = DOM.createEl('div',{class:'small',text:''});
    const inputSenha = DOM.createEl('input',{attrs:{type:'password',placeholder:'Senha'}});
    const errSenha = DOM.createEl('div',{class:'small',text:''});

    const controls = DOM.createEl('div',{class:'controls'});
    const btnFill = DOM.createEl('button',{class:'ghost',text:'Preencher campos (mock)'});
    const btnEnter = DOM.createEl('button',{text:'Entrar'});
    controls.appendChild(btnFill);
    controls.appendChild(btnEnter);

    form.appendChild(title);
    form.appendChild(inputEmail); form.appendChild(errEmail);
    form.appendChild(inputSenha); form.appendChild(errSenha);
    form.appendChild(controls);
    card.appendChild(form);
    container.appendChild(card);
    main.appendChild(container);

    btnFill.addEventListener('click', ()=>{
      inputEmail.value = 'master@pandda.test';
      inputSenha.value = 'master123';
    });

    btnEnter.addEventListener('click', async ()=>{
      errEmail.textContent = '';
      errSenha.textContent = '';
      const email = inputEmail.value.trim();
      const senha = inputSenha.value.trim();

      if(!email){ errEmail.textContent = 'Email é obrigatório'; return; }
      if(!senha){ errSenha.textContent = 'Senha é obrigatória'; return; }

      try {
        const admin = await AdminService.login(email, senha);
        window.sessionAdmin = {adminId: admin.id, adminMaster: !!admin.adminMaster};
        DOM.toast('Login efetuado');
        const sidebar = document.getElementById('sidebar');
        if(sidebar) sidebar.classList.remove('hidden');
        Router.navigateTo('clientes');
      } catch(e){
        if(e.type === 'credentials') DOM.toast('Credenciais inválidas');
        else DOM.toast('Erro ao autenticar. Tente novamente');
      }
    });
  }

  Router.register('login', renderLogin);
})();
