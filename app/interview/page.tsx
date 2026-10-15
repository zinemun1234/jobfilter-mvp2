'use client'
import {useEffect,useMemo,useRef,useState} from 'react'
import {useStore} from '@/lib/store'
import {JOBTYPE_KW,INTERVIEW_QUESTION_TEMPLATES,INTERVIEW_CHECK_ITEMS,nextPractice,uid,today,Any} from '@/lib/logic'

const SESSION_LEN=3, TIME_LIMIT=90

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

  const jtList=[...Object.keys(JOBTYPE_KW),'공통']
  const records=(S.interviews||[])

  const start=()=>{
    const pool=[...(INTERVIEW_QUESTION_TEMPLATES[jt]||[]),...(jt!=='공통'?INTERVIEW_QUESTION_TEMPLATES['공통'].slice(0,2):[])]
    const picked=[...pool].sort(()=>Math.random()-.5).slice(0,SESSION_LEN)
    setQs(picked); setQi(0); setAnswer(''); setChecks([]); setPhase('run')
  }
  useEffect(()=>{
    if(phase!=='run') return
    setLeft(TIME_LIMIT)
    timer.current=setInterval(()=>setLeft(v=>v>0?v-1:0),1000)
    return ()=>{if(timer.current)clearInterval(timer.current)}
  },[phase,qi])

  const saveAnswer=()=>{
    if(!answer.trim()){toast('답변을 입력하세요');return}
    update(d=>{(d.interviews=d.interviews||[]).push({id:uid(d,'I'),jobType:jt,question:qs[qi],answer,checks,sec:TIME_LIMIT-left,at:today()})})
    toast('답변 저장됨')
    if(qi+1<qs.length){setQi(qi+1);setAnswer('');setChecks([])}
    else setPhase('done')
  }
  const toggleCheck=(c:string)=>setChecks(v=>v.includes(c)?v.filter(x=>x!==c):[...v,c])
  const mmss=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  return <>
    <h2>규칙 기반 모의면접 <span className="muted">— F-64 · 직군별 질문 랜덤 추출 → 90초 타이머 → 자가 체크 → 기록 저장</span></h2>
    <div className="note">생성형 AI 없이 질문 템플릿·체크리스트 기반으로 동작합니다 — 답변 평가는 스스로 체크리스트로 수행합니다.</div>

    {phase==='setup'&&<div className="row" style={{alignItems:'flex-start'}}>
      <div className="card" style={{flex:1,maxWidth:520}}>
        <h3 style={{marginTop:0}}>연습 설정</h3>
        <div className="frow"><label>직군 선택</label>
          <select value={jt} onChange={e=>setJt(e.target.value)}>{jtList.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
        <div className="frow"><label>문항 수</label><span>{SESSION_LEN}문항 · 문항당 {TIME_LIMIT}초</span></div>
        <div className="frow"><label>질문 풀</label><span className="muted">{(INTERVIEW_QUESTION_TEMPLATES[jt]||[]).length}개 직군 + 공통 {INTERVIEW_QUESTION_TEMPLATES['공통'].length}개 템플릿</span></div>
        <button className="btn p" onClick={start}>모의면접 시작</button>
        <div className="muted" style={{marginTop:10}}>다음 추천 연습: <b>{nextPractice(S)}</b> (답변 기록이 가장 적은 직군)</div>
      </div>
      <div className="card" style={{flex:1}}>
        <h3 style={{marginTop:0}}>답변 기록 <span className="muted">({records.length}건)</span></h3>
        {records.length?<table><tbody>
          <tr><th>직군</th><th>질문</th><th>체크</th><th>날짜</th></tr>
          {[...records].reverse().slice(0,8).map((r:Any)=>(<tr key={r.id}>
            <td><span className="tag">{r.jobType}</span></td>
            <td style={{maxWidth:280}}>{r.question}</td>
            <td className="muted">{r.checks.length?r.checks.join(' · '):'-'}</td>
            <td className="muted">{r.at}</td></tr>))}
        </tbody></table>:<div className="empty">아직 기록이 없습니다 — 세션을 시작해보세요</div>}
      </div>
    </div>}

    {phase==='run'&&<div className="row" style={{alignItems:'flex-start'}}>
      <div className="card" style={{flex:1}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <span className="badge b-info">{jt} · 문항 {qi+1}/{qs.length}</span>
          <span className={'dday '+(left<=15?'urgent':'')} style={{fontSize:15}}>⏱ {mmss(left)}{left===0&&' — 시간 종료'}</span></div>
        <div className="bar" style={{marginTop:10}}><i style={{width:(left/TIME_LIMIT*100)+'%',background:left<=15?'var(--bad)':'var(--blue)'}}/></div>
        <h3>Q{qi+1}. {qs[qi]}</h3>
        <textarea rows={7} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="답변을 소리 내어 말하듯 작성하세요 — 90초 안에 결론까지 닿는 것이 목표입니다"/>
        <div className="row" style={{marginTop:10,justifyContent:'space-between'}}>
          <span className="muted">{answer.replace(/\s/g,'').length}자</span>
          <button className="btn p" onClick={saveAnswer}>{qi+1<qs.length?'저장 → 다음 문항':'저장 → 세션 종료'}</button></div>
      </div>
      <div className="card" style={{width:280,flexShrink:0}}>
        <b>자가 체크리스트</b>
        <div className="muted" style={{fontSize:12,margin:'6px 0'}}>답변 후 스스로 해당 항목에 체크하세요</div>
        {INTERVIEW_CHECK_ITEMS.map(c=>(
          <div key={c} className="row" style={{marginTop:8}}>
            <button className={'btn sm'+(checks.includes(c)?' p':'')} onClick={()=>toggleCheck(c)}>{checks.includes(c)?'✓':'○'}</button>
            <span style={{fontSize:13}}>{c}</span></div>))}
        <h3>팁</h3>
        <ul className="muted" style={{margin:'0 0 0 16px',fontSize:12,lineHeight:1.8}}>
          <li>결론을 첫 문장에 배치하세요 (두괄식)</li>
          <li>숫자·단위가 하나 이상 들어가면 설득력이 오릅니다</li>
          <li>상황→과제→행동→결과 순서를 지키세요</li></ul>
      </div>
    </div>}

    {phase==='done'&&<div className="card" style={{maxWidth:640}}>
      <h3 style={{marginTop:0}}>세션 완료 — {jt} {qs.length}문항</h3>
      {qs.map((q,i)=>(<div key={i} className="note" style={{margin:'8px 0'}}><b>Q{i+1}.</b> {q}</div>))}
      <p className="muted">답변 {qs.length}건이 기록에 저장됐습니다. 다음 추천 연습: <b>{nextPractice(S)}</b></p>
      <div className="row">
        <button className="btn p" onClick={()=>{setPhase('setup')}}>새 세션</button>
        <button className="btn" onClick={()=>{setJt(nextPractice(S));setPhase('setup')}}>추천 직군으로 설정</button></div>
    </div>}
  </>
}
