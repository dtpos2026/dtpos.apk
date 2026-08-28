const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/supabase-CGYMHqmD.js","assets/rolldown-runtime-Dd_uD5pT.js","assets/dist-4Lts-aME.js"])))=>i.map(i=>d[i]);
import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{o as t,p as n,r}from"./index-B4f6p3_0.js";import{A as i,C as a,D as o,E as s,F as c,M as l,N as u,P as d,S as f,a as p,d as m,h,i as g,k as _,n as v,p as y,s as b}from"./firebaseStub-JMMThFjh.js";import{n as x,r as S}from"./firebase-DR5PSfn6.js";import{r as C,t as w}from"./legacyFirebaseGuard-lC49GFSy.js";var T=e(n(),1);function E(e){return e===`owner`?`owner`:`support`}function D(e){return e===`support`||e===`out`?`admin`:`owner`}function O(e){return{id:e.id,from:D(e.direction),body:e.body,createdAt:e.created_at,read:D(e.direction)===`owner`?!!e.read_by_admin:!!e.read_by_owner,authorEmail:e.author_email??void 0,category:e.category??void 0,status:e.status??void 0,imageUrl:e.attachment_path??void 0,meta:e.meta??void 0,intent:e.intent??void 0,aiGenerated:!!e.ai_generated,_tenantId:e.tenant_id}}function k(e,t){if(w()){let n=null,i=!1,a=async()=>{try{let{sb:n}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),{data:i,error:a}=await n().from(`admin_support_messages`).select(`*`).eq(`tenant_id`,e).eq(`is_internal`,!1).order(`created_at`,{ascending:!0});if(a)throw a;t((i??[]).map(O))}catch(e){console.warn(`[support] load failed`,e),t([])}};return(async()=>{if(await a(),i)return;let{sb:t}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),o=t().channel(`support:${e}`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`admin_support_messages`,filter:`tenant_id=eq.${e}`},()=>{a()}).subscribe();if(i){try{t().removeChannel(o)}catch{}return}n=o})(),()=>{i=!0,n&&r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])).then(({sb:e})=>{try{e().removeChannel(n)}catch{}})}}let n=s(g(x(),`tenants`,e,`support`),a(`createdAt`,`asc`));return f(n,e=>{t(e.docs.map(e=>({id:e.id,...e.data()})))},e=>console.warn(`support listen`,e))}async function A(e,t,n,i,a){if(w()){let{sb:o}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),{data:s,error:c}=await o().from(`admin_support_messages`).insert({tenant_id:e,direction:E(t),body:n.trim(),author_email:i||null,status:a?.status||(t===`owner`?`new`:`replied`),category:a?.category??null,attachment_path:a?.imageUrl??null,meta:a?.meta??{},intent:a?.intent??null,ai_generated:!!a?.aiGenerated,is_internal:!1}).select(`id`).single();if(c)throw c;return s.id}return(await v(g(x(),`tenants`,e,`support`),{from:t,body:n.trim(),authorEmail:i||``,createdAt:_(),read:!1,status:a?.status||(t===`owner`?`new`:`replied`),...a?.category?{category:a.category}:{},...a?.imageUrl?{imageUrl:a.imageUrl}:{},...a?.meta?{meta:a.meta}:{},...a?.intent?{intent:a.intent}:{},...a?.aiGenerated?{aiGenerated:!0}:{}})).id}async function j(e,t,n){if(w()){let{sb:i}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),{error:a}=await i().from(`admin_support_messages`).update({status:n}).eq(`id`,t).eq(`tenant_id`,e);if(a)throw a;return}await l(b(x(),`tenants`,e,`support`,t),{status:n})}async function M(e,t){if(w()){try{let{sb:n}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2]));await n().rpc(`support_mark_read`,{p_tenant:e,p_side:t===`admin`?`admin`:`owner`})}catch(e){console.warn(`[support] markRead failed`,e)}return}let n=t===`admin`?`owner`:`admin`;try{let t=await y(s(g(x(),`tenants`,e,`support`),d(`from`,`==`,n),d(`read`,`==`,!1)));if(t.empty)return;let r=c(x());t.docs.forEach(e=>r.update(e.ref,{read:!0})),await r.commit()}catch(e){console.warn(`markRead`,e)}}async function N(e,t=1280,n=.8){if(!/^image\//.test(e.type))return e;try{let r=URL.createObjectURL(e),i=await new Promise((e,t)=>{let n=new Image;n.onload=()=>e(n),n.onerror=()=>t(Error(`bad image`)),n.src=r}),{width:a,height:o}=i,s=Math.min(1,t/Math.max(a,o));a=Math.round(a*s),o=Math.round(o*s);let c=document.createElement(`canvas`);c.width=a,c.height=o,c.getContext(`2d`).drawImage(i,0,0,a,o),URL.revokeObjectURL(r);let l=await new Promise(e=>c.toBlob(e,`image/jpeg`,n));return l&&l.size<e.size?l:e}catch{return e}}function P(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>t(String(r.result)),r.onerror=()=>n(Error(`read failed`)),r.readAsDataURL(e)})}async function F(e,t){if(w()){let{sb:n}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),i=t.name.replace(/[^\w.\-]/g,`_`).replace(/\.[^.]+$/,``)||`image`,a=await N(t),o=`${e}/support/${Date.now()}-${i}.jpg`,s=null;for(let e=0;e<2;e++){try{let{error:e}=await n().storage.from(`support-attachments`).upload(o,a,{upsert:!0,contentType:`image/jpeg`});if(!e)return o;s=e}catch(e){s=e}await new Promise(e=>setTimeout(e,800))}let c=await N(t,900,.6);if(c.size<=7e5)return P(c);throw Error(s?.message||`Upload failed — check your connection`)}let n=`support/${e}/${Date.now()}_${t.name.replace(/[^\w.\-]/g,`_`)}`,i=o(S(),n);return await u(i,t),h(i)}async function I(e){if(!e)return``;if(/^https?:\/\//i.test(e)||e.startsWith(`data:`))return e;try{let{sb:t}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),{data:n,error:i}=await t().storage.from(`support-attachments`).createSignedUrl(e,3600);if(i)throw i;return n?.signedUrl||``}catch(e){return console.warn(`[support] attachment url failed`,e),``}}function L(e,t){if(w())return(async()=>{try{let{sb:n}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),{data:i,error:a}=await n().from(`admin_support_messages`).select(`*`).eq(`tenant_id`,e).eq(`is_internal`,!0).order(`created_at`,{ascending:!0});if(a)throw a;t((i??[]).map(e=>({id:e.id,body:e.body,authorEmail:e.author_email??``,createdAt:e.created_at})))}catch(e){console.warn(`[support] notes failed`,e),t([])}})(),()=>{};let n=s(g(x(),`supportInternalNotes`,e,`items`),a(`createdAt`,`desc`));return f(n,e=>{t(e.docs.map(e=>({id:e.id,...e.data()})))},e=>console.warn(`internalNotes`,e))}async function R(e,t){if(w()){let{sb:n}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),{error:i}=await n().from(`admin_support_messages`).insert({tenant_id:e,direction:`support`,body:String(t.body??``).trim(),author_email:t.authorEmail||null,is_internal:!0});if(i)throw i;return}await v(g(x(),`supportInternalNotes`,e,`items`),{...t,createdAt:_()})}function z(e){if(w()){let t=null,n=async()=>{try{let{sb:t}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),{data:n,error:i}=await t().from(`admin_support_messages`).select(`*`).order(`created_at`,{ascending:!1}).limit(300);if(i)throw i;e((n??[]).map(O))}catch(t){console.warn(`[support] inbox failed`,t),e([])}};return(async()=>{await n();let{sb:e}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2]));t=e().channel(`support:inbox`).on(`postgres_changes`,{event:`*`,schema:`public`,table:`admin_support_messages`},()=>{n()}).subscribe()})(),()=>{t&&r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])).then(({sb:e})=>{try{e().removeChannel(t)}catch{}})}}let t=s(p(x(),`support`),a(`createdAt`,`desc`));return f(t,t=>{e(t.docs.map(e=>{let t=e.ref.parent.parent?.id;return{id:e.id,_tenantId:t,...e.data()}}))},e=>console.warn(`globalInbox`,e))}function B(e,t){let n=(e||``).replace(/[^\d]/g,``);return n.startsWith(`0`)?n=`92`+n.slice(1):!n.startsWith(`92`)&&n.length===10&&(n=`92`+n),`https://wa.me/${n}?text=${encodeURIComponent(t)}`}async function V(e){if(w())try{let{sb:t}=await r(async()=>{let{sb:e}=await import(`./supabase-CGYMHqmD.js`).then(e=>e.s);return{sb:e}},__vite__mapDeps([0,1,2])),{data:n}=await t().from(`branches`).select(`phone`).eq(`tenant_id`,e).not(`phone`,`is`,null).limit(1).maybeSingle();return n?.phone||``}catch{return``}if(w())return C([],`support`);try{let t=await m(b(x(),`tenants`,e,`meta`,`settings`));if(t.exists()){let e=t.data();return e.phone1||e.phone||e.contactPhone||``}}catch{}return``}var H=t();function U({src:e,className:t}){let[n,r]=(0,T.useState)(``);return(0,T.useEffect)(()=>{let t=!0;return I(e).then(e=>{t&&r(e)}),()=>{t=!1}},[e]),n?(0,H.jsx)(`a`,{href:n,target:`_blank`,rel:`noreferrer`,children:(0,H.jsx)(`img`,{src:n,alt:`Support attachment`,loading:`lazy`,className:t})}):(0,H.jsx)(`div`,{className:`rounded-lg border bg-muted/50 h-24 w-32 animate-pulse ${t||``}`})}var W=[{id:`printer`,label:`Printer Issue`,emoji:`🖨️`},{id:`order`,label:`Order Issue`,emoji:`🧾`},{id:`report`,label:`Report Issue`,emoji:`📊`},{id:`payment`,label:`Payment Issue`,emoji:`💳`},{id:`inventory`,label:`Inventory Issue`,emoji:`📦`},{id:`feature`,label:`New Feature Request`,emoji:`✨`},{id:`bug`,label:`Bug Report`,emoji:`🐛`},{id:`general`,label:`General Question`,emoji:`💬`}],G=[`globalSettings`,`aiAssistant`];async function K(){if(w())return{mode:`ai`};try{let e=await m(b(x(),G[0],G[1]));if(!e.exists())return{mode:`ai`};let t=e.data();return{...t,mode:t.mode||`ai`}}catch(e){return console.warn(`getAIConfig`,e),{mode:`ai`}}}async function q(e){w()||await i(b(x(),G[0],G[1]),{...e,updatedAt:_()},{merge:!0})}var J=/\b(bug|error|crash|fail|kaam nahi|nahi chal|nahi ho|broken|hang|stuck|wrong|galat|problem|masla|issue|blank|print nahi)\b/i,Y=/\b(feature|chahiye|add karo|add kar|option ho|hona chahiye|request|suggest|naya|new|please add)\b/i,X=/\b(urgent|jaldi|abhi|emergency|critical|production|down|live)\b/i;function Z(e){let t=(e||``).toLowerCase();return X.test(t)&&J.test(t)?`urgent`:J.test(t)?`bug`:Y.test(t)?`feature`:X.test(t)?`urgent`:`question`}var Q=[{topic:`Printer`,keywords:/\b(printer|print|kot|receipt|slip|thermal|escpos|lan|usb|blank|paper|80mm|58mm|cashdraw)\b/i,boost:/\b(blank|nahi aata|not printing|setup|test)\b/i,answer:`🖨️ **Printer Setup & Troubleshooting**

• **Settings → Printer Settings** kholein.
• **USB**: set the default printer in Windows → "Test Print".
• **LAN**: enter the IP and port 9100 → Test Print.
• Paper size: select 80mm or 58mm correctly.
• If a blank slip prints: check the paper width, reinstall the driver, check ESC/POS mode.
• KOT auto-print happens when "Send to Kitchen" is pressed in the POS.
• Older bills: the **Bill Reprint** page (with an audit log).
• Manual reprint: **Reprint Bill / Reprint KOT** options Bill page pe.`},{topic:`Deals & Variants`,keywords:/\b(deal|combo|variant|variation|pizza|burger|size|small|medium|large|topping|modifier|addon|add-on)\b/i,answer:`🍕 **Deal / Variant Setup**

• **Menu Manager → Variations & Deals** kholein.
• Add variants to an item (Small/Medium/Large) — each with its own price.
• To build a deal, tap items POS-style — the variant picker opens.
• Customer portal: variant items show "From Rs. ___" → clicking opens the picker.
• Tapping a variant item in the POS requires choosing a variant.
• The variant editor is 300px tall with internal scrolling.`},{topic:`Reports`,keywords:/\b(report|sales|revenue|profit|kitna|earning|kharcha|advanced|gross|net|discount|profitability|costing)\b/i,answer:`📊 **Reports Guide**

• **Reports Page**: Daily / Weekly / Monthly sales summary.
• **Advanced Reports**: Item-wise, variant-wise, category, subcategory — Qty, Gross, Discount, Net.
• **Profitability**: Recipe cost vs sale price, food cost %.
• **Costing Reports**: Wastage + receiving cost breakdown.
• All reports run on the **Business Day** engine (set the shift timing in Settings).
• PDF export aur 80mm thermal print dono available.`},{topic:`Login`,keywords:/\b(login|sign in|signin|password|locked|lock|please wait|loading|email yaad|remember|save)\b/i,answer:`🔐 **Login & Account**

• Check the email and password carefully (upper and lower case).
• **Remember Me** is now on by default — the email is saved on both Windows and web.
• Pressing "Switch Account" clears the saved email.
• The device must be approved — approve it from the Devices page.
• The POS locks when the plan expires — contact Digital Target.
• "Please Wait" stuck ho to Ctrl+R (Reload) .`},{topic:`Update`,keywords:/\b(update|version|install|upgrade|setup|exe|windows app|new build|release)\b/i,answer:`⬆️ **Update Guide**

• **Tenant → Version page** se "Check for Updates" .
• Download the new .exe → install → the app syncs its version to Firebase itself.
• An **automatic backup** is taken before updating (Zero Data Loss System).
• Update History: **Update Safety** page.
• The Super Admin can see the version and status of every device.`},{topic:`Backup`,keywords:/\b(backup|restore|data loss|safety|rollback|repair|export|import)\b/i,answer:`🛡️ **Data Safety**

• **Update Safety** page (#/update-safety) se manual backup len.
• Saved both to the cloud and locally.
• "Inspect & Repair" se database health check + auto-fix.
• Update install hone se pehle automatic snapshot Firestore me jata hai.
• Restore Super Admin ke through hota hai security ke liye.`},{topic:`Inventory`,keywords:/\b(inventory|stock|kg|gram|litre|liter|pcs|piece|recipe|ingredient|wastage|receiving|supplier|party)\b/i,answer:`📦 **Inventory & Recipes**

• **Inventory**: Stock units (Kg / Gram / Litre / Pcs).
• **Receiving**: Supplier (Party Master) se stock add with cost.
• **Recipes**: Har item ke ingredients define karein → order par auto deduct.
• **Wastage**: Reason ke saath spoilage record → profit me deduct.
• **Costing Report**: Actual food cost % nikalti hai.`},{topic:`Foodpanda`,keywords:/\b(foodpanda|food panda|aggregator|3rd party|third party)\b/i,answer:`🛵 **Foodpanda Mode**

• Settings me "Enable Foodpanda Mode" toggle ON karein.
• POS me extra order type button aata hai.
• **Foodpanda Orders** page: New → Preparing → Ready → Picked → Delivered.
• Separate filter aur report bhi.`},{topic:`Customers`,keywords:/\b(customer|crm|loyalty|phone|address|blocked|caller|repeat)\b/i,answer:`👥 **Customer Management**

• **Customers Page**: Phone number se add — name, address, loyalty points.
• **CRM Insights**: Top customers, repeat rate.
• **Blocked Customers / Locations**: Spam ya fake orders block karein.
• POS pe phone enter karte hi customer auto-fill hota hai.`},{topic:`Riders`,keywords:/\b(rider|delivery boy|driver|pin|map|gps|live|tracking|dispatch)\b/i,answer:`🏍️ **Riders & Delivery**

• **Riders List**: phone + 4-digit PIN ke saath add karein.
• Rider Public URL → PIN se login → claim orders.
• **Live Riders Map**: real-time GPS tracking.
• **Delivery Board**: assignment + status dashboard.
• Rider pickup karte hi order Kitchen Display se auto clear ho jata hai.`},{topic:`Business Day`,keywords:/\b(business day|shift|timing|date range|kal|aaj|late night|opening|closing)\b/i,answer:`⏰ **Business Day Engine**

• Settings → "Business Day Timing" me shift set karein (e.g. 08:00 to 03:00 next day).
• Sab dashboards aur reports usi shift window pe sales group karte hain.
• Calendar date ki bajaye shift-based grouping — late night sales sahi din ko milti hain.`},{topic:`Users & Roles`,keywords:/\b(user|role|permission|access|cashier|manager|waiter|kitchen staff|staff add)\b/i,answer:`👤 **Users & Roles**

• **Users & Roles** page se naye staff add karein.
• Roles: Owner, Manager, Cashier, Waiter, Kitchen, Rider.
• Per-page access toggle ho sakti hai.
• Sensitive actions (discount, void, bill edit) role-based locked hain.
• Bill Editor sirf Admin / Manager ko milta hai with audit history.`},{topic:`Online Portal`,keywords:/\b(online|website|portal|qr code|menu link|public|web order)\b/i,answer:`🌐 **Online Ordering**

• **Online Portal** page se public website link enable karein.
• Customer order → Owner approval → POS me enter.
• Menu items me "Show on website" toggle ON karein.
• Variant items "From Rs. ___" show hote hain.
• Tables ke QR codes **Tables Page** se generate karein.`},{topic:`Subscription`,keywords:/\b(subscription|plan|expire|renew|payment|billing|invoice|trial)\b/i,answer:`💳 **Subscription**

• Plans: Trial, Basic, Standard, Pro.
• Renewal Super Admin manage karta hai.
• Plan expire hone par POS lock ho jata hai.
• Renewal: 📧 digitaltarget.digital@gmail.com`},{topic:`Devices`,keywords:/\b(device|approve|new device|hardware|monitor|block device|delete device|machine|computer)\b/i,answer:`💻 **Device Control (Restaurant Admin)**

• **Devices Page** (Admin sidebar) se aapne device khud manage kar saktay hain.
• **Actions**: Approve · Block / Unblock · Delete · PDF Ledger.
• Naya device pehli baar login kare to pending hota hai — plan limit ke andar auto-approve hota hai.
• Super Admin bhi live activity (Online/Offline, Last Seen) dekh sakta hai.
• Block / Delete karne par woh device foran logout ho jata hai.`},{topic:`Sync`,keywords:/\b(sync|offline|internet|firebase|cloud|realtime|onsnapshot|slow)\b/i,answer:`☁️ **Sync & Offline**

• App offline kaam karti hai — orders local me save hote hain.
• Internet wapas aate hi auto-sync.
• Sync status badge sidebar me dikhta hai.
• Firestore realtime listeners (onSnapshot) se products / orders live update hote hain.
• Slow sync ke liye Settings → Inspect & Repair instead.`},{topic:`Running / Hold Bills`,keywords:/\b(running|retry|hold|unpaid|pending bill|open bill|kot bill)\b/i,answer:`🧾 **Running / Retry / Hold Bills**

• Jab tak bill Pay na ho, woh Running/Retry/Hold se nahi hatta.
• Unpaid bills pe red **UNPAID** badge lagta hai.
• Delivery bill pe 🛵 Rider name, Dining bill pe 🧑‍🍳 Waiter name show hota hai.
• Paid hone ke baad hi report me count hota hai.`},{topic:`Bill Edit`,keywords:/\b(bill edit|edit bill|change quantity|remove item|discount edit|recalculate|audit)\b/i,answer:`✏️ **Bill Editor (Admin / Manager)**

• Item add / edit / remove / quantity change.
• Discount add / edit / remove with auto total recalculation.
• Sirf Admin / Manager access.
• Har change ki **audit history**: kisne kiya, kab kiya.`},{topic:`KDS`,keywords:/\b(kds|kitchen display|kitchen screen|delayed|preparing|ready ticket)\b/i,answer:`👨‍🍳 **Kitchen Display (KDS)**

• Sirf active orders show hote hain: Pending / Preparing / In Progress.
• Served / Dispatched / Delivered / Paid orders auto-remove ho jate hain.
• Rider pickup karte hi delivery order KDS se nikal jata hai.
• Delayed status sirf tab dikhta hai jab order waqai stuck ho.`},{topic:`Duplicate KOT`,keywords:/\b(duplicate|double print|double kot|same order twice)\b/i,answer:`🛑 **Duplicate KOT / Order Prevention**

• Order create button pe 4-second signature lock — double-click pe duplicate nahi banta.
• Ek order pe ek hi KOT print.
• Print queue level pe bhi dedupe.
• Manual reprint alag section se: Reprint Bill / Reprint KOT.`},{topic:`WhatsApp`,keywords:/\b(whatsapp|wa|message customer|broadcast)\b/i,answer:`💬 **WhatsApp**

• **WhatsApp Page** se customer ko receipt / order update bhejein.
• Marketing contacts panel se broadcast filter.
• Floating WA button har page pe.`},{topic:`Super Admin`,keywords:/\b(super admin|portfolio|all restaurants|fleet|global)\b/i,answer:`👑 **Super Admin Tools**

• **Portfolio Dashboard**: total sale, orders, revenue across all restaurants.
• **Versions Page**: fleet version + update status.
• **AI Assistant Inbox**: restaurant messages forward yahan hote hain.
• **Update Safety Page**: backups + repair history.
• **Live Map**: device locations real-time.`},{topic:`Contact`,keywords:/\b(contact|support|help|email|whatsapp number|phone number|digital target)\b/i,answer:`📞 **Digital Target Support**

• 📧 **digitaltarget.digital@gmail.com**
• ☎ 0345-1873354
• In-app: Support Chat Widget (Dashboard / Settings page ke neechay).`},{topic:`Greeting`,keywords:/\b(hello|salam|hi|hey|assalam|good morning|good evening|thank you|thanks|theek|ok)\b/i,answer:`👋 **Assalam-o-Alaikum!**

Main **DT POS Assistant** hoon — aap ka built-in software guide.
Mujh se aap puchein:
• 🖨️ Printer · 📊 Reports · 🍕 Deal/Variant
• 📦 Inventory · 🛵 Foodpanda · 🏍️ Riders
• 💻 Devices · ⬆️ Update · 🛡️ Backup
• 🧾 Running/Hold Bills · ✏️ Bill Edit · 👨‍🍳 KDS
• 💳 Subscription · 👥 Customers · 👤 Users

Ya koi bhi masla likhein — agar mujhe pakka jawab na mile, Super Admin ko forward kar dunga.`}];function $(){return`🤔 Main is sawaal ka exact jawab confirm nahi kar saka.

Aap in topics me se koi keyword likhein:
${Array.from(new Set(Q.map(e=>e.topic))).filter(e=>e!==`Greeting`).map(e=>`• ${e}`).join(`
`)}

Ya sawaal thori detail me likhein (e.g. "LAN printer setup", "deal banana", "bill edit history").

📩 Aap ka message **Digital Target Support team** ko forward kar diya gaya hai.
📧 digitaltarget.digital@gmail.com`}function ee(e,t){let n=e.match(new RegExp(t.keywords.source,`gi`));if(!n)return 0;let r=n.length*2;if(t.boost){let n=e.match(new RegExp(t.boost.source,`gi`));n&&(r+=n.length*3)}return e.toLowerCase().includes(t.topic.toLowerCase())&&(r+=4),r}async function te(e){await new Promise(e=>setTimeout(e,250));let t=(e.userMessage||``).trim();if(!t)return $();let n=Q.map(e=>({entry:e,score:ee(t,e)})).filter(e=>e.score>0).sort((e,t)=>t.score-e.score),r=Z(t),i=e.userName?`Ji ${e.userName}, `:``;if(n.length>0){let e=n[0],t=`${i}\n\n${e.entry.answer}`;return n.length>1&&n[1].score>=Math.max(2,e.score-2)&&n[1].entry.topic!==e.entry.topic&&(t+=`\n\n🔗 **Related**: you can also ask about ${n[1].entry.topic}.`),r===`bug`||r===`urgent`?t+=`

📩 This issue has been forwarded to the **Digital Target Support team** — they will follow up shortly.`:r===`feature`&&(t+=`

✨ Your feature request has been noted — the team will review it.`),t.trim()}return`${i}\n\n${$()}`}export{W as a,V as c,k as d,M as f,B as g,F as h,q as i,z as l,j as m,te as n,U as o,A as p,K as r,R as s,Z as t,L as u};