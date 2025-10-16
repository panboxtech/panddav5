// simple router for views
const Router = (function(){
  const routes = {};
  let current = null;

  function register(name, renderFn){
    routes[name] = renderFn;
  }

  function navigateTo(name){
    const fn = routes[name];
    if(!fn){
      console.warn('View não registrada:', name);
      return;
    }
    current = name;
    try { fn(); } catch(err) { console.error('Erro ao renderizar view', name, err); }
  }

  function _hasRoute(name){
    return !!routes[name];
  }

  return {register, navigateTo, _hasRoute};
})();
