// clientes controller - listagem e modal criar cliente (simplificado)
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

    // filters
    const filtersDiv = DOM.createEl('div',{class:'card'});
    const selFilter = DOM.createEl('select');
    ['all','vencendo<=3','vencidos<30','todosVencidos'].forEach(k=>{
      selFilter.appendChild(DOM.createEl('option',{attrs:{value:k},text:k}));
    });
    filtersDiv.appendChild(selFilter);
    wrap.appendChild(filtersDiv);

    const tableCard = DOM.createEl('div',{class:'card'});
    const table = DOM.createEl('table',{class:'table'});
    const thead = DOM.createEl('thead'); thead.innerHTML = `<tr><th>Nome</th><th>Telefone</th><th>Plano</th><th>Vencimento</th><th>Progresso</th><th>Ações</th></tr>`;
    table.appendChild(thead);
    const tbody = DOM.createEl('tbody');
    table.appendChild(tbody);
    tableCard.appendChild(table);
    wrap.appendChild(tableCard);
    main.appendChild(wrap);

    async function loadAndRender(){
      DOM.clearChildren(tbody);
      const clients = await DB.getAll('clientes');
      const assinaturas = await DB.getAll('assinaturas');
      const planos = await DB.getAll('planos');
      const pontos = await DB.getAll('pontosDeAcesso');

      for(const c of clients){
        const asn = assinaturas.find(a=>a.cliente===c.id);
        const plano = planos.find(p=>p.id===c.plano);
        const somaPontos = pontos.filter(p=>p.cliente===c.id).reduce((s,p)=>s+Number(p.pontosSimultaneos||0),0);
        const tr = DOM.createEl('tr');
        tr.appendChild(DOM.createEl('td',{text:c.nome}));
        tr.appendChild(DOM.createEl('td',{text:c.telefone}));
        tr.appendChild(DOM.createEl('td',{text:plano?plano.nome:'-'}));
        tr.appendChild(DOM.createEl('td',{text: asn ? (new Date(asn.dataDeVencimento)).toLocaleDateString() : '-' }));
        const progTd = DOM.createEl('td');
        const pr = DOM.createEl('div',{class:'progress'}); const inner = DOM.createEl('i');
        const pct = asn ? Math.min(100, Math.round((somaPontos/(asn.telas||1))*100)) : 0;
        inner.style.width = pct+'%'; pr.appendChild(inner); progTd.appendChild(pr);
        tr.appendChild(progTd);
        const actions = DOM.createEl('td');
        const btnEdit = DOM.createEl('button',{class:'ghost',text:'Editar'});
        const btnBloq = DOM.createEl('button',{class:'ghost',text:c.bloqueado? 'Desbloquear':'Bloquear'});
        const btnWhats = DOM.createEl('button',{class:'ghost',text:'WhatsApp'});
        const btnRen = DOM.createEl('button',{class:'ghost',text:'Renovar'});
        const btnDel = DOM.createEl('button',{class:'ghost',text:'Excluir'});
        actions.appendChild(btnEdit); actions.appendChild(btnBloq); actions.appendChild(btnWhats); actions.appendChild(btnRen);
        if(window.sessionAdmin && window.sessionAdmin.adminMaster) actions.appendChild(btnDel);
        tr.appendChild(actions);
        tbody.appendChild(tr);

        btnWhats.addEventListener('click', ()=>{
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
        btnEdit.addEventListener('click', ()=> DOM.toast('Edição não implementada nesta demo'));
        btnDel.addEventListener('click', async ()=>{
          if(!window.sessionAdmin.adminMaster){ DOM.toast('Permissão negada'); return; }
          if(!confirm('Confirma exclusão?')) return;
          try{
            // remove pontos, assinatura, cliente
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
    }

    btnNovo.addEventListener('click', ()=> openCreateModal());

    await loadAndRender();
  }

  function openCreateModal(){
    // simplified modal enabling creation with required validations and points list
    const modal = DOM.createEl('div',{class:'modal'});
    const card = DOM.createEl('div',{class:'card'});
    const title = DOM.createEl('div',{class:'h1',text:'Novo Cliente'});
    card.appendChild(title);
    const form = DOM.createEl('div',{class:'grid-2'});
    // left - cliente dados
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

    // right - gerenciar pontos
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

    // state
    const pontosState = [];

    async function populatePServidorOptions(){
      const s1 = Number(selServ1.value);
      const s2 = Number(selServ2.value);
      const options = [];
      if(s1) options.push(s1);
      if(s2 && s2!==s1) options.push(s2);
      DOM.clearChildren(selPServidor);
      if(options.length===0) selPServidor.appendChild(DOM.createEl('option',{attrs:{value:''},text:'Selecione servidor no formulário cliente'}));
      else {
        options.forEach(s => {
          const serv = DB._tablesRef.servidores.find(x=>x.id===s);
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
      // show totals
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
      // fetch app
      const appsAll = await DB.getAll('apps');
      const appObj = appsAll.find(a=>a.id===app);
      if(!servidor || !app) { DOM.toast('Servidor/App inválido'); return; }
      if(!usuario || !senha){ DOM.toast('Usuário e senha obrigatórios'); return; }
      if(appObj.multiplosAcessos===false && pontos!==1){ DOM.toast('App exclusivo deve ter 1 ponto'); return; }
      // local duplicate
      if(appObj.multiplosAcessos===false){
        if(pontosState.some(p=>p.app===app && p.usuario===usuario)){
          DOM.toast(`Usuário ${usuario} já usado em app exclusivo (local)`); return;
        }
      }
      // sum check per server: cannot exceed telas
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
      // collect payload
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
        // refresh clientes view
        Router.navigateTo('clientes');
      }catch(e){
        if(e.type==='validation'){
          DOM.toast(e.message || 'Validação falhou');
        }else if(e.type==='persist'){
          DOM.toast(e.message || 'Erro ao persistir');
        }else DOM.toast('Erro desconhecido');
      }
    });
  }

  Router.register('clientes', renderClientes);
})();
