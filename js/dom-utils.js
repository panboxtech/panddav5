// helpers DOM
window.DOM = (function(){
  function createEl(tag, opts={}){
    const el = document.createElement(tag);
    if(opts.class) el.className = opts.class;
    if(opts.text) el.textContent = opts.text;
    if(opts.html) el.innerHTML = opts.html;
    if(opts.attrs) for(const k in opts.attrs) el.setAttribute(k, opts.attrs[k]);
    return el;
  }
  function clearChildren(el){ while(el.firstChild) el.removeChild(el.firstChild); }
  function toast(msg, timeout=3500){
    const t = createEl('div',{class:'toast',text:msg});
    document.body.appendChild(t);
    setTimeout(()=> t.remove(), timeout);
  }
  function formatDateISO(d){
    if(!d) return '';
    const dt = new Date(d);
    const y=dt.getFullYear(), m=String(dt.getMonth()+1).padStart(2,'0'), day=String(dt.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function copy(obj){ return JSON.parse(JSON.stringify(obj)); }
  return {createEl,clearChildren,toast,formatDateISO,copy};
})();
