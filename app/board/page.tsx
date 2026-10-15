'use client'
import {useState} from 'react'
import Link from 'next/link'
import {useStore} from '@/lib/store'
import {STATUS,STATUS_NAME,listingById,today,dday,matchScore,visibleListings,uid,Any} from '@/lib/logic'

const COL_DOT:Record<string,string>={PREPARING:'bg-slate-muted',APPLIED:'bg-info-blue',DOC_PASS:'bg-secondary',INTERVIEW:'bg-amber-warning',FINAL_PASS:'bg-match-green',REJECTED:'bg-alert-red'}

export default function BoardPage(){
  const {S,update,toast}=useStore()
  const [over,setOver]=useState<string|null>(null)
  const [sel,setSel]=useState<string|null>(null)
  const [addOpen,setAddOpen]=useState(false)
  const [addId,setAddId]=useState('')

  const drop=(e:React.DragEvent,st:string)=>{
    e.preventDefault();setOver(null)
    const pid=e.dataTransfer.getData('text')
    const p=S.postings.find((x:Any)=>x.id===pid)
    if(!p||p.status===st)return
    update(d=>{const dp=d.postings.find((x:Any)=>x.id===pid);dp.status=st;dp.history.push({s:st,at:today()})})
    toast(STATUS_NAME[st]+'로 이동 — 이력 기록됨')
  }
  const selP=S.postings.find((p:Any)=>p.id===sel)
  const selL=selP?listingById(S,selP.listingId):null
  const setStatus=(pid:string,st:string)=>{
    update(d=>{const dp=d.postings.find((x:Any)=>x.id===pid);if(dp.status!==st){dp.status=st;dp.history.push({s:st,at:today()})}})
    toast(STATUS_NAME[st]+'로 이동 — 이력 기록됨')
  }
  const addPosting=()=>{
    if(!addId)return
    update(d=>{d.postings.push({id:uid(d,'P'),listingId:addId,status:'PREPARING',history:[{s:'PREPARING',at:today()}]})})
    setAddOpen(false);setAddId('');toast('칸반에 등록됐습니다')
  }
  const delPosting=(pid:string)=>{update(d=>{d.postings=d.postings.filter((x:Any)=>x.id!==pid)});setSel(null);toast('지원 항목이 삭제됐습니다')}

  const total=S.postings.length
  const docPass=S.postings.filter((p:Any)=>['DOC_PASS','INTERVIEW','FINAL_PASS'].includes(p.status)).length
  const inProg=S.postings.filter((p:Any)=>['APPLIED','DOC_PASS','INTERVIEW'].includes(p.status)).length
  const pass=S.postings.filter((p:Any)=>p.status==='FINAL_PASS')
  const cands=visibleListings(S).filter((l:Any)=>!S.postings.some((p:Any)=>p.listingId===l.id))

  return <div className="flex flex-col gap-space-md">
    {/* 헤더 */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">지원 관리</h1>
        <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">F-14 — 카드를 드래그해 단계 이동 · 상태 이력 자동 기록</p>
      </div>
      <button onClick={()=>setAddOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold shadow-sm hover:bg-secondary transition-colors self-start" type="button">
        <span className="material-symbols-outlined text-base">add</span>신규 지원 공고 등록
      </button>
    </div>

    {/* 통계 바 */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
      {[
        ['총 지원 현황',<>{total}<span className="text-body-md font-normal text-slate-muted ml-0.5">건</span></>,'text-ink-charcoal','analytics','text-primary'],
        ['서류 통과율',<>{total?Math.round(docPass/total*100):0}%<span className="font-body-sm text-body-sm text-slate-muted font-normal ml-1">({docPass}/{total}건)</span></>,'text-info-blue','assignment_turned_in','text-info-blue'],
        ['전형 진행 중',<>{inProg}<span className="text-body-md font-normal text-slate-muted ml-0.5">건</span></>,'text-amber-warning','schedule','text-amber-warning'],
        ['최종 합격',<>{pass.length}<span className="text-body-md font-normal text-slate-muted ml-0.5">건</span></>,'text-match-green','verified','text-match-green'],
      ].map(([label,val,valCls,icon,iconCls]:Any,i:number)=>
        <div key={i} className="bg-surface rounded-xl p-space-md shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-slate-muted">{label}</span>
            <span className={"font-headline-lg text-headline-lg font-bold mt-1 font-mono-metric "+valCls}>{val}</span>
          </div>
          <div className={"w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center "+iconCls}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        </div>)}
    </div>

    {/* 6열 칸반 */}
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex gap-space-md min-w-[1720px] items-start">
        {STATUS.map(st=>{
          const cards=S.postings.filter((p:Any)=>p.status===st)
          return <div key={st}
            className={"w-[280px] shrink-0 flex flex-col gap-space-sm rounded-xl p-space-sm transition-colors "+(over===st?'bg-secondary/10 ring-2 ring-secondary/40':'bg-surface-container-low/60')}
            onDragOver={e=>{e.preventDefault();setOver(st)}}
            onDragLeave={()=>setOver(null)}
            onDrop={e=>drop(e,st)}>
            <div className="flex items-center justify-between px-space-xs py-1">
              <div className="flex items-center gap-space-xs">
                <span className={"w-2.5 h-2.5 rounded-full "+COL_DOT[st]}/>
                <h2 className="font-headline-sm text-body-md font-bold text-ink-charcoal">{STATUS_NAME[st]}</h2>
                <span className="font-mono-metric text-mono-badge px-2 py-0.5 rounded-full bg-surface-container text-slate-muted font-bold">{cards.length}</span>
              </div>
            </div>
            {cards.map((p:Any)=>{
              const l=listingById(S,p.listingId)
              if(!l)return null
              const d=dday(l.deadline),m=matchScore(S.profile,l)
              return <div key={p.id} draggable
                onDragStart={e=>e.dataTransfer.setData('text',p.id)}
                onClick={()=>setSel(p.id)}
                className="group bg-surface rounded-lg p-space-md shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-space-xs">
                <div className="flex items-start justify-between">
                  <span className={"px-2 py-0.5 rounded font-label-caps text-label-caps font-bold "+(d<=2?'bg-alert-red/10 text-alert-red':d<=7?'bg-amber-warning/10 text-amber-warning':'bg-surface-container text-slate-muted')}>{d<0?'마감':'D-'+d+' 마감'}</span>
                  <div className="flex items-center gap-1 text-slate-muted">
                    <span className={"font-mono-badge text-mono-badge px-1.5 py-0.5 rounded font-semibold "+(m.score>=70?'bg-match-green/10 text-match-green':'bg-surface-container-high text-primary')}>{m.score}%</span>
                    <span className="material-symbols-outlined text-base opacity-40 group-hover:opacity-100">drag_indicator</span>
                  </div>
                </div>
                <div>
                  <div className="font-label-caps text-label-caps text-slate-muted">{l.company}</div>
                  <div className="font-headline-sm text-body-md font-bold text-ink-charcoal group-hover:text-secondary transition-colors">{l.position}</div>
                </div>
                <div className="mt-1 flex items-center justify-between text-slate-muted font-body-sm text-body-sm pt-2">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {l.deadline.slice(5)}</span>
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </div>
              </div>})}
            {!cards.length&&<div className="rounded-lg border border-dashed border-hairline-border py-6 text-center font-label-caps text-label-caps text-slate-muted">카드를 여기로 드래그</div>}
          </div>})}
      </div>
    </div>

    {/* 슬라이드오버: 지원 상세 */}
    {selP&&selL&&<div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-charcoal/30" onClick={()=>setSel(null)}/>
      <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col">
        <div className="p-space-lg border-b border-hairline-border flex items-start justify-between">
          <div>
            <div className="font-label-caps text-label-caps text-slate-muted">{selL.company} · {selL.loc}</div>
            <h2 className="font-headline-md text-headline-md text-primary mt-0.5">{selL.position}</h2>
          </div>
          <button onClick={()=>setSel(null)} className="p-2 rounded-lg text-slate-muted hover:bg-paper-bg" type="button"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-space-md">
          <div>
            <div className="font-label-caps text-label-caps text-slate-muted mb-2">상태 변경</div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS.map(st=><button key={st} onClick={()=>setStatus(selP.id,st)} className={"px-2.5 py-1 rounded-full font-label-caps text-label-caps transition-colors "+(selP.status===st?'bg-primary-container text-on-primary font-bold shadow-sm':'bg-paper-bg text-slate-muted hover:bg-surface-container')} type="button">{STATUS_NAME[st]}</button>)}
            </div>
          </div>
          <div className="p-space-sm rounded-lg bg-amber-warning/5 border-l-2 border-amber-warning font-body-sm text-body-sm">
            마감 {selL.deadline} (D-{dday(selL.deadline)}) — {selL.company} {selL.position}
          </div>
          <div>
            <div className="font-label-caps text-label-caps text-slate-muted mb-2">지원 과정 타임라인</div>
            <ol className="flex flex-col gap-space-sm">
              {selP.history.map((h:Any,i:number)=>
                <li key={i} className="flex items-start gap-space-sm">
                  <span className={"w-6 h-6 rounded-full flex items-center justify-center shrink-0 "+(i===selP.history.length-1?'bg-match-green text-white':'bg-surface-container text-primary')}>
                    <span className="material-symbols-outlined text-xs">{i===selP.history.length-1?'radio_button_checked':'check'}</span>
                  </span>
                  <div><div className="font-body-sm text-body-sm font-semibold">{STATUS_NAME[h.s]}</div><div className="font-label-caps text-label-caps text-slate-muted">{h.at}</div></div>
                </li>)}
            </ol>
          </div>
          <Link href={'/jobs/'+selL.id} className="inline-flex items-center gap-1 font-body-sm text-body-sm text-secondary hover:underline"><span className="material-symbols-outlined text-base">open_in_new</span>공고 상세 보기</Link>
        </div>
        <div className="p-space-lg border-t border-hairline-border flex gap-space-xs">
          <button onClick={()=>delPosting(selP.id)} className="flex-1 px-3 py-2 rounded-lg bg-error-container/50 text-alert-red font-label-caps text-label-caps font-semibold hover:bg-error-container transition-colors" type="button">지원 항목 삭제</button>
          <button onClick={()=>setSel(null)} className="flex-1 px-3 py-2 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold" type="button">닫기</button>
        </div>
      </div>
    </div>}

    {/* 모달: 신규 지원 등록 */}
    {addOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink-charcoal/30" onClick={()=>setAddOpen(false)}/>
      <div className="relative w-full max-w-md bg-surface rounded-xl shadow-2xl p-space-lg">
        <h2 className="font-headline-md text-headline-md text-primary mb-space-md">신규 지원 공고 등록</h2>
        <select value={addId} onChange={e=>setAddId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-paper-bg border border-hairline-border font-body-sm text-body-sm focus:outline-none mb-space-md">
          <option value="">공고를 선택하세요</option>
          {cands.map((l:Any)=><option key={l.id} value={l.id}>{l.company} — {l.position} (D-{dday(l.deadline)})</option>)}
        </select>
        <div className="flex gap-space-xs">
          <button onClick={()=>setAddOpen(false)} className="flex-1 px-3 py-2 rounded-lg bg-surface-container text-slate-muted font-label-caps text-label-caps" type="button">취소</button>
          <button onClick={addPosting} disabled={!addId} className="flex-1 px-3 py-2 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold disabled:opacity-40" type="button">칸반에 등록</button>
        </div>
      </div>
    </div>}
  </div>
}
