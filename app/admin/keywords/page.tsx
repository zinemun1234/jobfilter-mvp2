'use client'
import {CS_KEYWORDS} from '@/lib/logic'

export default function KeywordsPage(){
  return <>
    <h2>키워드 사전 <span className="muted">— 자동 분류 기준(F-43). 현재 {CS_KEYWORDS.length}개 키워드</span></h2>
    <div className="card">
      <div>{CS_KEYWORDS.map(k=><span className="chip hit" key={k}>{k}</span>)}</div>
      <p className="muted" style={{marginTop:10}}>공고 텍스트에 이 사전의 키워드가 1개 이상 단어 경계로 매칭되면 &quot;컴공 관련&quot;으로 분류, 없으면 등록 제외됩니다.<br/>단어 경계 매칭 — &quot;Java&quot;가 &quot;JavaScript&quot;에 매칭되지 않음 (명세서 A-04)</p>
    </div>
  </>
}
