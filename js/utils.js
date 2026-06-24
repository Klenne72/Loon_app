const $=id=>document.getElementById(id);
const eur=(v,d=2)=>new Intl.NumberFormat('nl-BE',{style:'currency',currency:'EUR',minimumFractionDigits:d,maximumFractionDigits:d}).format(parseNum(v));const nfmt=(v,d=2)=>new Intl.NumberFormat('nl-BE',{minimumFractionDigits:d,maximumFractionDigits:d}).format(parseNum(v));const pct=v=>nfmt(v,2)+'%';
// === NUM PARSER (met komma support) ===
function parseNum(v){
  if(v === null || v === undefined) return 0;

  return parseFloat(
    String(v)
      .replace(',', '.')      // ✅ komma → punt
      .replace(/[^\d.-]/g,'') // ✅ rommel weg
  ) || 0;
}