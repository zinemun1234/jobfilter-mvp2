/* =====================================================
   JobFilter MVP — 기능명세서 v3.4 핵심기능(Must) 로직
   F-10 대시보드 / F-11·12 공고 목록·상세(매칭) / F-14 칸반
   F-15 자소서 / F-16 코칭분석 / F-17 히트맵 / F-27 프로필
   F-28 평가기준 공개 / F-31 기업등록 / F-41 승인 / F-42 일괄등록
   F-66 직군별 작성 가이드
   ===================================================== */

export type Any = any;

/* ---------- 키워드 사전 (F-43 자동 분류용) ---------- */
export const CS_KEYWORDS = ['개발','소프트웨어','SW','IT','프로그래머','백엔드','프론트엔드','풀스택','데이터','서버','네트워크','보안','클라우드','AI','머신러닝','DevOps','웹','앱','모바일','시스템','DB','Python','Java','JavaScript','TypeScript','C++','Kotlin','SQL','컴퓨터','엔지니어'];
export const JOBTYPE_KW: Record<string,string[]> = {
  '백엔드':['백엔드','서버','API','Spring','Java','Node','DB','SQL'],
  '프론트엔드':['프론트엔드','React','Vue','TypeScript','JavaScript','UI','UX','웹'],
  '인프라/DevOps':['DevOps','Docker','Kubernetes','AWS','클라우드','CI/CD','서버','인프라'],
  '데이터/AI':['데이터','Python','머신러닝','AI','SQL','분석','모델'],
  '보안':['보안','네트워크','침해','인증','취약점']
};

/* ---------- F-66 직군별 작성 가이드 (문장 프레임 — 빈칸 채우기형) ---------- */
const QTYPE_RULES:[string,RegExp][]=[
  ['지원동기',/지원|동기|이유|왜/],
  ['입사 후 포부',/포부|목표|입사|비전|계획/],
  ['협업·갈등',/협업|팀|갈등|소통|의견|리더|구성원|협력/],
  ['성장과정',/성장|가치관|배경|과정|변화|계기/],
  ['직무역량',/역량|직무|경험|기술|스킬|프로젝트|강점|문제/]
];
export function qTypeOf(q:string,text:string){
  const h=(q||'')+' '+(text||'').slice(0,60);
  for(const [t,re] of QTYPE_RULES) if(re.test(h)) return t;
  return '직무역량';
}
export const GUIDE:Record<string,Record<string,{f:string;c:string[]}>>={
 '백엔드':{
   '지원동기':{f:'[기술 스택·핵심 경험]을 통해 [문제·병목 상황]을 해결하고 [정량 성과]를 만들었습니다. 이 경험을 [지원 기업의 기술 과제]에 적용하겠습니다.',c:['기업 칭찬만으로 채우지 않았는가 — "왜 이 회사·이 직무인가"에 답하는가','지원 회사의 제품·기술 스택을 조사해 언급했는가','내 경험 → 입사 후 기여로 연결되는가']},
   '직무역량':{f:'[기술·도구]를 사용해 [문제 원인]을 분석하고, [개선 작업]을 적용해 [지표]를 [수치]만큼 개선했습니다.',c:['스킬 나열이 아니라 문제 해결 과정인가 (STAR)','본인의 행동(Action)이 본문의 절반 이상인가','응답시간·처리량·에러율 등 정량 지표가 있는가']},
   '입사 후 포부':{f:'입사 후 [단기 목표·기간] 안에 [핵심 업무·기술]을 익히고, 이후 [장기 목표]를 통해 [팀·서비스]에 기여하겠습니다.',c:['단기→장기 목표가 구체적인가','회사가 나아가는 방향과 내 목표가 연결되는가']}},
 '프론트엔드':{
   '지원동기':{f:'[사용자 경험·제품]에 대한 관심에서 출발해 [관련 프로젝트·학습]를 진행했고, [지원 기업의 제품·서비스]에서 이 역량을 발휘하고 싶습니다.',c:['회사 제품을 직접 써본 경험이 있는가','UX·사용성 관점의 관심이 드러나는가']},
   '직무역량':{f:'[사용자 문제]를 해결하기 위해 [UI·기능]을 설계·구현해 [사용성 지표]를 개선했습니다.',c:['사용자 문제에서 출발했는가','이탈률·접근성 점수·렌더링 시간 등 측정 지표가 있는가','"제가" 한 작업이 명확한가']},
   '입사 후 포부':{f:'입사 후 [단기 목표]로 제품의 사용자 경험을 개선하고, 장기적으로 [디자인 시스템·아키텍처 기여]를 이루겠습니다.',c:['사용자 가치 관점의 목표인가']}},
 '인프라/DevOps':{
   '지원동기':{f:'[배포·운영 자동화] 경험을 바탕으로 [대상 시스템]의 안정성과 효율을 높이는 데 기여하겠습니다.',c:['운영·자동화 경험이 구체적인가','대상 시스템의 규모·특성을 언급했는가']},
   '직무역량':{f:'[인프라 문제·장애] 상황에서 [모니터링·분석 도구]로 원인을 파악하고, [자동화·개선 조치]를 적용해 [가용성·배포 시간]을 개선했습니다.',c:['장애 대응·개선의 전 과정이 보이는가','배포 주기·가용성 등 운영 지표가 있는가']},
   '입사 후 포부':{f:'입사 후 [단기 목표]로 운영 자동화를 확립하고, 장기적으로 [플랫폼·SRE 역할]을 수행하겠습니다.',c:['안정성·효율 지향 목표인가']}},
 '데이터/AI':{
   '지원동기':{f:'[데이터 분석·모델링 경험]을 통해 [비즈니스 문제]를 해결한 경험이 있어, [지원 기업의 데이터 과제]에 기여하고자 지원했습니다.',c:['데이터로 만든 실제 변화가 있는가']},
   '직무역량':{f:'[데이터셋·분석 방법]으로 [비즈니스 문제]를 분석·예측해 [의사결정·지표 개선]에 기여했습니다.',c:['모델·기법만 나열하지 않고 문제→결과 구조인가','정확도·매출·효율 등 성과 지표가 있는가']},
   '입사 후 포부':{f:'입사 후 [단기 목표]로 데이터 파이프라인을 안정화하고, 장기적으로 [데이터 기반 의사결정 체계]를 만들겠습니다.',c:['분석이 실제 의사결정으로 이어지는 목표인가']}},
 '보안':{
   '지원동기':{f:'[보안 학습·분석 경험]을 통해 [위협·취약점 사례]를 다뤄봤으며, [지원 기업의 서비스·자산]을 지키는 데 기여하고 싶습니다.',c:['실습·대회·분석 등 구체 경험이 있는가']},
   '직무역량':{f:'[위협·취약점]을 탐지·분석하고 [대응 조치]를 적용해 [재발 방지·개선 결과]를 만들었습니다.',c:['탐지→분석→대응 흐름인가']},
   '입사 후 포부':{f:'입사 후 [단기 목표]로 보안 운영 역량을 갖추고, 장기적으로 [보안 체계 고도화]에 기여하겠습니다.',c:[]}},
 '공통':{
   '협업·갈등':{f:'[갈등·난관 상황]에서 [본인의 행동]으로 [팀의 결과]를 만들었고, [배운 점]을 체득했습니다.',c:['"우리"가 아니라 "저는"으로 본인 역할이 드러나는가','갈등 상황 → 본인 행동 → 팀 결과 순서인가']},
   '성장과정':{f:'[계기·전환점]을 통해 [가치관]을 갖게 되었고, 이를 [적용 경험]에서 발휘해 [결과·변화]를 만들었습니다.',c:['연대기 나열이 아니라 핵심 계기 1개인가','형성된 가치관이 지원 직무와 연결되는가']},
   '지원동기':{f:'[관심 계기]에서 시작해 [관련 경험·노력]을 쌓았고, [지원 기업·직무]에서 [기여 방향]을 이루고 싶습니다.',c:['기업 조사 근거가 있는가','경험과 기여가 연결되는가']},
   '직무역량':{f:'[상황·문제]에서 [목표]를 위해 [본인의 구체적 행동]을 수행해 [정량 결과]를 달성했습니다.',c:['STAR 구조(상황·과제·행동·결과)인가','수치 근거가 있는가']},
   '입사 후 포부':{f:'입사 후 [단기 목표]를 이루고, 장기적으로 [성장 방향]을 통해 [조직 기여]를 실현하겠습니다.',c:['회사 비전과 연결되는가']}}
};
export function jobTypeOfListing(l:Any, targetJob:string){
  if(!l) return targetJob;
  const hay=((l.tags||[]).join(' ')+' '+(l.position||''));
  for(const jt of Object.keys(JOBTYPE_KW)) if(hay.includes(jt.split('/')[0])) return jt;
  return '공통';
}
export function guideFor(jt:string,qt:string){ return (GUIDE[jt]&&GUIDE[jt][qt])||GUIDE['공통'][qt]||GUIDE['공통']['직무역량'] }

/* ---------- 날짜 ---------- */
export function dd(n:number){ const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10) }
export function today(off=0){ const d=new Date(); d.setDate(d.getDate()+(off||0)); return d.toISOString().slice(0,10) }
export function dday(ds:string){ return Math.ceil((new Date(ds).getTime()-new Date(today()).getTime())/86400000) }
export function uid(S:Any,p:string){ return p+(++S.seq) }

/* ---------- 칸반 상태 ---------- */
export const STATUS=['PREPARING','APPLIED','DOC_PASS','INTERVIEW','FINAL_PASS','REJECTED'];
export const STATUS_NAME:Record<string,string>={PREPARING:'서류 준비 중',APPLIED:'지원 완료',DOC_PASS:'서류 합격',INTERVIEW:'면접 예정',FINAL_PASS:'최종 합격',REJECTED:'불합격'};

/* ---------- 시드 데이터 ---------- */
export const SEED = {
  role:'student',
  profile:{name:'이영진', major:'컴퓨터공학과', skills:['Java','Python','SQL','React','Git'], targetJob:'백엔드'},
  listings:[
    {id:'L1',company:'넥스테크',position:'백엔드 개발자',loc:'서울 강남',career:'신입',type:'정규직',salary:'3,400만',deadline:dd(7),skills:['Java','Spring','MySQL','AWS'],tags:['백엔드','IT'],desc:'전자상거래 플랫폼 백엔드 API 설계·개발. Spring 기반 마이크로서비스 운영.',approved:true,src:'관리자',isActive:true},
    {id:'L2',company:'핀테크랩',position:'프론트엔드 개발자',loc:'서울 중구',career:'신입',type:'정규직',salary:'3,200만',deadline:dd(5),skills:['React','TypeScript','JavaScript'],tags:['프론트엔드','핀테크'],desc:'결제 대시보드 프론트엔드 개발. React·TypeScript 기반.',approved:true,src:'관리자',isActive:true},
    {id:'L3',company:'클라우드나인',position:'DevOps 엔지니어',loc:'서울',career:'경력 3년↑',type:'정규직',salary:'4,500만',deadline:dd(14),skills:['Docker','Kubernetes','AWS','CI/CD'],tags:['인프라','DevOps'],desc:'Kubernetes 클러스터 운영·배포 자동화 파이프라인 구축.',approved:true,src:'관리자',isActive:true},
    {id:'L4',company:'데이터웍스',position:'데이터 엔지니어',loc:'성남 판교',career:'경력무관',type:'정규직',salary:'3,800만',deadline:dd(10),skills:['Python','SQL','Spark','ETL'],tags:['데이터'],desc:'대규모 로그 데이터 파이프라인(ETL) 개발·운영.',approved:true,src:'관리자',isActive:true},
    {id:'L5',company:'시큐어링크',position:'정보보안 담당자',loc:'수원',career:'신입~2년',type:'정규직',salary:'3,300만',deadline:dd(21),skills:['네트워크','보안','Linux'],tags:['보안'],desc:'보안관제·취약점 점검·침해사고 대응.',approved:true,src:'관리자',isActive:true},
    {id:'L6',company:'AI랩스',position:'머신러닝 엔지니어',loc:'서울',career:'석사우대',type:'정규직',salary:'5,000만',deadline:dd(9),skills:['Python','PyTorch','머신러닝','데이터'],tags:['AI','데이터'],desc:'추천 모델 학습·서빙 파이프라인 구축.',approved:true,src:'관리자',isActive:true},
    {id:'L7',company:'모바일온',position:'안드로이드 개발자',loc:'서울',career:'신입',type:'정규직',salary:'3,500만',deadline:dd(18),skills:['Kotlin','Android','Git'],tags:['모바일'],desc:'커머스 앱 안드로이드 클라이언트 개발.',approved:true,src:'관리자',isActive:true},
    {id:'L8',company:'웹플로우',position:'웹 퍼블리셔',loc:'서울 마포',career:'신입~3년',type:'계약직',salary:'2,900만',deadline:dd(3),skills:['HTML','CSS','JavaScript'],tags:['웹','퍼블리싱'],desc:'반응형 웹 페이지 마크업·UI 구현.',approved:true,src:'관리자',isActive:true},
    {id:'L9',company:'게임팩토리',position:'게임 클라이언트 개발자',loc:'성남',career:'신입',type:'정규직',salary:'3,600만',deadline:dd(12),skills:['C++','Unity','Git'],tags:['게임','개발'],desc:'Unity 기반 모바일 게임 클라이언트 개발.',approved:true,src:'관리자',isActive:true},
    {id:'L10',company:'한빛물산',position:'생산관리 사무직',loc:'안산',career:'신입',type:'정규직',salary:'2,800만',deadline:dd(15),skills:['엑셀','ERP'],tags:['생산관리'],desc:'생산 실적 집계·ERP 입력 관리. (비컴공 — 자동분류 비교용)',approved:true,src:'관리자',isActive:true},
    {id:'L11',company:'미래식품',position:'품질관리(QC)',loc:'평택',career:'경력무관',type:'정규직',salary:'3,000만',deadline:dd(20),skills:['HACCP','QC'],tags:['품질관리'],desc:'식품 품질 검사·HACCP 문서 관리. (비컴공)',approved:true,src:'관리자',isActive:true},
    {id:'L12',company:'스마트리테일',position:'영업 지원',loc:'서울',career:'신입',type:'계약직',salary:'2,700만',deadline:dd(6),skills:['엑셀','PPT'],tags:['영업'],desc:'영업 데이터 정리·제안서 보조. (비컴공)',approved:true,src:'관리자',isActive:true}
  ],
  postings:[
    {id:'P1',listingId:'L8',status:'PREPARING',history:[{s:'PREPARING',at:today()}]},
    {id:'P2',listingId:'L4',status:'APPLIED',history:[{s:'PREPARING',at:today(-2)},{s:'APPLIED',at:today(-1)}]}
  ],
  bookmarks:['L1'],
  coverLetters:[
    {id:'C1',title:'넥스테크 백엔드 지원 자소서',items:[{q:'지원 동기',text:'당시 팀 프로젝트에서 API 응답 지연 문제가 있었습니다. 저는 직접 쿼리를 분석하고 캐시를 적용해 응답 시간을 40% 개선했습니다. 그 결과 사용자 이탈률이 감소했고, 팀원 5명과 코드 리뷰를 통해 구조를 함께 다듬었습니다. 넥스테크의 대규모 트래픽 환경에서 이 경험을 살려 백엔드 성능 개선에 기여하고 싶습니다.'}],versions:[],score:null}
  ],
  notif:[{text:'웹플로우 마감 D-3 — 지원 마무리하세요',read:false}],
  interviews:[],
  seq:100
};

/* ---------- 핵심 로직 ---------- */
// 단어 경계 매칭 (F-17, A-04: "Java" ≠ "JavaScript")
export function kwCount(text:string, kw:string){
  if(!/[A-Za-z0-9+#]/.test(kw)) return Math.max(0, text.split(kw).length-1);
  const esc = kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re = new RegExp('(?<![A-Za-z0-9+#])'+esc+'(?![A-Za-z0-9+#])','gi');
  return (text.match(re)||[]).length;
}
// 자동 분류 (F-42)
export function classify(row:Any){
  const hay = [row.company,row.position,row.desc,(row.skills||[]).join(' ')].join(' ');
  const hits = CS_KEYWORDS.filter(k=>kwCount(hay,k)>0);
  return {isCS: hits.length>0, hits};
}
// 매칭 점수 (F-11/12): 기술 일치 55 + 희망직무 20 + 경력 15 + 마감 10
export function matchScore(profile:Any, l:Any){
  const req = l.skills||[];
  const mine = profile.skills.map((s:string)=>s.toLowerCase());
  const hit = req.filter((s:string)=>mine.includes(s.toLowerCase()));
  const miss = req.filter((s:string)=>!mine.includes(s.toLowerCase()));
  const skillPt = req.length? hit.length/req.length*55 : 30;
  const jobPt = (l.tags||[]).some((t:string)=>t===profile.targetJob) || (l.position||'').includes(profile.targetJob.replace(/\/.*$/,'')) ? 20 : 0;
  const carPt = /신입|무관/.test(l.career||'') ? 15 : 5;
  const d = dday(l.deadline);
  const dlPt = d<=3?10 : d<=7?8 : d<=14?5 : 3;
  return {score:Math.round(skillPt+jobPt+carPt+dlPt), hit, miss};
}
// 자소서 채점 (F-16): 분량10·표현15·수치15·STAR25·직군20·문장길이10·협업5
export function analyzeCoverLetter(text:string, jobType:string){
  const jamo = (text.match(/[ㄱ-ㅎㅏ-ㅣ]/g)||[]).length;
  const chars = text.replace(/\s/g,'').length;
  const letters = (text.match(/[가-힣A-Za-z]/g)||[]).length;
  const words = text.split(/\s+/).filter(w=>w.replace(/[^가-힣A-Za-z0-9]/g,'').length>=2);
  const fail:string[] = [];
  if(chars<100) fail.push('분량 부족 (100자 미만)');
  if(chars>0 && jamo/chars>0.12) fail.push('단독 자모 비율 과다');
  if(words.length<20) fail.push('유효 단어 수 미달 (20개 미만)');
  if(chars>0 && letters/chars<0.5) fail.push('문자 비율 미달');
  if(fail.length) return {ok:false, fail};

  const items:Record<string,number> = {};
  items['분량'] = Math.min(10, Math.round(chars/80));
  const cliche = (text.match(/열심히|최선|노력하겠|성실히|열정/g)||[]).length;
  const concrete = (text.match(/프로젝트|구현|개발|설계|분석|개선|성과|지표/g)||[]).length;
  items['표현'] = Math.max(0, Math.min(15, 8 + Math.min(4,concrete) - cliche*2 + (/습니다|였습니다/.test(text)?3:0)));
  const nums = (text.match(/\d+(\.\d+)?\s*(%|명|건|개|배|점|위|원|개월|년|분|초)/g)||[]).length;
  items['수치 근거'] = Math.min(15, nums*5);
  const S1=/당시|처음|문제|상황|어려움/.test(text), T1=/목표|과제|해야|필요|기여|위해/.test(text),
        A1=/저는|직접|구현|개발|설계|분석|진행|적용|만들/.test(text), R1=/결과|성과|달성|개선|향상|완료|감소|수상|배웠/.test(text);
  items['STAR 구조'] = (S1?5:0)+(T1?5:0)+(A1?8:0)+(R1?7:0);
  const jkw = JOBTYPE_KW[jobType]||[];
  const jhit = jkw.filter(k=>kwCount(text,k)>0).length;
  items['직군 키워드'] = Math.min(20, jhit*4);
  const sents = text.split(/[.!?。\n]/).map(s=>s.trim()).filter(s=>s.length>0);
  const avg = sents.length? sents.reduce((a,s)=>a+s.length,0)/sents.length : 0;
  items['문장 길이'] = avg>=20&&avg<=80 ? 10 : avg>0?5:0;
  items['협업'] = /팀|협업|함께|소통|리뷰|공유|동료/.test(text)?5:0;
  const order:[string,number][]=[['분량',10],['표현',15],['수치 근거',15],['STAR 구조',25],['직군 키워드',20],['문장 길이',10],['협업',5]];
  const detail = order.map(([k,max])=>({name:k,score:items[k],max}));
  const total = detail.reduce((a,x)=>a+x.score,0);
  const good:string[]=[],bad:string[]=[];
  detail.forEach(d=>{ (d.score/d.max>=0.6?good:bad).push(d.name) });
  return {ok:true,total,detail,good,bad};
}
// 히트맵 (F-17)
export function heatmap(text:string, kws:string[]){ return kws.map(k=>({kw:k,n:kwCount(text,k)})) }

/* ---------- F-64 규칙 기반 모의면접 ---------- */
// 직군별 질문 템플릿 — AI 평가 없이 규칙 기반 (spec: 템플릿 25+)
export const INTERVIEW_QUESTION_TEMPLATES:Record<string,string[]>={
 '백엔드':[
  '자기소개와 함께 백엔드 개발자로 지원한 이유를 말씀해 주세요.',
  '가장 기억에 남는 API·서버 개선 경험을 STAR로 설명해 주세요.',
  '트래픽이 급증했을 때 서버가 느려진다면 어떤 순서로 원인을 찾겠습니까?',
  'DB 쿼리 성능을 개선했던 경험이 있다면 구체적으로 말씀해 주세요.',
  '팀 프로젝트에서 기술적 의견 충돌이 있었던 경험과 해결 방법을 말씀해 주세요.',
  '우리 회사 서비스의 백엔드에 기여하고 싶은 부분이 무엇입니까?'],
 '프론트엔드':[
  '자기소개와 함께 프론트엔드 개발자로 지원한 이유를 말씀해 주세요.',
  '사용자 경험을 개선했던 UI 작업을 STAR로 설명해 주세요.',
  '렌더링 성능 저하를 진단·개선한 경험이 있다면 말씀해 주세요.',
  '디자이너·기획자와 의견이 다를 때 어떻게 조율했는지 사례를 말씀해 주세요.',
  '접근성·반응형 대응에서 신경 쓴 부분을 구체적으로 말씀해 주세요.',
  '우리 회사 제품의 프론트엔드에서 개선하고 싶은 점이 있습니까?'],
 '인프라/DevOps':[
  '자기소개와 함께 인프라·DevOps 직군을 선택한 이유를 말씀해 주세요.',
  '배포·운영 자동화를 구축했던 경험을 STAR로 설명해 주세요.',
  '장애 발생 시 대응 절차를 어떻게 설계·실행하겠습니까?',
  '모니터링 지표 중 가장 중요하게 보는 것과 그 이유를 말씀해 주세요.',
  'CI/CD 파이프라인을 개선했던 경험이 있다면 정량 지표와 함께 말씀해 주세요.',
  '우리 회사 인프라에 기여할 수 있는 부분이 무엇이라 생각합니까?'],
 '데이터/AI':[
  '자기소개와 함께 데이터·AI 직군을 선택한 이유를 말씀해 주세요.',
  '데이터 분석·모델링으로 만든 실제 변화를 STAR로 설명해 주세요.',
  '모델 성능이 기대보다 낮을 때 어떤 순서로 개선하겠습니까?',
  '분석 결과를 비개발 직군에게 설명했던 경험을 말씀해 주세요.',
  '데이터 파이프라인을 설계·안정화한 경험이 있다면 말씀해 주세요.',
  '우리 회사의 데이터로 풀어보고 싶은 문제가 있습니까?'],
 '보안':[
  '자기소개와 함께 보안 직군을 선택한 이유를 말씀해 주세요.',
  '취약점을 탐지·분석·대응했던 경험을 STAR로 설명해 주세요.',
  '침해사고가 발생했다는 보고를 받았을 때 첫 24시간 행동 순서를 말씀해 주세요.',
  '보안과 편의성이 충돌할 때 어떻게 균형을 잡았는지 사례를 말씀해 주세요.',
  '보안 학습·대회·분석 중 가장 성장했던 경험을 말씀해 주세요.'],
 '공통':[
  '1분 자기소개를 해 주세요.',
  '팀 프로젝트에서 맡은 역할과 기여를 수치와 함께 말씀해 주세요.',
  '가장 어려웠던 문제와 해결 과정을 STAR로 설명해 주세요.',
  '입사 후 1년 안에 이루고 싶은 목표를 말씀해 주세요.',
  '마지막으로 질문하고 싶은 점이나 하고 싶은 말이 있습니까?']
};
export const INTERVIEW_CHECK_ITEMS=['두괄식 (결론 먼저)','수치·정량 근거 포함','STAR 구조 (상황→과제→행동→결과)','90초 내 마무리'];
export function nextPractice(S:Any){
  // 답변 기록이 가장 적은 직군을 다음 연습으로 추천
  const types=[...Object.keys(JOBTYPE_KW),'공통'];
  const counts=types.map(t=>({t,n:(S.interviews||[]).filter((r:Any)=>r.jobType===t).length}));
  counts.sort((a,b)=>a.n-b.n);
  return counts[0].t;
}

export function listingById(S:Any, id:string){ return S.listings.find((l:Any)=>l.id===id) }
export function visibleListings(S:Any){ return S.listings.filter((l:Any)=>l.isActive&&l.approved) }

export const CRITERIA:Record<string,string>={분량:'작성 분량(총 글자 수)',표현:'구체 표현·격식체·상투어 감점','수치 근거':'숫자+단위 정량 표현 수','STAR 구조':'상황·과제·행동·결과 요소 충족','직군 키워드':'희망 직군 사전 키워드 출현','문장 길이':'평균 문장 20~80자 적정',협업:'팀·협업·소통 표현 존재'};
