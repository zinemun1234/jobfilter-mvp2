'use client'
import React,{createContext,useContext,useEffect,useRef,useState} from 'react'
import {SEED,Any} from './logic'

const KEY='jf_mvp'

type Store={
  S:Any; hydrated:boolean;
  update:(fn:(draft:Any)=>void)=>void;
  toast:(m:string)=>void;
  clSel:string|null; setClSel:(v:string|null)=>void;
  clJob:string|null; setClJob:(v:string|null)=>void;
}
const Ctx=createContext<Store|null>(null)

export function StoreProvider({children}:{children:React.ReactNode}){
  const [S,setS]=useState<Any>(()=>JSON.parse(JSON.stringify(SEED)))
  const [hydrated,setHydrated]=useState(false)
  const [toastMsg,setToastMsg]=useState<string|null>(null)
  const [clSel,setClSel]=useState<string|null>(null)
  const [clJob,setClJob]=useState<string|null>(null)
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(()=>{
    try{const j=localStorage.getItem(KEY); if(j){const saved=JSON.parse(j); setS({...JSON.parse(JSON.stringify(SEED)),...saved})}}catch{}
    setHydrated(true)
  },[])

  useEffect(()=>{
    if(!hydrated) return
    try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}
  },[S,hydrated])

  const update=(fn:(draft:Any)=>void)=>{
    setS((prev:Any)=>{const n=JSON.parse(JSON.stringify(prev)); fn(n); return n})
  }
  const toast=(m:string)=>{
    setToastMsg(m)
    if(timer.current) clearTimeout(timer.current)
    timer.current=setTimeout(()=>setToastMsg(null),1800)
  }

  return <Ctx.Provider value={{S,hydrated,update,toast,clSel,setClSel,clJob,setClJob}}>
    {children}
    {toastMsg&&<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-lg bg-ink-charcoal text-white font-body-sm text-body-sm shadow-lg flex items-center gap-2"><span className="material-symbols-outlined text-base text-match-green">check_circle</span>{toastMsg}</div>}
  </Ctx.Provider>
}
export function useStore(){
  const c=useContext(Ctx)
  if(!c) throw new Error('useStore outside StoreProvider')
  return c
}
