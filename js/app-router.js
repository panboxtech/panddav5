// js/app-router.js
// simple router for views - exposto como window.Router para compatibilidade
(function(){
  const routes = {};
  let current = null;

  function register(name, renderFn){
    if(!name || typeof renderFn !== 'function') {
      console.warn('Router.register requires (name, renderFn)');
      return;
    }
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

  // Expor API
  const Router = { register, navigateTo, _hasRoute };

  // Tornar disponível no escopo global de forma robusta
  if(typeof window !== 'undefined'){
    window.Router = Router;
  }

  // Também expor como variável global para ambientes que esperam `Router` no escopo
  if(typeof globalThis !== 'undefined'){
    globalThis.Router = Router;
  }
})();
