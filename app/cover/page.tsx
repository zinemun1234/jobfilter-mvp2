'use client'
import {useEffect,useState} from 'react'
import {useStore} from '@/lib/store'
import {visibleListings,listingById,jobTypeOfListing,qTypeOf,guideFor,analyzeCoverLetter,heatmap,CRITERIA,uid,Any} from '@/lib/logic'

export default function CoverPage(){
  const {S,update,toast,clSel,setClSel,clJob,setClJob}=useStore()
  const jobs=visibleListings(S)
  const c=S.coverLetters.find((x:Any)=>x.id===clSel)
  const [draft,setDraft]=useState<Any>(null)
  const [result,setResult]=useState<Any>(null)
  const [curItem,setCurItem]=useState(0)

  useEffect(()=>{ if(!clSel&&S.coverLetters.length) setClSel(S.coverLetters[0].id) },[clSel,S.coverLetters,setClSel])
  useEffect(()=>{ if(!clJob&&jobs.length) setClJob(jobs[0].id) },[clJob,jobs,setClJob])
  useEffect(()=>{
    if(c) setDraft(JSON.parse(JSON.stringify({title:c.title,items:c.items})))
    else setDraft(null)
    setResult(null); setCurItem(0)
  },[clSel])  // eslint-disable-line

  const newCover=()=>{
    const nid='C'+(S.seq+1)
    update(d=>{d.coverLetters.push({id:uid(d,'C'),title:'새 자기소개서',items:[{q:'지원 동기',text:''}],versions:[],score:null})})
    setClSel(nid)
  }
  const saveCL=()=>{
    if(!c) return
    update(d=>{const dc=d.coverLetters.find((x:Any)=>x.id===c.id);
      dc.versions.push({v:dc.versions.length+1,at:new Date().toLocaleString('ko-KR'),items:JSON.parse(JSON.stringify(dc.items))});
      dc.title=draft.title; dc.items=draft.items})
    toast('저장됐습니다 — 버전 '+(c.versions.length+2)+' 생성')
  }
  const delCL=()=>{
    update(d=>{d.coverLetters=d.coverLetters.filter((x:Any)=>x.id!==c.id)})
    setClSel(S.coverLetters.find((x:Any)=>x.id!==c.id)?.id||null)
  }
  const addItem=()=>setDraft({...draft,items:[...draft.items,{q:'',text:''}]})
  const setItem=(i:number,k:string,v:string)=>{const items=[...draft.items]; items[i]={...items[i],[k]:v}; setDraft({...draft,items})}

  const l=listingById(S,clJob||'')
  const jt=jobTypeOfListing(l,S.profile.targetJob)

  const runAnalyze=()=>{
    if(!c) return
    const text=draft.items.map((i:Any)=>i.text).join('\n\n')
    const res=analyzeCoverLetter(text,(l&&(l.tags||[])[0])||S.profile.targetJob)
    const kws=[...(l?l.skills:[]),...(l?l.tags:[])]
    const hm=heatmap(text,kws)
    update(d=>{const dc=d.coverLetters.find((x:Any)=>x.id===c.id);
      dc.title=draft.title; dc.items=draft.items; dc.score=res.ok?res.total:null})
    setResult({...res,hm,l})
  }
  const insertFrame=(i:number)=>{
    const it=draft.items[i]
    const g=guideFor(jt,qTypeOf(it.q,it.text))
    setItem(i,'text',it.text?it.text+'\n'+g.f:g.f)
    toast('프레임 삽입됨 — [ ] 빈칸을 직접 채우세요')
  }

  const curGuide=()=>{
    if(!draft||!draft.items[curItem]) return null
    const it=draft.items[curItem]
    const qt=qTypeOf(it.q,it.text)
    const g=guideFor(jt,qt)
    return <div className="card" style={{width:280,flexShrink:0}}>
      <b>직군별 작성 가이드 <span className="muted">F-66</span></b>
      <div style={{margin:'8px 0'}}><span className="tag">{jt}</span> <span className="badge b-info">문항 유형: {qt}</span></div>
      <div className="muted" style={{fontSize:12}}>문장 프레임 — 완성 문장이 아니라 빈칸 채우기 형태입니다. [ ]를 직접 채우세요.</div>
      <div className="note" style={{margin:'8px 0',lineHeight:1.7}}>{g.f}</div>
      <button className="btn sm" onClick={()=>insertFrame(curItem)}>본문에 프레임 삽입</button>
      <h3>체크 포인트</h3>
      <ul className="muted" style={{margin:'0 0 0 16px',fontSize:12,lineHeight:1.8}}>{g.c.map((x:string)=><li key={x}>{x}</li>)}</ul>
      <p className="muted" style={{marginTop:8,fontSize:11}}>문항 제목·본문 키워드로 유형 자동 판정 · 공고 직군 태그로 직군 자동 선택 · 생성형 AI 없는 규칙 기반 가이드</p>
    </div>
  }

  return <>
    <h2>자소서 작성·코칭 <span className="muted">— F-15 작성 / F-16 채점 / F-17 히트맵 / F-28 기준 공개 / F-66 가이드</span></h2>
    <div className="row" style={{alignItems:'flex-start'}}>
      <div style={{width:200,flexShrink:0}}>
        <button className="btn p" style={{width:'100%',marginBottom:8,justifyContent:'center'}} onClick={newCover}>+ 새 자소서</button>
        {S.coverLetters.map((x:Any)=>(
          <div className="job" key={x.id} style={{padding:'10px 12px',marginBottom:6,borderColor:x.id===clSel?'var(--pri)':undefined}} onClick={()=>setClSel(x.id)}>
            <div className="t" style={{fontSize:12.5}}>{x.title}</div>
            <div className="muted">버전 {x.versions.length+1} · {x.score!=null?x.score+'점':'미분석'}</div></div>
        ))}
      </div>
      <div style={{flex:1}}>
        {c&&draft?<div className="row" style={{alignItems:'flex-start'}}>
          <div className="card" style={{flex:1}}>
            <div className="row" style={{marginBottom:8}}>
              <input type="text" style={{flex:1}} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/>
              <select style={{width:190}} value={clJob||''} onChange={e=>setClJob(e.target.value)}>
                {jobs.map((j:Any)=><option key={j.id} value={j.id}>{j.company} {j.position}</option>)}</select>
              <button className="btn sm" onClick={saveCL}>저장 (버전 생성)</button>
              <button className="btn p sm" onClick={runAnalyze}>코칭 분석 실행</button>
              <button className="btn sm danger" onClick={delCL}>삭제</button></div>
            {draft.items.map((it:Any,i:number)=>(
              <div key={i}>
                <div className="frow"><label>문항 {i+1}</label>
                  <input type="text" value={it.q} placeholder="예) 지원 동기" onFocus={()=>setCurItem(i)} onChange={e=>setItem(i,'q',e.target.value)}/></div>
                <textarea rows={7} value={it.text} placeholder="본문을 직접 작성하세요 — 의미 없는 입력은 '분석 불가' 처리됩니다" onFocus={()=>setCurItem(i)} onChange={e=>setItem(i,'text',e.target.value)}/>
              </div>))}
            <div className="row" style={{marginTop:8}}>
              <button className="btn sm" onClick={addItem}>+ 문항 추가</button>
              <span className="muted">버전 {c.versions.length+1} — 저장할 때마다 이전 내용이 버전 이력에 쌓입니다</span></div>
            {result&&(result.ok?
              <div className="card" style={{marginTop:12}}>
                <div className="row"><b style={{fontSize:20}}>종합 {result.total}점</b><span className="muted">/ 100</span>
                <span className="badge b-info">{(result.l?result.l.company+' '+result.l.position:'직군 미선택')} 기준</span></div>
                {result.detail.map((d:Any)=>(<div className="row" key={d.name} style={{marginTop:8}}>
                  <span style={{width:90,fontSize:12.5}}>{d.name} <span className="muted">/{d.max}</span></span>
                  <div className="bar" style={{flex:1}}><i style={{width:(d.score/d.max*100)+'%'}}/></div><b style={{width:30,textAlign:'right'}}>{d.score}</b></div>))}
                <p className="muted" style={{marginTop:10}}>잘된 점: {result.good.join(', ')||'-'} · 보완할 점: {result.bad.join(', ')||'-'}</p>
                <h3>키워드 히트맵 <span className="muted">— 공고 요구 키워드의 본문 출현 횟수 (단어 경계 매칭: "Java" ≠ "JavaScript")</span></h3>
                <div className="hm">{result.hm.map((h:Any)=>{const lv=h.n>=3?3:h.n;return <span key={h.kw} className={'h'+lv}>{h.kw} ×{h.n}</span>})}
                  <span className="muted" style={{padding:4}}>범례: 미출현 / 1회 / 2회 / 3회+</span></div>
                <h3>평가 기준 공개 <span className="muted">(F-28)</span></h3>
                <table><tbody>
                  <tr><th>항목</th><th>가중치</th><th>판정 기준</th></tr>
                  {result.detail.map((d:Any)=>(<tr key={d.name}><td>{d.name}</td><td>{d.max}점</td><td>{CRITERIA[d.name]}</td></tr>))}
                  <tr><td colSpan={3} className="muted">&apos;분석 불가&apos; 판정: 100자 미만 · 단독 자모 비율 12% 초과 · 유효 단어 20개 미만 · 문자 비율 50% 미달</td></tr>
                </tbody></table>
              </div>
              :<div className="card" style={{marginTop:12,borderColor:'#f0c0c0'}}>
                <b style={{color:'var(--bad)'}}>분석 불가</b> — 의미 없는 입력으로 판정해 분석을 수행하지 않았습니다.
                <ul className="muted" style={{margin:'6px 0 0 18px'}}>{result.fail.map((f:string)=><li key={f}>{f}</li>)}</ul></div>)}
          </div>
          {curGuide()}
        </div>
        :<div className="empty">자소서를 선택하세요</div>}
      </div>
    </div>
  </>
}
