'use client'
import {useStore} from '@/lib/store'
import {listingById,STATUS_NAME,matchScore,Any} from '@/lib/logic'

const ST_CLS:Record<string,string>={PREPARING:'bg-surface-container text-slate-muted',APPLIED:'bg-info-blue/10 text-info-blue',DOC_PASS:'bg-secondary/10 text-secondary',INTERVIEW:'bg-amber-warning/10 text-amber-warning',FINAL_PASS:'bg-match-green/10 text-match-green',REJECTED:'bg-alert-red/10 text-alert-red'}

export default function RappsPage(){
  const {S}=useStore()
  const rows=S.postings.filter((p:Any)=>{const l=listingById(S,p.listingId);return l&&l.src==='기업'})
  return <div className="flex flex-col gap-space-md">
    <div>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">지원자 열람</h1>
      <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">F-33 — 본인이 등록한 공고의 지원자만 조회됩니다</p>
    </div>
    <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left font-body-sm text-body-sm">
        <thead><tr className="border-b border-hairline-border">
          {['지원자','공고','현재 단계','매칭 점수','최근 변경'].map(h=><th key={h} className="px-space-md py-2.5 font-label-caps text-label-caps text-slate-muted font-semibold">{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.length?rows.map((p:Any)=>{const l=listingById(S,p.listingId);const m=matchScore(S.profile,l)
            return <tr key={p.id} className="border-b border-hairline-border last:border-0 hover:bg-paper-bg/60 transition-colors">
              <td className="px-space-md py-3"><div className="font-semibold text-ink-charcoal">{S.profile.name}</div><div className="font-label-caps text-label-caps text-slate-muted">{S.profile.major}</div></td>
              <td className="px-space-md py-3">{l.company} · {l.position}</td>
              <td className="px-space-md py-3"><span className={"px-2 py-0.5 rounded-full font-mono-badge text-mono-badge font-semibold "+ST_CLS[p.status]}>{STATUS_NAME[p.status]}</span></td>
              <td className="px-space-md py-3 font-mono-metric text-mono-metric font-bold text-match-green">{m.score}점</td>
              <td className="px-space-md py-3 text-slate-muted">{p.history[p.history.length-1].at}</td>
            </tr>})
          :<tr><td colSpan={5} className="px-space-md py-10 text-center text-slate-muted">아직 지원자가 없습니다 — 기업 공고가 승인·게시되고 학생이 지원하면 여기에 표시됩니다</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
}
