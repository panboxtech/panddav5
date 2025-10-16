// views/clientes.js - listagem com botões principais e painel extra expansível
(function(){
  async function renderClientes(){
    if(!window.sessionAdmin){ Router.navigateTo('login'); return; }
    const main = document.getElementById('main');
    DOM.clearChildren(main);
    const wrap = DOM.createEl('div',{class:'container'});
    const top = DOM.createEl('div',{class:'flex'});
    const h = DOM.createEl('div',{class:'h1',text:'Clientes'});
    const btnNovo = DOM.createEl('button',{text:'Novo Cliente'});
    top.appendChild(h); top.appendChild(btnNovo);
    wrap.appendChild(top);

    const listCard = DOM.createEl('div',{class:'card client-list'});
    wrap.appendChild(listCard);
    main.appendChild(wrap);

    btnNovo.addEventListener('click', ()=> openCreateModal());

    async function loadAndRender(){
      DOM.clearChildren(listCard);
      const clients = await DB.getAll('clientes');
      const assinaturas = await DB.getAll('assinaturas');
      const planos = await DB.getAll('planos');
      const pontos = await DB.getAll('pontosDeAcesso');

      for(const c of clients){
        const asn = assinaturas.find(a=>a.cliente===c.id);
        const plano = planos.find(p=>p.id===c.plano);
        const somaPontos = pontos.filter(p=>p.cliente===c.id).reduce((s,p)=>s+Number(p.pontosSimultaneos||0),0);

        const card = DOM.createEl('div',{class:'card'});
        const row = DOM.createEl('div',{class:'client-row'});
        const meta = DOM.createEl('div',{class:'client-meta'});
        meta.appendChild(DOM.createEl('div',{text:c.nome}));
        meta.appendChild(DOM.createEl('div',{class:'client-note',text:`Telefone: ${c.telefone} • Plano: ${plano?plano.nome:'-'}`}));
        row.appendChild(meta);

        // main action buttons: Renovar, Editar, Avisar
        const actions = DOM.createEl('div',{class:'client-actions'});
        const btnRen = DOM.createEl('button',{class:'btn',text:'Renovar'});
        const btnEdit = DOM.createEl('button',{class:'btn ghost',text:'Editar'});
        const btnAvisar = DOM.createEl('button',{class:'btn ghost',text:'Avisar'});
        actions.appendChild(btnRen); actions.appendChild(btnEdit); actions.appendChild(btnAvisar);

        // expand toggle (expands card to reveal other actions)
        const expand = DOM.createEl('button',{class:'expand-toggle',text:''});
        expand.appendChild(DOM.createEl('span',{class:'icon',text:'+’'}));
        expand.appendChild(DOM.createEl('span',{class:'label',text:'Mais'}));
        actions.appendChild(expand);

        row.appendChild(actions);
        card.appendChild(row);

        // extra panel hidden by default, shown when card.expanded
        const extra = DOM.createEl('div',{class:'client-extra'});
        // additional actions: Bloquear/Desbloquear, WhatsApp, Excluir (master only), detalhes de pontos
        const extraControls = DOM.createEl('div',{class:'controls'});
        const btnBloq = DOM.createEl('button',{class:'btn ghost',text:c.bloqueado? 'Desbloquear':'Bloquear'});
        const btnWhats = DOM.createEl('button',{class:'btn ghost',text:'WhatsApp'});
        extraControls.appendChild(btnBloq); extraControls.appendChild(btnWhats);
        if(window.sessionAdmin && window.sessionAdmin.adminMaster){
          const btnDel = DOM.createEl('button',{class:'btn ghost',text:'Excluir'});
          extraControls.appendChild(btnDel);
          btnDel.addEventListener('click', async ()=>{
            if(!confirm('Confirma exclusão?')) return;
            try{
              const pontosCli = (await DB.getAll('pontosDeAcesso')).filter(p=>p.cliente===c.id);
              for(const p of pontosCli) await DB.remove('pontosDeAcesso', p.id);
              const asn = (await DB.getAll('assinaturas')).find(a=>a.cliente===c.id);
              if(asn) await DB.remove('assinaturas', asn.id);
              await DB.remove('clientes', c.id);
              await DB.logActivity(window.sessionAdmin.adminId,'cliente.delete',`clienteId=${c.id}`);
              DOM.toast('Cliente excluído');
              loadAndRender();
            }catch(e){ DOM.toast('Erro ao excluir'); }
          });
        }
        extra.appendChild(extraControls);

        // show pontos resumo
        const pontosList = DOM.createEl('div',{class:'small',text:`Pontos somados: ${somaPontos} • Telas: ${asn?asn.telas:'-'}`});
        extra.appendChild(pontosList);

        card.appendChild(extra);
        listCard.appendChild(card);

        // actions behavior
        btnRen.addEventListener('click', async ()=>{
          if(!asn){ DOM.toast('Assinatura não encontrada'); return; }
          try{
            const plano = (await DB.getAll('planos')).find(p=>p.id===asn.plano);
            const res = await Assinatura.renew(asn, plano.validadeEmMeses, window.sessionAdmin.adminId);
            if(res.ajustadoParaDia1){
              const dt = new Date(res.nova);
              DOM.toast(`Renovado. Dia original não existe no mês alvo, ajustado para 01/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}.`);
            } else DOM.toast('Renovado');
            loadAndRender();
          }catch(e){ DOM.toast('Erro ao renovar'); }
        });
        btnEdit.addEventListener('click', ()=> {
          // reuse existing edit behaviour if implemented
          DOM.toast('Abrir edição (não implementado nesta demo)');
        });
        btnAvisar.addEventListener('click', ()=>{
          const firstName = c.nome.split(' ')[0] || c.nome;
          const msg = encodeURIComponent(`Olá ${firstName}, seu acesso está vencendo, para renovar`);
          const tel = c.telefone.replace(/\D/g,'');
          const url = `https://wa.me/${tel}?text=${msg}`;
          window.open(url,'_blank');
        });
        btnBloq.addEventListener('click', async ()=>{
          try{
            await DB.update('clientes', c.id, {bloqueado: !c.bloqueado});
            DOM.toast('Operação realizada');
            loadAndRender();
          }catch(e){ DOM.toast('Erro'); }
        });
        btnWhats.addEventListener('click', ()=>{
          const firstName = c.nome.split(' ')[0] || c.nome;
          const msg = encodeURIComponent(`Olá ${firstName}, seu acesso está vencendo, para renovar`);
          const tel = c.telefone.replace(/\D/g,'');
          const url = `https://wa.me/${tel}?text=${msg}`;
          window.open(url,'_blank');
        });

        // expand toggle behavior: toggle class on card, enlarge on mobile for easier tapping
        expand.addEventListener('click', ()=>{
          const isExpanded = card.classList.toggle('expanded');
          // if on mobile and expanded, increase width to make items easy to tap
          if(window.innerWidth <= 800){
            if(isExpanded) card.style.width = 'calc(100% - 24px)';
            else card.style.width = '';
          }
        });
      }
    }

    await loadAndRender();
  }

  // minimal create modal stub (keeps original behavior)
  function openCreateModal(){ DOM.toast('Form de criação não implementado nesta vista simplificada'); }

  Router.register('clientes', renderClientes);
})();
