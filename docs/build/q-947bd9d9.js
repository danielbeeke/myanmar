import{m as f,t as b,O as _,E as P,q as p,H as g,$}from"./q-7a24ca2a.js";import{u as k,a as D,g as m,s as K,b as O,p as S,l as A}from"./q-b9df7953.js";const C=o=>{const e=k(),t=D(),{onClick$:r,prefetch:n,reload:l,replaceState:d,scroll:v,...s}=(()=>o)(),a=f(()=>m({...s,reload:l},t));s["link:app"]=!!a,s.href=a||o.href;const h=f(()=>!!a&&n!==!1&&n!=="js"&&K(a,t)||void 0),i=f(()=>h||!!a&&n!==!1&&O(a,t))?p(()=>Promise.resolve().then(()=>u),"s_Osdg8FnYTw4"):void 0,y=a?b((c,L)=>{c.metaKey||c.ctrlKey||c.shiftKey||c.altKey||c.preventDefault()},"(event,target)=>{if(!(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)){event.preventDefault();}}"):void 0;return _("a",{...s,children:P(g,null,3,"AD_0"),"data-prefetch":h,onClick$:[y,r,a?p(()=>Promise.resolve().then(()=>u),"s_pIf0khHUxfY",[e,l,d,v]):void 0],onFocus$:[s.onFocus$,i],onMouseOver$:[s.onMouseOver$,i],onQVisible$:[s.onQVisible$,i]},null,0,"AD_1")},w=async(o,e)=>{const[t,r,n,l]=$();o.defaultPrevented&&(e.hasAttribute("q:nbs")?await t(location.href,{type:"popstate"}):e.href&&(e.setAttribute("aria-pressed","true"),await t(e.href,{forceReload:r,replaceState:n,scroll:l}),e.removeAttribute("aria-pressed")))},q=(o,e)=>{var t;if(!((t=navigator.connection)!=null&&t.saveData)&&e&&e.href){const r=new URL(e.href);S(r.pathname),e.hasAttribute("data-prefetch")&&A(r,e,{prefetchSymbols:!1,isPrefetch:!0})}},u=Object.freeze(Object.defineProperty({__proto__:null,s_8gdLBszqbaM:C,s_Osdg8FnYTw4:q,s_pIf0khHUxfY:w},Symbol.toStringTag,{value:"Module"}));export{C as s_8gdLBszqbaM,q as s_Osdg8FnYTw4,w as s_pIf0khHUxfY};