'use client'
import {useState} from 'react'
import Link from 'next/link'
import {useStore} from '@/lib/store'
import {dday,matchScore,visibleListings} from '@/lib/logic'
import MatchRing from '@/components/MatchRing'

export default function JobsPage(){
  const {S}=useStore()
  const [F,setF]=useState({q:'',type:'',career:'',loc:'',sort:'match'})
  let ls=visibleListings(S).filter((l:any)=>dday(l.deadline)>=0)
  if(F.q) ls=ls.filter((l:any)=>(l.company+l.position+(l.tags||[]).join(' ')).toLowerCase().includes(F.q.toLowerCase()))
  if(F.type) ls=ls.filter((l:any)=>l.type===F.type)
  if(F.career) ls=ls.filter((l:any)=>(l.career||'').includes(F.career))
  if(F.loc) ls=ls.filter((l:any)=>(l.loc||'').includes(F.loc))
  let lm=ls.map((l:any)=>({l,m:matchScore(S.profile,l)}))
  if(F.sort==='match') lm.sort((a:any,b:any)=>b.m.score-a.m.score)
  if(F.sort==='deadline') lm.sort((a:any,b:any)=>dday(a.l.deadline)-dday(b.l.deadline))
  if(F.sort==='latest') lm.sort((a:any,b:any)=>b.l.id.localeCompare(a.l.id))
  const opt=(arr:string[],cur:string)=>arr.map(v=><option key={v} value={v}>{v}</option>)
  return <>
    <h2>공고 목록 <span className="muted">— 컴공 관련 공고만 자동 선별됨 · {lm.length}건</span></h2>
    <div className="card" style={{marginBottom:14}}><div className="row">
      <input type="text" style={{width:220}} placeholder="회사·직무·태그 검색" value={F.q} onChange={e=>setF({...F,q:e.target.value})}/>
      <select style={{width:130}} value={F.type} onChange={e=>setF({...F,type:e.target.value})}><option value="">고용형태</option>{opt(['정규직','계약직','인턴'],F.type)}</select>
      <select style={{width:130}} value={F.career} onChange={e=>setF({...F,career:e.target.value})}><option value="">경력</option>{opt(['신입','경력무관','경력'],F.career)}</select>
      <select style={{width:120}} value={F.loc} onChange={e=>setF({...F,loc:e.target.value})}><option value="">지역</option>{opt(['서울','성남','수원','안산','평택'],F.loc)}</select>
      <select style={{width:130}} value={F.sort} onChange={e=>setF({...F,sort:e.target.value})}>
        <option value="match">매칭순</option><option value="deadline">마감임박순</option><option value="latest">최신순</option></select>
      <button className="btn sm" onClick={()=>setF({q:'',type:'',career:'',loc:'',sort:'match'})}>필터 초기화</button>
      <span className="muted">내 스킬: {S.profile.skills.join(', ')}</span></div></div>
    <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>{lm.length?lm.map(({l,m}:any)=>{
      const d=dday(l.deadline),bm=S.bookmarks.includes(l.id)
      return <Link className="job" key={l.id} href={'/jobs/'+l.id}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div><span className="co">{l.company}</span> {bm&&<span className="chip bm">★ 스크랩</span>}
          <div className="pos">{l.position}</div></div>
          <div style={{textAlign:'center'}}><MatchRing sc={m.score}/><div className="muted" style={{fontSize:10}}>매칭</div></div></div>
        <div>{(l.tags||[]).map((t:string)=><span className="tag" key={t}>{t}</span>)}</div>
        <div className="muted" style={{marginTop:4}}>{l.skills.join(' · ')}</div>
        <div className="row" style={{marginTop:6,justifyContent:'space-between'}}>
          <span className="muted">{l.loc} · {l.career} · {l.type} · {l.salary}</span>
          <span className={'dday '+(d<=5?'urgent':'')}>D-{d}</span></div>
      </Link>
    }):<div className="empty" style={{gridColumn:'1/3'}}>검색 결과가 없습니다 — 필터를 초기화해보세요</div>}</div>
  </>
}
