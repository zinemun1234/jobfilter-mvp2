'use client'
import {useStore} from '@/lib/store'
import {classify,dday,Any} from '@/lib/logic'

export default function ListingsPage(){
  const {S,update,toast}=useStore()
  const delJob=(id:string)=>{
    update(d=>{d.listings=d.listings.filter((l:Any)=>l.id!==id);d.postings=d.postings.filter((p:Any)=>p.listingId!==id)})
    toast('삭제했습니다')
  }
  return <div className="flex flex-col gap-space-md">
    <div>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">공고 관리</h1>
      <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">F-41 — 전체 공고 조회·삭제 · 총 {S.listings.length}건</p>
    </div>
    <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left font-body-sm text-body-sm">
        <thead><tr className="bg-paper-bg border-b border-hairline-border">
          {['회사·직무','출처','마감','자동분류','상태',''].map(h=><th key={h} className="px-space-md py-2.5 font-label-caps text-label-caps text-slate-muted font-semibold">{h}</th>)}
        </tr></thead>
        <tbody>
          {S.listings.map((l:Any)=>{const c=classify(l)
            return <tr key={l.id} className="border-b border-hairline-border last:border-0 hover:bg-paper-bg/60 transition-colors">
              <td className="px-space-md py-3"><div className="font-semibold text-ink-charcoal">{l.position}</div><div className="font-label-caps text-label-caps text-slate-muted">{l.company} · {l.loc}</div></td>
              <td className="px-space-md py-3"><span className={"px-2 py-0.5 rounded-full font-mono-badge text-mono-badge font-semibold "+(l.src==='기업'?'bg-secondary/10 text-secondary':'bg-surface-container text-primary')}>{l.src}</span></td>
              <td className="px-space-md py-3 font-mono-metric text-mono-metric whitespace-nowrap">{l.deadline} <span className={"font-mono-badge "+(dday(l.deadline)<=3?'text-alert-red':'text-slate-muted')}>(D-{dday(l.deadline)})</span></td>
              <td className="px-space-md py-3">{c.isCS?<span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-mono-badge text-mono-badge">컴공</span>:<span className="px-2 py-0.5 rounded-full bg-paper-bg text-slate-muted font-mono-badge text-mono-badge">비관련</span>}</td>
              <td className="px-space-md py-3">{l.approved?<span className="px-2 py-0.5 rounded-full bg-match-green/10 text-match-green font-mono-badge text-mono-badge font-semibold">게시</span>:<span className="px-2 py-0.5 rounded-full bg-amber-warning/10 text-amber-warning font-mono-badge text-mono-badge font-semibold">대기</span>}</td>
              <td className="px-space-md py-3"><button onClick={()=>delJob(l.id)} className="p-1.5 rounded-lg text-slate-muted hover:text-alert-red hover:bg-error-container/40 transition-colors" title="삭제" type="button"><span className="material-symbols-outlined text-lg">delete</span></button></td>
            </tr>})}
        </tbody>
      </table>
    </div>
  </div>
}
