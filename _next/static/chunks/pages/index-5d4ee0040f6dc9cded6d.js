(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{9138:function(t,a,e){"use strict";e.d(a,{$:function(){return n}});var l=e(5675),c=e(4246),i=function(t){var a=t.src;return"/co-share".concat(a)};function n(){return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)("div",{className:"flex-grow-1"}),(0,c.jsx)("footer",{className:"bg-light",children:(0,c.jsxs)("div",{className:"d-flex align-items-center justify-content-around p-3 container-lg",children:[(0,c.jsxs)("a",{target:"_blank",href:"https://github.com/cocoss-org/co-share",className:"mx-2 text-black d-flex flex-row align-items-center",children:[(0,c.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",fill:"currentColor",className:"bi bi-github mx-2",viewBox:"0 0 16 16",children:(0,c.jsx)("path",{d:"M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"})}),(0,c.jsx)("span",{className:"h5 mb-0",children:"Github"})]}),(0,c.jsx)("a",{className:"d-flex mx-2",target:"_blank",href:"https://www.coconut-xr.com/",children:(0,c.jsx)(l.default,{loader:i,layout:"fixed",width:170,height:40,src:"/powered-by.svg"})})]})})]})}},1655:function(t,a,e){"use strict";e.d(a,{h:function(){return s}});var l=e(1664),c=e(7378),i=e(4246),n=[{title:"Tutorial",url:"/counter"},{title:"Request",url:"/request"},{title:"Message",url:"/message"},{title:"Lockable",url:"/lockable"},{title:"Optimistic Lockable",url:"/optimistic-lockable"},{title:"Whiteboard",url:"/whiteboard"},{title:"Transformable",url:"/transformable"}];function s(t){var a=t.selectedIndex,e=(0,c.useState)(!1),s=e[0],g=e[1];return(0,i.jsx)("nav",{className:"navbar navbar-expand-lg navbar-light bg-light",children:(0,i.jsxs)("div",{className:"container-fluid",children:[(0,i.jsx)(l.default,{href:"/",passHref:!0,children:(0,i.jsx)("a",{className:"navbar-brand",children:"co-share examples"})}),(0,i.jsx)("button",{className:"navbar-toggler",type:"button",onClick:function(){return g(!s)},"data-bs-toggle":"collapse","data-bs-target":"#navbarNavDropdown","aria-controls":"navbarNavDropdown","aria-expanded":"false","aria-label":"Toggle navigation",children:(0,i.jsx)("span",{className:"navbar-toggler-icon"})}),(0,i.jsx)("div",{className:"align-self-flex-end navbar-collapse ".concat(s?"":"collapse"),children:(0,i.jsx)("ul",{className:"navbar-nav",children:n.map((function(t,e){var c=t.title,n=t.url;return(0,i.jsx)("li",{className:"nav-item",children:(0,i.jsx)(l.default,{href:n,passHref:!0,children:(0,i.jsx)("a",{className:"nav-link ".concat(e===a?"active":""),children:c})})},c)}))})})]})})}},9497:function(t,a,e){"use strict";e.r(a),e.d(a,{default:function(){return N}});e(7378);var l=e(9008),c=e(1655),i=e(7462),n=e(4925),s=e(3905),g=["components"],I={};function r(t){var a=t.components,e=(0,n.Z)(t,g);return(0,s.kt)("wrapper",(0,i.Z)({},I,e,{components:a,mdxType:"MDXLayout"}),(0,s.kt)("h1",null,"co-share"),(0,s.kt)("p",null,"A Javascript framework for easily building shared applications such as chats and games."),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"npm i co-share")),(0,s.kt)("h2",null,(0,s.kt)("strong",{parentName:"h2"},"When to use")),(0,s.kt)("p",null,"Building ",(0,s.kt)("strong",{parentName:"p"},"multiuser applications for the web")," is often challenging as asynchronous communication can drastically increase the system complexity.\nWriting ",(0,s.kt)("strong",{parentName:"p"},"robust and performant shared applications")," requires a structured and fitting architecure."),(0,s.kt)("p",null,"We propose the abstraction of ",(0,s.kt)("strong",{parentName:"p"},"shared stores")," to distribute logic and data between participating system.\nBy using Javascript & Node.js the same code can be used on the client and on the server to carry out the ",(0,s.kt)("strong",{parentName:"p"},"platform indepedent communication"),"."),(0,s.kt)("h2",null,(0,s.kt)("a",{parentName:"h2",href:"https://cocoss-org.github.io/co-share/counter"},(0,s.kt)("strong",{parentName:"a"},"Tutorial"))),(0,s.kt)("p",null,"We will build a global synchronized counter that can be increased asynchronously by every client."),(0,s.kt)("h2",null,(0,s.kt)("a",{parentName:"h2",href:"https://cocoss-org.github.io/co-share"},(0,s.kt)("strong",{parentName:"a"},"Examples"))),(0,s.kt)("p",null,(0,s.kt)("em",{parentName:"p"},"The code for each example, is provided under the sample")),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"https://cocoss-org.github.io/co-share/request"},"Request")," - request response paradigma"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"https://cocoss-org.github.io/co-share/message"},"Message")," - direct client to client messaging without any persistent storage in between"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"https://cocoss-org.github.io/co-share/lockable"},"Lockable")," - advanced lock functionality to prevent editing by multiple people simultaneously"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"https://cocoss-org.github.io/co-share/optimistic-lockable"},"Optimistic Lockable")," - performance optimize lockable that allows for optimistic behaviour and error correction"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"https://cocoss-org.github.io/co-share/whiteboard"},"Whiteboard")," - collaborative drawing on a shared whiteboard"),(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"https://cocoss-org.github.io/co-share/transformable"},"Transformable")," - shared 3D transformation")),(0,s.kt)("hr",null),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},(0,s.kt)("a",{parentName:"li",href:"https://github.com/cocoss-org/co-share-socketio-counter-example"},"Networked Counter using SocketIO")," - just like the counter from the tutorial but with a server/client architecture using SocketIO")))}r.isMDXComponent=!0;var m=e(9138),o=e(9935),b=e.n(o),M=e(4246);function N(){return(0,M.jsxs)("div",{className:"d-flex flex-column fullscreen",children:[(0,M.jsxs)(l.default,{children:[(0,M.jsx)("title",{children:"co-share"}),(0,M.jsx)("meta",{name:"description",content:"Architecting shared applications using js & node.js."}),(0,M.jsx)("meta",{name:"viewport",content:"initial-scale=1.0, width=device-width"}),(0,M.jsx)("link",{rel:"icon",type:"image/svg+xml",href:b()}),(0,M.jsx)("link",{rel:"mask-icon",href:b(),color:"#fff"})]}),(0,M.jsx)(c.h,{selectedIndex:-1}),(0,M.jsx)("div",{className:"container-lg p-3",children:(0,M.jsx)(r,{})}),(0,M.jsx)(m.$,{})]})}},5301:function(t,a,e){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return e(9497)}])},9008:function(t,a,e){t.exports=e(639)},9935:function(t){t.exports="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjMyLjMxMTAwMW1tIgogICBoZWlnaHQ9IjMxLjEzNDAwMW1tIgogICB2aWV3Qm94PSIwIDAgMzIuMzExMDAxIDMxLjEzNDAwMSIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMjIyMCIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMS4wLjIgKGU4NmM4NzA4NzksIDIwMjEtMDEtMTUsIGN1c3RvbSkiCiAgIHNvZGlwb2RpOmRvY25hbWU9Imljb24uc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzMjIxNCIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMy45NTk3OTgiCiAgICAgaW5rc2NhcGU6Y3g9IjQ3LjE4MDg2NSIKICAgICBpbmtzY2FwZTpjeT0iNzcuMDQ3NTgxIgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtcm90YXRpb249IjAiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMjU2MCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMzc3IgogICAgIGlua3NjYXBlOndpbmRvdy14PSIyNTUyIgogICAgIGlua3NjYXBlOndpbmRvdy15PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIiAvPgogIDxtZXRhZGF0YQogICAgIGlkPSJtZXRhZGF0YTIyMTciPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxnCiAgICAgaW5rc2NhcGU6bGFiZWw9IkViZW5lIDEiCiAgICAgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIKICAgICBpZD0ibGF5ZXIxIj4KICAgIDxnCiAgICAgICBpZD0iZzI4MDEiCiAgICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMy43MTQ5NCwtMi41NzYpIj4KICAgICAgPHBhdGgKICAgICAgICAgaWQ9InBhdGgxMzAzIgogICAgICAgICBzdHlsZT0iY29sb3I6IzAwMDAwMDtmb250LXN0eWxlOm5vcm1hbDtmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTptZWRpdW07bGluZS1oZWlnaHQ6bm9ybWFsO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LXBvc2l0aW9uOm5vcm1hbDtmb250LXZhcmlhbnQtY2Fwczpub3JtYWw7Zm9udC12YXJpYW50LW51bWVyaWM6bm9ybWFsO2ZvbnQtdmFyaWFudC1hbHRlcm5hdGVzOm5vcm1hbDtmb250LXZhcmlhbnQtZWFzdC1hc2lhbjpub3JtYWw7Zm9udC1mZWF0dXJlLXNldHRpbmdzOm5vcm1hbDtmb250LXZhcmlhdGlvbi1zZXR0aW5nczpub3JtYWw7dGV4dC1pbmRlbnQ6MDt0ZXh0LWFsaWduOnN0YXJ0O3RleHQtZGVjb3JhdGlvbjpub25lO3RleHQtZGVjb3JhdGlvbi1saW5lOm5vbmU7dGV4dC1kZWNvcmF0aW9uLXN0eWxlOnNvbGlkO3RleHQtZGVjb3JhdGlvbi1jb2xvcjojMDAwMDAwO2xldHRlci1zcGFjaW5nOm5vcm1hbDt3b3JkLXNwYWNpbmc6bm9ybWFsO3RleHQtdHJhbnNmb3JtOm5vbmU7d3JpdGluZy1tb2RlOmxyLXRiO2RpcmVjdGlvbjpsdHI7dGV4dC1vcmllbnRhdGlvbjptaXhlZDtkb21pbmFudC1iYXNlbGluZTphdXRvO2Jhc2VsaW5lLXNoaWZ0OmJhc2VsaW5lO3RleHQtYW5jaG9yOnN0YXJ0O3doaXRlLXNwYWNlOm5vcm1hbDtzaGFwZS1wYWRkaW5nOjA7c2hhcGUtbWFyZ2luOjA7aW5saW5lLXNpemU6MDtjbGlwLXJ1bGU6bm9uemVybztkaXNwbGF5OmlubGluZTtvdmVyZmxvdzp2aXNpYmxlO3Zpc2liaWxpdHk6dmlzaWJsZTtpc29sYXRpb246YXV0bzttaXgtYmxlbmQtbW9kZTpub3JtYWw7Y29sb3ItaW50ZXJwb2xhdGlvbjpzUkdCO2NvbG9yLWludGVycG9sYXRpb24tZmlsdGVyczpsaW5lYXJSR0I7c29saWQtY29sb3I6IzAwMDAwMDtzb2xpZC1vcGFjaXR5OjE7dmVjdG9yLWVmZmVjdDpub25lO2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MS4xNzcyOTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46YmV2ZWw7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLWRhc2hvZmZzZXQ6MDtzdHJva2Utb3BhY2l0eToxO2NvbG9yLXJlbmRlcmluZzphdXRvO2ltYWdlLXJlbmRlcmluZzphdXRvO3NoYXBlLXJlbmRlcmluZzphdXRvO3RleHQtcmVuZGVyaW5nOmF1dG87ZW5hYmxlLWJhY2tncm91bmQ6YWNjdW11bGF0ZTtzdG9wLWNvbG9yOiMwMDAwMDAiCiAgICAgICAgIGQ9Im0gLTEwLjc2OTEyLDUuNTMwMzEgYyAwLDAgLTMuMTI2MzYsMi40MjczNSAtMy45MDc5MiwzLjM4NzYgMC4zMTc1OSwtMC4wNDMgMC42MzgyOCwtMC4wNzYgMC45NjM1MSwtMC4wOTE5IDAuMDA0LC0xLjJlLTQgMC4wMDYsMS42ZS00IDAuMDA5LDAgMC4xODEwMiwtMC4wMDggMC4zNjI3NSwtMC4wMTQxIDAuNTQ1ODQsLTAuMDE0MSAwLjE1ODIzLDAgMC4zMTQ3NywwLjAwOCAwLjQ3MTQ2LDAuMDE0MSBoIDkuNDE2MjQgbCAzLjIzMDIxLC0zLjI3MjMgeiBtIDEyLjM4MjgxLDEuNjk4NzkgLTMuMjI5NiwzLjI3MjI4IHYgMTAuNDc0NTcgaCAtMC4wMTIxIGMgLTAuMDEzNSwwLjQyODE3IC0wLjA1MjgsMC44NDk2NiAtMC4xMTA2MSwxLjI2NTA5IDEuMDE4OSwtMC44NTU4NiAzLjM1OTU5LC0zLjI0NzE2IDMuMzU5NTksLTMuMjQ3MTYgeiBNIC0xNi4yNDgsMTEuMTk5NDQgYyAtMC4zNTg5NCwxLjAwODggLTAuNTU2MTEsMi42MTEwNyAtMC41NTYxMSwzLjc1MDQ4IDAsNS4yMjY0NyA0LjExNzcyLDkuNDI4NjkgOS4yMTYxNiw5LjQyODY5IDEuMDgxNjcsMCAyLjY1MzM4LC0wLjQyMzQ4IDMuNjE2NjcsLTAuNzcxNDggbCAwLjAxNDcsLTEyLjQxMDc5IHogbSAxMy40NTk0NCw5Ljc3NjUxIDEwZS00LDEwZS00IGMgNi43ZS00LC0xMGUtNCAtNi43ZS00LC02LjdlLTQgLTEwZS00LC0xMGUtNCB6IgogICAgICAgICBzb2RpcG9kaTpub2RldHlwZXM9ImNjc2NzY2NjY2NjY2NjY2Njc3NjY2NjY2MiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGlkPSJwYXRoMTMwNSIKICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46YmV2ZWw7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgZD0ibSAtOC42OTM0LDIuNTc2MDIgYyAtNi45MzE2MSwtNWUtNSAtMTIuNTUwODEsNS42NjU1NiAtMTIuNTUwODEsMTIuNjU0NDUgMTBlLTYsNi45ODg4OSA1LjYxOTIxLDEyLjY1NDQ5IDEyLjU1MDgxLDEyLjY1NDQzIDEuODQxMywtMTBlLTYgMy42NjAwNSwtMC40MDg1MiA1LjMyNzI0LC0xLjE5NjU1IC0xLjE2MDY1LDAuMzYyNDkgLTIuMzY4NzgsMC41NDY4MyAtMy41ODM4NCwwLjU0Njg1IC02LjY4OTg3LDdlLTUgLTEyLjExMzA5LC01LjQ2Nzk5IC0xMi4xMTMwMiwtMTIuMjEzMTUgMS40ZS00LC02Ljc0NTAxIDUuNDIzMywtMTIuMjEyODMgMTIuMTEzMDIsLTEyLjIxMjc3IDAuMjYwMTEsLTRlLTUgMC41MjAxNSwwLjAwOCAwLjc3OTcyLDAuMDI1MiBDIC03LjAwMDUsMi42NjI2NSAtNy44NDU4NiwyLjU3NjA0IC04LjY5MzQsMi41NzYgWiIKICAgICAgICAgc29kaXBvZGk6bm9kZXR5cGVzPSJzc3Njc3NzY3NzIiAvPgogICAgICA8cGF0aAogICAgICAgICBpZD0icGF0aDEzMDciCiAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjE7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOmJldmVsO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGQ9Im0gLTE2LjI3ODY5LDMuNzA4NTQgYyAtNC42MzM2NywyLjk5NTE0IC03LjQzNjExLDguMTYyODQgLTcuNDM2MjUsMTMuNzEyNDQgNmUtNSw4Ljk5NjE1IDcuMjMzMiwxNi4yODg5IDE2LjE1NTYxLDE2LjI4ODczIDguOTIyMjYsLTVlLTUgMTYuMTU1MTcsLTcuMjkyNzMgMTYuMTU1MjIsLTE2LjI4ODczIC0yLjFlLTQsLTAuMTc0ODIgLTAuMDAzLC0wLjM0OTYyIC0wLjAwOSwtMC41MjQzNCAtMC4zNTE0MSw4LjM5MDA2IC03LjE5OTc2LDE1LjAwOTU0IC0xNS41Mjg0NiwxNS4wMDk1MSAtOC41ODM3MSwtMS40ZS00IC0xNS41NDIwOCwtNy4wMTYyMSAtMTUuNTQyLC0xNS42NzA4NiAxLjFlLTQsLTQuOTI2NzkgMi4yOTgyMSwtOS41NjY3IDYuMjA0MzgsLTEyLjUyNjc1IHoiCiAgICAgICAgIHNvZGlwb2RpOm5vZGV0eXBlcz0iY2NzY2Nzc2NjIiAvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg=="}},function(t){t.O(0,[667,774,888,179],(function(){return a=5301,t(t.s=a);var a}));var a=t.O();_N_E=a}]);