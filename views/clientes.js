// views/clientes.js - listagem com filtro, expand toggle e modal completo de criação
(function(){
  // Função para abrir modal de criação — definida primeiro para garantir disponibilidade
  function openCreateModal(){
    const modal = DOM.createEl('div',{class:'modal'});
    const card = DOM.createEl('div',{class:'card client-modal'});
    const title = DOM.createEl('div',{class:'h1',text:'Novo Cliente'});
    card.appendChild(title);

    const form = DOM.createEl('div',{class:'grid-2'});
    const left = DOM.createEl('div');
    const inNome = DOM.createEl('input',{attrs:{type:'text',placeholder:'Nome'}});
    const errNome = DOM.createEl('div',{class:'small'});
    const inTel = DOM.createEl('input',{attrs:{type:'text',placeholder:'Telefone'}});
    const errTel = DOM.createEl('div',{class:'small'});
    const selPlano = DOM.createEl('select');
    (async ()=>{
      const planos = await DB.getAll('planos');
      selPlano.appendChild(DOM.createEl('option',{attrs:{value:''},text:'Selecione plano'}));
      planos.forEach(p=> selPlano.appendChild(DOM.createEl('option',{attrs:{value:p.id},text:`${p.nome} (${p.validadeEmMeses}m)` })));
    })();
    const inVenc = DOM.createEl('input',{attrs:{type:'date'}});
    const errVenc = DOM.createEl('div',{class:'small'});
    const selServ1 = DOM.createEl('select');
    const selServ2 = DOM.createEl('select');
    (async ()=>{
      const servs = await DB.getAll('servidores');
      selServ1.appendChild(DOM.createEl('option',{attrs:{value:''},text:'Selecione servidor 1'}));
      selServ2.appendChild(DOM.createEl('option',{attrs:{value:''},text:'Selecione um segundo servidor (opcional)'}));
      servs.forEach(s=>{
        selServ1.appendChild(DOM.createEl('option',{attrs:{value:s.id},text:s.nome}));
        selServ2.appendChild(DOM.createEl('option',{attrs:{value:s.id},text:s.nome}));
      });
    })();
    const inTelas = DOM.createEl('input',{attrs:{type:'number',min:1,placeholder:'Telas'}});

    left.appendChild(inNome); left.appendChild(errNome);
    left.appendChild(inTel); left.appendChild(errTel);
    left.appendChild(selPlano);
    left.appendChild(inVenc); left.appendChild(errVenc);
    left.appendChild(selServ1); left.appendChild(selServ2); left.appendChild(inTelas);

    const right = DOM.createEl('div');
    const pTitle = DOM.createEl('div',{class:'h1',text:'Gerenciar Pontos de Acesso'});
    const pForm = DOM.createEl('div',{class:'form-row column'});
    const selPServidor = DOM.createEl('select');
    const selPApp = DOM.createEl('select');
    const inPontos = DOM.createEl('input',{attrs:{type:'number',min:1,placeholder:'Pontos simultâneos'}});
    const inUsuario = DOM.createEl('input',{attrs:{type:'text',placeholder:'Usuário'}});
    const inSenha = DOM.createEl('input',{attrs:{type:'text',placeholder:'Senha'}});
    const btnAddP = DOM.createEl('button',{text:'Adicionar Ponto de Acesso'});
    const listP = DOM.createEl('div');
    pForm.appendChild(selPServidor); pForm.appendChild(selPApp); pForm.appendChild(inPontos); pForm.appendChild(inUsuario); pForm.appendChild(inSenha); pForm.appendChild(btnAddP);
    right.appendChild(pTitle); right.appendChild(pForm); right.appendChild(listP);

    form.appendChild(left); form.appendChild(right);

    const footer = DOM.createEl('div',{class:'flex'});
    const btnSalvar = DOM.createEl('button',{text:'Salvar Cliente'});
    const btnCancelar = DOM.createEl('button',{class:'ghost',text:'Cancelar'});
    footer.appendChild(btnSalvar); footer.appendChild(btnCancelar);

    card.appendChild(form); card.appendChild(footer);
    modal.appendChild(card);
    document.body.appendChild(modal);

    const pontosState = [];

    async function populatePServidorOptions(){
      const s1 = Number(selServ1.value);
      const s2 = Number(selServ2.value);
      DOM.clearChildren(selPServidor);
      const options = [];
      if(s1) options.push(s1);
      if(s2 && s2!==s1) options.push(s2);
      if(options.length===0) selPServidor.appendChild(DOM.createEl('option',{attrs:{value:''},text:'Selecione servidor no formulário cliente'}));
      else {
        options.forEach(s => {
          const serv = DB._tablesRef && DB._tablesRef.servidores ? DB._tablesRef.servidores.find(x=>x.id===s) : null;
          selPServidor.appendChild(DOM.createEl('option',{attrs:{value:s},text:serv?serv.nome:`Servidor ${s}`}));
        });
      }
      await populateApps();
    }
    async function populateApps(){
      const servId = Number(selPServidor.value);
      DOM.clearChildren(selPApp);
      const apps = (await DB.getAll('apps')).filter(a=>a.servidor===servId);
      if(apps.length===0) selPApp.appendChild(DOM.createEl('option',{attrs:{value:''},text:'Nenhum app disponível'}));
      else apps.forEach(a=> selPApp.appendChild(DOM.createEl('option',{attrs:{value:a.id},text:a.nome})));
    }

    selServ1.addEventListener('change', populatePServidorOptions);
    selServ2.addEventListener('change', populatePServidorOptions);
    selPServidor.addEventListener('change', populateApps);

    async function renderPontosList(){
      DOM.clearChildren(listP);
      pontosState.forEach((p,idx)=>{
        const row = DOM.createEl('div',{class:'card'});
        row.textContent = `Servidor ${p.servidor} - App ${p.app} - Pontos ${p.pontosSimultaneos} - Usuário ${p.usuario}`;
        const rm = DOM.createEl('button',{class:'ghost',text:'Remover'});
        rm.addEventListener('click', ()=>{ pontosState.splice(idx,1); renderPontosList(); });
        row.appendChild(rm);
        listP.appendChild(row);
      });
      const totals = pontosState.reduce((acc,p)=>{ acc[p.servidor]=(acc[p.servidor]||0)+Number(p.pontosSimultaneos||0); return acc; },{});
      const totalsDiv = DOM.createEl('div',{class:'small',text:'Somas por servidor: '+ Object.keys(totals).map(k=>`${k}:${totals[k]}`).join(', ')});
      listP.appendChild(totalsDiv);
    }

    btnAddP.addEventListener('click', async ()=>{
      const servidor = Number(selPServidor.value);
      const app = Number(selPApp.value);
      const pontos = Number(inPontos.value||1);
      const usuario = inUsuario.value.trim();
      const senha = inSenha.value.trim();
      const appsAll = await DB.getAll('apps');
      const appObj = appsAll.find(a=>a.id===app);
      if(!servidor || !app) { DOM.toast('Servidor/App inválido'); return; }
      if(!usuario || !senha){ DOM.toast('Usuário e senha obrigatórios'); return; }
      if(appObj && appObj.multiplosAcessos===false && pontos!==1){ DOM.toast('App exclusivo deve ter 1 ponto'); return; }
      if(appObj && appObj.multiplosAcessos===false){
        if(pontosState.some(p=>p.app===app && p.usuario===usuario)){
          DOM.toast(`Usuário ${usuario} já usado em app exclusivo (local)`); return;
        }
      }
      const telas = Number(inTelas.value||0);
      const sums = pontosState.reduce((s,p)=>{ s[p.servidor]=(s[p.servidor]||0)+Number(p.pontosSimultaneos||0); return s; },{});
      if((sums[servidor]||0) + pontos > telas){
        DOM.toast('Excede quota de telas no servidor'); return;
      }
      pontosState.push({servidor,app,pontosSimultaneos:pontos,usuario,senha});
      inPontos.value=''; inUsuario.value=''; inSenha.value='';
      renderPontosList();
    });

    btnCancelar.addEventListener('click', ()=> modal.remove());

    btnSalvar.addEventListener('click', async ()=>{
      const payload = {
        nome: inNome.value.trim(),
        telefone: inTel.value.trim(),
        email: null,
        plano: Number(selPlano.value||0),
        servidor1: Number(selServ1.value||0),
        servidor2: (selServ2.value?Number(selServ2.value):null),
        telas: Number(inTelas.value||0),
        dataDeVencimento: inVenc.value? (new Date(inVenc.value)).toISOString() : null,
        pontos: pontosState
      };
      try{
        const created = await ClienteService.createCliente(payload, window.sessionAdmin.adminId);
        DOM.toast('Cliente criado');
        modal.remove();
        Router.navigateTo('clientes');
      }catch(e){
        if(e && e.type==='validation'){
          DOM.toast(e.message || e.details || 'Validação falhou');
        }else if(e && e.type==='persist'){
          DOM.toast(e.message || 'Erro ao persistir');
        }else DOM.toast('Erro desconhecido');
      }
    });
  }

  // Função de edição reutilizada (mantida aqui para integridade)
  async function openEditModal(clienteId){
    try{
      const full = await ClienteService.loadClientFull(clienteId);
      const cliente = full.cliente;
      const modal = DOM.createEl('div',{class:'modal'});
      const card = DOM.createEl('div',{class:'card'});
      card.appendChild(DOM.createEl('div',{class:'h1',text:'Editar Cliente'}));
      const inNome = DOM.createEl('input',{attrs:{type:'text',value:cliente.nome}});
      const inTel = DOM.createEl('input',{attrs:{type:'text',value:cliente.telefone}});
      const btnSave = DOM.createEl('button',{text:'Salvar'});
      const btnCancel = DOM.createEl('button',{class:'ghost',text:'Cancelar'});
      card.appendChild(inNome); card.appendChild(inTel);
      const footer = DOM.createEl('div',{class:'flex'});
      footer.appendChild(btnSave); footer.appendChild(btnCancel);
      card.appendChild(footer);
      modal.appendChild(card);
      document.body.appendChild(modal);

      btnCancel.addEventListener('click', ()=> modal.remove());
      btnSave.addEventListener('click', async ()=>{
        try{
          await DB.update('clientes', cliente.id, {nome: inNome.value.trim(), telefone: inTel.value.trim()});
          DOM.toast('Cliente atualizado');
          modal.remove();
          Router.navigateTo('clientes');
        }catch(e){ DOM.toast('Erro ao atualizar'); }
      });
    }catch(e){ DOM.toast('Erro ao carregar cliente'); }
  }

  // Render principal da view clientes
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

    // Garantir que openCreateModal está disponível e ligado corretamente
    btnNovo.addEventListener('click', ()=>{
      if(typeof openCreateModal === 'function'){
        try { openCreateModal(); }
        catch(err){
          console.error('Erro ao abrir modal de criação:', err);
          DOM.toast('Erro ao abrir formulário de criação');
        }
      } else {
        console.error('openCreateModal não encontrada em views/clientes.js');
        DOM.toast('Formulário de criação indisponível no momento');
      }
    });

    async function loadAndRender(){
      DOM.clearChildren(listCard);
      let clients = await DB.getAll('clientes');
      const assinaturas = await DB.getAll('assinaturas');
      const planos = await DB.getAll('planos');
      const pontos = await DB.getAll('pontosDeAcesso');

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

      const filter = selFilter.value;
      if(filter === 'vencendo3'){
        clients = clients.filter(c=> c.vencDate && c.daysToVenc <= 3 && c.daysToVenc >= 0);
      } else if(filter === 'vencidos30'){
        clients = clients.filter(c=> c.vencDate && c.daysToVenc < 0 && Math.abs(c.daysToVenc) < 30);
      } else if(filter === 'todosvencidos'){
        clients = clients.filter(c=> c.vencDate && c.daysToVenc < 0);
      }

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

  Router.register('clientes', renderClientes);
})();
