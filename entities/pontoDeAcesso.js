// pontoDeAcesso.js - validações de ponto
// validates a point payload against app/server rules; returns {valid:true, errors:[]}
const Ponto = (function(){
  function validateLocal(ponto, clientePontos, appsList){
    const errors = [];
    if(!ponto.app) errors.push('App obrigatório');
    if(!ponto.servidor) errors.push('Servidor obrigatório');
    if(!ponto.usuario || String(ponto.usuario).trim()==='') errors.push('Usuário obrigatório');
    if(!ponto.senha || String(ponto.senha).trim()==='') errors.push('Senha obrigatória');
    const app = appsList.find(a=>a.id===ponto.app);
    if(!app) errors.push('App não pertence ao servidor informado');
    if(app && app.multiplosAcessos===false){
      if((ponto.pontosSimultaneos||1) !== 1) errors.push('App exclusivo deve ter pontosSimultaneos = 1');
      // local uniqueness check within clientePontos
      const dupe = clientePontos.find(p=>p.app===ponto.app && p.usuario===ponto.usuario && p !== ponto);
      if(dupe) errors.push(`Usuário ${ponto.usuario} já usado em outro ponto exclusivo do mesmo cliente`);
    } else {
      if(!(ponto.pontosSimultaneos>=1)) errors.push('PontosSimultaneos deve ser >=1');
    }
    return {valid:errors.length===0, errors};
  }
  return {validateLocal};
})();
