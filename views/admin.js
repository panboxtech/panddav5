// admin.js - painel administrativo simples
(function(){
  async function renderAdmin(){
    if(!window.sessionAdmin){ Router.navigateTo('login'); return; }
    if(!window.sessionAdmin.adminMaster){ DOM.toast('Acesso restrito a Admin Master'); Router.navigateTo('clientes'); return; }
    const main = document.getElementById('main'); DOM.clearChildren(main);
    const wrap = DOM.createEl('div',{class:'container'});
    wrap.appendChild(DOM.createEl('div',{class:'h1',text:'Admin'}));
    const logsCard = DOM.createEl('div',{class:'card admin-panel'});
    wrap.appendChild(logsCard);
    main.appendChild(wrap);

    async function load(){
      DOM.clearChildren(logsCard);
      logsCard.appendChild(DOM.createEl('div',{class:'h1',text:'Atividades'}));
      const logs = await DB.getAll('atividades');
      if(!logs.length) logsCard.appendChild(DOM.createEl('div',{text:'Nenhuma atividade registrada'}));
      logs.forEach(l=>{
        const row = DOM.createEl('div',{class:'card'});
        row.appendChild(DOM.createEl('div',{text:`[${new Date(l.timestamp).toLocaleString()}] admin:${l.adminId} acao:${l.acao} detalhe:${l.detalhe}`}));
        logsCard.appendChild(row);
      });
    }
    await load();
  }
  Router.register('admin', renderAdmin);
})();
