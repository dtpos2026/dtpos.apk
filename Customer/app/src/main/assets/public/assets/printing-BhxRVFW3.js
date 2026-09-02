import{n as e}from"./rolldown-runtime-Dd_uD5pT.js";var t={electronRenderDelayMs:200,browserRenderDelayMs:600,renderDelayMs:200,marginsMm:0,electron:{silent:!0,printBackground:!0,margins:{marginType:`none`},scaleFactor:100,landscape:!1,pagesPerSheet:1,collate:!1,duplexMode:`simplex`,usePrinterDefaultPageSize:!0},debug:!1};function n(e){return e===`58mm`?58e3:e===`110mm`?11e4:8e4}function r(e){return e===`58mm`?58:e===`110mm`?110:80}function i(e,t=!1){let n=r(e);return`
    @page {
      size: ${e} auto;        /* auto height — dynamic */
      margin: 0 !important;            /* Rule 7: zero printer margins */
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      color: #000 !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      /* Rule 5: disable browser shrink-to-fit */
      -webkit-print-scale: 1 !important;
      print-scale: 1 !important;
    }
    body.thermal-printing {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      overflow: visible !important;
    }
    body.thermal-printing .receipt-print-portal {
      display: none !important;
    }
    body.thermal-printing .receipt-print-portal[data-active-print="true"] {
      display: block !important;
      position: fixed !important;
      left: -20000px !important;   /* laid out for measurement, never seen */
      top: 0 !important;
      width: ${n}mm !important;        /* Rule 3: exact 80mm width */
      height: auto !important;
      max-height: none !important;
      min-height: 0 !important;
      overflow: visible !important;
      background: #fff !important;
      z-index: 2147483647 !important;
      opacity: 0 !important;
      visibility: visible !important;   /* visible, so it still lays out to measure */
      pointer-events: none !important;
    }
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt {
      /* Rule 3,4: exact width, scale 100%, no transform/zoom */
      width: ${n}mm !important;
      max-width: ${n}mm !important;
      min-width: ${n}mm !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      margin: 0 !important;
      padding: var(--dt-print-padding-top, 0mm) var(--dt-print-padding-right, 4mm) var(--dt-print-padding-bottom, 0mm) var(--dt-print-padding-left, 4mm) !important;
      box-sizing: border-box !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: #fff !important;
      color: #000 !important;
      overflow: visible !important;
      word-wrap: break-word !important;
      overflow-wrap: anywhere !important;

      /* Rule 4: scale 100% — disable any transform / zoom */
      transform: none !important;
      zoom: 1 !important;
      -webkit-transform: none !important;

      /* Rule 6: high DPI print rendering */
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: geometricPrecision !important;
      image-rendering: -webkit-optimize-contrast !important;

      /* WYSIWYG: template ki apni font-family / size / weight hi print hoti hai.
         Yahan koi typography force nahi ki jati — jo preview me dikha wahi chhapta hai. */
    }

    /* Rule 4,8: kill transform/zoom on ALL descendants; force pure black */
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt *,
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt *::before,
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt *::after {
      transform: none !important;
      zoom: 1 !important;
      -webkit-transform: none !important;
      -webkit-font-smoothing: antialiased !important;
      text-rendering: geometricPrecision !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      /* Rule 8: black only */
      color: #000 !important;
      border-color: #000 !important;
    }

    /* ===== Inverted header fix (v1.2.3 — "black bar at top" on Black Copper) =====
       KOT/receipt templates use white-on-black header bands (inline
       style color:#fff on a black background). The global color:#000
       override above turned that white text BLACK — invisible inside the
       black band, so the printout showed a solid black strip at the top.
       Preserve white text wherever the template explicitly asked for it.
       React serializes color:'#fff' as color: rgb(255, 255, 255). */
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color: rgb(255, 255, 255)"],
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color:#fff"],
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color: #fff"],
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color:#FFF"],
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color: white"] {
      color: #fff !important;
    }


    body.thermal-printing .receipt-print-portal[data-active-print="true"] .receipt-print-content {
      width: 100% !important;
      max-width: 100% !important;
      zoom: 1 !important;
      transform: none !important;
    }


    /* Tables — 1px black borders only */
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }


    /* Logos — keep crisp, force black. background:#fff prevents transparent
       PNGs from compositing onto black (another "black at top" cause). */
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt img {
      image-rendering: -webkit-optimize-contrast !important;
      max-width: 100% !important;
      background: #fff !important;
    }

    body.thermal-printing .receipt-print-portal[data-active-print="true"] .print-receipt > *:first-child,
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .receipt-print-content,
    body.thermal-printing .receipt-print-portal[data-active-print="true"] .receipt-print-content > *:first-child {
      margin-top: 0 !important;
      padding-top: 0 !important;
      border-top: 0 !important;
    }

    @media print {
      @page { size: ${e} auto; margin: 0 !important; }
      /* v1.29.4: on paper the application chrome must be gone and the
       * receipt must sit at the origin, opaque. On a monitor, neither. */
      body.thermal-printing > *:not(.receipt-print-portal[data-active-print="true"]) {
        display: none !important;
      }
      body.thermal-printing[data-print-active="true"] .receipt-print-portal[data-active-print="true"] {
        left: 0 !important;
        top: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      html, body {
        width: ${n}mm !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #fff !important;
        color: #000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        /* Rule 5: disable shrink-to-fit in print engine */
        -webkit-print-scale: 1 !important;
        print-scale: 1 !important;
      }
      .receipt-print-portal { display: none !important; }
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] {
        display: block !important;
        height: auto !important;
        overflow: visible !important;
      }
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt {
        width: ${n}mm !important;
        max-width: ${n}mm !important;
        min-width: ${n}mm !important;
        height: auto !important;
        max-height: none !important;
        min-height: 0 !important;
        overflow: visible !important;
        padding: var(--dt-print-padding-top, 0mm) var(--dt-print-padding-right, 4mm) var(--dt-print-padding-bottom, 0mm) var(--dt-print-padding-left, 4mm) !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        transform: none !important;
        zoom: 1 !important;
        -webkit-transform: none !important;
        -webkit-font-smoothing: antialiased !important;
        text-rendering: geometricPrecision !important;
        color: #000 !important;
        word-wrap: break-word !important;
        overflow-wrap: anywhere !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt *,
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt *::before,
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt *::after {
        transform: none !important;
        zoom: 1 !important;
        -webkit-transform: none !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        color: #000 !important;
        border-color: #000 !important;
      }
      /* Inverted header fix — keep explicit white text white (see above). */
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color: rgb(255, 255, 255)"],
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color:#fff"],
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color: #fff"],
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color:#FFF"],
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt [style*="color: white"] {
        color: #fff !important;
      }
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .receipt-print-content {
        width: 100% !important;
        max-width: 100% !important;
        zoom: 1 !important;
        transform: none !important;
      }
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt table {
        width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
      }
      body[data-print-active="true"] .receipt-print-portal[data-active-print="true"] .print-receipt img {
        image-rendering: -webkit-optimize-contrast !important;
        background: #fff !important;
        }
    }
    ${t?a():``}
  `}function a(){let e=[`body.thermal-printing.thermal-compact .receipt-print-portal[data-active-print="true"] .print-receipt`,`body[data-print-active="true"].thermal-compact .receipt-print-portal[data-active-print="true"] .print-receipt`],t=e.map(e=>`${e} *`).join(`,`);return`
    /* ===== Compact mode — global paper-saving overrides =====
       Font size + line height are driven by CSS variables so user can
       fine-tune from Settings without touching code:
         --dt-compact-font-size   (default 11px)
         --dt-compact-line-height (default 1.15)
       Logo is preserved at its own width/height (set via inline style on
       the <img>) unless body has class thermal-compact-shrink-logo. */
    ${e.join(`,`)} {
      font-size: var(--dt-compact-font-size, 11px) !important;
      line-height: var(--dt-compact-line-height, 1.15) !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
    ${t} {
      font-size: var(--dt-compact-font-size, 11px) !important;
      line-height: var(--dt-compact-line-height, 1.15) !important;
      letter-spacing: 0 !important;
    }
    ${e.map(e=>`${e} h1`).join(`,`)} { font-size: calc(var(--dt-compact-font-size, 11px) + 3px) !important; line-height: 1.1 !important; }
    ${e.map(e=>`${e} h2`).join(`,`)} { font-size: calc(var(--dt-compact-font-size, 11px) + 2px) !important; line-height: 1.1 !important; }
    ${e.map(e=>`${e} h3, ${e} h4, ${e} .grand-total`).join(`,`)} { font-size: calc(var(--dt-compact-font-size, 11px) + 1px) !important; line-height: 1.1 !important; }
    /* Only shrink images when explicitly requested — by default logo keeps
       its declared width/height so brand identity stays intact. */
    body.thermal-compact-shrink-logo ${e.map(e=>`${e} img`).join(`, body.thermal-compact-shrink-logo `)} {
      max-height: 40px !important;
      max-width: 40px !important;
    }
    ${e.map(e=>`${e} tbody tr, ${e} .item-row`).join(`,`)} {
      min-height: 14px !important;
      line-height: var(--dt-compact-line-height, 1.15) !important;
    }
    ${e.map(e=>`${e} tbody td, ${e} thead th`).join(`,`)} {
      padding: 1px 3px !important;
      vertical-align: top !important;
    }
    ${e.map(e=>`${e} p`).join(`,`)} {
      margin: 0 !important;
    }
    ${e.map(e=>`${e} > * + *`).join(`,`)} {
      margin-top: 1px !important;
    }
    /* Trim big gaps inside templates */
    ${e.map(e=>`${e} [style*="margin-bottom"], ${e} [style*="marginBottom"]`).join(`,`)} {
      margin-bottom: 2px !important;
    }
    ${e.map(e=>`${e} [style*="padding-top"], ${e} [style*="paddingTop"]`).join(`,`)} {
      padding-top: 2px !important;
    }
    ${e.map(e=>`${e} [style*="padding-bottom"], ${e} [style*="paddingBottom"]`).join(`,`)} {
      padding-bottom: 2px !important;
    }
    @media print {
      body.thermal-compact .receipt-print-portal[data-active-print="true"] .print-receipt,
      body[data-print-active="true"].thermal-compact .receipt-print-portal[data-active-print="true"] .print-receipt {
        font-size: 11px !important;
        line-height: 1.15 !important;
      }
    }
  `}var o=`dt-print-style`;function s(e,t=!1){if(typeof document>`u`)return()=>{};document.getElementById(o)?.remove();let n=document.createElement(`style`);return n.id=o,n.textContent=i(e,t),document.head.appendChild(n),()=>n.remove()}async function c(e={}){let r=window.electronAPI;if(!r?.printReceipt)return window.print(),{success:!0};let i=n(e.paperWidth||`80mm`),a={...t.electron,printerName:e.printerName,copies:Math.max(1,e.copies||1),pageWidthMicrons:i,usePrinterDefaultPageSize:!0,driverType:`escpos`,dpi:203,autoCut:!0};return e.pageHeightMicrons&&(a.pageHeightMicrons=e.pageHeightMicrons,a.usePrinterDefaultPageSize=!1),r.printReceipt(a)}function l(){return!!window.electronAPI?.printReceipt}function u(e=2){return new Promise(t=>{let n=0,r=()=>{if(n+=1,n>=e)return t();requestAnimationFrame(r)};requestAnimationFrame(r)})}function d(e){return new Promise(t=>setTimeout(t,e))}function f(e,t=1500){let n=[];try{let e=document.fonts;e?.ready&&n.push(Promise.resolve(e.ready).catch(()=>{}))}catch{}try{let t=Array.from(e.querySelectorAll(`img`));for(let e of t)e.complete&&e.naturalWidth>0||n.push(new Promise(t=>{e.addEventListener(`load`,()=>t(),{once:!0}),e.addEventListener(`error`,()=>t(),{once:!0});try{e.decode?.().then(()=>t()).catch(()=>{})}catch{}}))}catch{}return n.length?Promise.race([Promise.all(n).then(()=>void 0),new Promise(e=>setTimeout(e,t))]):Promise.resolve()}function p(e){try{let t=e.querySelector(`.print-receipt`)||e,n=Math.max(t.scrollHeight||0,t.offsetHeight||0);if(!n||!Number.isFinite(n))return;let r=n*25.4/96+4;return r<=1?void 0:Math.round(Math.max(25,Math.min(1500,r))*1e3)}catch{return}}async function m(e,n={}){if(!e)return{success:!1,error:`no portal element`};let r=n.paperWidth||`80mm`;e.setAttribute(`data-active-print`,`true`),document.body.classList.add(`thermal-printing`),document.body.dataset.printActive=`true`;let i=s(r),a=()=>{i(),e.removeAttribute(`data-active-print`),document.body.classList.remove(`thermal-printing`),delete document.body.dataset.printActive};try{await u(2),await f(e),await u(2);let i=n.preferElectron!==!1&&(n.silent??!0)&&l();if(await d(i?Math.max(100,Math.min(500,t.electronRenderDelayMs)):Math.max(300,Math.min(1e3,t.browserRenderDelayMs))),i){let t=p(e),i=await c({printerName:n.printerName,paperWidth:r,copies:n.copies,pageHeightMicrons:t});return i.success||await h(),i}return await h(),{success:!0}}finally{setTimeout(a,300)}}function h(){return new Promise(e=>{let t=()=>{window.removeEventListener(`afterprint`,t),e()};window.addEventListener(`afterprint`,t,{once:!0});try{window.print()}catch{e()}setTimeout(t,4e3)})}var g=e({printNode:()=>m});export{s as a,l as i,m as n,n as o,c as r,g as t};