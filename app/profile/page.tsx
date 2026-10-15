'use client'
import {useState,useEffect} from 'react'
import {useStore} from '@/lib/store'
import {JOBTYPE_KW} from '@/lib/logic'

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
    toast('저장됐습니다')
  }
  return <>
    <h2>프로필 <span className="muted">— 매칭 점수 계산의 기준 데이터 (F-27)</span></h2>
    <div className="card" style={{maxWidth:560}}>
      <div className="frow"><label>이름</label><input type="text" value={name} onChange={e=>setName(e.target.value)}/></div>
      <div className="frow"><label>학과</label><input type="text" value={major} onChange={e=>setMajor(e.target.value)}/></div>
      <div className="frow"><label>기술 스택</label><input type="text" value={skills} onChange={e=>setSkills(e.target.value)} placeholder="쉼표로 구분: Java, Python, SQL"/></div>
      <div className="frow"><label>희망 직무</label><select value={job} onChange={e=>setJob(e.target.value)}>
        {Object.keys(JOBTYPE_KW).map(j=><option key={j} value={j}>{j}</option>)}</select></div>
      <button className="btn p" onClick={save}>저장</button></div>
    <div className="note">스킬·희망 직무를 바꾸면 공고 목록의 매칭 점수와 &apos;일치/부족&apos; 표시가 즉시 재계산됩니다.</div>
  </>
}
