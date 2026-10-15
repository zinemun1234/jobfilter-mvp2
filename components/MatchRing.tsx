export default function MatchRing({sc}:{sc:number}){
  const c=sc>=70?'#16A34A':sc>=45?'#D97706':'#98a0ae';
  const r=17.5, circ=+(2*Math.PI*r).toFixed(2), off=+(circ*(1-sc/100)).toFixed(2);
  return <svg className="ms" viewBox="0 0 46 46">
    <circle cx="23" cy="23" r={r} fill="none" stroke="#E3E8EF" strokeWidth="4"/>
    <circle cx="23" cy="23" r={r} fill="none" stroke={c} strokeWidth="4" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 23 23)"/>
    <text x="23" y="27" textAnchor="middle" fill={c}>{sc}</text>
  </svg>
}
