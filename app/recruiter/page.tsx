'use client'
import {useState} from 'react'
import {useStore} from '@/lib/store'
import {classify,uid,dd,Any} from '@/lib/logic'

export default function RecruiterPage(){
  const {S,update,toast}=useStore()
  const mine=S.listings.filter((l:Any)=>l.src==='기업')
  const [f,setF]=useState({co:'',pos:'',loc:'',car:'신입',type:'정규직',sal:'',dl:'',sk:'',desc:''})
  const set=(k:string)=>(e:any)=>setF({...f,[k]:e.target.value})

  const regJob=()=>{
    const l:Any={id:'',company:f.co||'(무기명)',position:f.pos||'미정',loc:f.loc,career:f.car,type:f.type,salary:f.sal,deadline:f.dl||dd(14),skills:f.sk.split(',').map((s:string)=>s.trim()).filter(Boolean),tags:[],desc:f.desc,approved:false,src:'기업',isActive:true}
    l.tags=classify(l).hits.slice(0,3)
    update(d=>{l.id=uid(d,'L'); d.listings.push(l)})
    toast('등록됐습니다 — 관리자 승인 대기')
    setF({co:'',pos:'',loc:'',car:'신입',type:'정규직',sal:'',dl:'',sk:'',desc:''})
  }
  return <>
    <h2>기업 공고 등록·관리 <span className="muted">— 등록 즉시 관리자 승인 대기(F-31)</span></h2>
    <div className="card sec"><h3 style={{marginTop:0}}>새 공고 등록</h3>
      <div className="frow"><label>회사명</label><input type="text" value={f.co} onChange={set('co')}/></div>
      <div className="frow"><label>직무</label><input type="text" value={f.pos} onChange={set('pos')} placeholder="예) 백엔드 개발자"/></div>
      <div className="frow"><label>근무지</label><input type="text" value={f.loc} onChange={set('loc')}/></div>
      <div className="frow"><label>경력</label><select value={f.car} onChange={set('car')}><option>신입</option><option>경력무관</option><option>경력 3년↑</option><option>석사우대</option></select></div>
      <div className="frow"><label>고용형태</label><select value={f.type} onChange={set('type')}><option>정규직</option><option>계약직</option><option>인턴</option></select></div>
      <div className="frow"><label>연봉</label><input type="text" value={f.sal} onChange={set('sal')} placeholder="예) 3,500만"/></div>
      <div className="frow"><label>마감일</label><input type="date" value={f.dl} onChange={set('dl')}/></div>
      <div className="frow"><label>요구 스킬</label><input type="text" value={f.sk} onChange={set('sk')} placeholder="쉼표 구분: Java, Spring, MySQL"/></div>
      <div className="frow"><label>상세 설명</label><textarea rows={3} value={f.desc} onChange={set('desc')}/></div>
      <button className="btn p" onClick={regJob}>등록 → 승인 요청</button></div>
    <h3>내 공고 목록</h3>
    <div className="card"><table><tbody>
      <tr><th>회사·직무</th><th>마감</th><th>승인 상태</th><th>지원자</th><th>자동분류</th></tr>
      {mine.length?mine.map((l:Any)=>(<tr key={l.id}><td>{l.company} · {l.position}</td><td>{l.deadline}</td>
        <td>{l.approved?<span className="badge b-ok">게시 중</span>:<span className="badge b-wait">승인 대기</span>}</td>
        <td>{S.postings.filter((p:Any)=>p.listingId===l.id).length}명</td>
        <td>{classify(l).isCS?<span className="badge b-info">컴공 관련</span>:<span className="badge b-no">비관련</span>}</td></tr>
      )):<tr><td colSpan={5} className="muted">등록한 공고가 없습니다</td></tr>}
    </tbody></table></div>
  </>
}
