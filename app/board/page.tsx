'use client'
import {useState} from 'react'
import {useStore} from '@/lib/store'
import {STATUS,STATUS_NAME,listingById,today} from '@/lib/logic'

export default function BoardPage(){
  const {S,update,toast}=useStore()
  const [open,setOpen]=useState<Record<string,boolean>>({})
  const [over,setOver]=useState<string|null>(null)

  const drop=(e:React.DragEvent,st:string)=>{
    e.preventDefault(); setOver(null)
    const pid=e.dataTransfer.getData('text')
    const p=S.postings.find((x:any)=>x.id===pid)
    if(!p||p.status===st) return
    update(d=>{const dp=d.postings.find((x:any)=>x.id===pid); dp.status=st; dp.history.push({s:st,at:today()})})
    toast(STATUS_NAME[st]+'로 이동 — 이력 기록됨')
  }

  return <>
    <h2>지원 관리 칸반 <span className="muted">— 카드를 드래그해 단계 이동 · 상태 이력(StatusHistory) 자동 기록</span></h2>
    <div className="board">{STATUS.map(st=>{
      const cards=S.postings.filter((p:any)=>p.status===st)
      return <div key={st} className={'col'+(over===st?' over':'')}
        onDragOver={e=>{e.preventDefault();setOver(st)}}
        onDragLeave={()=>setOver(null)}
        onDrop={e=>drop(e,st)}>
        <h4>{STATUS_NAME[st]}<span>{cards.length}</span></h4>
        {cards.map((p:any)=>{const l=listingById(S,p.listingId);return (
          <div key={p.id} className={'kcard'+(open[p.id]?' open':'')} draggable
            onDragStart={e=>e.dataTransfer.setData('text',p.id)}
            onClick={()=>setOpen({...open,[p.id]:!open[p.id]})}>
            <div className="t">{l?l.company:'?'} <span className="muted">{l?l.position:''}</span></div>
            <div className="muted">마감 {l?l.deadline:''}</div>
            <div className="hist">{p.history.map((h:any,i:number)=>(<div key={i}>· {STATUS_NAME[h.s]} <span className="muted">{h.at}</span></div>))}</div>
          </div>)})}
      </div>
    })}</div>
    <div className="note">카드 클릭 → 상태 변경 이력(StatusHistory) 표시. 불합격은 모든 단계에서 전이 가능합니다.</div>
  </>
}
