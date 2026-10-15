'use client'
import React from 'react'
import Link from 'next/link'
import {usePathname,useRouter} from 'next/navigation'
import {useStore} from '@/lib/store'

const NAV:Record<string,[string,string,string][]>={
  student:[['/','대시보드','▦'],['/jobs','공고 목록','≡'],['/board','지원 관리','▤'],['/cover','자소서·코칭','✎'],['/interview','모의면접','◎'],['/profile','프로필','☺']],
  recruiter:[['/recruiter','공고 등록·관리','✚'],['/recruiter/applicants','지원자 열람','☷']],
  admin:[['/admin','공고 승인','✓'],['/admin/upload','일괄 등록','⇪'],['/admin/keywords','키워드 사전','✱'],['/admin/listings','공고 관리','☰']]
}
const HOME:Record<string,string>={student:'/',recruiter:'/recruiter',admin:'/admin'}
const ROLE_NAME:Record<string,string>={student:'학생',recruiter:'기업 담당자',admin:'관리자'}
const TITLES:[RegExp,string][]=[
  [/^\/$/,'대시보드'],[/^\/jobs\/.+/,'공고 상세'],[/^\/jobs$/,'공고 목록'],[/^\/board/,'지원 관리 칸반'],
  [/^\/cover/,'자소서 코칭'],[/^\/interview/,'모의면접'],[/^\/profile/,'프로필'],[/^\/recruiter\/applicants/,'지원자 열람'],[/^\/recruiter/,'기업 공고 관리'],
  [/^\/admin\/upload/,'엑셀 일괄 등록'],[/^\/admin\/keywords/,'키워드 사전'],[/^\/admin\/listings/,'공고 관리'],[/^\/admin/,'공고 승인']
]

export default function AppShell({children}:{children:React.ReactNode}){
  const {S,update}=useStore()
  const pathname=usePathname()||'/'
  const router=useRouter()
  const role=S.role as string
  const title=TITLES.find(([re])=>re.test(pathname))?.[1]||''

  const setRole=(r:string)=>{
    update(d=>{d.role=r})
    router.push(HOME[r])
  }

  return <div className="shell">
    <aside className="rail">
      <div className="brand">Job<em>Filter</em><span className="vbadge">MVP</span></div>
      <div className="rail-sub">컴공 맞춤 취업지원 포털</div>
      <nav className="side">
        {(NAV[role]||NAV.student).map(([href,n,ic])=>
          <Link key={href} href={href} className={pathname===href||(href!=='/'&&pathname.startsWith(href))?'on':''}>
            <span className="ic">{ic}</span>{n}
          </Link>)}
      </nav>
      <div className="rail-foot">핵심기능 시연 · 명세서 v3.5 기준<br/>로그인 없음 — 역할 즉시 전환</div>
    </aside>
    <div className="main">
      <header className="topbar">
        <span className="ptitle">{ROLE_NAME[role]} · {title}</span>
        <span className="muted">핵심기능 MVP — 로그인·회원가입 제외</span>
        <div className="role">
          {Object.keys(ROLE_NAME).map(r=>
            <button key={r} className={role===r?'on':''} onClick={()=>setRole(r)}>{ROLE_NAME[r]}</button>)}
        </div>
      </header>
      <main>{children}</main>
    </div>
  </div>
}
