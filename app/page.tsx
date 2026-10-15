'use client'
import Link from 'next/link'
import {useStore} from '@/lib/store'
import {dday,matchScore,visibleListings} from '@/lib/logic'
import MatchRing from '@/components/MatchRing'

export default function DashPage(){
  const {S}=useStore()
  const open=visibleListings(S).filter((l:any)=>dday(l.deadline)>=0)
  const urg=open.filter((l:any)=>dday(l.deadline)<=7).sort((a:any,b:any)=>dday(a.deadline)-dday(b.deadline))
  const rec=open.map((l:any)=>({l,m:matchScore(S.profile,l)})).sort((a:any,b:any)=>b.m.score-a.m.score).slice(0,3)
  const doing=S.postings.filter((p:any)=>!['FINAL_PASS','REJECTED'].includes(p.status)).length
  const scores=S.coverLetters.map((c:any)=>c.score).filter(Boolean)
  return <>
    <h2>대시보드 <span className="muted">— {S.profile.name} · {S.profile.major} · 희망 {S.profile.targetJob}</span></h2>
    <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
      <div className="card"><div className="muted">전체 공고</div><div style={{fontSize:26,fontWeight:800}}>{open.length}</div></div>
      <div className="card"><div className="muted">마감 임박 (D-7 이내)</div><div style={{fontSize:26,fontWeight:800,color:'var(--bad)'}}>{urg.length}</div></div>
      <div className="card"><div className="muted">진행 중인 지원</div><div style={{fontSize:26,fontWeight:800}}>{doing}</div></div>
      <div className="card"><div className="muted">자소서 평균 점수</div><div style={{fontSize:26,fontWeight:800}}>{scores.length?Math.round(scores.reduce((a:number,b:number)=>a+b)/scores.length):'-'}</div></div>
    </div>
    <h3>마감 임박 공고</h3>
    <div className="grid">{urg.length?urg.map((l:any)=>(
      <Link className="job" key={l.id} href={'/jobs/'+l.id}><div className="row" style={{justifyContent:'space-between'}}>
        <div><span className="co">{l.company}</span> <span className="pos">{l.position}</span></div>
        <span className="dday urgent">D-{dday(l.deadline)}</span></div>
        <div className="muted">{l.loc} · {l.career} · {l.type}</div></Link>
    )):<div className="empty">임박 공고 없음</div>}</div>
    <h3>추천 공고 <span className="muted">(프로필 매칭 상위)</span></h3>
    <div className="grid">{rec.map(({l,m}:any)=>(
      <Link className="job" key={l.id} href={'/jobs/'+l.id}><div className="row" style={{justifyContent:'space-between'}}>
        <div><span className="co">{l.company}</span> <span className="pos">{l.position}</span>
        <div className="muted">{l.skills.join(' · ')}</div></div><MatchRing sc={m.score}/></div></Link>
    ))}</div>
  </>
}
