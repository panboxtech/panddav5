// assinatura.js - lógica de renovação
// assinaturaRenew(assinatura, validadeEmMeses) -> ISO date string
const Assinatura = (function(){
  function addMonthsPreserveDayISO(dateISO, months){
    const d = new Date(dateISO);
    const day = d.getDate();
    const target = new Date(d.getFullYear(), d.getMonth()+months, day);
    if(target.getDate() !== day){
      // adjust to first day of next month after target month
      const adjusted = new Date(d.getFullYear(), d.getMonth()+months+1, 1);
      return adjusted.toISOString();
    }
    return target.toISOString();
  }
  async function renew(assinatura, validadeEmMeses, adminId){
    const current = new Date(assinatura.dataDeVencimento || new Date().toISOString());
    const nova = addMonthsPreserveDayISO(current.toISOString(), validadeEmMeses);
    const novoDt = new Date(nova);
    const sameDay = new Date(assinatura.dataDeVencimento).getDate() === novoDt.getDate();
    await DB.update('assinaturas', assinatura.id, {dataDeVencimento: nova});
    await DB.logActivity(adminId||null, 'assinatura.renew', `assinaturaId=${assinatura.id} nova=${nova}`);
    return {nova, ajustadoParaDia1: !sameDay && novoDt.getDate()===1};
  }
  return {renew};
})();
