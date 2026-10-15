'use client'
import {useStore} from '@/lib/store'
import {classify,dday,Any} from '@/lib/logic'

const ROLE_CLS:Record<string,string>={학생:'bg-info-blue/10 text-info-blue',기업:'bg-secondary/10 text-secondary',관리자:'bg-primary-container/10 text-primary'}

export default function AdminPage(){
  const {S,update,toast}=useStore()
  const pend=S.listings.filter((l:Any)=>!l.approved)
  const users=((S.users as Any[])||[])
  const appr=(id:string,ok:boolean)=>{
    update(d=>{
      if(ok){const l=d.listings.find((x:Any)=>x.id===id);if(l)l.approved=true}
      else d.listings=d.listings.filter((x:Any)=>x.id!==id)
    })
    toast(ok?'승인 — 학생 공고 목록에 게시됩니다':'반려 — 공고 삭제됨')
  }
  const toggleUser=(id:string)=>{
    update(d=>{const u=d.users.find((x:Any)=>x.id===id);u.status=u.status==='활성'?'정지':'활성'})
    toast('계정 상태가 변경됐습니다')
  }
  const active=S.listings.filter((l:Any)=>l.approved&&l.isActive&&dday(l.deadline)>=0)

  return <div className="flex flex-col gap-space-md">
    <div>
      <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">관리자 운영 대시보드</h1>
      <p className="font-body-sm text-body-sm text-slate-muted mt-0.5">F-41 승인 심사 · F-44 사용자 관리</p>
    </div>

    {/* 지표 카드 */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
      {[['승인 대기',pend.length,'건','text-amber-warning','pending_actions'],
        ['게시 중 공고',active.length,'건','text-match-green','inventory_2'],
        ['등록 사용자',users.length,'명','text-info-blue','group'],
        ['누적 공고',S.listings.length,'건','text-primary','database']].map(([l,v,u,c,i]:Any)=>
        <div key={l} className="bg-surface rounded-xl p-space-md shadow-sm flex items-center justify-between">
          <div className="flex flex-col"><span className="font-label-caps text-label-caps text-slate-muted">{l}</span>
          <span className={"font-headline-lg text-headline-lg font-bold mt-1 font-mono-metric "+c}>{v}<span className="text-body-md font-normal text-slate-muted ml-0.5">{u}</span></span></div>
          <div className={"w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center "+c}><span className="material-symbols-outlined">{i}</span></div>
        </div>)}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
      {/* 승인 대기열 */}
      <div className="xl:col-span-7 bg-surface rounded-xl shadow-sm overflow-hidden">
        <div className="px-space-lg py-space-md border-b border-hairline-border flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-primary">공고 승인 심사 대기열 <span className="font-label-caps text-label-caps text-slate-muted font-normal">(F-41)</span></h2>
          <span className="px-2 py-0.5 rounded-full bg-amber-warning/10 text-amber-warning font-mono-badge text-mono-badge font-bold">{pend.length}건 대기</span>
        </div>
        <table className="w-full text-left font-body-sm text-body-sm">
          <thead><tr className="border-b border-hairline-border">
            {['회사·직무','마감','자동분류','처리'].map(h=><th key={h} className="px-space-md py-2.5 font-label-caps text-label-caps text-slate-muted font-semibold">{h}</th>)}
          </tr></thead>
          <tbody>
            {pend.length?pend.map((l:Any)=>{const c=classify(l)
              return <tr key={l.id} className="border-b border-hairline-border last:border-0 hover:bg-paper-bg/60 transition-colors">
                <td className="px-space-md py-3"><div className="font-semibold text-ink-charcoal">{l.position}</div><div className="font-label-caps text-label-caps text-slate-muted">{l.company} · {l.src}</div></td>
                <td className="px-space-md py-3 font-mono-metric text-mono-metric whitespace-nowrap">{l.deadline}</td>
                <td className="px-space-md py-3">{c.isCS?<span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-mono-badge text-mono-badge font-semibold">컴공 {c.hits.slice(0,2).join('·')}</span>:<span className="px-2 py-0.5 rounded-full bg-paper-bg text-slate-muted font-mono-badge text-mono-badge">비관련</span>}</td>
                <td className="px-space-md py-3 whitespace-nowrap">
                  <button onClick={()=>appr(l.id,true)} className="px-2.5 py-1 rounded-lg bg-match-green text-white font-label-caps text-label-caps font-semibold hover:opacity-90" type="button">승인</button>
                  <button onClick={()=>appr(l.id,false)} className="ml-1 px-2.5 py-1 rounded-lg bg-error-container/50 text-alert-red font-label-caps text-label-caps font-semibold hover:bg-error-container" type="button">반려</button>
                </td>
              </tr>})
            :<tr><td colSpan={4} className="px-space-md py-10 text-center text-slate-muted">승인 대기 공고가 없습니다 — 기업 탭에서 등록해보세요</td></tr>}
          </tbody>
        </table>
      </div>

      {/* 사용자 관리 (F-44) */}
      <div className="xl:col-span-5 bg-surface rounded-xl shadow-sm overflow-hidden">
        <div className="px-space-lg py-space-md border-b border-hairline-border flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-primary">사용자 관리 <span className="font-label-caps text-label-caps text-slate-muted font-normal">(F-44)</span></h2>
        </div>
        <table className="w-full text-left font-body-sm text-body-sm">
          <thead><tr className="border-b border-hairline-border">
            {['사용자','역할','가입일','상태',''].map(h=><th key={h} className="px-space-md py-2.5 font-label-caps text-label-caps text-slate-muted font-semibold">{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map((u:Any)=>
              <tr key={u.id} className="border-b border-hairline-border last:border-0 hover:bg-paper-bg/60 transition-colors">
                <td className="px-space-md py-3"><div className="font-semibold text-ink-charcoal">{u.name}</div><div className="font-label-caps text-label-caps text-slate-muted">{u.dept}</div></td>
                <td className="px-space-md py-3"><span className={"px-2 py-0.5 rounded-full font-mono-badge text-mono-badge font-semibold "+(ROLE_CLS[u.role]||'bg-surface-container text-slate-muted')}>{u.role}</span></td>
                <td className="px-space-md py-3 font-mono-metric text-mono-metric text-slate-muted">{u.joined}</td>
                <td className="px-space-md py-3"><span className={"px-2 py-0.5 rounded-full font-mono-badge text-mono-badge font-semibold "+(u.status==='활성'?'bg-match-green/10 text-match-green':'bg-alert-red/10 text-alert-red')}>{u.status}</span></td>
                <td className="px-space-md py-3"><button onClick={()=>toggleUser(u.id)} className="px-2.5 py-1 rounded-lg bg-surface-container text-primary font-label-caps text-label-caps font-semibold hover:bg-surface-variant" type="button">{u.status==='활성'?'정지':'활성화'}</button></td>
              </tr>)}
          </tbody>
        </table>
        <p className="px-space-lg py-2.5 font-label-caps text-label-caps text-slate-muted border-t border-hairline-border">데모용 시드 계정 — 실제 인증 없이 계정 조회·상태 변경 흐름을 시연합니다</p>
      </div>
    </div>
  </div>
}
