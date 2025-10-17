// views/login.js (com buildSidebar atualizado)
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
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('hidden');
        buildSidebar();
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

    const header = DOM.createEl('div',{class:'menu-header'});
    const title = DOM.createEl('div',{class:'small title',text:'Pandda'});
    const toggle = DOM.createEl('button',{class:'toggle-btn',attrs:{'aria-label':'Minimizar menu'},text:'≡'});
    header.appendChild(title); header.appendChild(toggle);
    sidebar.appendChild(header);

    const menu = DOM.createEl('div',{class:'menu-items'});
    const items = [
      {key:'clientes',label:'Clientes'},
      {key:'planos',label:'Planos'},
      {key:'servidores',label:'Servidores'},
      {key:'apps',label:'Apps'},
      {key:'assinaturas',label:'Assinaturas'},
      {key:'admin',label:'Admin'}
    ];
    items.forEach(it=>{
      const btn = DOM.createEl('button',{class:'menu-item',text:''});
      const icon = DOM.createEl('span',{class:'icon',text:'•'});
      const lbl = DOM.createEl('span',{class:'label',text:it.label});
      btn.appendChild(icon); btn.appendChild(lbl);
      btn.addEventListener('click', ()=> {
        if(it.key === 'admin' && !(window.sessionAdmin && window.sessionAdmin.adminMaster)){
          DOM.toast('Acesso restrito a Admin Master');
          return;
        }
        Router.navigateTo(it.key);
        if(window.innerWidth <= 800){
          sidebar.classList.add('hidden');
          document.body.classList.toggle('sidebar-visible', false);
        }
      });
      menu.appendChild(btn);
    });
    sidebar.appendChild(menu);

    const spacer = DOM.createEl('div',{attrs:{style:'flex:1'}});
    sidebar.appendChild(spacer);

    const logout = DOM.createEl('button',{class:'menu-item',text:''});
    logout.appendChild(DOM.createEl('span',{class:'icon',text:'⎋'}));
    logout.appendChild(DOM.createEl('span',{class:'label',text:'Sair'}));
    logout.addEventListener('click', ()=>{
      window.sessionAdmin = null;
      sidebar.classList.add('hidden');
      document.body.classList.remove('sidebar-visible');
      Router.navigateTo('login');
    });
    sidebar.appendChild(logout);

    if(window && typeof window.setTimeout === 'function'){
      setTimeout(()=>{ document.body.classList.toggle('sidebar-visible', !sidebar.classList.contains('hidden')); }, 0);
    }
  }

  Router.register('login', renderLogin);
})();
