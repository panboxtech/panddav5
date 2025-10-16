// admin.js - lógica e validações do admin
// Exports AdminService with login(email, senha) -> admin or throws
const AdminService = (function(){
  async function login(email, senha){
    if(!email || !senha) throw {type:'validation', message:'Email e senha obrigatórios'};
    const all = await DB.getAll('admins');
    const found = all.find(a=>a.email === email && a.senha === senha);
    if(!found) throw {type:'credentials', message:'Credenciais inválidas'};
    return Object.assign({}, found);
  }
  return {login};
})();
