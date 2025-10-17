// js/main.js - controle centralizado do estado do sidebar e inicialização segura
(function(){
  function syncBodyClasses(){
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    const visible = !sidebar.classList.contains('hidden');
    body.classList.toggle('sidebar-visible', visible);
    body.classList.toggle('sidebar-hidden', !visible);
    body.classList.toggle('sidebar-minimized', sidebar.classList.contains('minimized'));
  }

  function toggleSidebarMinimize(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    const wasHidden = sidebar.classList.contains('hidden');
    if(wasHidden){
      sidebar.classList.remove('hidden');
    } else {
      sidebar.classList.toggle('minimized');
    }
    syncBodyClasses();
  }

  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest && ev.target.closest('.toggle-btn');
    if(btn){
      toggleSidebarMinimize();
      const sidebar = document.getElementById('sidebar');
      if(sidebar.classList.contains('minimized')) btn.setAttribute('aria-label','Maximizar menu');
      else btn.setAttribute('aria-label','Minimizar menu');
    }
  });

  document.addEventListener('click', (ev)=>{
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(window.innerWidth <= 800 && !sidebar.classList.contains('hidden')){
      if(!sidebar.contains(ev.target) && !ev.target.closest('.toggle-btn')){
        sidebar.classList.add('hidden');
        syncBodyClasses();
      }
    }
  });

  window.addEventListener('resize', ()=>{
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(window.innerWidth > 800){
      sidebar.classList.remove('hidden');
    }
    syncBodyClasses();
  });

  window.addEventListener('DOMContentLoaded', ()=>{
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.add('hidden');

    const maxWait = 3000;
    const interval = 50;
    let waited = 0;
    const iv = setInterval(()=>{
      if(window.Router && typeof Router.navigateTo === 'function' && Router._hasRoute && Router._hasRoute('login')){
        clearInterval(iv);
        syncBodyClasses();
        try { Router.navigateTo('login'); } catch(e){ console.error('Erro ao navegar para login', e); }
      } else {
        waited += interval;
        if(waited >= maxWait){
          clearInterval(iv);
          syncBodyClasses();
          if(window.Router && Router._hasRoute && Router._hasRoute('login')) Router.navigateTo('login');
          else console.warn('Router não pronto após timeout.');
        }
      }
    }, interval);
  });

})();
