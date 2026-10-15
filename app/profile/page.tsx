'use client'
import {useState,useEffect} from 'react'
import {useStore} from '@/lib/store'
import {JOBTYPE_KW} from '@/lib/logic'

const inp="w-full px-3 py-2.5 rounded-lg bg-paper-bg border border-hairline-border font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low"
const lbl="font-label-caps text-label-caps text-slate-muted mb-1 block"

export default function ProfilePage(){
  const {S,update,toast}=useStore()
  const p=S.profile
  const [name,setName]=useState(p.name)
  const [major,setMajor]=useState(p.major)
  const [skills,setSkills]=useState(p.skills.join(', '))
  const [job,setJob]=useState(p.targetJob)
  useEffect(()=>{setName(p.name);setMajor(p.major);setSkills(p.skills.join(', '));setJob(p.targetJob)},[S.profile]) // eslint-disable-line

  const save=()=>{
    update(d=>{d.profile={name,major,skills:skills.split(',').map((s:string)=>s.trim()).filter(Boolean),targetJob:job}})
    toast('저장됐습니다 — 매칭 점수가 즉시 재계산됩니다')
  }
  return <div className="flex flex-col gap-space-md max-w-2xl">
    <div>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">프로필</h1>
      <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">F-27 — 매칭 점수 계산의 기준 데이터</p>
    </div>
    <div className="bg-surface rounded-xl shadow-sm overflow-hidden">
      <div className="px-space-lg py-space-md border-b border-hairline-border flex items-center gap-space-md">
        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-white font-headline-sm font-bold">{name[0]||'?'}</div>
        <div>
          <div className="font-headline-sm text-headline-sm text-ink-charcoal">{name} · {major}</div>
          <div className="font-label-caps text-label-caps text-slate-muted">희망 직무: {job}</div>
        </div>
      </div>
      <div className="p-space-lg flex flex-col gap-space-md">
        <div className="grid grid-cols-2 gap-space-md">
          <div><label className={lbl}>이름</label><input className={inp} type="text" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><label className={lbl}>학과</label><input className={inp} type="text" value={major} onChange={e=>setMajor(e.target.value)}/></div>
        </div>
        <div>
          <label className={lbl}>기술 스택 (쉼표 구분)</label>
          <input className={inp} type="text" value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Java, Python, SQL"/>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.split(',').map((s:string)=>s.trim()).filter(Boolean).map((s:string)=><span key={s} className="px-2 py-0.5 rounded-full bg-surface-container font-mono-badge text-mono-badge text-primary">{s}</span>)}
          </div>
        </div>
        <div>
          <label className={lbl}>희망 직무</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(JOBTYPE_KW).map(j=><button key={j} onClick={()=>setJob(j)} className={"px-3 py-1.5 rounded-full font-body-sm text-body-sm transition-colors "+(job===j?'bg-primary-container text-on-primary font-semibold shadow-sm':'bg-paper-bg text-slate-muted hover:bg-surface-container')} type="button">{j}</button>)}
          </div>
        </div>
        <button onClick={save} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold shadow-sm hover:bg-secondary transition-colors self-start" type="button">
          <span className="material-symbols-outlined text-base">save</span>저장
        </button>
      </div>
    </div>
    <div className="flex items-center gap-2 px-space-md py-2.5 rounded-xl bg-info-blue/5 border-l-4 border-info-blue font-body-sm text-body-sm">
      <span className="material-symbols-outlined text-info-blue text-lg">info</span>
      스킬·희망 직무를 바꾸면 공고 목록의 매칭 점수와 '일치/부족' 표시가 즉시 재계산됩니다.
    </div>
  </div>
}
