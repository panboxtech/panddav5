// mock-provider.js
// export: DB with async functions getAll(table), insert(table, payload), update(table,id,patch), remove(table,id)
// exposes initial arrays: admins, servidores, apps, planos, clientes, assinaturas, pontosDeAcesso, atividades
// functions simulate latency and return deep copies
const DB = (function(){
  // simple id generator
  let seq = 100;
  function nextId(){ return ++seq; }

  const now = () => new Date().toISOString();

  // initial data
  const admins = [
    {id:1,email:'master@pandda.test',senha:'master123',dataDeCadastro:now(),adminMaster:true},
    {id:2,email:'comum@pandda.test',senha:'comum123',dataDeCadastro:now(),adminMaster:false}
  ];

  const servidores = [
    {id:1,nome:'Servidor A',dataDeCriacao:now()},
    {id:2,nome:'Servidor B',dataDeCriacao:now()},
    {id:3,nome:'Servidor C',dataDeCriacao:now()}
  ];

  const apps = [
    {id:1,nome:'App Android',multiplosAcessos:false,servidor:1,tipo:'android',dataDeCriacao:now()},
    {id:2,nome:'App Web',multiplosAcessos:true,servidor:1,tipo:'web',dataDeCriacao:now()},
    {id:3,nome:'App iOS',multiplosAcessos:false,servidor:2,tipo:'ios',dataDeCriacao:now()},
    {id:4,nome:'App SmartTV',multiplosAcessos:true,servidor:2,tipo:'smarttv',dataDeCriacao:now()},
    {id:5,nome:'App Firestick',multiplosAcessos:false,servidor:3,tipo:'firestick',dataDeCriacao:now()},
    {id:6,nome:'App Roku',multiplosAcessos:true,servidor:3,tipo:'roku',dataDeCriacao:now()}
  ];

  const planos = [
    {id:1,nome:'Mensal',validadeEmMeses:1},
    {id:2,nome:'Trimestral',validadeEmMeses:3},
    {id:3,nome:'Anual',validadeEmMeses:12}
  ];

  // helper for dates: add months preserving day or adjust to 1 if missing
  function addMonthsPreserveDay(dateISO, months){
    const d = new Date(dateISO);
    const day = d.getDate();
    const newMonth = d.getMonth()+months;
    const candidate = new Date(d.getFullYear(), newMonth, day);
    if(candidate.getMonth() !== ((d.getMonth()+months)%12 + 12)%12){
      // day overflowed; return first day of next month after target
      const target = new Date(d.getFullYear(), newMonth+1, 1);
      return target.toISOString();
    } else return candidate.toISOString();
  }

  // create five clients with subscriptions and points
  const clientes = [
    {id:10,nome:'André Silva',telefone:'5598199990001',email:'andre@example.com',dataDeCriacao:now(),plano:1,servidor1:1,servidor2:2,bloqueado:false},
    {id:11,nome:'Beatriz Costa',telefone:'5598199990002',email:'beatriz@example.com',dataDeCriacao:now(),plano:2,servidor1:2,servidor2:null,bloqueado:false},
    {id:12,nome:'Carlos Pereira',telefone:'5598199990003',email:'carlos@example.com',dataDeCriacao:now(),plano:1,servidor1:3,servidor2:null,bloqueado:false},
    {id:13,nome:'Daniela Rocha',telefone:'5598199990004',email:'daniela@example.com',dataDeCriacao:now(),plano:3,servidor1:1,servidor2:3,bloqueado:false},
    {id:14,nome:'Eduardo Lima',telefone:'5598199990005',email:'eduardo@example.com',dataDeCriacao:now(),plano:1,servidor1:2,servidor2:3,bloqueado:true}
  ];

  // helper to get vencimento initial: today + validade months
  function initialVencimento(daysOffset, months){
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return addMonthsPreserveDay(d.toISOString(), months);
  }

  const assinaturas = [
    // one vencendo <=3 dias
    {id:200,cliente:10,plano:1,telas:2,dataDeVencimento: (()=>{const d=new Date(); d.setDate(d.getDate()+2); return d.toISOString();})(),dataDePagamento:null,formaDePagamento:null,valor:29.9},
    // one vencida <30 dias
    {id:201,cliente:11,plano:2,telas:3,dataDeVencimento:(()=>{const d=new Date(); d.setDate(d.getDate()-10); return d.toISOString();})(),dataDePagamento:null,formaDePagamento:null,valor:79.9},
    // others
    {id:202,cliente:12,plano:1,telas:1,dataDeVencimento:initialVencimento(10,1),dataDePagamento:null,formaDePagamento:null,valor:29.9},
    {id:203,cliente:13,plano:3,telas:4,dataDeVencimento:initialVencimento(20,12),dataDePagamento:null,formaDePagamento:null,valor:299.9},
    {id:204,cliente:14,plano:1,telas:1,dataDeVencimento:(()=>{const d=new Date(); d.setDate(d.getDate()-40); return d.toISOString();})(),dataDePagamento:null,formaDePagamento:null,valor:29.9}
  ];

  const pontosDeAcesso = [
    {id:300,cliente:10,servidor:1,app:1,pontosSimultaneos:1,usuario:'andreact',senha:'x1'},
    {id:301,cliente:10,servidor:2,app:4,pontosSimultaneos:1,usuario:'andre2',senha:'x2'},
    {id:302,cliente:11,servidor:2,app:3,pontosSimultaneos:1,usuario:'beatriz',senha:'p1'},
    {id:303,cliente:12,servidor:3,app:6,pontosSimultaneos:1,usuario:'carlos',senha:'p2'},
    {id:304,cliente:13,servidor:1,app:2,pontosSimultaneos:2,usuario:'daniela',senha:'p3'},
    {id:305,cliente:14,servidor:2,app:4,pontosSimultaneos:1,usuario:'eduardo',senha:'p4'}
  ];

  const atividades = []; // logs, e.g., {id,adminId,acao,timestamp,detalhe}

  const tables = {admins,servidores,apps,planos,clientes,assinaturas,pontosDeAcesso,atividades};

  // simulate latency
  function delay(ms=180){ return new Promise(r=>setTimeout(r,ms)); }

  async function getAll(table){ await delay(); return JSON.parse(JSON.stringify(tables[table] || [])); }
  async function find(table, predicate){ const all = await getAll(table); return all.find(predicate); }
  async function insert(table, payload){
    await delay();
    const t = tables[table];
    if(!t) throw new Error('Tabela não existe: '+table);
    const obj = JSON.parse(JSON.stringify(payload));
    obj.id = nextId();
    if(table==='assinaturas' || table==='clientes' || table==='servidores' || table==='apps') {
      // timestamps simulated
      obj.dataDeCriacao = obj.dataDeCriacao || now();
      if(table==='assinaturas' && !obj.dataDeVencimento) obj.dataDeVencimento = now();
    }
    t.push(obj);
    return JSON.parse(JSON.stringify(obj));
  }
  async function update(table, id, patch){
    await delay();
    const t = tables[table];
    if(!t) throw new Error('Tabela não existe: '+table);
    const idx = t.findIndex(x=>x.id===id);
    if(idx===-1) throw new Error('Registro não encontrado: '+table+'#'+id);
    t[idx] = Object.assign({}, t[idx], JSON.parse(JSON.stringify(patch)));
    return JSON.parse(JSON.stringify(t[idx]));
  }
  async function remove(table, id){
    await delay();
    const t = tables[table];
    const idx = t.findIndex(x=>x.id===id);
    if(idx===-1) throw new Error('Registro não encontrado: '+table+'#'+id);
    const [removed] = t.splice(idx,1);
    return JSON.parse(JSON.stringify(removed));
  }

  async function queryBy(table, filters){
    await delay();
    const t = tables[table] || [];
    return JSON.parse(JSON.stringify(t.filter(item=>{
      for(const k in filters){
        if(item[k] !== filters[k]) return false;
      }
      return true;
    })));
  }

  async function logActivity(adminId,acao,detalhe){
    await delay(20);
    const log = {id:nextId(),adminId,acao,timestamp:now(),detalhe};
    atividades.push(log);
    return JSON.parse(JSON.stringify(log));
  }

  // expose
  return {
    getAll, insert, update, remove, queryBy, find, logActivity,
    // direct access for read-only needs (tests)
    _tablesRef: tables,
  };
})();
