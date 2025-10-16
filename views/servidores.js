// servidores.js - controller simplificado
(function(){
  async function renderServidores(){
    if(!window.sessionAdmin){ Router.navigateTo('login'); return; }
    const main = document.getElementById('main'); DOM.clearChildren(main);
    const wrap = DOM.createEl('div',{class:'container'});
    wrap.appendChild(DOM.createEl('div',{class:'h1',text:'Servidores'}));
    const btnNew = DOM.createEl('button',{text:'Novo Servidor'}); wrap.appendChild(btnNew);
    const list = DOM.createEl('div',{class:'servidores-list'});
    wrap.appendChild(list);
    main.appendChild(wrap);

    async function load(){
      DOM.clearChildren(list);
      const servs = await DB.getAll('servidores');
      servs.forEach(s=>{
        const c = DOM.createEl('div',{class:'card'});
        c.appendChild(DOM.createEl('div',{text:s.nome}));
        const ctrl = DOM.createEl('div',{class:'controls'});
        const btDel = DOM.createEl('button',{class:'ghost',text:'Excluir'});
        if(window.sessionAdmin.adminMaster) ctrl.appendChild(btDel);
        c.appendChild(ctrl);
        list.appendChild(c);
        btDel.addEventListener('click', async ()=>{
          if(!confirm('Excluir servidor?')) return;
          try{ await Servidor.remove(s.id, window.sessionAdmin.adminId); DOM.toast('Servidor removido'); load(); }catch(e){ DOM.toast('Erro'); }
        });
      });
    }
    btnNew.addEventListener('click', async ()=>{
      const nome = prompt('Nome servidor:');
      if(!nome) return;
      try{ await Servidor.create({nome}, window.sessionAdmin.adminId); DOM.toast('Servidor criado'); load(); }catch(e){ DOM.toast('Erro'); }
    });
    await load();
  }
  Router.register('servidores', renderServidores);
})();
