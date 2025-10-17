// js/main.js - controle do estado do sidebar e inicialização segura (corrigido para clique-fora mobile)
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
    if(sidebar.classList.contains('hidden')){
      // abrir a sidebar a partir do estado oculto (mobile)
      sidebar.classList.remove('hidden');
      sidebar.classList.remove('minimized');
    } else if(sidebar.classList.contains('minimized')){
      // restaurar quando estava minimizada
      sidebar.classList.remove('minimized');
    } else {
      // minimizar normalmente
      sidebar.classList.add('minimized');
    }
    syncBodyClasses();
  }

  // Abre a sidebar se estiver oculta
  function openSidebar(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    sidebar.classList.remove('hidden');
    sidebar.classList.remove('minimized');
    syncBodyClasses();
  }

  // Fecha (oculta) a sidebar — usado apenas para overlay mobile
  function hideSidebar(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    sidebar.classList.add('hidden');
    syncBodyClasses();
  }

  // Handler global para o botão toggle (event delegation)
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest && ev.target.closest('.toggle-btn');
    if(btn){
      // evita que o mesmo clique chegue ao clique-fora
      ev.stopPropagation();
      toggleSidebarMinimize();
      const sidebar = document.getElementById('sidebar');
      if(sidebar && sidebar.classList.contains('minimized')) btn.setAttribute('aria-label','Maximizar menu');
      else btn.setAttribute('aria-label','Minimizar menu');
    }
  });

  // Clique/Toque fora: fechar somente quando mobile (<=800), sidebar visível e NÃO minimizada
  function handleClickOutside(ev){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    // condição mobile
    if(window.innerWidth > 800) return;
    const isVisible = !sidebar.classList.contains('hidden');
    const isMinimized = sidebar.classList.contains('minimized');
    // somente fechar se estiver visível e não minimizada
    if(isVisible && !isMinimized){
      const clickedToggle = ev.target.closest && ev.target.closest('.toggle-btn');
      const clickedInsideSidebar = sidebar.contains(ev.target);
      if(!clickedInsideSidebar && !clickedToggle){
        hideSidebar();
      }
    }
  }

  // suportar clicks e toques (touchstart) para dispositivos mobile
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('touchstart', handleClickOutside);

  // resize: garantir sidebar visível no desktop e sincronizar classes
  window.addEventListener('resize', ()=>{
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(window.innerWidth > 800){
      // mostrar sidebar no desktop (mantendo minimized se estiver)
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
