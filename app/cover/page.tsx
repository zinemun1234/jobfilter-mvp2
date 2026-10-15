'use client'
import {useEffect,useState} from 'react'
import {useStore} from '@/lib/store'
import {visibleListings,listingById,jobTypeOfListing,qTypeOf,guideFor,analyzeCoverLetter,heatmap,CRITERIA,uid,Any} from '@/lib/logic'
import {Ring} from '@/components/ui'

export default function CoverPage(){
  const {S,update,toast,clSel,setClSel,clJob,setClJob}=useStore()
  const jobs=visibleListings(S)
  const c=S.coverLetters.find((x:Any)=>x.id===clSel)
  const [draft,setDraft]=useState<Any>(null)
  const [result,setResult]=useState<Any>(null)
  const [curItem,setCurItem]=useState(0)

  useEffect(()=>{if(!clSel&&S.coverLetters.length)setClSel(S.coverLetters[0].id)},[clSel,S.coverLetters,setClSel])
  useEffect(()=>{if(!clJob&&jobs.length)setClJob(jobs[0].id)},[clJob,jobs,setClJob])
  useEffect(()=>{
    if(c)setDraft(JSON.parse(JSON.stringify({title:c.title,items:c.items})))
    else setDraft(null)
    setResult(null);setCurItem(0)
  },[clSel])  // eslint-disable-line

  const newCover=()=>{
    const nid='C'+(S.seq+1)
    update(d=>{d.coverLetters.push({id:uid(d,'C'),title:'새 자기소개서',items:[{q:'지원 동기',text:''}],versions:[],score:null})})
    setClSel(nid)
  }
  const saveCL=()=>{
    if(!c)return
    update(d=>{const dc=d.coverLetters.find((x:Any)=>x.id===c.id);
      dc.versions.push({v:dc.versions.length+1,at:new Date().toLocaleString('ko-KR'),items:JSON.parse(JSON.stringify(dc.items))});
      dc.title=draft.title;dc.items=draft.items})
    toast('저장됐습니다 — 버전 '+(c.versions.length+2)+' 생성')
  }
  const delCL=()=>{
    update(d=>{d.coverLetters=d.coverLetters.filter((x:Any)=>x.id!==c.id)})
    setClSel(S.coverLetters.find((x:Any)=>x.id!==c.id)?.id||null)
  }
  const addItem=()=>setDraft({...draft,items:[...draft.items,{q:'',text:''}]})
  const setItem=(i:number,k:string,v:string)=>{const items=[...draft.items];items[i]={...items[i],[k]:v};setDraft({...draft,items})}

  const l=listingById(S,clJob||'')
  const jt=jobTypeOfListing(l,S.profile.targetJob)

  const runAnalyze=()=>{
    if(!c)return
    const text=draft.items.map((i:Any)=>i.text).join('\n\n')
    const res=analyzeCoverLetter(text,(l&&(l.tags||[])[0])||S.profile.targetJob)
    const kws=[...(l?l.skills:[]),...(l?l.tags:[])]
    const hm=heatmap(text,kws)
    update(d=>{const dc=d.coverLetters.find((x:Any)=>x.id===c.id);
      dc.title=draft.title;dc.items=draft.items;dc.score=res.ok?res.total:null})
    setResult({...res,hm,l})
  }
  const insertFrame=(i:number)=>{
    const it=draft.items[i]
    const g=guideFor(jt,qTypeOf(it.q,it.text))
    setItem(i,'text',it.text?it.text+'\n'+g.f:g.f)
    toast('프레임 삽입됨 — [ ] 빈칸을 직접 채우세요')
  }
  const guide=(()=>{
    if(!draft||!draft.items[curItem])return null
    const it=draft.items[curItem]
    const qt=qTypeOf(it.q,it.text)
    return {qt,g:guideFor(jt,qt)}
  })()

  return <div className="flex flex-col gap-space-md">
    {/* 워크스페이스 헤더 */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">자소서 코칭 워크스페이스</h1>
        <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">F-15 작성 · F-16 채점 · F-17 히트맵 · F-28 기준 공개 · F-66 가이드</p>
      </div>
      <div className="flex flex-wrap items-center gap-space-xs">
        <select value={clSel||''} onChange={e=>setClSel(e.target.value)} className="px-3 py-2 rounded-lg bg-surface border border-hairline-border text-body-sm font-body-sm focus:outline-none">
          {S.coverLetters.map((x:Any)=><option key={x.id} value={x.id}>{x.title} (v{x.versions.length+1})</option>)}
        </select>
        <select value={clJob||''} onChange={e=>setClJob(e.target.value)} className="px-3 py-2 rounded-lg bg-surface border border-hairline-border text-body-sm font-body-sm focus:outline-none">
          {jobs.map((j:Any)=><option key={j.id} value={j.id}>{j.company} {j.position}</option>)}
        </select>
        <button onClick={newCover} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-high text-primary font-label-caps text-label-caps hover:bg-surface-variant transition-colors" type="button">
          <span className="material-symbols-outlined text-base">add</span>새 자소서
        </button>
        <button onClick={saveCL} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-high text-primary font-label-caps text-label-caps hover:bg-surface-variant transition-colors" type="button">
          <span className="material-symbols-outlined text-base">save</span>저장
        </button>
        <button onClick={runAnalyze} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold shadow-sm hover:bg-secondary transition-colors" type="button">
          <span className="material-symbols-outlined text-base">analytics</span>코칭 분석 실행
        </button>
        <button onClick={delCL} className="p-2 rounded-lg text-slate-muted hover:text-alert-red hover:bg-error-container/40 transition-colors" title="삭제" type="button">
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>

    {c&&draft?<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
      {/* 좌측: 종합 진단 패널 */}
      <div className="xl:col-span-3 flex flex-col gap-space-md">
        <div className="bg-surface rounded-xl p-space-lg shadow-sm">
          <h2 className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider mb-space-sm">종합 진단 결과</h2>
          {result?(result.ok?
            <>
              <div className="flex items-center gap-space-md mb-space-md">
                <Ring sc={result.total} size={88}/>
                <div className="flex flex-col">
                  <span className="font-headline-lg text-headline-lg text-primary">{result.total}점</span>
                  <span className="font-label-caps text-label-caps text-slate-muted">/ 100 · {(result.l?result.l.company:'직군 미선택')} 기준</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {result.detail.map((d:Any)=>{const v=Math.round(d.score/d.max*100);return <div key={d.name}>
                  <div className="flex items-center justify-between font-label-caps text-label-caps mb-0.5">
                    <span className="text-on-surface-variant">{d.name} ({d.max}점)</span>
                    <span className={"font-mono-metric text-mono-metric font-bold "+(v>=80?'text-match-green':v>=55?'text-amber-warning':'text-alert-red')}>{d.score}점 · {v}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden">
                    <div className={"h-full rounded-full "+(v>=80?'bg-match-green':v>=55?'bg-amber-warning':'bg-alert-red')} style={{width:v+'%'}}/>
                  </div>
                </div>})}
              </div>
              <div className="mt-space-md p-space-sm rounded-lg bg-info-blue/5 border-l-2 border-info-blue font-body-sm text-body-sm leading-relaxed">
                잘된 점: {result.good.join(', ')||'-'}<br/>보완할 점: {result.bad.join(', ')||'-'}
              </div>
            </>
            :<div className="p-space-sm rounded-lg bg-error-container/40 border-l-2 border-alert-red">
              <b className="text-alert-red font-body-sm">분석 불가</b>
              <ul className="font-body-sm text-body-sm text-slate-muted mt-1 ml-4 list-disc">{result.fail.map((f:string)=><li key={f}>{f}</li>)}</ul>
            </div>)
          :<div className="py-space-lg text-center text-slate-muted font-body-sm">
            <span className="material-symbols-outlined text-3xl block mb-2">analytics</span>
            상단의 "코칭 분석 실행"을 누르면 7개 가중치 항목별 진단이 표시됩니다
          </div>}
        </div>
        {c.versions.length>0&&<div className="bg-surface rounded-xl p-space-lg shadow-sm">
          <h2 className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider mb-2">버전 이력 (F-15)</h2>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-space-sm py-1.5 rounded-lg bg-surface-container-low font-body-sm"><span>현재 v{c.versions.length+1}</span><span className="font-mono-badge text-mono-badge text-match-green font-semibold">작성 중</span></div>
            {[...c.versions].reverse().map((v:Any)=><div key={v.v} className="flex items-center justify-between px-space-sm py-1.5 rounded-lg hover:bg-paper-bg font-body-sm">
              <span>v{v.v}</span><span className="font-label-caps text-label-caps text-slate-muted">{v.at}</span>
            </div>)}
          </div>
        </div>}
        <div className="bg-surface rounded-xl p-space-lg shadow-sm">
          <h2 className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider mb-2">평가 기준 공개 (F-28)</h2>
          <div className="flex flex-col gap-1 font-body-sm text-body-sm">
            {Object.entries(CRITERIA).map(([k,v])=><div key={k} className="flex justify-between gap-2 py-1 border-b border-hairline-border last:border-0">
              <span className="font-medium shrink-0">{k}</span><span className="text-slate-muted text-right">{v as string}</span>
            </div>)}
          </div>
        </div>
      </div>

      {/* 중앙: 에디터 */}
      <div className="xl:col-span-6 flex flex-col gap-space-md">
        <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
          <div className="px-space-md pt-space-md border-b border-hairline-border flex items-center gap-1">
            {draft.items.map((it:Any,i:number)=>
              <button key={i} onClick={()=>setCurItem(i)} className={"px-space-md py-2 font-label-caps text-label-caps border-b-2 transition-colors "+(i===curItem?"border-secondary text-primary font-bold":"border-transparent text-slate-muted hover:text-ink-charcoal")} type="button">
                문항 {i+1}
              </button>)}
            <button onClick={addItem} className="px-space-md py-2 text-slate-muted hover:text-secondary font-label-caps text-label-caps flex items-center gap-0.5" type="button">
              <span className="material-symbols-outlined text-sm">add</span>추가
            </button>
            <span className="ml-auto font-label-caps text-label-caps text-slate-muted pb-2">버전 {c.versions.length+1} · 자동 저장 준비</span>
          </div>
          <div className="p-space-md flex flex-col gap-space-md">
            <input type="text" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="자소서 제목" className="w-full px-space-md py-2 rounded-lg bg-paper-bg font-headline-sm text-headline-sm text-ink-charcoal placeholder:text-slate-muted focus:outline-none focus:bg-surface-container-low"/>
            {draft.items.map((it:Any,i:number)=>
              <div key={i} className={"rounded-xl border p-space-md transition-colors "+(i===curItem?'border-secondary/40 bg-surface':'border-hairline-border')}>
                <input type="text" value={it.q} placeholder="문항 제목 (예: 지원 동기)" onFocus={()=>setCurItem(i)} onChange={e=>setItem(i,'q',e.target.value)} className="w-full px-2 py-1.5 rounded-md bg-paper-bg font-body-sm text-body-sm font-semibold text-primary placeholder:text-slate-muted focus:outline-none focus:bg-surface-container-low mb-2"/>
                <textarea rows={7} value={it.text} placeholder="본문을 직접 작성하세요 — 의미 없는 입력은 '분석 불가' 처리됩니다" onFocus={()=>setCurItem(i)} onChange={e=>setItem(i,'text',e.target.value)} className="w-full px-2 py-1.5 rounded-md font-body-sm text-body-sm leading-relaxed text-ink-charcoal placeholder:text-slate-muted focus:outline-none focus:bg-paper-bg resize-y"/>
                <div className="flex items-center justify-between font-label-caps text-label-caps text-slate-muted mt-1">
                  <span>{it.text.length}자 · {(it.text.match(/\S+/g)||[]).length}단어</span>
                  {i===curItem&&<span className="text-secondary">편집 중</span>}
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {/* 우측: F-66 가이드 패널 */}
      <div className="xl:col-span-3 flex flex-col gap-space-md">
        <div className="bg-surface rounded-xl p-space-lg shadow-sm border-t-4 border-secondary-container">
          <div className="flex items-center justify-between mb-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-primary">직군별 작성 가이드</h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono-badge text-mono-badge text-primary">F-66</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-space-sm">
            <span className="px-2 py-0.5 rounded bg-secondary-container text-white font-mono-badge text-mono-badge">{jt}</span>
            {guide&&<span className="px-2 py-0.5 rounded bg-surface-container text-slate-muted font-mono-badge text-mono-badge">문항 유형: {guide.qt}</span>}
          </div>
          {guide?<>
            <p className="font-label-caps text-label-caps text-slate-muted mb-2">문장 프레임 — [ ]를 직접 채우는 형태입니다</p>
            <div className="p-space-sm rounded-lg bg-paper-bg font-body-sm text-body-sm leading-relaxed whitespace-pre-wrap mb-space-sm">{guide.g.f}</div>
            <button onClick={()=>insertFrame(curItem)} className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-surface-container-high text-primary font-label-caps text-label-caps font-semibold hover:bg-surface-variant transition-colors mb-space-md" type="button">
              <span className="material-symbols-outlined text-base">post_add</span>본문에 프레임 삽입
            </button>
            <h3 className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider mb-1.5">체크 포인트</h3>
            <ul className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
              {guide.g.c.map((x:string)=><li key={x} className="flex items-start gap-1.5"><span className="material-symbols-outlined text-sm text-match-green mt-0.5">check_small</span>{x}</li>)}
            </ul>
            <p className="mt-space-md font-label-caps text-label-caps text-slate-muted leading-relaxed">문항 제목·본문 키워드로 유형 자동 판정 · 공고 직군 태그로 직군 자동 선택 · 생성형 AI 없는 규칙 기반 가이드</p>
          </>:<p className="font-body-sm text-body-sm text-slate-muted">문항을 추가하면 가이드가 표시됩니다</p>}
        </div>
      </div>
    </div>
    :<div className="bg-surface rounded-xl p-space-lg text-center text-slate-muted font-body-sm">자소서를 선택하세요</div>}

    {/* 하단: 키워드 히트맵 스트립 */}
    {result&&result.ok&&<div className="bg-surface rounded-xl p-space-lg shadow-sm">
      <div className="flex items-center justify-between mb-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-primary">공고 요구 키워드 히트맵 <span className="font-label-caps text-label-caps text-slate-muted font-normal">— 단어 경계 매칭: "Java" ≠ "JavaScript" (F-17)</span></h2>
        <span className="font-label-caps text-label-caps text-slate-muted hidden sm:block">범례: 회색=미출현 / 초록=1회 이상</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {result.hm.map((h:Any)=>
          <span key={h.kw} className={"px-2.5 py-1 rounded-full font-mono-badge text-mono-badge font-semibold "+(h.n>0?'bg-match-green/10 text-match-green':'bg-paper-bg text-slate-muted')}>
            {h.kw} ×{h.n}
          </span>)}
      </div>
    </div>}
  </div>
}
