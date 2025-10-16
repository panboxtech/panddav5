// plano.js - lógica e validações de plano
const Plano = (function(){
  function validate(payload){
    const errors = {};
    if(!payload.nome || String(payload.nome).trim()==='') errors.nome='Nome obrigatório';
    if(!(Number(payload.validadeEmMeses) >= 1)) errors.validadeEmMeses='Validade em meses deve ser >=1';
    return errors;
  }
  async function create(payload, adminId){
    const errs = validate(payload);
    if(Object.keys(errs).length) throw {type:'validation',details:errs};
    const p = await DB.insert('planos', {nome:payload.nome,validadeEmMeses: Number(payload.validadeEmMeses)});
    await DB.logActivity(adminId,'plano.create',`planoId=${p.id}`);
    return p;
  }
  async function update(id,patch, adminId){
    const p = await DB.update('planos', id, patch);
    await DB.logActivity(adminId,'plano.update',`planoId=${id}`);
    return p;
  }
  async function remove(id, adminId){
    await DB.remove('planos', id);
    await DB.logActivity(adminId,'plano.delete',`planoId=${id}`);
  }
  return {validate,create,update,remove};
})();
