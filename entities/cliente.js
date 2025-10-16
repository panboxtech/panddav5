// cliente.js - validações e helpers para criação/edição
// Exports ClienteService with create/update flows (mock transaction simulation)
const ClienteService = (function(){
  // helper: phone digits only
  function cleanPhone(phone){ return String(phone||'').replace(/\D/g,''); }
  function validateClientePayload(payload){
    const errors = {};
    if(!payload.nome || String(payload.nome).trim()==='') errors.nome = 'Nome obrigatório';
    if(!payload.telefone || cleanPhone(payload.telefone).length<1) errors.telefone = 'Telefone obrigatório';
    if(!payload.plano) errors.plano = 'Plano obrigatório';
    if(!payload.servidor1) errors.servidor1 = 'Servidor1 obrigatório';
    if(!payload.telas || !(Number(payload.telas)>=1)) errors.telas = 'Telas deve ser >=1';
    if(!payload.dataDeVencimento) errors.dataDeVencimento = 'Data de vencimento obrigatória';
    // date must be > today
    if(payload.dataDeVencimento){
      const today = new Date(); today.setHours(0,0,0,0);
      const venc = new Date(payload.dataDeVencimento);
      venc.setHours(0,0,0,0);
      if(!(venc > today)) errors.dataDeVencimento = 'Data de vencimento deve ser maior que hoje';
    }
    return errors;
  }

  // simulated transaction: create cliente, assinatura, pontos; rollback on failure
  async function createCliente(fullPayload, adminId){
    const clientePayload = {
      nome: fullPayload.nome,
      telefone: cleanPhone(fullPayload.telefone),
      email: fullPayload.email || null,
      plano: fullPayload.plano,
      servidor1: fullPayload.servidor1,
      servidor2: fullPayload.servidor2 || null,
      bloqueado: false
    };
    const assinaturaPayload = {
      cliente: null, // after client created -> set
      plano: fullPayload.plano,
      telas: fullPayload.telas,
      dataDeVencimento: fullPayload.dataDeVencimento,
      dataDePagamento: null,
      formaDePagamento: null,
      valor: fullPayload.valor || 0
    };
    const pontos = (fullPayload.pontos || []).map(p => Object.assign({}, p));
    // validations
    const clientErrors = validateClientePayload(Object.assign({}, clientePayload, {dataDeVencimento: assinaturaPayload.dataDeVencimento}));
    if(Object.keys(clientErrors).length) throw {type:'validation', details:clientErrors};

    // validate sum per server
    const sums = {};
    for(const p of pontos){
      sums[p.servidor] = (sums[p.servidor]||0) + Number(p.pontosSimultaneos||0);
    }
    // each selected server must equal telas
    const servidoresSelected = [clientePayload.servidor1];
    if(clientePayload.servidor2) servidoresSelected.push(clientePayload.servidor2);
    for(const s of servidoresSelected){
      if((sums[s]||0) !== Number(assinaturaPayload.telas)){
        throw {type:'validation', message:`Soma de pontos para servidor ${s} deve ser exatamente ${assinaturaPayload.telas}`};
      }
    }

    // local uniqueness for exclusive apps
    const appsAll = await DB.getAll('apps');
    for(const p of pontos){
      const app = appsAll.find(a=>a.id===p.app);
      if(!app) throw {type:'validation', message:`App id ${p.app} inválido`};
      if(app.multiplosAcessos===false){
        const dupLocal = pontos.find(x=>x !== p && x.app===p.app && x.usuario===p.usuario);
        if(dupLocal) throw {type:'validation', message:`Usuário ${p.usuario} duplicado localmente em app exclusivo`};
      }
    }

    // check global uniqueness for exclusive apps before persisting
    for(const p of pontos){
      const app = appsAll.find(a=>a.id===p.app);
      if(app.multiplosAcessos===false){
        const global = await DB.queryBy('pontosDeAcesso', {app: p.app});
        if(global.some(g=>g.usuario === p.usuario)){
          throw {type:'validation', message:`Usuário ${p.usuario} já usado globalmente para app exclusivo`};
        }
      }
    }

    // persist sequence with rollback
    const created = {cliente:null,assinatura:null, pontos:[]};
    try{
      const cli = await DB.insert('clientes', clientePayload);
      created.cliente = cli;
      assinaturaPayload.cliente = cli.id;
      const asn = await DB.insert('assinaturas', assinaturaPayload);
      created.assinatura = asn;
      for(const p of pontos){
        const pld = Object.assign({}, p, {cliente: cli.id});
        const rp = await DB.insert('pontosDeAcesso', pld);
        created.pontos.push(rp);
      }
      await DB.logActivity(adminId||null,'cliente.create',`clienteId=${cli.id}`);
      return created;
    }catch(err){
      // rollback created ones
      try{
        if(created.pontos){
          for(const rp of created.pontos) await DB.remove('pontosDeAcesso', rp.id);
        }
        if(created.assinatura) await DB.remove('assinaturas', created.assinatura.id);
        if(created.cliente) await DB.remove('clientes', created.cliente.id);
      }catch(e){ /* swallow */ }
      throw {type:'persist', message:'Erro ao criar cliente. Operação revertida', detail: err};
    }
  }

  async function loadClientFull(clientId){
    const clients = await DB.getAll('clientes');
    const client = clients.find(c=>c.id===clientId);
    if(!client) throw {type:'notfound'};
    const assinaturas = await DB.getAll('assinaturas');
    const pontos = await DB.getAll('pontosDeAcesso');
    const assinatura = assinaturas.find(a=>a.cliente===clientId);
    const pontosCliente = pontos.filter(p=>p.cliente===clientId);
    return {cliente:client,assinatura, pontos:pontosCliente};
  }

  return {createCliente, loadClientFull, validateClientePayload};
})();
