'use client'
import {useStore} from '@/lib/store'
import {listingById,STATUS_NAME,Any} from '@/lib/logic'

export default function RappsPage(){
  const {S}=useStore()
  const rows=S.postings.filter((p:Any)=>{const l=listingById(S,p.listingId);return l&&l.src==='기업'})
  return <>
    <h2>지원자 열람 <span className="muted">— 본인이 등록한 공고의 지원자만 조회(F-33)</span></h2>
    <div className="card"><table><tbody>
      <tr><th>지원자</th><th>공고</th><th>현재 단계</th><th>최근 변경</th></tr>
      {rows.length?rows.map((p:Any)=>{const l=listingById(S,p.listingId);return (<tr key={p.id}>
        <td>{S.profile.name} ({S.profile.major})</td>
        <td>{l.company} · {l.position}</td>
        <td><span className="badge b-info">{STATUS_NAME[p.status]}</span></td>
        <td className="muted">{p.history[p.history.length-1].at}</td></tr>)
      }):<tr><td colSpan={4} className="muted">아직 지원자가 없습니다</td></tr>}
    </tbody></table></div>
  </>
}
