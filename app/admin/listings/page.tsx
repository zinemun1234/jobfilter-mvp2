'use client'
import {useStore} from '@/lib/store'
import {Any} from '@/lib/logic'

export default function ListingsPage(){
  const {S,update,toast}=useStore()
  const delJob=(id:string)=>{
    update(d=>{d.listings=d.listings.filter((l:Any)=>l.id!==id); d.postings=d.postings.filter((p:Any)=>p.listingId!==id)})
    toast('삭제했습니다')
  }
  return <>
    <h2>공고 관리 <span className="muted">— 전체 공고 조회·삭제(F-41)</span></h2>
    <div className="card"><table><tbody>
      <tr><th>회사·직무</th><th>출처</th><th>마감</th><th>상태</th><th></th></tr>
      {S.listings.map((l:Any)=>(<tr key={l.id}>
        <td>{l.company} · {l.position}</td><td>{l.src}</td><td>{l.deadline}</td>
        <td>{l.approved?<span className="badge b-ok">게시</span>:<span className="badge b-wait">대기</span>}</td>
        <td><button className="btn sm danger" onClick={()=>delJob(l.id)}>삭제</button></td></tr>))}
    </tbody></table></div>
  </>
}
