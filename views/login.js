// view login controller
(function(){
  function renderLogin(){
    const main = document.getElementById('main');
    DOM.clearChildren(main);
    const card = DOM.createEl('div',{class:'card container'});
    const h = DOM.createEl('div',{class:'h1',text:'Login'});
    const form = DOM.createEl('div',{class:'form-row column'});
    const inputEmail = DOM.createEl('input',{attrs:{type:'email',placeholder:'email'}});
    const errEmail = DOM.createEl('div',{class:'small',text:''});
    const inputSenha = DOM.createEl('input',{attrs:{type:'password',placeholder:'senha'}});
    const errSenha = DOM.createEl('div',{class:'small',text:''});
    const controls = DOM.createEl('div',{class:'controls'});
    const btnFill = DOM.createEl('button',{class:'ghost',text:'Preencher campos (mock)'});
    const btnEnter = DOM.createEl('button',{text:'Entrar'});
    controls.appendChild(btnFill); controls.appendChild(btnEnter);

    form.appendChild(h);
    form.appendChild(inputEmail); form.appendChild(errEmail);
    form.appendChild(inputSenha); form.appendChild(errSenha);
    form.appendChild(controls);
    card.appendChild(form);
    main.appendChild(card);

    btnFill.addEventListener('click', ()=>{
      inputEmail.value = 'master@pandda.test';
      inputSenha.value = 'master123';
    });
    btnEnter.addEventListener('click', async ()=>{
      errEmail.textContent=''; errSenha.textContent='';
      const email = inputEmail.value.trim(); const senha = inputSenha.value.trim();
      if(!email){ errEmail.textContent='Email é obrigatório'; return; }
      if(!senha){ errSenha.textContent='Senha é obrigatória'; return; }
      try{
        const admin = await AdminService.login(email, senha);
        window.sessionAdmin = {adminId: admin.id, adminMaster: !!admin.adminMaster};
        DOM.toast('Login efetuado');
        // show sidebar
        document.getElementById('sidebar').classList.remove('hidden');
        // build sidebar menu
        buildSidebar();
        // navigate to clientes
        Router.navigateTo('clientes');
      }catch(e){
        if(e.type === 'credentials') DOM.toast('Credenciais inválidas');
        else DOM.toast('Erro ao autenticar. Tente novamente');
      }
    });
  }

  function buildSidebar(){
    const sidebar = document.getElementById('sidebar');
    DOM.clearChildren(sidebar);
    const title = DOM.createEl('div',{class:'small',text:'Menu'});
    sidebar.appendChild(title);
    const menu = DOM.createEl('div');
    const mClientes = DOM.createEl('button',{class:'ghost',text:'Clientes'});
    const mPlanos = DOM.createEl('button',{class:'ghost',text:'Planos'});
    const mSair = DOM.createEl('button',{class:'ghost',text:'Sair'});
    menu.appendChild(mClientes); menu.appendChild(mPlanos); menu.appendChild(mSair);
    sidebar.appendChild(menu);
    mClientes.addEventListener('click', ()=> Router.navigateTo('clientes'));
    mPlanos.addEventListener('click', ()=> DOM.toast('Planos não implementado nesta demo'));
    mSair.addEventListener('click', ()=>{
      window.sessionAdmin = null;
      document.getElementById('sidebar').classList.add('hidden');
      Router.navigateTo('login');
    });
  }

  // register view
  Router.register('login', renderLogin);
})();
