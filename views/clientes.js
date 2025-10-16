// views/clientes.js - completa com filtro por vencimento e botão expand full-width
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

    // filter bar
    const filterBar = DOM.createEl('div',{class:'filter-bar'});
    const selFilter = DOM.createEl('select');
    selFilter.appendChild(DOM.createEl('option',{attrs:{value:'all'},text:'Todos'}));
    selFilter.appendChild(DOM.createEl('option',{attrs:{value:'vencendo3'},text:'Vencendo em <= 3 dias'}));
    selFilter.appendChild(DOM.createEl('option',{attrs:{value:'vencidos30'},text:'Vencidos < 30 dias'}));
    selFilter.appendChild(DOM.createEl('option',{attrs:{value:'todosvencidos'},text:'Todos vencidos'}));
    const selOrder = DOM.createEl('select');
    selOrder.appendChild(DOM.createEl('option',{attrs:{value:'nome'},text:'Ordenar por nome'}));
    selOrder.appendChild(DOM.createEl('option',{attrs:{value:'vencimento'},text:'Ordenar por vencimento'}));
    filterBar.appendChild(selFilter); filterBar.appendChild(selOrder);
    wrap.appendChild(filterBar);

    const listCard = DOM.createEl('div',{class:'card client-list'});
    wrap.appendChild(listCard);
    main.appendChild(wrap);

    btnNovo.addEventListener('click', ()=> openCreateModal());

    async function loadAndRender(){
      DOM.clearChildren(listCard);
      let clients = await DB.getAll('clientes');
      const assinaturas = await DB.getAll('assinaturas');
      const planos = await DB.getAll('planos');
      const pontos = await DB.getAll('pontosDeAcesso');

      // join clients with assinatura and apply filters
      const now = new Date();
      function daysBetween(d1,d2){ return Math.ceil((d1-d2)/(1000*60*60*24)); }

      clients = clients.map(c=>{
        const asn = assinaturas.find(a=>a.cliente===c.id) || null;
        const plano = planos.find(p=>p.id===c.plano) || null;
        const somaPontos = pontos.filter(p=>p.cliente===c.id).reduce((s,p)=>s+Number(p.pontosSimultaneos||0),0);
        const vencDate = asn && asn.dataDeVencimento ? new Date(asn.dataDeVencimento) : null;
        const daysToVenc = vencDate ? daysBetween(vencDate, now) : null;
        return Object.assign({}, c, {assinatura: asn, plano: plano, somaPontos, vencDate, daysToVenc});
      });

      // filtering
      const filter = selFilter.value;
      if(filter === 'vencendo3'){
        clients = clients.filter(c=> c.vencDate && c.daysToVenc <= 3 && c.daysToVenc >= 0);
      } else if(filter === 'vencidos30'){
        clients = clients.filter(c=> c.vencDate && c.daysToVenc < 0 && Math.abs(c.daysToVenc) < 30);
      } else if(filter === 'todosvencidos'){
        clients = clients.filter(c=> c.vencDate && c.daysToVenc < 0);
      }

      // ordering
      const order = selOrder.value;
      if(order === 'nome'){
        clients.sort((a,b)=> a.nome.localeCompare(b.nome));
      } else if(order === 'vencimento'){
        clients.sort((a,b)=>{
          if(!a.vencDate && !b.vencDate) return 0;
          if(!a.vencDate) return 1;
          if(!b.vencDate) return -1;
          return a.vencDate - b.vencDate;
        });
      }

      // render
      for(const c of clients){
        const card = DOM.createEl('div',{class:'card'});
        const row = DOM.createEl('div',{class:'client-row'});
        const meta = DOM.createEl('div',{class:'client-meta'});
        meta.appendChild(DOM.createEl('div',{text:c.nome}));
        const vencText = c.vencDate ? (new Date(c.vencDate)).toLocaleDateString() : '-';
        meta.appendChild(DOM.createEl('div',{class:'client-note',text:`Telefone: ${c.telefone} • Plano: ${c.plano?c.plano.nome:'-'} • Venc: ${vencText}`}));
        row.appendChild(meta);

        const actions = DOM.createEl('div',{class:'client-actions'});
        const btnRen = DOM.createEl('button',{class:'btn',text:'Renovar'});
        const btnEdit = DOM.createEl('button',{class:'btn ghost',text:'Editar'});
        const btnAvisar = DOM.createEl('button',{class:'btn ghost',text:'Avisar'});
        actions.appendChild(btnRen); actions.appendChild(btnEdit); actions.appendChild(btnAvisar);
        row.appendChild(actions);
        card.appendChild(row);

        const expand = DOM.createEl('button',{class:'expand-toggle',text:''});
        expand.appendChild(DOM.createEl('span',{class:'icon',text:'+'}));
        expand.appendChild(DOM.createEl('span',{class:'label',text:'Mais opções'}));
        card.appendChild(expand);

        const extra = DOM.createEl('div',{class:'client-extra'});
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
              const asn2 = (await DB.getAll('assinaturas')).find(a=>a.cliente===c.id);
              if(asn2) await DB.remove('assinaturas', asn2.id);
              await DB.remove('clientes', c.id);
              await DB.logActivity(window.sessionAdmin.adminId,'cliente.delete',`clienteId=${c.id}`);
              DOM.toast('Cliente excluído');
              loadAndRender();
            }catch(e){ DOM.toast('Erro ao excluir'); }
          });
        }
        extra.appendChild(extraControls);
        extra.appendChild(DOM.createEl('div',{class:'small',text:`Pontos somados: ${c.somaPontos} • Telas: ${c.assinatura?c.assinatura.telas:'-'}`}));
        card.appendChild(extra);
        listCard.appendChild(card);

        // behaviors
        btnRen.addEventListener('click', async ()=>{
          if(!c.assinatura){ DOM.toast('Assinatura não encontrada'); return; }
          try{
            const planoObj = c.plano || (await DB.getAll('planos')).find(p=>p.id===c.assinatura.plano);
            const res = await Assinatura.renew(c.assinatura, planoObj.validadeEmMeses, window.sessionAdmin.adminId);
            if(res.ajustadoParaDia1){
              const dt = new Date(res.nova);
              DOM.toast(`Renovado. Ajustado para 01/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}.`);
            } else DOM.toast('Renovado');
            loadAndRender();
          }catch(e){ DOM.toast('Erro ao renovar'); }
        });

        btnEdit.addEventListener('click', ()=> openEditModal(c.id));
        btnAvisar.addEventListener('click', ()=>{
          const firstName = c.nome.split(' ')[0] || c.nome;
          const msg = encodeURIComponent(`Olá ${firstName}, seu acesso está vencendo, para renovar`);
          const tel = c.telefone.replace(/\D/g,'');
          const url = `https://wa.me/${tel}?text=${msg}`;
          window.open(url,'_blank');
        });
        btnBloq.addEventListener('click', async ()=>{
          try{ await DB.update('clientes', c.id, {bloqueado: !c.bloqueado}); DOM.toast('Operação realizada'); loadAndRender(); }catch(e){ DOM.toast('Erro'); }
        });
        btnWhats.addEventListener('click', ()=>{
          const firstName = c.nome.split(' ')[0] || c.nome;
          const msg = encodeURIComponent(`Olá ${firstName}, seu acesso está vencendo, para renovar`);
          const tel = c.telefone.replace(/\D/g,'');
          const url = `https://wa.me/${tel}?text=${msg}`;
          window.open(url,'_blank');
        });

        expand.addEventListener('click', ()=>{
          const isExpanded = card.classList.toggle('expanded');
          if(window.innerWidth <= 800){
            if(isExpanded) card.style.width = 'calc(100% - 24px)';
            else card.style.width = '';
          }
          const icon = expand.querySelector('.icon');
          const lbl = expand.querySelector('.label');
          if(isExpanded){ if(icon) icon.textContent = '-'; if(lbl) lbl.textContent = 'Menos opções'; }
          else { if(icon) icon.textContent = '+'; if(lbl) lbl.textContent = 'Mais opções'; }
        });
      }
    }

    selFilter.addEventListener('change', loadAndRender);
    selOrder.addEventListener('change', loadAndRender);

    await loadAndRender();
  }

  // create/edit modal implementations preserved (reuse previous code)
  // openCreateModal and openEditModal refer to earlier implementations in project files

  Router.register('clientes', renderClientes);
})();
