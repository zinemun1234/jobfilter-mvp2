'use client'
import {useStore} from '@/lib/store'
import {classify,Any} from '@/lib/logic'

export default function AdminPage(){
  const {S,update,toast}=useStore()
  const pend=S.listings.filter((l:Any)=>!l.approved)
  const appr=(id:string,ok:boolean)=>{
    update(d=>{
      if(ok){const l=d.listings.find((x:Any)=>x.id===id); if(l) l.approved=true}
      else d.listings=d.listings.filter((x:Any)=>x.id!==id)
    })
    toast(ok?'승인 — 학생 공고 목록에 게시됩니다':'반려 — 공고 삭제됨')
  }
  return <>
    <h2>공고 승인 <span className="muted">— 기업 등록 공고 심사(F-41)</span></h2>
    <div className="card"><table><tbody>
      <tr><th>회사·직무</th><th>마감</th><th>자동분류</th><th>처리</th></tr>
      {pend.length?pend.map((l:Any)=>{const c=classify(l);return (<tr key={l.id}>
        <td>{l.company} · {l.position}</td><td>{l.deadline}</td>
        <td>{c.isCS?<><span className="badge b-info">컴공 관련</span> <span className="muted">{c.hits.slice(0,4).join(',')}</span></>:<span className="badge b-no">비관련</span>}</td>
        <td><button className="btn p sm" onClick={()=>appr(l.id,true)}>승인</button> <button className="btn sm danger" onClick={()=>appr(l.id,false)}>반려</button></td></tr>)
      }):<tr><td colSpan={4} className="muted">승인 대기 공고가 없습니다 — 기업 탭에서 등록해보세요</td></tr>}
    </tbody></table></div>
  </>
}
