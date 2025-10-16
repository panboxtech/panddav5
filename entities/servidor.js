// servidor.js - servidor entity
const Servidor = (function(){
  function validate(payload){
    const errors={};
    if(!payload.nome || String(payload.nome).trim()==='') errors.nome='Nome obrigatório';
    return errors;
  }
  async function create(payload, adminId){
    const e = validate(payload);
    if(Object.keys(e).length) throw {type:'validation',details:e};
    const s = await DB.insert('servidores', {nome:payload.nome});
    await DB.logActivity(adminId,'servidor.create',`servidorId=${s.id}`);
    return s;
  }
  async function remove(id, adminId){
    await DB.remove('servidores', id);
    await DB.logActivity(adminId,'servidor.delete',`servidorId=${id}`);
  }
  return {validate,create,remove};
})();
