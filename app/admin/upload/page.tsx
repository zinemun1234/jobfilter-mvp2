'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {useStore} from '@/lib/store'
import {classify,dday,dd,uid,Any} from '@/lib/logic'

const SAMPLE=(d20:string,d11:string,d8:string,d7:string)=>`테크밸리,백엔드 개발자,서울,신입,정규직,3400만,${d20},Java;Spring;MySQL,백엔드 API 서버 개발 및 운영
옵티마AI,데이터 분석가,서울,경력무관,정규직,4000만,${d11},Python;SQL;Tableau,비즈니스 데이터 분석 및 대시보드 구축
한국물류,배송 기사,인천,경력무관,계약직,3200만,${d8},운전면허,택배 배송 및 물류 운영
넥스테크,백엔드 개발자,서울 강남,신입,정규직,3400만,${d7},Java;Spring,중복 테스트용 행`

export default function UploadPage(){
  const {S,update,toast}=useStore()
  const router=useRouter()
  const [csv,setCsv]=useState(()=>SAMPLE(dd(20),dd(11),dd(8),dd(7)))
  const [preview,setPreview]=useState<Any[]|null>(null)

  const doParse=()=>{
    const lines=csv.split('\n').map(s=>s.trim()).filter(Boolean)
    const seen=new Set(S.listings.map((l:Any)=>l.company+'|'+l.position))
    const rows=lines.map(t=>{
      const a=t.split(',').map(s=>s.trim())
      const row:Any={company:a[0]||'',position:a[1]||'',loc:a[2]||'',career:a[3]||'',type:a[4]||'',salary:a[5]||'',deadline:a[6]||dd(14),skills:(a[7]||'').split(';').map(s=>s.trim()).filter(Boolean),desc:a[8]||''}
      const c=classify(row)
      const dup=seen.has(row.company+'|'+row.position)
      const expired=dday(row.deadline)<0
      return {...row,cls:c,skip:dup||expired||!c.isCS,reason:dup?'중복':expired?'마감 경과':!c.isCS?'비관련(자동분류)':''}
    })
    setPreview(rows)
  }
  const doReg=()=>{
    if(!preview) return
    let n=0
    update(d=>{preview.filter(r=>!r.skip).forEach(r=>{
      const {cls,skip,reason,...rest}=r
      d.listings.push({id:uid(d,'L'),...rest,tags:r.cls.hits.slice(0,3),approved:true,src:'관리자',isActive:true}); n++
    })})
    toast(n+'건 일괄 등록 완료'); router.push('/admin/listings')
  }
  const ok=preview?preview.filter(r=>!r.skip).length:0
  return <>
    <h2>엑셀 일괄 등록 <span className="muted">— 파싱 → 미리보기(중복·마감 제외) → 자동 분류 → 등록 (F-42)</span></h2>
    <div className="card">
      <p className="muted" style={{marginBottom:6}}>CSV 형식: 회사,직무,지역,경력,고용형태,연봉,마감일,요구스킬(;구분),설명 — 한 줄에 한 공고</p>
      <textarea rows={6} value={csv} onChange={e=>setCsv(e.target.value)}/>
      <div className="row" style={{marginTop:8}}>
        <button className="btn p" onClick={doParse}>파싱 → 미리보기</button>
        {preview&&<button className="btn" onClick={doReg}>미리보기 확정 — 일괄 등록</button>}
      </div>
      {preview&&<div>
        <h3>미리보기 — 등록 {ok}건 / 제외 {preview.length-ok}건</h3>
        <table><tbody>
          <tr><th>회사·직무</th><th>마감</th><th>자동 분류 (매칭 키워드)</th><th>처리</th></tr>
          {preview.map((r,i)=>(<tr key={i} style={{opacity:r.skip?0.5:1}}>
            <td>{r.company} · {r.position}</td><td>{r.deadline}</td>
            <td>{r.cls.isCS?<><span className="badge b-info">컴공 관련</span> <span className="muted">{r.cls.hits.slice(0,5).join(', ')}</span></>:<span className="badge b-no">비관련</span>}</td>
            <td>{r.skip?<span className="badge b-no">제외 — {r.reason}</span>:<span className="badge b-ok">등록</span>}</td></tr>))}
        </tbody></table>
      </div>}
    </div>
  </>
}
