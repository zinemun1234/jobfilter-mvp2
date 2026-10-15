'use client'
import {CS_KEYWORDS} from '@/lib/logic'

export default function KeywordsPage(){
  return <div className="flex flex-col gap-space-md">
    <div>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">키워드 사전 관리</h1>
      <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">F-43 — 자동 분류 기준 · 현재 {CS_KEYWORDS.length}개 키워드</p>
    </div>
    <div className="bg-surface rounded-xl shadow-sm p-space-lg">
      <div className="flex flex-wrap gap-1.5">
        {CS_KEYWORDS.map(k=><span key={k} className="px-2.5 py-1 rounded-full bg-match-green/10 text-match-green font-mono-badge text-mono-badge font-semibold">{k}</span>)}
      </div>
      <div className="mt-space-md p-space-sm rounded-lg bg-surface-container-low border-l-2 border-info-blue font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
        공고 텍스트에 이 사전의 키워드가 1개 이상 단어 경계로 매칭되면 "컴공 관련"으로 분류, 없으면 등록 제외됩니다.<br/>
        단어 경계 매칭 — "Java"가 "JavaScript"에 매칭되지 않음 (명세서 A-04)
      </div>
    </div>
  </div>
}
