// js/main.js - inicialização segura e comportamento sidebar
(function(){
  window.addEventListener('DOMContentLoaded', ()=>{
    const sidebar = document.getElementById('sidebar');
    if(sidebar) sidebar.classList.add('hidden');

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
          if(window.Router && Router._hasRoute && Router._hasRoute('login')){
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
      }
    }
  });

  // Ajuste ao redimensionar
  window.addEventListener('resize', ()=>{
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('.main');
    if(!sidebar || !main) return;
    if(window.innerWidth > 800){
      if(window.sessionAdmin) sidebar.classList.remove('hidden');
      if(sidebar.classList.contains('minimized')) main.style.marginLeft = '56px';
      else main.style.marginLeft = '220px';
    } else {
      main.style.marginLeft = '0';
    }
  });
})();
