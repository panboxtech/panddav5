// js/main.js - inicialização segura e comportamento sidebar com classes no body
(function(){
  function setBodySidebarState(){
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    // sidebar visible if not hidden
    const visible = !sidebar.classList.contains('hidden');
    if(visible) body.classList.add('sidebar-visible'); else body.classList.remove('sidebar-visible');
    if(sidebar.classList.contains('minimized')) body.classList.add('sidebar-minimized'); else body.classList.remove('sidebar-minimized');
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.add('hidden');

    const maxWait = 3000;
    const interval = 50;
    let waited = 0;
    const iv = setInterval(()=>{
      if(window.Router && typeof Router.navigateTo === 'function' && Router._hasRoute && Router._hasRoute('login')){
        clearInterval(iv);
        try {
          // ensure state classes synced
          setBodySidebarState();
          Router.navigateTo('login');
        } catch(e){ console.error('Erro ao navegar para login', e); }
      } else {
        waited += interval;
        if(waited >= maxWait){
          clearInterval(iv);
          if(window.Router && Router._hasRoute && Router._hasRoute('login')){
            setBodySidebarState();
            Router.navigateTo('login');
          } else {
            console.warn('Router não pronto após timeout. Verifique ordem de scripts.');
          }
        }
      }
    }, interval);
  });

  // Clique fora do sidebar fecha na versão mobile
  document.addEventListener('click', (e)=>{
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(window.innerWidth <= 800 && !sidebar.classList.contains('hidden')){
      if(!sidebar.contains(e.target)){
        sidebar.classList.add('hidden');
        setBodySidebarState();
      }
    }
  });

  // toggle handlers from sidebar toggle button use event delegation: observe clicks on document and update classes
  document.addEventListener('click', (e)=>{
    if(!e.target) return;
    // toggle button has class 'toggle-btn'
    const t = e.target.closest && e.target.closest('.toggle-btn');
    if(t){
      const sidebar = document.getElementById('sidebar');
      if(!sidebar) return;
      const isMin = sidebar.classList.toggle('minimized');
      // if minimized, ensure visible on desktop
      if(window.innerWidth > 800){
        sidebar.classList.remove('hidden');
      }
      setBodySidebarState();
      // update aria-label for toggle
      if(isMin) t.setAttribute('aria-label','Maximizar menu'); else t.setAttribute('aria-label','Minimizar menu');
    }
  });

  // Adjust main margin on resize to keep centering and avoid overlap
  window.addEventListener('resize', ()=>{
    // ensure body classes reflect current sidebar state
    setBodySidebarState();
    // nothing else required because CSS uses body classes to set margin
  });
})();
