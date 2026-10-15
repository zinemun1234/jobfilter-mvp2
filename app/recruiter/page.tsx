'use client'
import {useState} from 'react'
import {useStore} from '@/lib/store'
import {classify,uid,dd,dday,Any} from '@/lib/logic'

const inp="w-full px-3 py-2 rounded-lg bg-paper-bg border border-hairline-border font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low"
const lbl="font-label-caps text-label-caps text-slate-muted mb-1 block"
const empty={co:'',pos:'',loc:'',car:'신입',type:'정규직',sal:'',dl:'',sk:'',desc:''}

export default function RecruiterPage(){
  const {S,update,toast}=useStore()
  const mine=S.listings.filter((l:Any)=>l.src==='기업')
  const [f,setF]=useState<Any>({...empty})
  const [editId,setEditId]=useState<string|null>(null)
  const [modal,setModal]=useState(false)
  const [tab,setTab]=useState('전체')
  const set=(k:string)=>(e:Any)=>setF({...f,[k]:e.target.value})

  const openNew=()=>{setF({...empty});setEditId(null);setModal(true)}
  const openEdit=(l:Any)=>{setF({co:l.company,pos:l.position,loc:l.loc,car:l.career,type:l.type,sal:l.salary,dl:l.deadline,sk:l.skills.join(', '),desc:l.desc});setEditId(l.id);setModal(true)}
  const regJob=()=>{
    const base:Any={company:f.co||'(무기명)',position:f.pos||'미정',loc:f.loc,career:f.car,type:f.type,salary:f.sal,deadline:f.dl||dd(14),skills:f.sk.split(',').map((s:string)=>s.trim()).filter(Boolean),desc:f.desc}
    update(d=>{
      if(editId){const dl=d.listings.find((x:Any)=>x.id===editId);Object.assign(dl,base);dl.tags=classify(dl).hits.slice(0,3)}
      else{const l:Any={...base,id:uid(d,'L'),tags:[],approved:false,src:'기업',isActive:true};l.tags=classify(l).hits.slice(0,3);d.listings.push(l)}
    })
    toast(editId?'수정됐습니다':'등록됐습니다 — 관리자 승인 대기')
    setModal(false);setF({...empty});setEditId(null)
  }
  const toggleActive=(id:string)=>update(d=>{const l=d.listings.find((x:Any)=>x.id===id);l.isActive=!l.isActive})

  const counts={전체:mine.length,게시중:mine.filter((l:Any)=>l.approved&&l.isActive).length,승인대기:mine.filter((l:Any)=>!l.approved).length,마감:mine.filter((l:Any)=>dday(l.deadline)<0||!l.isActive).length}
  const rows=mine.filter((l:Any)=>tab==='전체'||(tab==='게시중'&&l.approved&&l.isActive)||(tab==='승인대기'&&!l.approved)||(tab==='마감'&&(dday(l.deadline)<0||!l.isActive)))

  return <div className="flex flex-col gap-space-md">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">공고 관리 콘솔</h1>
        <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">F-31 등록·수정 — 등록 즉시 관리자 승인 대기</p>
      </div>
      <button onClick={openNew} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold shadow-sm hover:bg-secondary transition-colors self-start" type="button">
        <span className="material-symbols-outlined text-base">add_business</span>새 공고 등록
      </button>
    </div>

    {/* 요약 지표 */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
      {[['전체 공고',counts.전체,'text-ink-charcoal','inventory_2'],['게시 중',counts.게시중,'text-match-green','check_circle'],['승인 대기',counts.승인대기,'text-amber-warning','pending'],['마감/중단',counts.마감,'text-alert-red','event_busy']].map(([l,v,c,i]:Any)=>
        <div key={l} className="bg-surface rounded-xl p-space-md shadow-sm flex items-center justify-between">
          <div className="flex flex-col"><span className="font-label-caps text-label-caps text-slate-muted">{l}</span>
          <span className={"font-headline-lg text-headline-lg font-bold mt-1 font-mono-metric "+c}>{v}<span className="text-body-md font-normal text-slate-muted ml-0.5">건</span></span></div>
          <div className={"w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center "+c}><span className="material-symbols-outlined">{i}</span></div>
        </div>)}
    </div>

    {/* 공고 테이블 */}
    <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
      <div className="px-space-md pt-space-md border-b border-hairline-border flex items-center gap-1">
        {Object.keys(counts).map(t=><button key={t} onClick={()=>setTab(t)} className={"px-space-md py-2 font-label-caps text-label-caps border-b-2 transition-colors "+(tab===t?"border-secondary text-primary font-bold":"border-transparent text-slate-muted hover:text-ink-charcoal")} type="button">{t} <span className="font-mono-metric">{(counts as Any)[t]}</span></button>)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-sm text-body-sm">
          <thead><tr className="border-b border-hairline-border">
            {['회사·직무','마감','승인 상태','지원자','자동분류','관리'].map(h=><th key={h} className="px-space-md py-2.5 font-label-caps text-label-caps text-slate-muted font-semibold">{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.length?rows.map((l:Any)=>{
              const apps=S.postings.filter((p:Any)=>p.listingId===l.id).length
              const cs=classify(l)
              return <tr key={l.id} className="border-b border-hairline-border last:border-0 hover:bg-paper-bg/60 transition-colors">
                <td className="px-space-md py-3"><div className="font-semibold text-ink-charcoal">{l.position}</div><div className="font-label-caps text-label-caps text-slate-muted">{l.company} · {l.loc}</div></td>
                <td className="px-space-md py-3 font-mono-metric text-mono-metric">{l.deadline}<div className={"font-mono-badge text-mono-badge "+(dday(l.deadline)<=3?'text-alert-red':'text-slate-muted')}>D-{dday(l.deadline)}</div></td>
                <td className="px-space-md py-3">{l.approved?<span className="px-2 py-0.5 rounded-full bg-match-green/10 text-match-green font-mono-badge text-mono-badge font-semibold">게시 중</span>:<span className="px-2 py-0.5 rounded-full bg-amber-warning/10 text-amber-warning font-mono-badge text-mono-badge font-semibold">승인 대기</span>}</td>
                <td className="px-space-md py-3 font-mono-metric text-mono-metric">{apps}명</td>
                <td className="px-space-md py-3">{cs.isCS?<span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-mono-badge text-mono-badge font-semibold">컴공 관련</span>:<span className="px-2 py-0.5 rounded-full bg-paper-bg text-slate-muted font-mono-badge text-mono-badge">비관련</span>}</td>
                <td className="px-space-md py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={()=>openEdit(l)} className="p-1.5 rounded-lg text-slate-muted hover:text-secondary hover:bg-surface-container" title="수정" type="button"><span className="material-symbols-outlined text-lg">edit</span></button>
                    <button onClick={()=>toggleActive(l.id)} className="p-1.5 rounded-lg text-slate-muted hover:text-amber-warning hover:bg-surface-container" title={l.isActive?'게시 중단':'게시 재개'} type="button"><span className="material-symbols-outlined text-lg">{l.isActive?'visibility_off':'visibility'}</span></button>
                  </div>
                </td>
              </tr>})
            :<tr><td colSpan={6} className="px-space-md py-10 text-center text-slate-muted">등록한 공고가 없습니다 — 우상단 "새 공고 등록"을 눌러 시작하세요</td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    {/* 등록/수정 모달 */}
    {modal&&<div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-ink-charcoal/30" onClick={()=>setModal(false)}/>
      <div className="relative w-full max-w-2xl bg-surface rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-space-lg border-b border-hairline-border flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-primary">{editId?'공고 수정':'새 공고 등록'}</h2>
          <button onClick={()=>setModal(false)} className="p-2 rounded-lg text-slate-muted hover:bg-paper-bg" type="button"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-space-lg overflow-y-auto flex flex-col gap-space-md">
          <div className="grid grid-cols-2 gap-space-md">
            <div><label className={lbl}>회사명</label><input className={inp} type="text" value={f.co} onChange={set('co')}/></div>
            <div><label className={lbl}>직무</label><input className={inp} type="text" value={f.pos} onChange={set('pos')} placeholder="예) 백엔드 개발자"/></div>
            <div><label className={lbl}>경력</label><select className={inp} value={f.car} onChange={set('car')}><option>신입</option><option>경력무관</option><option>경력 3년↑</option><option>석사우대</option></select></div>
            <div><label className={lbl}>고용형태</label><select className={inp} value={f.type} onChange={set('type')}><option>정규직</option><option>계약직</option><option>인턴</option></select></div>
            <div><label className={lbl}>근무지</label><input className={inp} type="text" value={f.loc} onChange={set('loc')}/></div>
            <div><label className={lbl}>마감일</label><input className={inp} type="date" value={f.dl} onChange={set('dl')}/></div>
            <div><label className={lbl}>연봉</label><input className={inp} type="text" value={f.sal} onChange={set('sal')} placeholder="예) 3,500만"/></div>
            <div><label className={lbl}>요구 스킬 (쉼표 구분)</label><input className={inp} type="text" value={f.sk} onChange={set('sk')} placeholder="Java, Spring, MySQL"/></div>
          </div>
          <div><label className={lbl}>상세 설명</label><textarea rows={4} className={inp+' resize-y'} value={f.desc} onChange={set('desc')}/></div>
        </div>
        <div className="p-space-lg border-t border-hairline-border flex gap-space-xs justify-end">
          <button onClick={()=>setModal(false)} className="px-4 py-2 rounded-lg bg-surface-container text-slate-muted font-label-caps text-label-caps" type="button">취소</button>
          <button onClick={regJob} className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold shadow-sm" type="button">{editId?'수정 저장':'등록 → 승인 요청'}</button>
        </div>
      </div>
    </div>}
  </div>
}
