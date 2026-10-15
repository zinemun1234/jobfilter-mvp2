'use client'
import Link from 'next/link'
import {useStore} from '@/lib/store'
import {dday,matchScore,visibleListings,STATUS_NAME,Any} from '@/lib/logic'
import {Ring,DdayChip,SkillChip} from '@/components/ui'

export default function DashPage(){
  const {S}=useStore()
  const open=visibleListings(S).filter((l:Any)=>dday(l.deadline)>=0)
  const urg=open.filter((l:Any)=>dday(l.deadline)<=7).sort((a:Any,b:Any)=>dday(a.deadline)-dday(b.deadline))
  const rec=open.map((l:Any)=>({l,m:matchScore(S.profile,l)})).sort((a:Any,b:Any)=>b.m.score-a.m.score).slice(0,4)
  const doing=S.postings.filter((p:Any)=>!['FINAL_PASS','REJECTED'].includes(p.status))
  const prep=doing.filter((p:Any)=>p.status==='PREPARING').length
  const iv=doing.filter((p:Any)=>p.status==='INTERVIEW').length
  const passed=S.postings.filter((p:Any)=>['DOC_PASS','INTERVIEW','FINAL_PASS'].includes(p.status))
  const passRate=S.postings.length?Math.round(passed.length/S.postings.length*100):0
  const d2=urg.filter((l:Any)=>dday(l.deadline)<=2).length
  const avgSc=open.length?Math.round(open.reduce((a:Any,l:Any)=>a+matchScore(S.profile,l).score,0)/open.length):0
  const timeline=[...S.postings].flatMap((p:Any)=>(p.history||[]).map((h:Any)=>({...h,listing:S.listings.find((l:Any)=>l.id===p.listingId)}))).sort((a:Any,b:Any)=>(b.at||'').localeCompare(a.at||'')).slice(0,4)
  const companyOf=(p:Any)=>S.listings.find((l:Any)=>l.id===p.listingId)?.company||''

  return <div className="flex flex-col w-full gap-space-lg">
    {/* 헤더 배너 */}
    <section className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface p-space-lg rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)]">
      <div className="flex items-start gap-space-md">
        <div className="w-1.5 h-12 bg-primary rounded-full hidden sm:block"/>
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">학생 대시보드</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-mono-badge font-mono-badge bg-surface-container text-primary font-semibold">F-10</span>
          </div>
          <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">{S.profile.major} · 희망직군 {S.profile.targetJob} · 맞춤 채용 현황 요약</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-space-md">
        <div className="flex items-center gap-1.5 text-slate-muted font-mono-metric text-mono-metric bg-surface-container-low px-space-md py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-match-green animate-pulse"/>
          <span>실시간 로컬 데이터 동기화</span>
        </div>
        <Link href="/profile" className="inline-flex items-center gap-space-xs px-space-md py-2 bg-primary-container text-on-primary rounded-lg font-headline-sm text-headline-sm hover:bg-primary transition-colors shadow-sm">
          <span className="material-symbols-outlined text-base">sync</span>
          <span>이력서·희망직무 업데이트</span>
        </Link>
      </div>
    </section>

    {/* 상단 지표 4개 */}
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      <div className="flex flex-col justify-between p-space-lg bg-surface rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)] transition-all hover:shadow-[0_4px_12px_rgba(20,57,107,0.08)]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider">지원 진행 중</span>
          <span className="p-1.5 rounded-lg bg-surface-container text-secondary"><span className="material-symbols-outlined text-lg">hourglass_top</span></span>
        </div>
        <div className="my-space-sm flex items-baseline gap-space-sm">
          <span className="font-headline-lg text-headline-lg text-ink-charcoal tracking-tight font-extrabold">{doing.length}건</span>
          <span className="font-body-sm text-body-sm text-slate-muted">(서류 준비 {prep}, 면접 대기 {iv})</span>
        </div>
        <div className="flex items-center gap-1 text-match-green font-mono-metric text-mono-metric">
          <span className="material-symbols-outlined text-sm">trending_up</span><span>칸반보드에서 상태 관리</span>
        </div>
      </div>
      <div className="flex flex-col justify-between p-space-lg bg-surface rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)] transition-all hover:shadow-[0_4px_12px_rgba(20,57,107,0.08)]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider">서류 합격</span>
          <span className="p-1.5 rounded-lg bg-surface-container text-match-green"><span className="material-symbols-outlined text-lg">task_alt</span></span>
        </div>
        <div className="my-space-sm flex items-baseline gap-space-sm">
          <span className="font-headline-lg text-headline-lg text-match-green tracking-tight font-extrabold">{passed.length}건</span>
          <span className="font-body-sm text-body-sm text-slate-muted">합격률 {passRate}%</span>
        </div>
        <div className="font-body-sm text-body-sm text-slate-muted truncate">{passed.slice(0,3).map(companyOf).join(', ')||'아직 없음'}</div>
      </div>
      <div className="flex flex-col justify-between p-space-lg bg-surface rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)] transition-all hover:shadow-[0_4px_12px_rgba(20,57,107,0.08)]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps text-alert-red font-semibold uppercase tracking-wider">이번 주 마감</span>
          <span className="p-1.5 rounded-lg bg-error-container text-alert-red"><span className="material-symbols-outlined text-lg">alarm</span></span>
        </div>
        <div className="my-space-sm flex items-baseline gap-space-sm">
          <span className="font-headline-lg text-headline-lg text-alert-red tracking-tight font-extrabold">{urg.length}건</span>
          {d2>0&&<span className="px-2 py-0.5 rounded-full bg-error-container text-alert-red font-label-caps text-label-caps font-bold">D-2 임박 {d2}건 포함</span>}
        </div>
        <div className="font-body-sm text-body-sm text-alert-red font-medium">서류 제출 기한 점검 필수</div>
      </div>
      <div className="flex flex-col justify-between p-space-lg bg-surface rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)] transition-all hover:shadow-[0_4px_12px_rgba(20,57,107,0.08)]">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider">평균 매칭 점수</span>
          <span className="p-1.5 rounded-lg bg-surface-container text-secondary"><span className="material-symbols-outlined text-lg">auto_graph</span></span>
        </div>
        <div className="my-space-sm flex items-baseline gap-space-sm">
          <span className="font-headline-lg text-headline-lg text-primary tracking-tight font-extrabold">{avgSc}점</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-match-green font-mono-badge text-mono-badge font-bold">가중치 기반</span>
        </div>
        <div className="font-body-sm text-body-sm text-slate-muted">보유 기술스택 기반 캘리브레이션</div>
      </div>
    </section>

    {/* 2단 그리드 */}
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
      {/* 마감 임박 */}
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between bg-surface px-space-lg py-space-md rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)]">
          <div className="flex items-center gap-space-sm">
            <span className="p-1 rounded bg-error-container text-alert-red"><span className="material-symbols-outlined text-base">timer</span></span>
            <h2 className="font-headline-md text-headline-md text-ink-charcoal">마감 임박 공고</h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono-badge text-mono-badge">{urg.length}건</span>
          </div>
          <Link className="text-secondary font-headline-sm text-headline-sm hover:underline flex items-center" href="/jobs">
            <span>전체보기</span><span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
        {urg.slice(0,4).map((l:Any)=>{
          const d=dday(l.deadline), m=matchScore(S.profile,l)
          const applied=S.postings.find((p:Any)=>p.listingId===l.id)
          return <div key={l.id} className="p-space-lg bg-surface rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)] hover:shadow-[0_4px_12px_rgba(20,57,107,0.08)] transition-all flex flex-col gap-space-sm relative overflow-hidden group">
            <div className={"absolute top-0 left-0 bottom-0 w-1 "+(d<=2?'bg-alert-red':'bg-amber-warning')}/>
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-sm mb-1">
                  <span className="font-headline-sm text-headline-sm text-ink-charcoal font-bold">{l.company}</span>
                  <DdayChip d={d}/>
                  <span className="font-mono-metric text-mono-metric text-slate-muted">{l.deadline} 마감</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary font-semibold truncate group-hover:text-secondary transition-colors">{l.position}</h3>
              </div>
              <div className="flex flex-col items-center justify-center shrink-0">
                <Ring sc={m.score}/>
                <span className="font-mono-badge text-mono-badge text-slate-muted mt-0.5">매칭도</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {l.skills.map((s:string)=><SkillChip key={s} s={s}/>)}
              <span className="px-2 py-1 rounded bg-surface-container-low font-mono-badge text-mono-badge text-slate-muted">{l.loc}</span>
            </div>
            <div className="flex items-center justify-between pt-space-xs mt-space-xs bg-surface-bright p-space-sm rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-muted font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-sm text-amber-warning">warning</span>
                <span>{applied?STATUS_NAME[applied.status]+' 상태 — 마감 전 확인':'미지원 — 마감 전 지원서 작성 필요'}</span>
              </div>
              <Link href={'/jobs/'+l.id} className="px-space-md py-1 bg-primary text-on-primary rounded text-label-caps font-label-caps hover:bg-secondary transition-colors">지원서 작성</Link>
            </div>
          </div>})}
        {!urg.length&&<div className="p-space-lg bg-surface rounded-[10px] text-center text-slate-muted font-body-sm">임박 공고 없음</div>}
      </div>
      {/* 맞춤 추천 */}
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between bg-surface px-space-lg py-space-md rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)]">
          <div className="flex items-center gap-space-sm">
            <span className="p-1 rounded bg-surface-container text-secondary"><span className="material-symbols-outlined text-base">recommend</span></span>
            <h2 className="font-headline-md text-headline-md text-ink-charcoal">맞춤 추천 공고</h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono-badge text-mono-badge">규칙 기반 매칭</span>
          </div>
        </div>
        {rec.map(({l,m}:Any)=>{
          const d=dday(l.deadline)
          return <div key={l.id} className="p-space-lg bg-surface rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)] hover:shadow-[0_4px_12px_rgba(20,57,107,0.08)] transition-all flex flex-col gap-space-sm group">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-start gap-space-md">
                <div className="w-10 h-10 rounded-lg bg-match-green/10 text-match-green flex items-center justify-center font-bold text-headline-md shrink-0">{l.company[0]}</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-sm mb-1">
                    <span className="font-headline-sm text-headline-sm text-ink-charcoal font-bold">{l.company}</span>
                    <DdayChip d={d}/>
                    <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-label-caps text-label-caps">{l.type}</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary font-semibold group-hover:text-secondary transition-colors">{l.position}</h3>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center shrink-0">
                <Ring sc={m.score}/>
                <span className="font-mono-badge text-mono-badge text-match-green font-semibold mt-0.5">{m.score>=70?'초근접 매칭':'매칭도'}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {m.hit.map((s:string)=><SkillChip key={s} s={s} hit/>)}
              {m.miss.map((s:string)=><SkillChip key={s} s={s} hit={false}/>)}
            </div>
            <div className="flex items-center justify-between pt-space-xs mt-space-xs border-t border-hairline-border">
              <span className="font-body-sm text-body-sm text-slate-muted">보유 {m.hit.length} · 부족 {m.miss.length} 스킬 매핑</span>
              <Link href={'/jobs/'+l.id} className="px-space-md py-1.5 bg-primary-container text-on-primary rounded-lg text-headline-sm font-headline-sm hover:bg-primary transition-colors">상세보기</Link>
            </div>
          </div>})}
      </div>
    </section>

    {/* 타임라인 */}
    <section className="flex flex-col bg-surface p-space-lg rounded-[10px] shadow-[0_1px_3px_rgba(20,57,107,0.04)] gap-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <span className="p-1 rounded bg-surface-container text-secondary"><span className="material-symbols-outlined text-base">history_toggle_off</span></span>
          <h2 className="font-headline-md text-headline-md text-ink-charcoal">최근 지원 활동 타임라인</h2>
          <span className="font-mono-badge text-mono-badge text-slate-muted">[F-10 실시간 추적]</span>
        </div>
        <Link className="font-headline-sm text-headline-sm text-secondary hover:underline flex items-center" href="/board">
          <span>지원 관리 칸반보드로 이동</span><span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-xs">
        {timeline.map((h:Any,i:number)=>{
          const ok=['DOC_PASS','FINAL_PASS'].includes(h.s), info=h.s==='APPLIED'
          return <div key={i} className="relative flex flex-col p-space-md bg-paper-bg rounded-lg hover:bg-surface-container-high transition-colors">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-mono-badge text-mono-badge text-slate-muted">{h.at}</span>
              <span className={"px-2 py-0.5 rounded-full font-label-caps text-label-caps font-bold "+(ok?'bg-match-green/10 text-match-green':info?'bg-info-blue/10 text-info-blue':'bg-secondary/10 text-secondary')}>{STATUS_NAME[h.s]||h.s}</span>
            </div>
            <span className="font-headline-sm text-headline-sm text-primary font-bold">{h.listing?.company}</span>
            <p className="font-body-sm text-body-sm text-ink-charcoal mt-1 line-clamp-2">{h.listing?.position} — {STATUS_NAME[h.s]}</p>
            <div className="mt-space-sm pt-space-xs border-t border-hairline-border flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-slate-muted">마감 {h.listing?.deadline}</span>
              <span className={"material-symbols-outlined text-sm "+(ok?'text-match-green':'text-info-blue')}>{ok?'check_circle':'send'}</span>
            </div>
          </div>})}
        {!timeline.length&&<div className="text-slate-muted font-body-sm">아직 지원 활동이 없습니다</div>}
      </div>
    </section>
  </div>
}
