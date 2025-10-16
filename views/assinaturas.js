// assinaturas.js - listagem e ações básicas
(function(){
  async function renderAssinaturas(){
    if(!window.sessionAdmin){ Router.navigateTo('login'); return; }
    const main = document.getElementById('main'); DOM.clearChildren(main);
    const wrap = DOM.createEl('div',{class:'container'});
    wrap.appendChild(DOM.createEl('div',{class:'h1',text:'Assinaturas'}));
    const list = DOM.createEl('div',{class:'assinaturas-list'});
    wrap.appendChild(list);
    main.appendChild(wrap);

    async function load(){
      DOM.clearChildren(list);
      const assinaturas = await DB.getAll('assinaturas');
      const clientes = await DB.getAll('clientes');
      assinaturas.forEach(a=>{
        const c = clientes.find(x=>x.id===a.cliente);
        const card = DOM.createEl('div',{class:'card'});
        card.appendChild(DOM.createEl('div',{text:`Cliente: ${c?c.nome:'-'} — Venc: ${new Date(a.dataDeVencimento).toLocaleDateString()} — Telas: ${a.telas}`}));
        const ctrl = DOM.createEl('div',{class:'controls'});
        const btRen = DOM.createEl('button',{class:'ghost',text:'Renovar'});
        ctrl.appendChild(btRen);
        card.appendChild(ctrl);
        list.appendChild(card);
        btRen.addEventListener('click', async ()=>{
          const plano = (await DB.getAll('planos')).find(p=>p.id===a.plano);
          try{
            const res = await Assinatura.renew(a, plano.validadeEmMeses, window.sessionAdmin.adminId);
            if(res.ajustadoParaDia1){ const dt = new Date(res.nova); DOM.toast(`Renovado. Ajustado para 01/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}.`); }
            else DOM.toast('Renovado');
            load();
          }catch(e){ DOM.toast('Erro ao renovar'); }
        });
      });
    }
    await load();
  }
  Router.register('assinaturas', renderAssinaturas);
})();
