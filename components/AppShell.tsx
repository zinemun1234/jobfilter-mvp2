'use client'
import React from 'react'
import Link from 'next/link'
import {usePathname,useRouter} from 'next/navigation'
import {useStore} from '@/lib/store'

const NAV:Record<string,[string,string,string][]>={
  student:[['/','대시보드','dashboard'],['/jobs','공고 목록','work'],['/board','지원 관리','view_kanban'],['/cover','자소서 코칭','edit_note'],['/interview','모의면접','record_voice_over'],['/profile','프로필','person']],
  recruiter:[['/recruiter','공고 관리','campaign'],['/recruiter/applicants','지원자 현황 / 심사','groups']],
  admin:[['/admin','공고 승인 심사','verified'],['/admin/keywords','키워드 사전','spellcheck'],['/admin/upload','일괄 업로드','receipt_long'],['/admin/listings','공고 관리','lists']]
}
const HOME:Record<string,string>={student:'/',recruiter:'/recruiter',admin:'/admin'}
const ROLE_NAME:Record<string,string>={student:'학생',recruiter:'기업 담당자',admin:'관리자'}
const ROLE_SUB:Record<string,string>={student:'컴공 채용 포털',recruiter:'기업 파트너스',admin:'운영 콘솔'}
const NAV_CAPTION:Record<string,string>={student:'Navigation',recruiter:'채용 관리 콘솔',admin:'운영 도구'}
const TITLES:[RegExp,string][]=[
  [/^\/$/,'대시보드'],[/^\/jobs\/.+/,'공고 상세'],[/^\/jobs$/,'공고 목록'],[/^\/board/,'지원 관리 칸반'],
  [/^\/cover/,'자소서 코칭'],[/^\/interview/,'모의면접'],[/^\/profile/,'프로필'],[/^\/recruiter\/applicants/,'지원자 현황'],[/^\/recruiter/,'기업 공고 관리'],
  [/^\/admin\/upload/,'엑셀 일괄 등록'],[/^\/admin\/keywords/,'키워드 사전'],[/^\/admin\/listings/,'공고 관리'],[/^\/admin/,'공고 승인']
]

export default function AppShell({children}:{children:React.ReactNode}){
  const {S,update}=useStore()
  const pathname=usePathname()||'/'
  const router=useRouter()
  const role=S.role as string
  const title=TITLES.find(([re])=>re.test(pathname))?.[1]||''
  const unread=(S.notif||[]).filter((n:{read:boolean})=>!n.read).length

  const setRole=(r:string)=>{
    update(d=>{d.role=r})
    router.push(HOME[r])
  }
  const navCls=(on:boolean)=>on
    ?'flex items-center gap-space-sm px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-headline-sm shadow-sm transition-colors'
    :'flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md transition-colors'

  return <>
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(20,57,107,0.04)]">
      <div className="flex flex-col">
        <div className="h-14 px-space-lg flex items-center gap-space-sm">
          <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-headline-md text-headline-sm">J</div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none">JobFilter</span>
            <span className="font-mono-badge text-mono-badge text-slate-muted uppercase tracking-wider mt-0.5">{ROLE_SUB[role]}</span>
          </div>
        </div>
        <div className="px-space-md py-space-sm">
          <div className="px-space-sm py-space-xs mb-space-xs"><span className="font-label-caps text-label-caps text-slate-muted uppercase tracking-wider">{NAV_CAPTION[role]}</span></div>
          <nav className="flex flex-col gap-1">
            {(NAV[role]||NAV.student).map(([href,n,ic])=>{
              const on=pathname===href||(href!=='/'&&pathname.startsWith(href))
              return <Link key={href} href={href} className={navCls(on)} aria-current={on?'page':undefined}>
                <span className="material-symbols-outlined text-[20px]">{ic}</span>
                <span className="font-body-md text-body-md">{n}</span>
              </Link>})}
          </nav>
        </div>
      </div>
      <div className="p-space-md m-space-md bg-surface-container-low rounded-lg">
        <div className="flex items-center justify-between mb-space-xs">
          <span className="font-label-caps text-label-caps text-slate-muted">핵심기능 시연</span>
          <span className="font-mono-metric text-mono-metric text-match-green font-semibold">v3.5</span>
        </div>
        <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden"><div className="bg-match-green h-full rounded-full" style={{width:'84%'}}/></div>
        <p className="mt-space-xs font-body-sm text-body-sm text-slate-muted leading-tight">로그인 없음 — 역할 즉시 전환</p>
      </div>
    </aside>
    <div className="pl-60 min-h-screen flex flex-col">
      <header className="fixed top-0 left-60 right-0 h-14 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-margin flex items-center justify-between">
        <div className="flex items-center gap-space-md">
          <span className="font-headline-sm text-headline-sm text-on-surface">{ROLE_NAME[role]} · {title}</span>
          <span className="font-body-sm text-body-sm text-slate-muted">핵심기능 MVP — 로그인·회원가입 제외</span>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="inline-flex items-center gap-1 bg-surface-container rounded-full p-1">
            {Object.keys(ROLE_NAME).map(r=>
              <button key={r} onClick={()=>setRole(r)} className={'px-space-md py-1 rounded-full font-body-sm text-body-sm transition-colors '+(role===r?'bg-primary-container text-on-primary font-semibold':'text-slate-muted hover:text-on-surface')}>{ROLE_NAME[r]}</button>)}
          </div>
          <button className="relative p-1.5 rounded-lg text-slate-muted hover:bg-surface-container-high hover:text-on-surface transition-colors" type="button" title="알림">
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unread>0&&<span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-alert-red"/>}
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-body-sm">{(S.profile?.name||'U')[0]}</div>
        </div>
      </header>
      <main className="relative w-full pt-14 bg-paper-bg flex-1 px-margin py-margin">{children}</main>
    </div>
  </>
}
