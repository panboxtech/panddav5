// main.js - inicialização segura
(function(){
  window.addEventListener('DOMContentLoaded', ()=>{
    // sidebar escondida até login
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.add('hidden');

    // espera até que a rota 'login' esteja registrada, com timeout
    const maxWait = 3000;
    const interval = 50;
    let waited = 0;
    const iv = setInterval(()=>{
      if(window.Router && typeof Router.navigateTo === 'function' && Router._hasRoute && Router._hasRoute('login')){
        clearInterval(iv);
        try { Router.navigateTo('login'); }
        catch(e){ console.error('Erro ao navegar para login', e); }
      } else {
        waited += interval;
        if(waited >= maxWait){
          clearInterval(iv);
          // fallback: tentar navegar se Router existe
          if(window.Router && Router._hasRoute && Router._hasRoute('login')){
            Router.navigateTo('login');
          } else {
            console.warn('Router não pronto após timeout. Verifique ordem de scripts.');
          }
        }
      }
    }, interval);
  });

  // mobile: click outside sidebar para minimizar
  document.addEventListener('click', (e)=>{
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(window.innerWidth <= 800 && !sidebar.classList.contains('hidden')){
      if(!sidebar.contains(e.target)){
        sidebar.classList.add('hidden');
      }
    }
  });
})();
