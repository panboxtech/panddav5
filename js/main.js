// js/main.js - controle do estado do sidebar e inicialização segura (corrigido)
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

  function openSidebarIfHidden(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(sidebar.classList.contains('hidden')){
      sidebar.classList.remove('hidden');
    }
  }

  function toggleSidebarMinimize(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;

    // if currently hidden (mobile), just open it (do not toggle minimize)
    if(sidebar.classList.contains('hidden')){
      sidebar.classList.remove('hidden');
      // ensure not minimized when opening from hidden
      sidebar.classList.remove('minimized');
    } else if(sidebar.classList.contains('minimized')){
      // if minimized, expand to full width
      sidebar.classList.remove('minimized');
    } else {
      // normal toggle to minimized
      sidebar.classList.add('minimized');
    }
    syncBodyClasses();
  }

  // centralizar ação do botão toggle (event delegation)
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest && ev.target.closest('.toggle-btn');
    if(btn){
      toggleSidebarMinimize();
      const sidebar = document.getElementById('sidebar');
      if(sidebar && sidebar.classList.contains('minimized')) btn.setAttribute('aria-label','Maximizar menu');
      else btn.setAttribute('aria-label','Minimizar menu');
    }
  });

  // fechar sidebar ao clicar fora somente quando estiver visível e não minimizado (mobile overlay)
  document.addEventListener('click', (ev)=>{
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    // only when viewport is mobile-like and sidebar currently visible as overlay
    if(window.innerWidth <= 800){
      const isVisible = !sidebar.classList.contains('hidden');
      const isMinimized = sidebar.classList.contains('minimized');
      if(isVisible && !isMinimized){
        if(!sidebar.contains(ev.target) && !ev.target.closest('.toggle-btn')){
          sidebar.classList.add('hidden');
          syncBodyClasses();
        }
      }
    }
  });

  // redimensionamento: garantir sidebar visível no desktop e classes sincronizadas
  window.addEventListener('resize', ()=>{
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(window.innerWidth > 800){
      // on desktop always show sidebar (unless explicitly hidden by user? this keeps consistent)
      sidebar.classList.remove('hidden');
    }
    syncBodyClasses();
  });

  // inicialização segura: aguarda Router antes de navegar
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
