// planos.js - controller de planos (listagem e CRUD básico)
(function(){
  async function renderPlanos(){
    if(!window.sessionAdmin){ Router.navigateTo('login'); return; }
    const main = document.getElementById('main'); DOM.clearChildren(main);
    const wrap = DOM.createEl('div',{class:'container'});
    const header = DOM.createEl('div',{class:'client-header'});
    header.appendChild(DOM.createEl('div',{class:'h1',text:'Planos'}));
    const btnNew = DOM.createEl('button',{text:'Novo Plano'}); header.appendChild(btnNew);
    wrap.appendChild(header);

    const listCard = DOM.createEl('div',{class:'planos-list card'});
    wrap.appendChild(listCard);
    main.appendChild(wrap);

    async function load(){
      DOM.clearChildren(listCard);
      const planos = await DB.getAll('planos');
      planos.forEach(p=>{
        const row = DOM.createEl('div',{class:'card'});
        row.appendChild(DOM.createEl('div',{text:`${p.nome} — ${p.validadeEmMeses} meses`}));
        const controls = DOM.createEl('div',{class:'controls'});
        const btEdit = DOM.createEl('button',{class:'ghost',text:'Editar'});
        const btDel = DOM.createEl('button',{class:'ghost',text:'Excluir'});
        controls.appendChild(btEdit); if(window.sessionAdmin.adminMaster) controls.appendChild(btDel);
        row.appendChild(controls);
        listCard.appendChild(row);

        btDel.addEventListener('click', async ()=>{
          if(!confirm('Confirma exclusão do plano?')) return;
          try{ await Plano.remove(p.id, window.sessionAdmin.adminId); DOM.toast('Plano removido'); load(); }
          catch(e){ DOM.toast('Erro ao remover'); }
        });
        btEdit.addEventListener('click', ()=> DOM.toast('Edição de plano não implementada nesta demo'));
      });
    }

    btnNew.addEventListener('click', async ()=>{
      const nome = prompt('Nome do plano:');
      const meses = prompt('Validade em meses:');
      if(!nome || !meses) return;
      try{ await Plano.create({nome,validadeEmMeses: Number(meses)}, window.sessionAdmin.adminId); DOM.toast('Plano criado'); await load(); }
      catch(e){ DOM.toast(e.message || 'Erro'); }
    });

    await load();
  }
  Router.register('planos', renderPlanos);
})();
