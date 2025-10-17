// main.js — inicialização e layout com sidebar funcional
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
      sidebar.classList.remove('hidden');
      sidebar.classList.remove('minimized');
    } else if(sidebar.classList.contains('minimized')){
      sidebar.classList.remove('minimized');
    } else {
      sidebar.classList.add('minimized');
    }
    syncBodyClasses();
  }

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

  document.addEventListener('click', (ev)=>{
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    if(window.innerWidth <= 800 && !sidebar.classList.contains('hidden')){
      if(!sidebar.contains(ev.target)){
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
    syncBodyClasses();

    const maxWait = 3000;
    const interval = 50;
    let waited = 0;
    const iv = setInterval(()=>{
      if(window.Router && typeof Router.navigateTo === 'function' && Router._hasRoute && Router._hasRoute('login')){
        clearInterval(iv);
        syncBodyClasses();
        try { Router.navigateTo('login'); } catch(e){ console.error(e); }
      } else {
        waited += interval;
        if(waited >= maxWait){
          clearInterval(iv);
          syncBodyClasses();
          if(window.Router && Router._hasRoute && Router._hasRoute('login')) Router.navigateTo('login');
        }
      }
    }, interval);
  });

  // buildSidebar agora incluído diretamente
  window.buildSidebar = function(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    sidebar.innerHTML = '';

    const header = DOM.createEl('div',{class:'menu-header'});
    const title = DOM.createEl('div',{class:'small title',text:'Pandda'});
    const toggle = DOM.createEl('button',{class:'toggle-btn',text:'≡'});
    header.appendChild(title); header.appendChild(toggle);
    sidebar.appendChild(header);

    const menu = DOM.createEl('div',{class:'menu-items'});
    const items = [
      {key:'clientes',label:'Clientes'},
      {key:'planos',label:'Planos'},
      {key:'servidores',label:'Servidores'},
      {key:'apps',label:'Apps'},
      {key:'assinaturas',label:'Assinaturas'},
      {key:'admin',label:'Admin'}
    ];
    items.forEach(it=>{
      const btn = DOM.createEl('button',{class:'menu-item'});
      const icon = DOM.createEl('span',{class:'icon',text:'•'});
      const lbl = DOM.createEl('span',{class:'label',text:it.label});
      btn.appendChild(icon); btn.appendChild(lbl);
      btn.addEventListener('click', ()=>{
        if(it.key === 'admin' && !(window.sessionAdmin && window.sessionAdmin.adminMaster)){
          DOM.toast('Acesso restrito a Admin Master');
          return;
        }
        Router.navigateTo(it.key);
      });
      menu.appendChild(btn);
    });
    sidebar.appendChild(menu);

    const spacer = DOM.createEl('div',{attrs:{style:'flex:1'}});
    sidebar.appendChild(spacer);

    const logout = DOM.createEl('button',{class:'menu-item'});
    logout.appendChild(DOM.createEl('span',{class:'icon',text:'⎋'}));
    logout.appendChild(DOM.createEl('span',{class:'label',text:'Sair'}));
    logout.addEventListener('click', ()=>{
      window.sessionAdmin = null;
      sidebar.classList.add('hidden');
      Router.navigateTo('login');
    });
    sidebar.appendChild(logout);

    toggle.addEventListener('click', ()=>{
      sidebar.classList.toggle('minimized');
      syncBodyClasses();
    });
  };
})();
