const D=window.GOOG_DATA,SEC=window.GOOG_SEC,XF=window.GOOG_X||[],YT=window.GOOG_YT||[];
const T=s=>s;
const lk=(s,u)=>u?`<a href="${u}" target="_blank" rel="noopener">${s}</a>`:s,na=()=>`<span class="na">${T('n/a')}</span>`;
const bn=v=>v==null?na():(v<0?'−':'')+'$'+(Math.abs(v)/1e9).toFixed(2)+'bn',b1=v=>(v<0?'−':'')+'$'+Math.abs(v).toFixed(1)+'bn';
const ql=d=>({'03-31':'Q1','06-30':'Q2','09-30':'Q3','12-31':'Q4'}[d.slice(5)])+' '+d.slice(0,4);
const SRCL=(s,u)=>`<p class="src">${T('Source')}: ${lk(s,u)}</p>`,XBRL='https://data.sec.gov/api/xbrl/companyfacts/CIK0001652044.json';
const TABS=[['overview','Overview'],['financials','Financials'],['segments','Segments'],['compute','TPU & compute'],['ai','AI & Gemini rollout'],['waymo','Waymo & Other Bets'],['calls','Earnings calls'],['estimates','Wall Street estimates'],['insiders','Insiders'],['filings','SEC filings'],['legal','Regulatory & antitrust'],['people','Key people'],['video','YouTube / video'],['holders','13F holders'],['catalysts','Catalysts'],['sources','Sources & news'],['position','My position']];
let charts=[],FS='is';
/* ---------- live quote: own worker (planned) -> Micron worker (temporary) -> CNBC -> build-time close ---------- */
const QSRC=[['GOOG worker',(/\.workers\.dev$/.test(location.hostname)?'/api/quote':'https://goog-dashboard.cashcache.workers.dev/api/quote')+'?symbol=GOOGL'],['Micron quote worker (temporary fallback)','https://micron-dashboard.cashcache.workers.dev/api/quote?symbol=GOOGL']];
const CNBC='https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=GOOGL&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1';
const W={d:null,src:null,at:0,err:null},C={d:null,at:0};
const sgt=ms=>new Date(ms).toLocaleString('en-GB',{timeZone:'Asia/Singapore',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
const livePx=()=>W.d?W.d.main.price:C.d?parseFloat(C.d.last):D.close.px;
function quoteHTML(){
 if(W.d){const w=W.d,m=w.main,c=+m.change,cls=c>=0?'pos':'neg',sg=c>=0?'+':'',rg=w.regular||{},pc=w.prev_close||{};
  return `<div class="lq"><span class="px">$${m.price.toFixed(2)}</span><span class="ch ${cls}">${sg}${c.toFixed(2)} (${sg}${(+m.pct).toFixed(2)}%)</span><span class="badge">${m.label}</span><span class="src">${T('Regular close')} $${rg.price!=null?rg.price.toFixed(2):'—'}${pc.price!=null?` · ${T('prev close')} $${pc.price.toFixed(2)} (${pc.date})`:''}</span></div>
  <p class="src">${T('Updated')} ${sgt(W.at)} SGT · ${'quote time'} ${m.time_et} · ${T('Source')}: ${lk('Robinhood','https://robinhood.com/stocks/GOOGL')} via ${lk(W.src[0],W.src[1])} (${w.source_note}) · ${T('refreshes every 15 s')}</p>`}
 if(C.d){const q=C.d,c=parseFloat(q.change);return `<div class="lq"><span class="px">$${q.last}</span><span class="ch ${c>=0?'pos':'neg'}">${q.change} (${q.change_pct})</span></div><p class="src">${T('Updated')} ${sgt(C.at)} SGT · ${T('Source')}: ${lk('CNBC quote feed','https://www.cnbc.com/quotes/GOOGL')} · ${T('refreshes every 15 s')}</p>`}
 return `<div class="lq"><span class="px">$${D.close.px.toFixed(2)}</span><span class="src">${'Close'} ${D.close.date}</span></div><p class="src">${'Loading live quote…'}</p>`}
async function pollQuote(){let ok=false;
 for(const s of QSRC){try{const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),7000);const r=await fetch(s[1]+'&t='+Date.now(),{cache:'no-store',signal:ctl.signal});clearTimeout(to);const j=await r.json();if(!j||!j.ok||!j.main||!j.main.price)throw 0;W.d=j;W.src=s;W.at=Date.now();ok=true;break}catch(e){}}
 if(!ok&&!W.d){try{const r=await fetch(CNBC,{cache:'no-store'});const q=(await r.json()).FormattedQuoteResult.FormattedQuote[0];if(q&&q.last){C.d=q;C.at=Date.now()}}catch(e){}}
 const el=document.getElementById('lq');if(el)el.innerHTML=quoteHTML();const mc=document.getElementById('mcap');if(mc)mc.innerHTML=mcapTxt()}
const mcapTxt=()=>'$'+(D.val.mcap*livePx()/D.val.px0/1e12).toFixed(2)+'T';
/* ---------- helpers ---------- */
const card=(h,body,src)=>`<div class="card">${h?`<h2>${h}</h2>`:''}${body}${src||''}</div>`;
const tbl=(head,rows)=>`<div class="tw"><table><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
const hc=(l,v,s,id)=>`<div class="hcard"><div class="l">${l}</div><div class="v"${id?` id="${id}"`:''}>${v}</div><div class="s src">${s}</div></div>`;
const ttm=a=>a.slice(-4).reduce((x,y)=>x+y,0);
const pdate=s=>{const t=Date.parse(s.replace(/\(.*\)/,''));return isNaN(t)?0:t};
/* ---------- sections ---------- */
const S={};
S.overview=()=>{const fcf=SEC.fs.cf.find(r=>r[0]==='Free cash flow').slice(1),tf=ttm(fcf),r=D.ratings,n=r.sb+r.b+r.h+r.s;
 return `<div class="hero"><h1>Alphabet <span class="tk">GOOGL</span></h1></div>
 ${card(`<span class="livedot"></span> ${T('Live price')}`,`<div id="lq">${quoteHTML()}</div>`)}
 <div class="h4">${hc(T('Market cap'),mcapTxt(),`${'Scaled from'} $3.92T @ $320.21 · ${lk('stockanalysis.com, 24 Oct 2026',D.val.src)}`,'mcap')}
 ${hc(T('Forward P/E'),'23.9x',`${'Trailing'} 16.1x ${'(inflated by equity gains)'} · ${lk('stockanalysis.com',D.val.src)}`)}
 ${hc(T('EV/EBITDA'),'21.9x',`EV $3.79T · ${lk('stockanalysis.com',D.val.src)}`)}
 ${hc(T('Consensus'),'Strong Buy',`${T('Mean target')} <b>${r.mean?'$'+r.mean.toFixed(2):'n/a'}</b> · ${r.sb}/${r.b}/${r.h}/${r.s} (${n}) · ${lk('S&P Global via stockanalysis, '+r.asof,r.src)}`)}</div>
 <div class="h2row"><div class="mini"><div class="l">${T('52-week range')}</div><div class="v">$${D.close.lo}–$${D.close.hi}</div></div>
 <div class="mini"><div class="l">${'TTM free cash flow'}</div><div class="v">${b1(tf/1e9)}</div><div class="s">${lk('SEC XBRL',XBRL)}</div></div>
 <div class="mini"><div class="l">${'FY2026 capex guide'}</div><div class="v">$195–205bn</div><div class="s">${lk('Q3 call','https://stockanalysis.com/stocks/googl/transcripts/712854-q3-2026/')}</div></div>
 <div class="mini"><div class="l">FY2027 capex</div><div class="v">↑ significantly</div><div class="s">mgmt; $ n/a until Q4 call</div></div>
 <div class="mini"><div class="l">${'Next earnings'}</div><div class="v">n/a</div><div class="s">Q4 2026 date not yet announced (checked 29 Oct 2026); Q3 reported 28 Oct</div></div></div>
 <div class="card callout"><b>${T('Trailing P/E caveat')}.</b> ${'Q1 and Q2 2026 net income include $37.7bn and $98.0bn of other income, mostly unrealized gains on equity stakes. Use forward P/E or operating income.'} ${lk('Q2 2026 call',D.q2call)}</div>
 ${card(T('What changed this week'),`<ul class="week">${D.week.map(w=>`<li><span class="d">${w[0]}</span>${lk(w[1],w[2])}</li>`).join('')}</ul>`)}
 ${card(`GOOGL ${'chart'} <span class="src">NASDAQ:GOOGL · TradingView</span>`,'<div class="tvchart" id="tv"></div>',SRCL('TradingView NASDAQ:GOOGL','https://www.tradingview.com/symbols/NASDAQ-GOOGL/'))}`};
S.financials=()=>{const F=SEC.fs,C=F.cols,isE=l=>/EPS/.test(l),rows=F[FS],A=SEC.annual;
 const fmt=(l,v)=>v==null?na():isE(l)?'$'+v.toFixed(2):bn(v);
 return `<h1>${T('Financials')}</h1><p class="sub">${'SEC EDGAR XBRL companyfacts (CIK 1652044); each column links to its 10-Q/10-K. Built'} ${SEC.built}.</p>
 <div class="card"><div class="seg">${[['is','Income statement'],['bs','Balance sheet'],['cf','Cash flow']].map(([k,n])=>`<button class="${k===FS?'on':''}" onclick="FS='${k}';render()">${T(n)}</button>`).join('')}</div>
 ${tbl([T('Quarter'),...C.map(c=>`${lk(ql(c),F.acc[c].url)}<div class="src">${F.acc[c].form} · ${F.acc[c].filed}</div>`)],rows.map(r=>[T(r[0]),...r.slice(1).map(v=>`<span class="n">${fmt(r[0],v)}</span>`)]))}
 ${SRCL('SEC EDGAR XBRL companyfacts',XBRL)}</div>
 <div class="two">${card(T('Revenue')+' / '+T('Operating income'),'<div class="cw"><canvas id="f1"></canvas></div>')}${card(T('Operating cash flow')+' / '+T('Capex')+' / '+T('Free cash flow'),'<div class="cw"><canvas id="f2"></canvas></div>')}</div>
 ${card(T('10-year history')+' (FY2016–FY2025)','<div class="cw"><canvas id="f3"></canvas></div>'+tbl(['FY',...A.years],[[T('Revenue'),...A.rev.map(v=>bn(v))],[T('Operating income'),...A.opi.map(v=>bn(v))],[T('Operating cash flow'),...A.ocf.map(v=>bn(v))],[T('Capex'),...A.capex.map(v=>bn(v))],[T('Free cash flow'),...A.ocf.map((v,i)=>v!=null&&A.capex[i]!=null?bn(v-A.capex[i]):na())],['Buybacks',...A.bb.map(v=>bn(v))]]),SRCL('SEC 10-K XBRL',XBRL))}
 ${card(T('Valuation & payback'),tbl(['Metric','Value',T('Source')],[
  ['P/FCF (TTM)','73.5x',lk('stockanalysis.com',D.val.src)],
  ['FCF yield (TTM FCF / mkt cap)',(ttm(SEC.fs.cf.find(r=>r[0]==='Free cash flow').slice(1))/D.val.mcap*100).toFixed(2)+'%',lk('SEC XBRL',XBRL)+' + '+lk('stockanalysis',D.val.src)],
  ['Payback at TTM FCF (years)',(D.val.mcap/ttm(SEC.fs.cf.find(r=>r[0]==='Free cash flow').slice(1))).toFixed(0),'Market cap ÷ TTM FCF; calculated'],
  ['Net cash (30 Jun 2026)','$121.7bn ($242.5bn cash & securities − $120.8bn debt)',lk('Q2 10-Q',D.sources[0][1])],
  ['Dividend','$0.22/qtr · yield 0.27%',lk('stockanalysis.com',D.val.src)],
  ['Buybacks','None in Q1–Q2 2026 (paused)',lk('SEC XBRL',XBRL)]]))}`};
S.segments=()=>{const ks=Object.keys(D.SEG);return `<h1>${T('Segments')}</h1><p class="sub">${'Revenue by line, US$bn, Q3 2024–Q2 2026.'}</p>
 ${card(T('Segment revenue history'),'<div class="cw" style="height:360px"><canvas id="s1"></canvas></div>',SRCL('Alphabet 10-Q/10-K segment note; stockanalysis.com quarterly',D.sources[4][1]))}
 <div class="grid3">${ks.map((k,i)=>`<div class="card"><h2>${k}</h2><div class="cw" style="height:180px"><canvas id="sg${i}"></canvas></div><p class="src">Q2'26 $${D.SEG[k][7].toFixed(2)}bn · YoY ${((D.SEG[k][7]/D.SEG[k][3]-1)*100).toFixed(0)}%</p></div>`).join('')}</div>
 ${card('Google Cloud',tbl(['',"Q2'25","Q3'25","Q2'26","Q3'26"],D.cloud)+`<p>${'Q3 2026: Cloud +103%; TPU system sales a meaningful contributor. Google Services op. income $39.2bn (40.7% margin); Other Bets −$2.0bn. Backlog last reported $514bn (30 Jun 2026); Q3 figure n/a in release.'}</p>`,SRCL('Q3 2026 release','https://www.sec.gov/Archives/edgar/data/1652044/000165204426000080/googexhibit991q32026.htm'))}`};
S.compute=()=>{const H=SEC.qhist;return `<h1>${T('TPU & compute')}</h1>
 ${card('Multi-year capex plan (newest first)',tbl(['Year','Plan / guidance','Status',T('Source')],D.capexplan.map(r=>[`<b>${r[0]}</b>`,r[1],r[2],lk(r[3],r[4])])),SRCL('Management figures preferred; media/Street rows labelled',D.capexplan[0][4]))}
 ${card(T('Capex & infrastructure'),tbl(['Item','Detail',T('Source')],D.compute.map(r=>[`<b>${r[0]}</b>`,r[1],lk(r[2],r[3])])))}
 <div class="two">${card('Quarterly capex vs OCF (16 quarters, SEC XBRL)','<div class="cw"><canvas id="c1"></canvas></div>',SRCL('SEC XBRL',XBRL))}
 ${card(T('Capex guidance history'),'<div class="cw" style="height:200px"><canvas id="c2"></canvas></div>'+tbl([T('Date'),T('Event'),'US$bn'],D.guide.map(g=>[g[0],lk(g[1],g[4]),g[2]+'–'+g[3]])))}</div>
 ${card(T('TPU generations'),tbl(['Generation',T('Date'),'Specs (company-stated)',T('Status'),T('Source')],D.tpu.map(r=>[`<b>${r[0]}</b>`,r[1],r[2],r[3],lk(r[4],r[5])])))}
 ${card(T('External TPU deals'),tbl([T('Date'),T('Customer'),T('Deal'),T('Status'),T('Source')],D.deals.map(r=>[r[0],`<b>${r[1]}</b>`,r[2],`<span class="est ${/not confirmed/.test(r[3])?'e':''}">${r[3]}</span>`,lk(r[4],r[5])])),'<p class="src">'+'Nvidia GPU purchase volumes are not disclosed by Alphabet (n/a).'+'</p>')}`};
S.ai=()=>`<h1>${T('AI & Gemini rollout')}</h1><p class="sub">${'Newest first; each item links to its source.'}</p>
 ${card('',tbl([T('Date'),T('Area'),T('Launch'),T('Source')],D.roll.slice().sort((a,b)=>pdate(b[0])-pdate(a[0])).map(r=>[`<b style="white-space:nowrap">${r[0]}</b>`,r[1],r[2],lk(r[4],r[3])])))}
 ${card('Usage KPIs (Q3 2026 release; others Q2 call)',tbl(['KPI','Value'],[['Gemini app users','1B (Q3 2026; 950M MAU in Q2)'],['Model API tokens / min','~32B (Q3 2026; ~22B in Q2)'],['AI Mode MAU','>1B'],['Developers building monthly','>9M'],['Fortune 100 using Gemini Enterprise','~90%'],['Gemma downloads','>900M (Gemma 4: >300M)']]),SRCL('Alphabet Q2 2026 call, 22 Jul 2026',D.q2call))}`;
S.waymo=()=>{const w=D.waymo;return `<h1>${T('Waymo & Other Bets')}</h1>
 <div class="h4">${w.kpi.slice(0,4).map(k=>hc(k[0],k[1],lk(k[2],k[3]))).join('')}</div>
 <div class="two">${card('Paid rides per week (thousands, company-announced)','<div class="cw" style="height:220px"><canvas id="w1"></canvas></div>',SRCL('Waymo announcements via robotaxistats',w.ridesSrc))}
 ${card('Funding & Other Bets',tbl(['',''],w.kpi.slice(4).map(k=>[k[0],k[1]+' · '+lk(k[2],k[3])])))}</div>
 ${card(T('Cities')+` (${w.cities.length})`,tbl(['City',T('Status'),'Access'],w.cities.map(c=>[`<b>${c[0]}</b>`,c[1],c[2]])),SRCL('Waymo Help announcements; Waymo FAQ (22 Oct 2026)',w.citySrc))}`};
S.calls=()=>`<h1>${T('Earnings calls')}</h1><p class="sub">${'Latest: Q3 2026 on 28 Oct (US). Next: Q4 2026 results, date n/a (not yet announced, checked 29 Oct 2026).'}</p>
 ${card(T('Guidance vs actuals'),tbl(['Guided on','FY2026 capex guide','Actual to date'],[['28 Oct 2026','$195–205bn (reaffirmed)','9M $132.0bn → Q4 implied ~$63–73bn'],['22 Jul 2026','$195–205bn','H1 $80.6bn → H2 implied ~$115–125bn'],['29 Apr 2026','$180–190bn','Q1 $35.7bn'],['4 Feb 2026','$175–185bn','FY2025 actual $91.4bn']]),SRCL('Alphabet earnings calls; SEC XBRL',D.q2call))}
 ${D.calls.map(c=>card(`${c.q} · ${c.date}`,`<div class="two"><div><h3>${'Actuals'}</h3>${tbl(['',''],c.actual)}</div><div><h3>${T('Management guidance')}</h3><ul class="lst">${c.guide.map(x=>`<li>${x}</li>`).join('')}</ul><h3>${T('Call notes')}</h3><ul class="lst">${c.notes.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`,SRCL(c.q+' transcript',c.url))).join('')}
 <p class="src">${'Q&A-by-analyst highlights: n/a (to be added from the Q3 transcript).'}</p>`;
S.estimates=()=>{const r=D.ratings;return `<h1>${T('Wall Street estimates')}</h1>
 <div class="two">${card(T('Rating counts'),'<div class="cw" style="height:220px"><canvas id="e1"></canvas></div>',SRCL('S&P Global via stockanalysis.com, '+r.asof,r.src))}
 ${card('Price-target range',tbl(['',''],[['High','$515 (+60.8%)'],['Mean','$430.51 (+34.5%)'],['Median','$430'],['Low','$340 (+6.2%)']]),SRCL('stockanalysis.com, 22 Oct 2026',r.src))}</div>
 ${card(T('Price targets'),tbl(['Firm','Rating','Target',T('Date')],D.analysts),SRCL('stockanalysis.com forecasts',r.src))}
 ${card(T('Labelled estimates'),tbl(['Estimate','Value',T('Source')],D.est.map(e=>[e[0],'<span class="est e">'+'estimate'+'</span> '+e[1],lk(e[2],e[3])])),'<p class="src">'+'EPS/revenue consensus history over time: n/a (no free dated source).'+'</p>')}`};
S.insiders=()=>{const I=SEC.ins;return `<h1>${T('Insiders')}</h1><p class="sub">${'SEC Form 4, latest 60 filings, newest first. Codes: S sale, A grant, F tax withholding, C conversion, G gift, J other.'}</p>
 ${card('Open-market sales (code S) by person: plan vs non-plan, shares','<div class="cw" style="height:300px"><canvas id="i1"></canvas></div>',SRCL('SEC EDGAR Form 4','https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=4'))}
 ${card('',tbl([T('Date'),T('Name'),T('Role'),'Class',T('Code'),T('Shares'),T('Price'),'Plan',T('Form')],I.slice(0,80).map(x=>[x.date,`<b>${x.name}</b>`,`<span class="tag">${x.role||'—'}</span>`,(x.cls||'').replace(' Common Stock',''),x.code,`<span class="${x.ad==='D'?'neg':'pos'}">${x.ad==='D'?'−':'+'}${Math.round(x.shares).toLocaleString('en-US')}</span>`,x.px?'$'+x.px.toFixed(2):'—',x.plan?'10b5-1':'—',lk('Form 4',x.url)])))}`};
S.filings=()=>`<h1>${T('SEC filings')}</h1>${card('',tbl([T('Filed'),T('Form'),T('Description')],SEC.feed.map(f=>[f.filed,`<b>${f.form}</b>`,lk(f.desc||f.items||f.form,f.url)])),SRCL('SEC EDGAR submissions API','https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044'))}`;
S.legal=()=>`<h1>${T('Regulatory & antitrust')}</h1>${card('',tbl([T('Case'),T('Parties'),T('Status'),T('Next date'),T('Source')],D.legal.map(c=>[`<b>${c[0]}</b>`,c[1],c[2],c[3],lk('docket / report',c[4])])))}
 ${card('Other risks',`<ul class="lst">${D.risks.map(x=>`<li>${x}</li>`).join('')}</ul>`)}`;
S.people=()=>`<h1>${T('Key people')}</h1>${card(T('Quotes'),D.quotes.map(q=>`<div class="q"><div class="t">“${q[3]}”</div><div class="m"><b>${q[0]}</b> (${q[1]}) · ${q[2]} · ${lk(q[4],q[5])}</div></div>`).join(''))}
 ${card(T('X posts')+' · @sundarpichai · @demishassabis · @Google',XF.map(p=>`<div class="q"><div class="t">${p.text.replace(/</g,'&lt;')}</div><div class="m">@${p.user} · ${sgt(Date.parse(p.at))} SGT · ${lk('x.com',p.url)}</div></div>`).join(''),'<p class="src">'+'Verbatim via X API; Chinese translations n/a.'+'</p>')}`;
S.video=()=>`<h1>${T('YouTube / video')}</h1><p class="sub">${'Real videos found by build_youtube.py (yt-dlp search by upload date), newest first. Summaries are verbatim caption openings or description excerpts, labelled.'}</p>
 ${YT.length?YT.map(v=>card('',`<div class="vid"><a href="${v.url}" target="_blank" rel="noopener"><img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt=""></a><div><h2>${lk(v.title,v.url)}</h2><p class="src">${v.date} · ${v.channel} · ${v.dur||''}</p><p>${v.summary.replace(/</g,'&lt;')}</p><p class="src">${T('Summary')}: ${v.origin}</p></div></div>`)).join(''):card('',na())}`;
S.holders=()=>`<h1>${T('13F holders')}</h1>${card('',`<p class="na">${'Not built yet: 8-quarter 13F holder table (CUSIP 02079K305 / 02079K107) is a remaining gap. Q3 2026 13Fs are due 14 Nov 2026.'}</p>`)}`;
S.catalysts=()=>`<h1>${T('Catalysts')}</h1>${card('',tbl([T('Date'),T('Event'),T('Status'),T('Source')],D.cat.map(c=>[`<b>${c[0]}</b>${c[1]?`<div class="src">${c[1]}</div>`:''}`,c[2],c[3],lk(T('Source'),c[4])])))}`;
S.sources=()=>`<h1>${T('Sources & news')}</h1>${card(T('What changed this week'),`<ul class="week">${D.week.map(w=>`<li><span class="d">${w[0]}</span>${lk(w[1],w[2])}</li>`).join('')}</ul>`)}
 ${card(T('Source'),`<ul class="lst">${D.sources.map(s=>`<li>${lk(s[0],s[1])}</li>`).join('')}<li>${lk('SEC EDGAR XBRL companyfacts (CIK 1652044)',XBRL)}</li></ul>`)}`;
S.position=()=>`<h1>${T('My position')}</h1>${card('',tbl(['',''],[[T('Shares'),T('Not yet provided')],['Cost basis',T('Not yet provided')],['Unrealised P/L',T('Not yet provided')]]))}`;
/* ---------- render ---------- */
function mk(id,cfg){const e=document.getElementById(id);if(e){cfg.options=Object.assign({maintainAspectRatio:false,animation:false},cfg.options||{});charts.push(new Chart(e,cfg))}}
const G=['#4285F4','#EA4335','#FBBC05','#34A853','#7a2fd6','#8e8e93'];
function render(){const tab=(location.hash||'#overview').slice(1),t=S[tab]?tab:'overview';
 document.getElementById('nav').innerHTML=TABS.map(([k,n])=>`<a href="#${k}" class="${k===t?'on':''}">${T(n)}</a>`).join('');
 charts.forEach(c=>c.destroy());charts=[];document.getElementById('main').innerHTML=`<section class="on">${S[t]()}</section>`;
 const F=SEC.fs,lab=F.cols.map(ql),row=(sec,n)=>F[sec].find(r=>r[0]===n).slice(1).map(v=>v==null?null:v/1e9);
 mk('f1',{type:'bar',data:{labels:lab,datasets:[{label:T('Revenue'),data:row('is','Revenue'),backgroundColor:G[0]},{label:T('Operating income'),data:row('is','Operating income'),backgroundColor:G[3]}]}});
 mk('f2',{type:'bar',data:{labels:lab,datasets:[{label:T('Operating cash flow'),data:row('cf','Operating cash flow'),backgroundColor:G[0]},{label:T('Capex'),data:row('cf','Capex'),backgroundColor:G[1]},{label:T('Free cash flow'),data:row('cf','Free cash flow'),backgroundColor:G[3]}]}});
 const A=SEC.annual;mk('f3',{type:'bar',data:{labels:A.years,datasets:[{label:T('Revenue'),data:A.rev.map(v=>v/1e9),backgroundColor:G[0]},{label:T('Operating cash flow'),data:A.ocf.map(v=>v/1e9),backgroundColor:G[2]},{label:T('Capex'),data:A.capex.map(v=>v/1e9),backgroundColor:G[1]},{label:T('Free cash flow'),data:A.ocf.map((v,i)=>(v-A.capex[i])/1e9),backgroundColor:G[3]}]}});
 const ks=Object.keys(D.SEG);mk('s1',{type:'bar',data:{labels:D.Q,datasets:ks.map((k,i)=>({label:k,data:D.SEG[k],backgroundColor:G[i]}))},options:{scales:{x:{stacked:true},y:{stacked:true}}}});
 ks.forEach((k,i)=>mk('sg'+i,{type:'line',data:{labels:D.Q,datasets:[{label:k,data:D.SEG[k],borderColor:G[i],backgroundColor:G[i],tension:.3}]},options:{plugins:{legend:{display:false}}}}));
 const H=SEC.qhist;mk('c1',{type:'bar',data:{labels:H.q.map(ql),datasets:[{label:T('Capex'),data:H.capex.map(v=>v/1e9),backgroundColor:G[1]},{label:T('Operating cash flow'),data:H.ocf.map(v=>v/1e9),backgroundColor:G[0]}]}});
 mk('c2',{type:'bar',data:{labels:D.guide.map(g=>g[0]),datasets:[{label:'FY2026 capex guide (US$bn)',data:D.guide.map(g=>[g[2],g[3]]),backgroundColor:G[0]}]},options:{indexAxis:'y',scales:{x:{min:150}}}});
 mk('w1',{type:'bar',data:{labels:D.waymo.rides.map(r=>r[0]),datasets:[{label:'k rides/week',data:D.waymo.rides.map(r=>r[1]),backgroundColor:G[3]}]}});
 const r=D.ratings;mk('e1',{type:'bar',data:{labels:['Strong Buy','Buy','Hold','Sell'],datasets:[{label:'Analysts',data:[r.sb,r.b,r.h,r.s],backgroundColor:[G[3],G[0],G[2],G[1]]}]}});
 if(document.getElementById('i1')){const s=SEC.ins.filter(x=>x.code==='S'),names=[...new Set(s.map(x=>x.name))],sum=(n,p)=>s.filter(x=>x.name===n&&x.plan===p).reduce((a,x)=>a+x.shares,0);
  mk('i1',{type:'bar',data:{labels:names,datasets:[{label:T('Plan (10b5-1)'),data:names.map(n=>sum(n,true)),backgroundColor:G[0]},{label:T('Non-plan'),data:names.map(n=>sum(n,false)),backgroundColor:G[1]}]},options:{indexAxis:'y',scales:{x:{stacked:true},y:{stacked:true}}}})}
 const tv=document.getElementById('tv');if(tv){const s=document.createElement('script');s.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';s.async=true;s.text=JSON.stringify({symbol:'NASDAQ:GOOGL',interval:'D',timezone:'Asia/Singapore',theme:isDark()?'dark':'light',locale:'en',autosize:true,hide_side_toolbar:true});tv.appendChild(s)}}
const isDark=()=>{const t=document.documentElement.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches};
function applyTheme(){const t=document.documentElement.dataset.theme||'auto';themelbl.textContent=t==='auto'?'Auto':t==='dark'?'Dark':'Light';themeic.textContent=t==='auto'?'◐':t==='dark'?'☾':'☀';Chart.defaults.color=isDark()?'#a1a1a6':'#6e6e73';Chart.defaults.borderColor=isDark()?'rgba(255,255,255,.1)':'rgba(0,0,0,.08)'}
themebtn.onclick=()=>{const h=document.documentElement,c=h.dataset.theme||'auto',n=c==='auto'?(isDark()?'light':'dark'):c==='dark'?'light':'auto';if(n==='auto'){delete h.dataset.theme;try{localStorage.removeItem('goog-theme')}catch(e){}}else{h.dataset.theme=n;try{localStorage.setItem('goog-theme',n)}catch(e){}}applyTheme();render()};
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{applyTheme();render()});
window.addEventListener('hashchange',render);applyTheme();render();pollQuote();setInterval(()=>{if(!document.hidden)pollQuote()},15000);
