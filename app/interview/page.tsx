'use client'
import {useEffect,useRef,useState} from 'react'
import {useStore} from '@/lib/store'
import {JOBTYPE_KW,INTERVIEW_QUESTION_TEMPLATES,INTERVIEW_CHECK_ITEMS,nextPractice,uid,today,Any} from '@/lib/logic'

const SESSION_LEN=3, TIME_LIMIT=90
const mmss=(s:number)=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0')

export default function InterviewPage(){
  const {S,update,toast}=useStore()
  const [phase,setPhase]=useState<'setup'|'run'|'done'>('setup')
  const [jt,setJt]=useState(S.profile.targetJob)
  const [qs,setQs]=useState<string[]>([])
  const [qi,setQi]=useState(0)
  const [left,setLeft]=useState(TIME_LIMIT)
  const [answer,setAnswer]=useState('')
  const [checks,setChecks]=useState<string[]>([])
  const timer=useRef<ReturnType<typeof setInterval>|null>(null)

  useEffect(()=>()=>{if(timer.current)clearInterval(timer.current)},[])
  useEffect(()=>{
    if(phase!=='run')return
    setLeft(TIME_LIMIT)
    timer.current=setInterval(()=>setLeft(v=>v>0?v-1:0),1000)
    return ()=>{if(timer.current)clearInterval(timer.current)}
  },[phase,qi])

  const jtList=[...Object.keys(JOBTYPE_KW),'공통']
  const records:Any[]=(S.interviews||[])
  const start=()=>{
    const pool=[...(INTERVIEW_QUESTION_TEMPLATES[jt]||[]),...(jt!=='공통'?INTERVIEW_QUESTION_TEMPLATES['공통'].slice(0,2):[])]
    setQs([...pool].sort(()=>Math.random()-.5).slice(0,SESSION_LEN))
    setQi(0);setAnswer('');setChecks([]);setPhase('run')
  }
  const saveAnswer=()=>{
    if(!answer.trim()){toast('답변을 입력하세요');return}
    update(d=>{(d.interviews=d.interviews||[]).push({id:uid(d,'I'),jobType:jt,question:qs[qi],answer,checks,sec:TIME_LIMIT-left,at:today()})})
    toast('답변 저장됨')
    if(qi+1<qs.length){setQi(qi+1);setAnswer('');setChecks([])}
    else setPhase('done')
  }
  const toggleCheck=(c:string)=>setChecks(v=>v.includes(c)?v.filter(x=>x!==c):[...v,c])
  const timerPct=left/TIME_LIMIT*100
  const timerColor=left<=15?'#DC2626':left<=45?'#D97706':'#0284C7'

  return <div className="flex flex-col gap-space-md">
    {/* 상단 안내 배너 */}
    <div className="flex items-center gap-2 px-space-md py-2.5 rounded-xl bg-info-blue/5 border-l-4 border-info-blue font-body-sm text-body-sm">
      <span className="material-symbols-outlined text-info-blue text-lg">info</span>
      <span><b>규칙 기반 모의면접 (F-64)</b> — 생성형 AI 없이 질문 템플릿·자가 체크리스트로 동작합니다. 답변 평가는 스스로 수행합니다.</span>
    </div>

    {phase==='setup'&&<>
      <div className="bg-surface rounded-xl shadow-sm p-space-lg">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-lg">
          <div className="flex-1">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">연습 설정</h1>
            <p className="font-body-sm text-body-sm text-slate-muted mt-0.5 mb-space-md">직군을 선택하면 해당 질문 풀에서 랜덤 {SESSION_LEN}문항이 출제됩니다</p>
            <div className="flex flex-wrap gap-1.5">
              {jtList.map(t=><button key={t} onClick={()=>setJt(t)} className={"px-3 py-1.5 rounded-full font-body-sm text-body-sm transition-colors "+(jt===t?'bg-primary-container text-on-primary font-semibold shadow-sm':'bg-paper-bg text-slate-muted hover:bg-surface-container')} type="button">{t}</button>)}
            </div>
          </div>
          <div className="bg-paper-bg rounded-xl p-space-md min-w-[240px]">
            <div className="grid grid-cols-3 gap-space-sm text-center mb-space-sm">
              <div><div className="font-label-caps text-label-caps text-slate-muted">문항 수</div><div className="font-mono-metric text-headline-sm font-bold text-ink-charcoal">{SESSION_LEN}</div></div>
              <div><div className="font-label-caps text-label-caps text-slate-muted">문항당</div><div className="font-mono-metric text-headline-sm font-bold text-ink-charcoal">{TIME_LIMIT}초</div></div>
              <div><div className="font-label-caps text-label-caps text-slate-muted">질문 풀</div><div className="font-mono-metric text-headline-sm font-bold text-ink-charcoal">{(INTERVIEW_QUESTION_TEMPLATES[jt]||[]).length}+</div></div>
            </div>
            <button onClick={start} className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold shadow-sm hover:bg-secondary transition-colors" type="button">
              <span className="material-symbols-outlined text-base">play_arrow</span>모의면접 시작
            </button>
            <p className="font-label-caps text-label-caps text-slate-muted mt-2 text-center">다음 추천 연습: <b className="text-match-green">{nextPractice(S)}</b></p>
          </div>
        </div>
      </div>
      <HistoryTable records={records}/>
      <RecommendBanner S={S} onPick={(t:string)=>{setJt(t)}}/>
    </>}

    {phase==='run'&&<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
      {/* 세션 카드 */}
      <div className="xl:col-span-8 bg-surface rounded-xl shadow-sm p-space-lg">
        <div className="flex items-center justify-between mb-space-md">
          <span className="px-2.5 py-1 rounded-full bg-surface-container text-primary font-label-caps text-label-caps font-semibold">{jt} · 문항 {qi+1}/{qs.length}</span>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="-rotate-90" viewBox="0 0 36 36" style={{width:64,height:64}}>
              <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"/>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={timerColor} strokeDasharray={timerPct+', 100'} strokeLinecap="round" strokeWidth="2.5"/>
            </svg>
            <span className="absolute font-mono-metric text-body-sm font-bold" style={{color:timerColor}}>{mmss(left)}</span>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden mb-space-md">
          <div className="h-full rounded-full transition-all duration-1000" style={{width:timerPct+'%',background:timerColor}}/>
        </div>
        <h2 className="font-headline-md text-headline-md text-primary mb-space-md leading-snug">Q{qi+1}. {qs[qi]}</h2>
        <textarea rows={8} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="답변을 소리 내어 말하듯 작성하세요 — 90초 안에 결론까지 닿는 것이 목표입니다" className="w-full px-space-md py-3 rounded-xl bg-paper-bg border border-hairline-border font-body-sm text-body-sm leading-relaxed text-ink-charcoal placeholder:text-slate-muted focus:outline-none focus:bg-surface-container-low resize-y"/>
        <div className="flex items-center justify-between mt-space-sm">
          <span className="font-label-caps text-label-caps text-slate-muted">{answer.replace(/\s/g,'').length}자 · {left===0?'시간 종료 — 작성 후 저장하세요':'남은 시간 '+mmss(left)}</span>
          <button onClick={saveAnswer} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold shadow-sm hover:bg-secondary transition-colors" type="button">
            {qi+1<qs.length?'저장 → 다음 문항':'저장 → 세션 종료'}<span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
      {/* 자가 체크리스트 */}
      <div className="xl:col-span-4 bg-surface rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-1">실전 답변 자가 체크리스트</h2>
        <p className="font-label-caps text-label-caps text-slate-muted mb-space-sm">답변 후 스스로 해당 항목에 체크하세요</p>
        <div className="w-full h-1.5 rounded-full bg-surface-variant overflow-hidden mb-space-md">
          <div className="h-full bg-match-green rounded-full transition-all" style={{width:(checks.length/INTERVIEW_CHECK_ITEMS.length*100)+'%'}}/>
        </div>
        <div className="flex flex-col gap-space-xs">
          {INTERVIEW_CHECK_ITEMS.map(c=>{
            const on=checks.includes(c)
            return <button key={c} onClick={()=>toggleCheck(c)} className={"flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg border text-left transition-colors "+(on?'border-match-green/40 bg-match-green/5':'border-hairline-border hover:bg-paper-bg')} type="button">
              <span className={"w-5 h-5 rounded-full flex items-center justify-center shrink-0 "+(on?'bg-match-green text-white':'bg-surface-container text-slate-muted')}>
                <span className="material-symbols-outlined text-xs">{on?'check':'radio_button_unchecked'}</span>
              </span>
              <span className={"font-body-sm text-body-sm "+(on?'font-semibold text-ink-charcoal':'text-on-surface-variant')}>{c}</span>
            </button>})}
        </div>
        <h3 className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider mt-space-lg mb-2">면접관 팁</h3>
        <ul className="flex flex-col gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
          <li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-sm text-secondary mt-0.5">tips_and_updates</span>결론을 첫 문장에 배치하세요 (두괄식)</li>
          <li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-sm text-secondary mt-0.5">tips_and_updates</span>숫자·단위가 하나 이상 들어가면 설득력이 오릅니다</li>
          <li className="flex items-start gap-1.5"><span className="material-symbols-outlined text-sm text-secondary mt-0.5">tips_and_updates</span>상황→과제→행동→결과 순서를 지키세요</li>
        </ul>
      </div>
    </div>}

    {phase==='done'&&<>
      <div className="bg-surface rounded-xl shadow-sm p-space-lg border-t-4 border-match-green">
        <div className="flex items-center gap-space-md mb-space-md">
          <span className="w-12 h-12 rounded-full bg-match-green/10 flex items-center justify-center"><span className="material-symbols-outlined text-match-green text-2xl">task_alt</span></span>
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">세션 완료 — {jt} {qs.length}문항</h1>
            <p className="font-body-sm text-body-sm text-slate-muted">답변 {qs.length}건이 기록에 저장됐습니다</p>
          </div>
        </div>
        <div className="flex flex-col gap-space-xs mb-space-md">
          {qs.map((q,i)=><div key={i} className="px-space-md py-2.5 rounded-lg bg-paper-bg font-body-sm text-body-sm"><b className="text-primary">Q{i+1}.</b> {q}</div>)}
        </div>
        <div className="flex flex-wrap gap-space-xs">
          <button onClick={()=>setPhase('setup')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold shadow-sm" type="button"><span className="material-symbols-outlined text-base">replay</span>새 세션</button>
          <button onClick={()=>{setJt(nextPractice(S));setPhase('setup')}} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-primary font-label-caps text-label-caps font-semibold hover:bg-surface-variant" type="button"><span className="material-symbols-outlined text-base">recommend</span>추천 직군({nextPractice(S)})으로 설정</button>
        </div>
      </div>
      <HistoryTable records={records}/>
      <RecommendBanner S={S} onPick={(t:string)=>{setJt(t);setPhase('setup')}}/>
    </>}
  </div>
}

function HistoryTable({records}:{records:Any[]}){
  return <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
    <div className="px-space-lg py-space-md border-b border-hairline-border flex items-center justify-between">
      <h2 className="font-headline-sm text-headline-sm text-primary">최근 모의면접 답변 및 체크 기록</h2>
      <span className="font-mono-badge text-mono-badge px-2 py-0.5 rounded-full bg-surface-container text-slate-muted font-bold">{records.length}건</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left font-body-sm text-body-sm">
        <thead><tr className="border-b border-hairline-border">
          {['직군','질문','소요 시간','자가 체크','날짜'].map(h=><th key={h} className="px-space-md py-2.5 font-label-caps text-label-caps text-slate-muted font-semibold">{h}</th>)}
        </tr></thead>
        <tbody>
          {records.length?[...records].reverse().slice(0,8).map((r:Any)=>
            <tr key={r.id} className="border-b border-hairline-border last:border-0 hover:bg-paper-bg/60 transition-colors">
              <td className="px-space-md py-2.5"><span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-mono-badge text-mono-badge font-semibold">{r.jobType}</span></td>
              <td className="px-space-md py-2.5 max-w-[320px] truncate">{r.question}</td>
              <td className="px-space-md py-2.5 font-mono-metric text-mono-metric">{r.sec}초</td>
              <td className="px-space-md py-2.5 text-slate-muted">{r.checks.length?r.checks.length+'/4 체크':'-'}</td>
              <td className="px-space-md py-2.5 text-slate-muted">{r.at}</td>
            </tr>)
          :<tr><td colSpan={5} className="px-space-md py-10 text-center text-slate-muted">아직 기록이 없습니다 — 세션을 시작해보세요</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
}
function RecommendBanner({S,onPick}:{S:Any;onPick:(t:string)=>void}){
  const rec=nextPractice(S)
  return <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md rounded-xl bg-primary-container px-space-lg py-space-md text-white">
    <div className="flex items-center gap-space-sm">
      <span className="material-symbols-outlined text-2xl">recommend</span>
      <div>
        <div className="font-headline-sm text-headline-sm">다음 추천 연습: {rec}</div>
        <div className="font-body-sm text-body-sm opacity-80">답변 기록이 가장 적은 직군을 추천합니다 — 골고루 연습하면 커버리지가 균형을 이룹니다</div>
      </div>
    </div>
    <button onClick={()=>onPick(rec)} className="px-4 py-2 rounded-lg bg-white text-primary font-label-caps text-label-caps font-bold hover:bg-surface-container transition-colors shrink-0" type="button">{rec} 선택</button>
  </div>
}
