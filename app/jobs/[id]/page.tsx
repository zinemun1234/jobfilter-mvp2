'use client'
import Link from 'next/link'
import {useParams,useRouter} from 'next/navigation'
import {useStore} from '@/lib/store'
import {dday,matchScore,listingById,uid,today,STATUS_NAME} from '@/lib/logic'
import MatchRing from '@/components/MatchRing'

export default function JobDetailPage(){
  const {S,update,toast,setClSel,setClJob}=useStore()
  const params=useParams()
  const router=useRouter()
  const id=String(params?.id||'')
  const l=listingById(S,id)
  if(!l) return <div className="empty">공고를 찾을 수 없습니다</div>
  const m=matchScore(S.profile,l), d=dday(l.deadline), bm=S.bookmarks.includes(l.id)
  const applied=S.postings.find((p:any)=>p.listingId===l.id)

  const toggleBm=()=>{ update(d2=>{const i=d2.bookmarks.indexOf(l.id); i<0?d2.bookmarks.push(l.id):d2.bookmarks.splice(i,1)}); toast(bm?'스크랩 해제':'스크랩했습니다') }
  const applyJob=()=>{
    if(applied) return router.push('/board')
    update(d2=>{d2.postings.push({id:uid(d2,'P'),listingId:l.id,status:'PREPARING',history:[{s:'PREPARING',at:today()}]})})
    toast('칸반에 "서류 준비 중"으로 등록됐습니다'); router.push('/board')
  }
  const newCoverFor=()=>{
    const nid='C'+(S.seq+1)
    update(d2=>{d2.coverLetters.push({id:uid(d2,'C'),title:l.company+' '+l.position+' 지원 자소서',items:[{q:'지원 동기',text:''},{q:'직무 역량',text:''}],versions:[],score:null})})
    setClSel(nid); setClJob(l.id); router.push('/cover')
  }

  return <>
    <Link className="btn sm" href="/jobs">← 목록</Link>
    <div className="card sec" style={{marginTop:10}}>
      <div className="row" style={{justifyContent:'space-between'}}>
        <div><div style={{fontSize:19,fontWeight:800}}>{l.company}</div>
        <div style={{fontSize:15,marginTop:2}}>{l.position}</div></div>
        <div style={{textAlign:'center'}}><MatchRing sc={m.score}/><div className="muted" style={{fontSize:10}}>매칭 점수</div></div></div>
      <div style={{margin:'8px 0'}}>{(l.tags||[]).map((t:string)=><span className="tag" key={t}>{t}</span>)}</div>
      <table><tbody>
        <tr><th>근무지</th><th>경력</th><th>고용형태</th><th>연봉</th><th>마감일</th></tr>
        <tr><td>{l.loc}</td><td>{l.career}</td><td>{l.type}</td><td>{l.salary}</td><td><b className={d<=5?'dday urgent':''}>{l.deadline} (D-{d})</b></td></tr>
      </tbody></table>
      <h3>공고 내용</h3><p style={{lineHeight:1.7}}>{l.desc}</p>
      <h3>요구 역량 vs 내 프로필 <span className="muted">(매칭 분석)</span></h3>
      <div>{m.hit.map((s:string)=><span className="chip hit" key={s}>✓ {s} 보유</span>)}
           {m.miss.map((s:string)=><span className="chip miss" key={s}>✗ {s} 부족</span>)}</div>
      <div className="row" style={{marginTop:14}}>
        <button className="btn" onClick={toggleBm}>{bm?'★ 스크랩 해제':'☆ 스크랩'}</button>
        <button className="btn p" onClick={applyJob}>{applied?'지원 관리 보드로 이동':'지원 항목 등록 → 칸반'}</button>
        <button className="btn" onClick={newCoverFor}>이 공고로 자소서 쓰기</button></div>
      {applied&&<div className="note">이미 지원 관리 보드에 등록된 공고입니다 (현재: {STATUS_NAME[applied.status]})</div>}
    </div>
  </>
}
