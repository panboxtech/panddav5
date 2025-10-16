// simple router for views
const Router = (function(){
  const routes = {};
  let current = null;
  function register(name, renderFn){ routes[name]=renderFn; }
  function navigateTo(name){
    const fn = routes[name];
    if(!fn) { console.warn('View não registrada:',name); return; }
    current = name;
    fn();
  }
  // default starting route
  return {register,navigateTo};
})();
