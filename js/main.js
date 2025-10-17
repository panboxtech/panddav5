// js/main.js - sincronização robusta entre estado do sidebar e layout
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

  function openSidebarForMobile(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    sidebar.classList.remove('hidden');
    sidebar.classList.remove('minimized');
    syncBodyClasses();
  }

  function hideSidebarForMobile(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    sidebar.classList.add('hidden');
    // keep minimized removed so next open is full
    sidebar.classList.remove('minimized');
    syncBodyClasses();
  }

  function toggleSidebarMinimize(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(sidebar.classList.contains('hidden')){
      // open from hidden on mobile
      sidebar.classList.remove('hidden');
      sidebar.classList.remove('minimized');
    } else if(sidebar.classList.contains('minimized')){
      // expand when minimized
      sidebar.classList.remove('minimized');
    } else {
      // minimize
      sidebar.classList.add('minimized');
    }
    syncBodyClasses();
  }

  // toggle button handler
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest && ev.target.closest('.toggle-btn');
    if(btn){
      ev.stopPropagation();
      toggleSidebarMinimize();
      const sidebar = document.getElementById('sidebar');
      if(sidebar && sidebar.classList.contains('minimized')) btn.setAttribute('aria-label','Maximizar menu');
      else btn.setAttribute('aria-label','Minimizar menu');
    }
  });

  // click/touch outside only closes when mobile and sidebar visible AND not minimized
  function handleOutside(ev){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(window.innerWidth > 800) return;
    const visible = !sidebar.classList.contains('hidden');
    const minimized = sidebar.classList.contains('minimized');
    if(visible && !minimized){
      const clickedToggle = ev.target.closest && ev.target.closest('.toggle-btn');
      const clickedInside = sidebar.contains(ev.target);
      if(!clickedInside && !clickedToggle){
        hideSidebarForMobile();
      }
    }
  }
  document.addEventListener('click', handleOutside);
  document.addEventListener('touchstart', handleOutside);

  // resize: enforce desktop-visible sidebar (but preserve minimized)
  window.addEventListener('resize', ()=>{
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(window.innerWidth > 800){
      sidebar.classList.remove('hidden');
    }
    syncBodyClasses();
  });

  // init: mobile-first hidden; wait Router then navigate
  window.addEventListener('DOMContentLoaded', ()=>{
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.add('hidden');
    syncBodyClasses();

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
