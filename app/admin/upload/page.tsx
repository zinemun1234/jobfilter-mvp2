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
    if(!preview)return
    let n=0
    update(d=>{preview.filter(r=>!r.skip).forEach(r=>{
      const {cls,skip,reason,...rest}=r
      d.listings.push({id:uid(d,'L'),...rest,tags:r.cls.hits.slice(0,3),approved:true,src:'관리자',isActive:true});n++
    })})
    toast(n+'건 일괄 등록 완료');router.push('/admin/listings')
  }
  const ok=preview?preview.filter(r=>!r.skip).length:0

  return <div className="flex flex-col gap-space-md">
    <div>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">엑셀 일괄 등록</h1>
      <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">F-42 — 파싱 → 미리보기(중복·마감 제외) → 자동 분류 → 등록</p>
    </div>
    <div className="bg-surface rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
      <div className="rounded-xl border-2 border-dashed border-hairline-border bg-paper-bg p-space-md">
        <div className="flex items-center gap-2 mb-2 font-label-caps text-label-caps text-slate-muted">
          <span className="material-symbols-outlined text-lg">upload_file</span>
          CSV 형식: 회사,직무,지역,경력,고용형태,연봉,마감일,요구스킬(;구분),설명 — 한 줄에 한 공고
        </div>
        <textarea rows={6} value={csv} onChange={e=>setCsv(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline-border font-mono-metric text-body-sm focus:outline-none focus:bg-surface-container-low resize-y"/>
      </div>
      <div className="flex gap-space-xs">
        <button onClick={doParse} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-caps text-label-caps font-semibold shadow-sm hover:bg-secondary transition-colors" type="button">
          <span className="material-symbols-outlined text-base">manage_search</span>파싱 → 미리보기
        </button>
        {preview&&<button onClick={doReg} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-match-green text-white font-label-caps text-label-caps font-semibold shadow-sm hover:opacity-90 transition-colors" type="button">
          <span className="material-symbols-outlined text-base">check_circle</span>미리보기 확정 — {ok}건 일괄 등록
        </button>}
      </div>
      {preview&&<div>
        <div className="flex items-center gap-space-sm mb-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary">파싱 미리보기</h2>
          <span className="px-2 py-0.5 rounded-full bg-match-green/10 text-match-green font-mono-badge text-mono-badge font-bold">등록 {ok}건</span>
          <span className="px-2 py-0.5 rounded-full bg-alert-red/10 text-alert-red font-mono-badge text-mono-badge font-bold">제외 {preview.length-ok}건</span>
        </div>
        <div className="rounded-lg border border-hairline-border overflow-hidden">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead><tr className="bg-paper-bg border-b border-hairline-border">
              {['회사·직무','마감','자동 분류 (매칭 키워드)','처리'].map(h=><th key={h} className="px-space-md py-2 font-label-caps text-label-caps text-slate-muted font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {preview.map((r,i)=><tr key={i} className={"border-b border-hairline-border last:border-0 "+(r.skip?'opacity-50':'')}>
                <td className="px-space-md py-2.5 font-semibold">{r.company} · {r.position}</td>
                <td className="px-space-md py-2.5 font-mono-metric text-mono-metric">{r.deadline}</td>
                <td className="px-space-md py-2.5">{r.cls.isCS?<span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-mono-badge text-mono-badge">컴공 — {r.cls.hits.slice(0,4).join(', ')}</span>:<span className="px-2 py-0.5 rounded-full bg-paper-bg text-slate-muted font-mono-badge text-mono-badge">비관련</span>}</td>
                <td className="px-space-md py-2.5">{r.skip?<span className="px-2 py-0.5 rounded-full bg-alert-red/10 text-alert-red font-mono-badge text-mono-badge font-semibold">제외 — {r.reason}</span>:<span className="px-2 py-0.5 rounded-full bg-match-green/10 text-match-green font-mono-badge text-mono-badge font-semibold">등록</span>}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  </div>
}
