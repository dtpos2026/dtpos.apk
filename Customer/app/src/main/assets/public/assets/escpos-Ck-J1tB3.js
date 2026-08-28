function e(...e){return e}function t(e){if(!e)return``;let t=e.replace(/<style[\s\S]*?<\/style>/gi,``).replace(/<script[\s\S]*?<\/script>/gi,``).replace(/<\/tr>/gi,`
`).replace(/<\/(td|th)>/gi,`  `).replace(/<(tr|td|th)[^>]*>/gi,``).replace(/<br\s*\/?>(\s*)/gi,`
`).replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li)>/gi,`
`).replace(/<li[^>]*>/gi,`• `).replace(/<\/span>/gi,`  `).replace(/<hr[^>]*>/gi,`
--------------------------------
`).replace(/<[^>]+>/g,``);return t=t.replace(/&nbsp;/g,` `).replace(/&amp;/g,`&`).replace(/&lt;/g,`<`).replace(/&gt;/g,`>`).replace(/&quot;/g,`"`).replace(/&apos;/g,`'`).replace(/&#(\d+);/g,(e,t)=>String.fromCharCode(Number(t))).replace(/&#x([0-9a-f]+);/gi,(e,t)=>String.fromCharCode(parseInt(t,16))),t=t.replace(/[ \t\f\v]+/g,` `),t=t.replace(/[ \t]*\n[ \t]*/g,`
`).replace(/\n{3,}/g,`

`).trim(),t}function n(t,n={}){let r=[];r.push(...e(27,64)),r.push(...e(27,116,0)),r.push(...e(27,82,0)),r.push(...e(27,97,0));for(let e=0;e<(n.topFeedLines||0);e++)r.push(10);let i=new TextEncoder;for(let e of t){if(e===`
`){r.push(10);continue}let t=e.charCodeAt(0);if(t<128)r.push(t);else{let t=i.encode(e);for(let e=0;e<t.length;e++)r.push(t[e])}}r.push(10);for(let e=0;e<(n.bottomFeedLines||3);e++)r.push(10);return n.beep&&r.push(...e(27,66,2,2)),n.autoCut!==!1&&r.push(...e(29,86,0)),r}var r=class extends Error{constructor(){super(`Receipt content empty — refusing to send blank slip to printer`)}};function i(e,i={}){let a=t(e);if(a.replace(/\s+/g,``).length<5)throw new r;return n(a,i)}export{i as buildEscposFromHtml,n as buildEscposFromText};