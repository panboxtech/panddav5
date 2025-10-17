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
    const toggle = DOM.createEl('button',{class:'toggle-btn',text:'≡'});
    header.appendChild(title); header.appendChild(toggle);
    sidebar.appendChild(header);

    const menu = DOM.createEl('div',{class:'menu-items'});
    const items = [
      {key:'clientes
