// apps.js - controller de apps
(function(){
  async function renderApps(){
    if(!window.sessionAdmin){ Router.navigateTo('login'); return; }
    const main = document.getElementById('main'); DOM.clearChildren(main);
    const wrap = DOM.createEl('div',{class:'container'});
    wrap.appendChild(DOM.createEl('div',{class:'h1',text:'Apps'}));
    const btnNew = DOM.createEl('button',{text:'Novo App'}); wrap.appendChild(btnNew);
    const list = DOM.createEl('div',{class:'apps-list'});
    wrap.appendChild(list);
    main.appendChild(wrap);

    async function load(){
      DOM.clearChildren(list);
      const apps = await DB.getAll('apps');
      apps.forEach(a=>{
        const c = DOM.createEl('div',{class:'card'});
        c.appendChild(DOM.createEl('div',{text:`${a.nome} — servidor ${a.servidor} — mult:${a.multiplosAcessos}`}));
        const ctrl = DOM.createEl('div',{class:'controls'});
        const btDel = DOM.createEl('button',{class:'ghost',text:'Excluir'});
        if(window.sessionAdmin.adminMaster) ctrl.appendChild(btDel);
        c.appendChild(ctrl);
        list.appendChild(c);
        btDel.addEventListener('click', async ()=>{
          if(!confirm('Excluir app?')) return;
          try{ await AppEntity.remove(a.id, window.sessionAdmin.adminId); DOM.toast('App removido'); load(); }catch(e){ DOM.toast('Erro'); }
        });
      });
    }
    btnNew.addEventListener('click', async ()=>{
      const nome = prompt('Nome do app:'); const servidor = Number(prompt('Servidor id:')); const mult = confirm('Múltiplos acessos? OK = sim');
      if(!nome || !servidor) return;
      try{ await AppEntity.create({nome,servidor,multiplosAcessos:mult}, window.sessionAdmin.adminId); DOM.toast('App criado'); load(); }catch(e){ DOM.toast('Erro'); }
    });
    await load();
  }
  Router.register('apps', renderApps);
})();
