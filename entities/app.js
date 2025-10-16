// app.js - lógica de apps
const AppEntity = (function(){
  function validate(payload){
    const errors={};
    if(!payload.nome || String(payload.nome).trim()==='') errors.nome='Nome obrigatório';
    if(!payload.servidor) errors.servidor='Servidor obrigatório';
    return errors;
  }
  async function create(payload, adminId){
    const e = validate(payload);
    if(Object.keys(e).length) throw {type:'validation',details:e};
    const app = await DB.insert('apps', {
      nome: payload.nome,
      codigoApp: payload.codigoApp || null,
      urlDownloadAndroid: payload.urlDownloadAndroid || null,
      urlDownloadIos: payload.urlDownloadIos || null,
      codigoDownloadLoja1: payload.codigoDownloadLoja1 || null,
      codigoDownloadLoja2: payload.codigoDownloadLoja2 || null,
      multiplosAcessos: !!payload.multiplosAcessos,
      servidor: payload.servidor,
      tipo: payload.tipo || null
    });
    await DB.logActivity(adminId,'app.create',`appId=${app.id}`);
    return app;
  }
  async function update(id, patch, adminId){
    const app = await DB.update('apps', id, patch);
    await DB.logActivity(adminId,'app.update',`appId=${id}`);
    return app;
  }
  async function remove(id, adminId){
    await DB.remove('apps', id);
    await DB.logActivity(adminId,'app.delete',`appId=${id}`);
  }
  return {validate,create,update,remove};
})();
