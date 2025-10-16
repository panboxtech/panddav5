// main initialization
(function(){
  // start at login
  window.addEventListener('DOMContentLoaded', ()=>{
    // ensure sidebar hidden until login
    document.getElementById('sidebar').classList.add('hidden');
    Router.navigateTo('login');
  });
  // mobile: click outside sidebar to minimize
  document.addEventListener('click', (e)=>{
    const sidebar = document.getElementById('sidebar');
    if(window.innerWidth <= 800 && !sidebar.classList.contains('hidden')){
      if(!sidebar.contains(e.target)){
        sidebar.classList.add('hidden');
      }
    }
  });
})();
