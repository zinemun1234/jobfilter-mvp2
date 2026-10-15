// Stitch 화면 공용 부품 — 매칭 링·D-day 배지·스킬 칩
export function Ring({sc,size=48}:{sc:number;size?:number}){
  const c=sc>=70?'text-match-green':sc>=45?'text-amber-warning':'text-slate-muted'
  const r=20, circ=125.66, off=+(circ*(1-sc/100)).toFixed(2)
  const hex=sc>=70?'#16A34A':sc>=45?'#D97706':'#5B6472'
  return <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
    <svg className="-rotate-90" style={{width:size,height:size}} viewBox="0 0 48 48">
      <circle className="text-surface-variant stroke-current" cx="24" cy="24" r={r} fill="transparent" strokeWidth="4"/>
      <circle className={c+' stroke-current'} cx="24" cy="24" r={r} fill="transparent" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" strokeWidth="4"/>
    </svg>
    <span className="absolute font-mono-metric font-bold" style={{color:hex,fontSize:size*0.24}}>{sc}%</span>
  </div>
}
export function DdayChip({d}:{d:number}){
  const cls=d<=2?'bg-error-container text-alert-red':d<=7?'bg-amber-warning/10 text-amber-warning':'bg-surface-container-low text-slate-muted'
  return <span className={'px-2 py-0.5 rounded-full font-mono-badge text-mono-badge font-bold '+cls}>{d<0?'마감':'D-'+d}</span>
}
export function SkillChip({s,hit}:{s:string;hit?:boolean}){
  if(hit===true) return <span className="px-2 py-1 rounded bg-surface-container font-mono-badge text-mono-badge text-primary font-semibold">✓ {s}</span>
  if(hit===false) return <span className="px-2 py-1 rounded bg-error-container/50 font-mono-badge text-mono-badge text-alert-red">✗ {s}</span>
  return <span className="px-2 py-1 rounded bg-surface-container font-mono-badge text-mono-badge text-ink-charcoal">{s}</span>
}
export function SectionCard({children,className=''}:{children:React.ReactNode;className?:string}){
  return <div className={"bg-surface rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)] "+className}>{children}</div>
}
