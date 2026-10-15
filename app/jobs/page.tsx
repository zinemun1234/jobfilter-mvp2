'use client'
import Link from 'next/link'
import {useMemo,useState} from 'react'
import {useStore} from '@/lib/store'
import {dday,matchScore,visibleListings,classify,Any} from '@/lib/logic'
import {Ring,DdayChip} from '@/components/ui'

const PER=7
const CAREERS=['전체','신입','경력무관','경력']
const TYPES=['전체','정규직','계약직','인턴']
const STACKS=['Java','Spring','Spring Boot','MySQL','Redis','Kafka','Docker','Kubernetes','AWS','React','TypeScript','Python','C++','Node.js','SQL']
const chip=(on:boolean)=>"px-2.5 py-1 rounded-full font-body-sm text-body-sm transition-colors "+(on?"bg-primary-container text-on-primary font-medium shadow-sm":"text-slate-muted hover:bg-paper-bg")

export default function JobsPage(){
  const {S,update,toast}=useStore()
  const [q,setQ]=useState('')
  const [sort,setSort]=useState('match')
  const [fc,setFc]=useState('전체')
  const [ft,setFt]=useState('전체')
  const [stacks,setStacks]=useState<string[]>([])
  const [page,setPage]=useState(1)

  const all=visibleListings(S)
  const csCount=all.filter((l:Any)=>classify(l).isCS).length
  const urgent=all.filter((l:Any)=>{const d=dday(l.deadline);return d>=0&&d<=3}).length

  const list=useMemo(()=>{
    let r=all.map((l:Any)=>({l,m:matchScore(S.profile,l)}))
    if(q.trim()){const qq=q.trim().toLowerCase();r=r.filter((x:Any)=>(x.l.company+x.l.position+x.l.skills.join(' ')+x.l.tags.join(' ')).toLowerCase().includes(qq))}
    if(fc!=='전체') r=r.filter((x:Any)=>(x.l.career||'').includes(fc))
    if(ft!=='전체') r=r.filter((x:Any)=>(x.l.type||'').includes(ft))
    if(stacks.length) r=r.filter((x:Any)=>stacks.every(s=>x.l.skills.join(' ').toLowerCase().includes(s.toLowerCase())))
    if(sort==='match') r.sort((a:Any,b:Any)=>b.m.score-a.m.score)
    else if(sort==='dday') r.sort((a:Any,b:Any)=>dday(a.l.deadline)-dday(b.l.deadline))
    else r.sort((a:Any,b:Any)=>b.l.id.localeCompare(a.l.id))
    return r
  },[all,q,sort,fc,ft,stacks,S.profile])
  const pages=Math.max(1,Math.ceil(list.length/PER))
  const pg=Math.min(page,pages)
  const view=list.slice((pg-1)*PER,pg*PER)
  const toggleStack=(s:string)=>{setStacks(v=>v.includes(s)?v.filter(x=>x!==s):[...v,s]);setPage(1)}
  const toggleBookmark=(id:string)=>update(d=>{const i=d.bookmarks.indexOf(id);i<0?d.bookmarks.push(id):d.bookmarks.splice(i,1)})

  return <div className="flex flex-col gap-space-md">
    {/* 타이틀 + 통계 스트립 */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div>
        <div className="flex items-center gap-space-sm">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">공고 목록</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-mono-badge font-mono-badge bg-surface-container text-primary font-semibold">F-11</span>
        </div>
        <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">컴퓨터공학과 학생 맞춤 기술 스택 필터링 및 규칙 기반 적합도 분석 공고</p>
      </div>
      <div className="flex items-center gap-space-sm bg-surface p-1.5 rounded-xl shadow-sm self-start md:self-auto">
        <div className="px-space-md py-1 flex flex-col"><span className="font-label-caps text-label-caps text-slate-muted">총 공고</span><span className="font-mono-metric text-mono-metric text-ink-charcoal font-bold">{all.length}건</span></div>
        <div className="w-px h-6 bg-hairline-border"/>
        <div className="px-space-md py-1 flex flex-col"><span className="font-label-caps text-label-caps text-slate-muted">CS 맞춤 추천</span><span className="font-mono-metric text-mono-metric text-match-green font-bold">{csCount}건</span></div>
        <div className="w-px h-6 bg-hairline-border"/>
        <div className="px-space-md py-1 flex flex-col"><span className="font-label-caps text-label-caps text-slate-muted">마감 임박 (D-3)</span><span className="font-mono-metric text-mono-metric text-alert-red font-bold">{urgent}건</span></div>
      </div>
    </div>

    {/* 검색·필터 모듈 */}
    <div className="flex flex-col bg-surface rounded-xl shadow-sm overflow-hidden">
      <div className="p-space-md flex flex-col lg:flex-row items-center justify-between gap-space-md bg-surface-container-lowest">
        <div className="relative w-full lg:max-w-2xl flex items-center">
          <span className="material-symbols-outlined absolute left-space-md text-slate-muted text-xl pointer-events-none">search</span>
          <input className="w-full pl-11 pr-28 py-2.5 bg-paper-bg rounded-lg text-ink-charcoal placeholder:text-slate-muted font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low transition-all" placeholder="기업명, 직무, 기술 스택 검색 (예: Java, Spring, 백엔드)..." type="text" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}}/>
          <button className="absolute right-2 px-space-md py-1.5 bg-primary-container text-on-primary rounded-lg font-label-caps text-label-caps shadow-sm hover:bg-secondary transition-colors" type="button">검색</button>
        </div>
        <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-space-md">
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-slate-muted">총 <span className="font-mono-metric text-mono-metric text-primary font-bold">{list.length}</span>건의 맞춤 공고</div>
          <div className="w-px h-4 bg-hairline-border hidden sm:block"/>
          <div className="flex items-center gap-1 bg-paper-bg p-1 rounded-lg">
            {[['match','매칭순'],['dday','마감순'],['new','최신순']].map(([k,n])=>
              <button key={k} onClick={()=>setSort(k)} className={"px-space-md py-1 rounded font-label-caps text-label-caps transition-all "+(sort===k?"bg-surface text-primary shadow-sm font-bold":"text-slate-muted hover:text-ink-charcoal")} type="button">{n}</button>)}
          </div>
        </div>
      </div>
      <div className="p-space-md flex flex-col gap-space-sm bg-surface">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center text-body-sm">
          <span className="md:col-span-1 font-label-caps text-label-caps text-slate-muted font-semibold">경력 구분</span>
          <div className="md:col-span-5 flex flex-wrap gap-1.5">
            {CAREERS.map(c=><button key={c} onClick={()=>{setFc(c);setPage(1)}} className={chip(fc===c)} type="button">{c}</button>)}
          </div>
          <span className="md:col-span-1 font-label-caps text-label-caps text-slate-muted font-semibold">고용 형태</span>
          <div className="md:col-span-5 flex flex-wrap gap-1.5">
            {TYPES.map(t=><button key={t} onClick={()=>{setFt(t);setPage(1)}} className={chip(ft===t)} type="button">{t}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-start text-body-sm pt-1">
          <span className="md:col-span-1 font-label-caps text-label-caps text-slate-muted font-semibold pt-1">기술 스택</span>
          <div className="md:col-span-11 flex flex-wrap gap-1.5 items-center">
            {STACKS.map(s=>stacks.includes(s)
              ?<span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-mono-metric text-mono-metric font-semibold shadow-xs">{s}<span className="material-symbols-outlined text-xs cursor-pointer" onClick={()=>toggleStack(s)}>close</span></span>
              :<button key={s} onClick={()=>toggleStack(s)} className="px-2.5 py-1 rounded-full bg-paper-bg text-ink-charcoal hover:bg-surface-container-high font-mono-metric text-mono-metric" type="button">{s}</button>)}
          </div>
        </div>
      </div>
      {(fc!=='전체'||ft!=='전체'||stacks.length>0||q)&&<div className="px-space-md py-2.5 bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="font-label-caps text-label-caps text-slate-muted uppercase mr-1">적용 필터:</span>
          {fc!=='전체'&&<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface text-ink-charcoal shadow-xs font-body-sm text-body-sm font-medium">{fc}</span>}
          {ft!=='전체'&&<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface text-ink-charcoal shadow-xs font-body-sm text-body-sm font-medium">{ft}</span>}
          {stacks.map(s=><span key={s} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface text-ink-charcoal shadow-xs font-body-sm text-body-sm font-medium">{s}</span>)}
          {q&&<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface text-ink-charcoal shadow-xs font-body-sm text-body-sm font-medium">"{q}"</span>}
        </div>
        <button onClick={()=>{setQ('');setFc('전체');setFt('전체');setStacks([]);setPage(1)}} className="font-label-caps text-label-caps text-alert-red hover:underline flex items-center gap-0.5" type="button">
          <span className="material-symbols-outlined text-sm">restart_alt</span>필터 초기화
        </button>
      </div>}
    </div>

    {/* 공고 카드 리스트 */}
    <div className="flex flex-col gap-space-md">
      {view.map(({l,m}:Any)=>{
        const d=dday(l.deadline), bm=S.bookmarks.includes(l.id)
        return <div key={l.id} className="p-space-lg bg-surface rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-lg group">
          <div className="flex items-start gap-space-md w-full xl:w-7/12">
            <div className="w-14 h-14 rounded-xl bg-match-green/10 flex items-center justify-center shrink-0 shadow-xs">
              <span className="font-headline-md text-headline-md font-black text-match-green">{l.company[0]}</span>
            </div>
            <div className="flex flex-col gap-1.5 w-full min-w-0">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="font-label-caps text-label-caps text-primary font-bold">{l.company}</span>
                <span className="text-hairline-border text-xs">•</span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-caps text-label-caps font-semibold">{l.type} {l.career}</span>
                <span className="text-hairline-border text-xs">•</span>
                <span className="font-body-sm text-body-sm text-slate-muted">{l.loc}</span>
              </div>
              <Link className="font-headline-md text-headline-md text-ink-charcoal hover:text-secondary font-bold tracking-tight truncate transition-colors" href={'/jobs/'+l.id}>{l.position}</Link>
              <p className="font-body-sm text-body-sm text-slate-muted line-clamp-1">{l.desc}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {m.hit.map((s:string)=><span key={s} className="px-2 py-0.5 rounded-full bg-match-green/10 text-match-green font-mono-badge text-mono-badge font-semibold">✓ {s}</span>)}
                {m.miss.map((s:string)=><span key={s} className="px-2 py-0.5 rounded-full bg-paper-bg text-ink-charcoal font-mono-badge text-mono-badge">{s}</span>)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between xl:justify-end gap-space-lg w-full xl:w-5/12 pt-space-sm xl:pt-0">
            <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-2 rounded-xl">
              <Ring sc={m.score}/>
              <div className="flex flex-col">
                <span className={"font-label-caps text-label-caps font-bold "+(m.score>=70?'text-match-green':m.score>=45?'text-amber-warning':'text-slate-muted')}>{m.score>=70?'초근접 최적 매칭':m.score>=45?'적합 매칭':'도전 매칭'}</span>
                <span className="font-body-sm text-body-sm text-slate-muted">스택 {m.hit.length}/{l.skills.length} 보유</span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="flex flex-col items-end">
                <DdayChip d={d}/>
                <span className="font-label-caps text-label-caps text-slate-muted mt-0.5">{l.deadline} 마감</span>
              </div>
              <div className="flex items-center gap-1.5 pl-2">
                <button onClick={()=>{toggleBookmark(l.id);toast(bm?'스크랩 해제':'스크랩 저장')}} className={"p-2 rounded-lg transition-colors "+(bm?'text-amber-warning':'text-slate-muted hover:text-amber-warning hover:bg-surface-container')} title="공고 스크랩" type="button">
                  <span className="material-symbols-outlined text-xl">{bm?'bookmark':'bookmark_border'}</span>
                </button>
                <Link href={'/jobs/'+l.id} className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary hover:bg-secondary font-label-caps text-label-caps font-semibold shadow-sm transition-colors whitespace-nowrap">상세보기</Link>
              </div>
            </div>
          </div>
        </div>})}
      {!view.length&&<div className="p-space-lg bg-surface rounded-xl text-center text-slate-muted font-body-sm">조건에 맞는 공고가 없습니다</div>}
    </div>

    {/* 페이지네이션 */}
    <div className="flex items-center justify-between bg-surface px-space-lg py-space-md rounded-xl shadow-sm">
      <div className="font-body-sm text-body-sm text-slate-muted hidden sm:block">
        {list.length}개 공고 중 <span className="font-mono-metric text-mono-metric font-bold text-ink-charcoal">{(pg-1)*PER+1} - {Math.min(pg*PER,list.length)}</span> 표시 중
      </div>
      <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={pg===1} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-muted hover:bg-paper-bg disabled:opacity-40 transition-colors" type="button"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
        {Array.from({length:pages},(_,i)=>i+1).slice(0,7).map(p=>
          <button key={p} onClick={()=>setPage(p)} className={"w-8 h-8 rounded-lg font-mono-metric text-mono-metric transition-colors "+(p===pg?"bg-primary-container text-on-primary font-bold shadow-sm":"text-ink-charcoal hover:bg-paper-bg")} type="button">{p}</button>)}
        <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={pg===pages} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-charcoal hover:bg-paper-bg disabled:opacity-40 transition-colors" type="button"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <span className="font-label-caps text-label-caps text-slate-muted">페이지 당:</span>
        <span className="bg-paper-bg text-ink-charcoal text-body-sm font-body-sm rounded-lg px-2 py-1">{PER}개씩</span>
      </div>
    </div>
  </div>
}
