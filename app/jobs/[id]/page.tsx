'use client'
import Link from 'next/link'
import {useParams,useRouter} from 'next/navigation'
import {useStore} from '@/lib/store'
import {dday,matchScore,listingById,uid,today,STATUS_NAME,visibleListings,Any} from '@/lib/logic'
import {Ring,DdayChip} from '@/components/ui'

export default function JobDetailPage(){
  const {S,update,toast,setClSel,setClJob}=useStore()
  const params=useParams(); const router=useRouter()
  const id=String(params?.id||'')
  const l=listingById(S,id)
  if(!l) return <div className="bg-surface rounded-xl p-space-lg text-slate-muted text-center">공고를 찾을 수 없습니다</div>
  const m=matchScore(S.profile,l), d=dday(l.deadline), bm=S.bookmarks.includes(l.id)
  const applied=S.postings.find((p:Any)=>p.listingId===l.id)
  const similar=visibleListings(S).filter((x:Any)=>x.id!==l.id&&(x.tags||[]).some((t:string)=>(l.tags||[]).includes(t))).slice(0,2)

  const toggleBm=()=>{update(d2=>{const i=d2.bookmarks.indexOf(l.id);i<0?d2.bookmarks.push(l.id):d2.bookmarks.splice(i,1)});toast(bm?'스크랩 해제':'스크랩했습니다')}
  const applyJob=()=>{
    if(applied) return router.push('/board')
    update(d2=>{d2.postings.push({id:uid(d2,'P'),listingId:l.id,status:'PREPARING',history:[{s:'PREPARING',at:today()}]})})
    toast('칸반에 "서류 준비 중"으로 등록됐습니다');router.push('/board')
  }
  const newCoverFor=()=>{
    const nid='C'+(S.seq+1)
    update(d2=>{d2.coverLetters.push({id:uid(d2,'C'),title:l.company+' '+l.position+' 지원 자소서',items:[{q:'지원 동기',text:''},{q:'직무 역량',text:''}],versions:[],score:null})})
    setClSel(nid);setClJob(l.id);router.push('/cover')
  }
  const bars=[[ '필수 기술 스택 일치도 ('+l.skills.join(', ')+')', m.parts.skill ],
              ['희망 직무·태그 적합도 ('+S.profile.targetJob+')', m.parts.job ],
              ['경력 조건 부합도 ('+l.career+')', m.parts.career ],
              ['마감 여유도 (D-'+d+')', m.parts.deadline ]]

  return <div className="flex flex-col gap-space-md">
    {/* 브레드크럼 */}
    <nav className="flex items-center gap-1 font-label-caps text-label-caps text-slate-muted">
      <Link href="/jobs" className="flex items-center gap-1 hover:text-primary"><span className="material-symbols-outlined text-base">arrow_back</span>공고 목록</Link>
      <span className="material-symbols-outlined text-sm">chevron_right</span><span className="text-primary">공고 상세</span>
    </nav>

    {/* 스티키 헤더 카드 */}
    <div className="bg-surface rounded-xl p-space-lg shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
      <div className="flex items-start gap-space-md">
        <div className="w-14 h-14 rounded-lg bg-primary-container flex items-center justify-center text-white shrink-0 shadow-sm">
          <span className="font-headline-lg text-headline-lg font-black tracking-tighter">{l.company[0]}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">{l.company}</span>
            <span className="px-2 py-0.5 rounded bg-surface-container font-mono-badge text-mono-badge text-primary">공고 {l.id}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{l.position}</h1>
          <div className="flex flex-wrap items-center gap-space-xs mt-1">
            <span className="px-2.5 py-1 rounded bg-surface-container-high text-primary font-label-caps text-label-caps">{l.type} {l.career}</span>
            <span className="px-2.5 py-1 rounded bg-surface-container text-slate-muted font-body-sm text-body-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span> {l.loc}
            </span>
            <span className={"px-2.5 py-1 rounded font-mono-metric text-mono-metric font-semibold flex items-center gap-1 "+(d<=3?'bg-red-50 text-alert-red':'bg-surface-container text-slate-muted')}>
              <span className="material-symbols-outlined text-sm">alarm</span> 마감 D-{d} ({l.deadline} 마감)
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-space-xs xl:justify-end shrink-0">
        <button onClick={toggleBm} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors font-body-sm text-body-sm" type="button">
          <span className={"material-symbols-outlined text-lg "+(bm?'text-amber-warning':'text-slate-muted')}>{bm?'bookmark':'bookmark_border'}</span>
          <span className="font-medium">{bm?'스크랩됨':'스크랩'}</span>
        </button>
        <button onClick={applyJob} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant text-primary font-body-sm text-body-sm font-semibold transition-colors" type="button">
          <span className="material-symbols-outlined text-lg text-secondary">view_kanban</span>
          <span>{applied?'칸반으로 이동':'지원 관리 칸반에 등록'}</span>
        </button>
        <button onClick={newCoverFor} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary-container hover:bg-secondary text-white font-body-sm text-body-sm font-semibold shadow-sm transition-colors" type="button">
          <span className="material-symbols-outlined text-lg">edit_note</span><span>자소서 코칭으로 이동</span>
        </button>
        <a className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-white font-headline-sm text-headline-sm shadow-sm transition-colors" href={l.link||'https://www.jobkorea.co.kr'} rel="noopener noreferrer" target="_blank">
          <span>원문 공고 즉시 지원</span><span className="material-symbols-outlined text-base">north_east</span>
        </a>
      </div>
    </div>

    {applied&&<div className="flex items-center gap-2 px-space-md py-2.5 rounded-xl bg-surface-container-low border-l-4 border-info-blue text-body-sm font-body-sm">
      <span className="material-symbols-outlined text-info-blue text-lg">info</span>
      이미 지원 관리 보드에 등록된 공고입니다 — 현재 상태 <b>{STATUS_NAME[applied.status]}</b>
    </div>}

    {/* 2열 그리드 */}
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md">
      {/* 좌측: 공고 내용 */}
      <div className="xl:col-span-7 flex flex-col gap-space-md">
        <div className="bg-surface rounded-xl p-space-lg shadow-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-space-sm">공고 개요</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-space-sm text-center">
            {[['근무지',l.loc],['경력',l.career],['고용형태',l.type],['연봉',l.salary],['마감일',l.deadline]].map(([k,v])=>
              <div key={k} className="bg-paper-bg rounded-lg p-space-sm"><div className="font-label-caps text-label-caps text-slate-muted">{k}</div><div className="font-body-sm text-body-sm font-semibold mt-0.5">{v}</div></div>)}
          </div>
        </div>
        <div className="bg-surface rounded-xl p-space-lg shadow-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-space-sm">포지션 소개 및 담당 업무</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{l.desc}</p>
          <div className="flex flex-wrap gap-1.5 mt-space-sm">{(l.tags||[]).map((t:string)=><span key={t} className="px-2 py-0.5 rounded-full bg-surface-container font-mono-badge text-mono-badge text-primary">#{t}</span>)}</div>
        </div>
        <div className="bg-surface rounded-xl p-space-lg shadow-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-space-sm">요구 기술 스택</h2>
          <div className="flex flex-wrap gap-1.5">
            {m.hit.map((s:string)=><span key={s} className="px-2 py-1 rounded bg-match-green/10 text-match-green font-mono-badge text-mono-badge font-semibold">✓ {s} 보유</span>)}
            {m.miss.map((s:string)=><span key={s} className="px-2 py-1 rounded bg-error-container/50 text-alert-red font-mono-badge text-mono-badge">✗ {s} 부족</span>)}
          </div>
        </div>
        <div className="bg-surface rounded-xl p-space-lg shadow-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-space-sm">전형 절차</h2>
          <ol className="flex flex-col gap-space-sm">
            {['서류 접수 (온라인)','서류 전형','1차 기술 면접','2차 임원 면접','최종 합격·처우 협의'].map((s,i)=>
              <li key={s} className="flex items-center gap-space-sm">
                <span className={"w-7 h-7 rounded-full flex items-center justify-center font-mono-metric text-mono-metric font-bold shrink-0 "+(i===0?'bg-primary-container text-white':'bg-surface-container text-primary')}>{i+1}</span>
                <span className="font-body-sm text-body-sm">{s}</span>
              </li>)}
          </ol>
        </div>
      </div>

      {/* 우측: 매칭 분석 */}
      <div className="xl:col-span-5 flex flex-col gap-space-md">
        <div className="bg-surface rounded-xl p-space-lg shadow-sm border-t-4 border-match-green">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider">프로필 매칭 정밀 분석</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono-badge text-mono-badge text-primary">규칙 기반</span>
          </div>
          <div className="flex items-center gap-space-lg mb-space-lg">
            <Ring sc={m.score} size={96}/>
            <div className="flex flex-col">
              <span className="font-headline-lg text-headline-lg text-primary">{m.score}점</span>
              <span className="font-body-sm text-body-sm text-slate-muted">{S.profile.name} 님의 프로필과 비교한 종합 적합도</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 mb-space-lg">
            {bars.map(([label,v]:Any)=>
              <div key={label}>
                <div className="flex items-center justify-between font-label-caps text-label-caps mb-1">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className={"font-mono-metric text-mono-metric font-bold "+(v>=70?'text-match-green':v>=45?'text-amber-warning':'text-alert-red')}>{v}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-variant overflow-hidden">
                  <div className={"h-full rounded-full "+(v>=70?'bg-match-green':v>=45?'bg-amber-warning':'bg-alert-red')} style={{width:v+'%'}}/>
                </div>
              </div>)}
          </div>
          <h3 className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider mb-2">요구 기술 vs 내 스택</h3>
          <div className="flex flex-col gap-1">
            {l.skills.map((s:string)=>{
              const mine=S.profile.skills.map((x:string)=>x.toLowerCase()).includes(s.toLowerCase())
              return <div key={s} className="flex items-center justify-between px-space-sm py-1.5 rounded-lg hover:bg-paper-bg">
                <span className="font-mono-metric text-mono-metric">{s}</span>
                <span className={"inline-flex items-center gap-1 font-label-caps text-label-caps font-semibold "+(mine?'text-match-green':'text-alert-red')}>
                  <span className="material-symbols-outlined text-sm">{mine?'check_circle':'cancel'}</span>{mine?'보유':'미보유'}
                </span>
              </div>})}
          </div>
        </div>
        {m.miss.length>0&&<div className="bg-surface rounded-xl p-space-lg shadow-sm border-l-4 border-amber-warning">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-space-sm">지원 전략 코칭</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">부족 역량 <b>{m.miss.join(', ')}</b>은 자소서에서 유사 경험과 학습 계획으로 보완하세요. 자소서 코칭의 가이드(F-66)가 문항별 문장 프레임을 제공합니다.</p>
        </div>}
        {similar.length>0&&<div className="bg-surface rounded-xl p-space-lg shadow-sm">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-space-sm">유사 추천 공고</h3>
          <div className="flex flex-col gap-space-sm">
            {similar.map((x:Any)=>{const sm=matchScore(S.profile,x);return <Link key={x.id} href={'/jobs/'+x.id} className="flex items-center justify-between p-space-sm rounded-lg border border-hairline-border hover:border-secondary hover:shadow-sm transition-all">
              <div className="flex items-center gap-space-sm min-w-0">
                <span className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center font-headline-sm text-primary font-bold shrink-0">{x.company[0]}</span>
                <div className="min-w-0"><div className="font-body-sm text-body-sm font-semibold truncate">{x.position}</div><div className="font-label-caps text-label-caps text-slate-muted">{x.company} · D-{dday(x.deadline)}</div></div>
              </div>
              <Ring sc={sm.score} size={40}/>
            </Link>})}
          </div>
        </div>}
      </div>
    </div>
  </div>
}
