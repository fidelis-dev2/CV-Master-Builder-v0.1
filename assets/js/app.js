const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
let templates=[],reviews=[],currentStep=0,selectedRating=5,progressChart,strengthChart,heroChart,previewTemplate=null;
const emptyCV={template:'classic',language:'en',photo:'',fullName:'',headline:'',email:'',phone:'',location:'',linkedin:'',summary:'',skills:'',languages:'',education:'',experience:'',projects:'',certifications:'',referees:'',achievements:'',dob:'',nationality:''};
const demoPhoto='data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="260" viewBox="0 0 220 260"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#2563eb"/><stop offset="1" stop-color="#9333ea"/></linearGradient></defs><rect width="220" height="260" fill="#eaf2ff"/><circle cx="110" cy="86" r="45" fill="url(#g)"/><path d="M38 230c10-58 134-58 144 0" fill="url(#g)"/><text x="110" y="248" text-anchor="middle" fill="#0f172a" font-size="14" font-family="Arial" font-weight="700">DEMO PASSPORT</text></svg>`);
const demoCV={template:'executive-gold',language:'en',photo:demoPhoto,fullName:'Raphael Chokala',headline:'Senior Software Developer & Systems Analyst',email:'raphael@example.com',phone:'+255 700 000 000',location:'Dar es Salaam, Tanzania',linkedin:'linkedin.com/in/raphael-demo',dob:'12 March 1995',nationality:'Tanzanian',summary:'Results-driven software developer with strong experience in designing web-based management systems, financial platforms, dashboards and data-driven applications. Skilled in translating business requirements into reliable, user-friendly digital solutions.',skills:'Java, JSP, PHP, MySQL, JavaScript, Bootstrap, System Analysis, Dashboard Design, API Integration, Reporting',languages:'English, Swahili',education:'BSc in Computer Science, University of Dar es Salaam\nAdvanced Certificate in Software Engineering and Database Systems',experience:'Senior Developer, COHEMA Company Limited — Designed rental, SACCOS, school and financial management platforms. Built dashboards, reporting modules, payment workflows and administrative controls.\nSystems Analyst — Collected requirements, prepared technical documentation, trained users and improved system usability.',projects:'SmartRent Pro SaaS — Rental management system with tenants, units, payments, contracts and dashboards.\nCV Master Builder — Static CV builder with templates, language support, PDF export and ratings.',certifications:'Database Administration Certificate\nWeb Application Security Training\nProject Management Basics',achievements:'Developed production-ready web modules used by real organizations.\nImproved user experience through modern UI/UX and responsive dashboards.\nIntegrated reporting, document upload and PDF generation workflows.',referees:'Available upon request'};
const stepDefs=[{name:'Personal',fields:[['fullName','Full name'],['headline','Career title / profession'],['email','Email'],['phone','Phone'],['location','Location'],['linkedin','LinkedIn / Portfolio'],['dob','Date of birth'],['nationality','Nationality'],['photo','Passport photo','file']]},{name:'Profile',fields:[['summary','Professional summary','textarea'],['skills','Skills separated by comma','textarea'],['languages','Languages separated by comma','textarea']]},{name:'Education',fields:[['education','Education background','textarea'],['certifications','Certifications / licenses','textarea']]},{name:'Experience',fields:[['experience','Work experience','textarea'],['projects','Projects / portfolio','textarea'],['achievements','Key achievements','textarea']]},{name:'Referees',fields:[['referees','Referees','textarea']]}];
const langMap={en:{name:'English',summary:'Professional Summary',experience:'Work Experience',education:'Education',skills:'Skills',languages:'Languages',projects:'Projects',certifications:'Certifications',achievements:'Achievements',referees:'Referees',contact:'Contact',dob:'Date of Birth',nationality:'Nationality'},sw:{name:'Kiswahili',summary:'Wasifu wa Kitaaluma',experience:'Uzoefu wa Kazi',education:'Elimu',skills:'Ujuzi',languages:'Lugha',projects:'Miradi',certifications:'Vyeti',achievements:'Mafanikio',referees:'Wadhamini',contact:'Mawasiliano',dob:'Tarehe ya Kuzaliwa',nationality:'Uraia'},hi:{name:'Hindi',summary:'पेशेवर सारांश',experience:'कार्य अनुभव',education:'शिक्षा',skills:'कौशल',languages:'भाषाएँ',projects:'परियोजनाएँ',certifications:'प्रमाणपत्र',achievements:'उपलब्धियाँ',referees:'संदर्भ',contact:'संपर्क',dob:'जन्म तिथि',nationality:'राष्ट्रीयता'},zh:{name:'Chinese',summary:'职业简介',experience:'工作经验',education:'教育背景',skills:'技能',languages:'语言',projects:'项目',certifications:'证书',achievements:'成就',referees:'推荐人',contact:'联系方式',dob:'出生日期',nationality:'国籍'},ko:{name:'Korean',summary:'전문 요약',experience:'경력',education:'학력',skills:'기술',languages:'언어',projects:'프로젝트',certifications:'자격증',achievements:'성과',referees:'추천인',contact:'연락처',dob:'생년월일',nationality:'국적'},ja:{name:'Japanese',summary:'職務要約',experience:'職務経験',education:'学歴',skills:'スキル',languages:'言語',projects:'プロジェクト',certifications:'資格',achievements:'実績',referees:'推薦者',contact:'連絡先',dob:'生年月日',nationality:'国籍'},ar:{name:'Arabic',summary:'الملخص المهني',experience:'الخبرة العملية',education:'التعليم',skills:'المهارات',languages:'اللغات',projects:'المشاريع',certifications:'الشهادات',achievements:'الإنجازات',referees:'المراجع',contact:'التواصل',dob:'تاريخ الميلاد',nationality:'الجنسية'},fr:{name:'French',summary:'Résumé Professionnel',experience:'Expérience Professionnelle',education:'Éducation',skills:'Compétences',languages:'Langues',projects:'Projets',certifications:'Certifications',achievements:'Réalisations',referees:'Références',contact:'Contact',dob:'Date de naissance',nationality:'Nationalité'},es:{name:'Spanish',summary:'Resumen Profesional',experience:'Experiencia Laboral',education:'Educación',skills:'Habilidades',languages:'Idiomas',projects:'Proyectos',certifications:'Certificaciones',achievements:'Logros',referees:'Referencias',contact:'Contacto',dob:'Fecha de nacimiento',nationality:'Nacionalidad'},de:{name:'German',summary:'Berufliches Profil',experience:'Berufserfahrung',education:'Bildung',skills:'Fähigkeiten',languages:'Sprachen',projects:'Projekte',certifications:'Zertifikate',achievements:'Erfolge',referees:'Referenzen',contact:'Kontakt',dob:'Geburtsdatum',nationality:'Nationalität'}};
let cv={...emptyCV,...JSON.parse(localStorage.getItem('cvMasterData')||'{}')};
async function init(){templates=await fetch('data/templates.json').then(r=>r.json()).catch(()=>[]);reviews=await fetch('data/reviews.json').then(r=>r.json()).catch(()=>[]);reviews=[...JSON.parse(localStorage.getItem('cvMasterReviews')||'[]'),...reviews];renderLanguage();renderTemplates();renderSteps();renderCV();renderReviews();renderRatingInput();bind();charts();toast('Ready','Select a template to preview it first.','success')}init();
function bind(){$$('[data-scroll]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll).scrollIntoView({behavior:'smooth'}));$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');$('#prevStep').onclick=()=>{currentStep=Math.max(0,currentStep-1);renderSteps()};$('#nextStep').onclick=()=>{currentStep=Math.min(stepDefs.length-1,currentStep+1);renderSteps()};$('#templateSearch').oninput=renderTemplates;$('#languageSelect').onchange=e=>{cv.language=e.target.value;save(false);renderCV();updateDashboard()};$('#saveBtn').onclick=$('#saveDraft').onclick=()=>save(true);$('#resetBtn').onclick=reset;$('#downloadPdf').onclick=$('#downloadPdfTop').onclick=downloadPDF;$('#printBtn').onclick=$('#printBtn2').onclick=printCVOnly;$('#viewFull').onclick=()=>showModal('<div class="template-modal-grid"><div>'+$('#cvPreview').outerHTML+'</div><div class="template-modal-actions"><h2>Full CV Preview</h2><button class="primary full" onclick="downloadPDF()">Download PDF CV</button><button class="secondary full" onclick="printCVOnly()">Print CV Only</button></div></div>');$('#smartSuggest').onclick=suggest;$('#submitRating').onclick=submitRating;$('#exportJson').onclick=exportJSON;$('#importJson').onchange=importJSON;$('#addCustomTemplate').onclick=addCustomTemplate;$('#demoBtn').onclick=loadDemo}
function renderLanguage(){let sel=$('#languageSelect');sel.innerHTML=Object.keys(langMap).map(k=>`<option value="${k}">${langMap[k].name}</option>`).join('');sel.value=cv.language||'en'}
function allTemplates(){return [...templates,...JSON.parse(localStorage.getItem('cvCustomTemplates')||'[]')]}
function renderTemplates(){const q=($('#templateSearch')?.value||'').toLowerCase();let all=allTemplates().filter(t=>(t.name+t.career+t.desc+t.layout).toLowerCase().includes(q));$('#templatesGrid').innerHTML=all.map(t=>`<div class="template-card ${cv.template==t.id?'active':''}" style="--c:${t.accent}" onclick="openTemplatePreview('${t.id}')"><span class="premium-badge">${t.premium?'<i class="fa fa-lock"></i> Premium':'Free'}</span><div class="template-thumb thumb-${t.layout}">${thumb(t.layout)}</div><h3>${t.number?String(t.number).padStart(2,'0')+'. ':''}${t.name}</h3><p>${t.desc}</p><small><b>Career:</b> ${t.career}</small><br><span class="layout-chip">${t.layout} structure</span></div>`).join('')}
function thumb(layout){let side='<div class="paper-mini"><div style="width:50%"></div><div></div><div style="width:70%"></div></div><div class="paper-mini"><div></div><div style="width:60%"></div><div style="width:80%"></div><div style="width:55%"></div></div>';let top='<div class="paper-mini" style="flex:2"><div style="width:80%"></div><div style="width:45%"></div><hr><div></div><div style="width:70%"></div><div style="width:90%"></div></div>';let dark='<div class="paper-mini" style="background:#0f172a"><div style="background:#22c55e"></div><div style="background:#e5e7eb;width:70%"></div><div style="background:#e5e7eb;width:90%"></div></div>';if(layout==='dark')return dark;if(['modern','minimal','academic','legal'].includes(layout))return top;return side}
async function openTemplatePreview(id){let t=allTemplates().find(x=>x.id===id);if(!t)return;previewTemplate=t;let sample={...cv,template:t.id};let html=buildCV(sample,t,true);showModal(`<div class="template-modal-grid"><div>${html}</div><div class="template-modal-actions"><span class="layout-chip" style="--cvAccent:${t.accent}">${t.layout} structure</span><h2>${t.name}</h2><p>${t.desc}</p><p><b>Career:</b> ${t.career}</p><p>${t.premium?'<i class="fa fa-lock"></i> Premium template requires access password.':'Free template: select and start editing.'}</p><button class="primary full" onclick="selectTemplateFromModal('${t.id}')"><i class="fa fa-check"></i> Use This Template</button><button class="secondary full" onclick="document.getElementById('modal').style.display='none'"><i class="fa fa-xmark"></i> Close</button></div></div>`) }
async function selectTemplateFromModal(id){let t=allTemplates().find(x=>x.id===id);if(!t)return;if(t.premium){let ok=await askPremium();if(!ok)return}cv.template=id;save(false);renderTemplates();renderCV();updateDashboard();$('#modal').style.display='none';toast('Template selected',t.name,'success');document.getElementById('builder').scrollIntoView({behavior:'smooth'})}
async function askPremium(){const {value:p}=await Swal.fire({title:'Premium Template',text:'Enter access password.',input:'password',inputPlaceholder:'Password',showCancelButton:true,confirmButtonText:'Unlock'});if(!p)return false;const good=String.fromCharCode(76,97,122,121,64,50,48,48,49);if(p.trim()===good){Swal.fire('Unlocked','Premium template is ready.','success');return true}Swal.fire('Wrong password','Please check the password and try again.','error');return false}
function renderSteps(){let st=stepDefs[currentStep];$('#stepLabel').textContent=st.name;$('#formSteps').innerHTML=`<div class="form-grid">${st.fields.map(f=>fieldHTML(...f)).join('')}</div>`;$$('[data-field]').forEach(el=>{el.oninput=handleInput;el.onchange=handleInput});updateDashboard()}
function fieldHTML(k,label,type='text'){if(type==='file')return `<div class="field"><label>${label}</label><input type="file" accept="image/*" data-field="${k}"></div>`;let val=(cv[k]||'').replaceAll('"','&quot;');if(type==='textarea')return `<div class="field" style="grid-column:1/-1"><label>${label}</label><textarea data-field="${k}" placeholder="${label}">${cv[k]||''}</textarea></div>`;return `<div class="field"><label>${label}</label><input value="${val}" data-field="${k}" placeholder="${label}"></div>`}
function handleInput(e){let k=e.target.dataset.field;if(k==='photo'&&e.target.files[0]){let r=new FileReader();r.onload=()=>{cv.photo=r.result;save(false);renderCV();updateDashboard()};r.readAsDataURL(e.target.files[0]);return}cv[k]=e.target.value;save(false);renderCV();updateDashboard()}
function getTemplate(data=cv){return allTemplates().find(t=>t.id===data.template)||templates[0]||{accent:'#0f172a',name:'Classic',layout:'classic'}}
function blank(v,w=170){return v&&String(v).trim()?nl(v):`<span class="cv-empty-line" style="min-width:${w}px"></span>`}
function tags(s){let arr=(s||'').split(',').map(x=>x.trim()).filter(Boolean);if(!arr.length)arr=['Skill','Skill','Skill'];return arr.map(x=>`<span class="tag">${x}</span>`).join('')}
function nl(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}
function renderCV(){let t=getTemplate();document.documentElement.style.setProperty('--cvAccent',t.accent);$('#templateName').textContent=t.name||'None';$('#languageName').textContent=(langMap[cv.language||'en']||langMap.en).name;$('#languageSelect').value=cv.language||'en';$('#photoPreview').src=cv.photo||demoPhoto;$('#cvPreview').outerHTML=buildCV(cv,t,false);updateDashboard()}
function buildCV(data,t,forModal=false){let L=langMap[data.language||'en']||langMap.en;let dir=(data.language==='ar')?'rtl':'ltr';let photo=data.photo||demoPhoto;let contact=`<div class="cv-section"><h3>${L.contact}</h3><p>${blank(data.email,130)}</p><p>${blank(data.phone,120)}</p><p>${blank(data.location,150)}</p><p>${blank(data.linkedin,150)}</p><p><b>${L.dob}:</b> ${blank(data.dob,80)}</p><p><b>${L.nationality}:</b> ${blank(data.nationality,80)}</p></div>`;
let sections=`<div class="cv-section"><h3>${L.summary}</h3><p>${blank(data.summary,420)}</p></div><div class="cv-section"><h3>${L.experience}</h3><p>${blank(data.experience,440)}</p></div><div class="cv-section"><h3>${L.education}</h3><p>${blank(data.education,380)}</p></div><div class="cv-section"><h3>${L.projects}</h3><p>${blank(data.projects,380)}</p></div><div class="cv-section"><h3>${L.certifications}</h3><p>${blank(data.certifications,300)}</p></div><div class="cv-section"><h3>${L.achievements}</h3><p>${blank(data.achievements,350)}</p></div><div class="cv-section"><h3>${L.referees}</h3><p>${blank(data.referees,220)}</p></div>`;
let skillBlock=`<div class="cv-section"><h3>${L.skills}</h3>${tags(data.skills)}</div><div class="cv-section"><h3>${L.languages}</h3>${tags(data.languages)}</div>`;
let header=`<h1 class="cv-name">${blank(data.fullName,260)}</h1><div class="cv-role">${blank(data.headline,220)}</div>`;
let cls=`cv-page cv-layout-${t.layout||'classic'}`;let style=`style="--cvAccent:${t.accent}" dir="${dir}"`;
let html='';
if(['classic','side','health','premium-side','photo-left'].includes(t.layout)){html=`<div id="cvPreview" class="${cls}" ${style}><div class="cv-inner"><aside class="cv-side"><img class="cv-photo" src="${photo}">${contact}${skillBlock}</aside><main class="cv-main">${header}${sections}</main></div>${forModal?'<div class="preview-watermark">Template preview</div>':''}</div>`}
else if(['modern','minimal','academic','legal'].includes(t.layout)){html=`<div id="cvPreview" class="${cls}" ${style}><div class="cv-top"><div style="display:flex;gap:20px;align-items:center"><img class="cv-photo" src="${photo}"><div>${header}</div></div></div><div class="cv-body"><div>${contact}${skillBlock}</div><div>${sections}</div></div>${forModal?'<div class="preview-watermark">Template preview</div>':''}</div>`}
else if(['creative','portfolio'].includes(t.layout)){html=`<div id="cvPreview" class="${cls}" ${style}><div class="cv-top"><div style="display:flex;gap:20px;align-items:center"><img class="cv-photo" src="${photo}"><div>${header}</div></div></div><div class="cv-body"><div>${sections}</div><div>${contact}${skillBlock}</div></div>${forModal?'<div class="preview-watermark">Template preview</div>':''}</div>`}
else{html=`<div id="cvPreview" class="${cls}" ${style}><div class="cv-inner"><div style="display:flex;justify-content:space-between;gap:24px;align-items:center;margin-bottom:22px"><div>${header}</div><img class="cv-photo" src="${photo}"></div><div style="display:grid;grid-template-columns:1fr 1.8fr;gap:24px"><div>${contact}${skillBlock}</div><div>${sections}</div></div></div>${forModal?'<div class="preview-watermark">Template preview</div>':''}</div>`}
return html}
function save(show=true){localStorage.setItem('cvMasterData',JSON.stringify(cv));if(show)toast('Saved','Your CV draft has been saved in this browser.','success')}
function reset(){Swal.fire({title:'Reset CV?',text:'This clears local draft only.',showCancelButton:true}).then(r=>{if(r.isConfirmed){cv={...emptyCV};save(false);renderLanguage();renderSteps();renderCV();renderTemplates();toast('Reset complete','','success')}})}
function loadDemo(){Swal.fire({title:'Load demo CV?',text:'This fills full demo data including passport preview.',showCancelButton:true,confirmButtonText:'Load demo'}).then(r=>{if(r.isConfirmed){cv={...emptyCV,...demoCV};save(false);renderLanguage();renderSteps();renderCV();renderTemplates();toast('Demo loaded','Full CV data has been added.','success')}})}
function completion(){let keys=Object.keys(emptyCV).filter(k=>!['template','language'].includes(k));let filled=keys.filter(k=>String(cv[k]||'').trim().length>0).length;return Math.round(filled/keys.length*100)}
function charts(){if(window.Chart){heroChart=new Chart($('#heroChart'),{type:'line',data:{labels:['Start','Profile','Skills','PDF'],datasets:[{data:[10,45,75,100],fill:true,tension:.35,backgroundColor:'rgba(37,99,235,.16)',borderColor:'#2563eb'}]},options:{plugins:{legend:{display:false}},scales:{x:{display:false},y:{display:false}}}});progressChart=new Chart($('#progressChart'),{type:'bar',data:{labels:stepDefs.map(s=>s.name),datasets:[{data:[0,0,0,0,0],borderRadius:12,backgroundColor:'#2563eb'}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,max:100}}}});strengthChart=new Chart($('#strengthChart'),{type:'doughnut',data:{labels:['Done','Remaining'],datasets:[{data:[0,100],backgroundColor:['#2563eb','#e5edf7']}]},options:{plugins:{legend:{position:'bottom'}}}})}updateDashboard()}
function updateDashboard(){let p=completion();$('#progressText').textContent=p+'%';if(progressChart){progressChart.data.datasets[0].data=stepDefs.map(st=>{let total=st.fields.length,done=st.fields.filter(f=>cv[f[0]]).length;return Math.round(done/total*100)});progressChart.update()}if(strengthChart){strengthChart.data.datasets[0].data=[p,100-p];strengthChart.update()}$('#reviewCount').textContent=reviews.length}
function renderReviews(){let box=$('#reviewsTicker');let i=0;function draw(){if(!reviews.length)return;let r=reviews[i%reviews.length];box.insertAdjacentHTML('afterbegin',`<div class="review-card"><b>${r.name}</b><div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div><p>${r.comment}</p><small>${r.role} • ${r.date}</small></div>`);while(box.children.length>5)box.lastChild.remove();i++}draw();setInterval(draw,2800);updateDashboard()}
function renderRatingInput(){$('#starInput').innerHTML=[1,2,3,4,5].map(i=>`<span data-rate="${i}">${i<=selectedRating?'★':'☆'}</span>`).join('');$$('#starInput span').forEach(s=>s.onclick=()=>{selectedRating=+s.dataset.rate;renderRatingInput()})}
function submitRating(){let name=$('#raterName').value||'Website User',comment=$('#raterComment').value||'Great CV builder.';let role=$('#raterRole').value;let r={id:Date.now(),name,role,rating:selectedRating,comment,date:new Date().toISOString().slice(0,10)};reviews.unshift(r);let custom=JSON.parse(localStorage.getItem('cvMasterReviews')||'[]');custom.unshift(r);localStorage.setItem('cvMasterReviews',JSON.stringify(custom));$('#reviewsTicker').innerHTML='';renderReviews();toast('Thank you','Your rating has been added in this browser JSON storage.','success')}
function printCVOnly(){
  const source = document.getElementById('cvPreview');
  if(!source){ toast('Print Error','CV preview was not found.','error'); return; }

  const oldStage = document.querySelector('.cv-print-stage');
  if(oldStage) oldStage.remove();

  const stage = document.createElement('div');
  stage.className = 'cv-print-stage';

  const clone = source.cloneNode(true);
  clone.id = 'cvPrintPreview';
  clone.style.transform = 'none';
  clone.style.width = '210mm';
  clone.style.minHeight = '297mm';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';

  stage.appendChild(clone);
  document.body.appendChild(stage);
  document.body.classList.add('cv-print-mode');

  const cleanup = () => {
    document.body.classList.remove('cv-print-mode');
    const currentStage = document.querySelector('.cv-print-stage');
    if(currentStage) currentStage.remove();
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  setTimeout(() => {
    window.print();
    setTimeout(cleanup, 1200);
  }, 80);
}

async function downloadPDF(){
  save(false);
  const node = document.getElementById('cvPreview');
  if(!node){ toast('PDF Error','CV preview was not found.','error'); return; }
  const filename = ((cv.fullName||'professional-cv').replace(/[^a-z0-9\- ]/gi,'').trim()||'professional-cv').replace(/\s+/g,'-')+'.pdf';

  if(!window.html2pdf){
    Swal.fire({title:'PDF library not loaded',text:'Your internet/CDN did not load html2pdf. The print window will open; choose Save as PDF.',icon:'warning',confirmButtonText:'Open Print'}).then(()=>printCVOnly());
    return;
  }

  document.body.classList.add('pdf-preparing');
  Swal.fire({title:'Preparing PDF...',text:'Please wait while the CV is being generated.',allowOutsideClick:false,didOpen:()=>Swal.showLoading()});

  const clone = node.cloneNode(true);
  clone.id = 'cvPdfExportOnly';
  clone.classList.add('cv-export-clone');
  clone.style.transform = 'none';
  clone.style.width = '794px';
  clone.style.minHeight = '1123px';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.background = '#ffffff';
  document.body.appendChild(clone);

  const opt = {
    margin: 0,
    filename: filename,
    pagebreak: { mode: ['avoid-all','css','legacy'] },
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0, windowWidth: 794 },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait', compress: true }
  };

  try{
    await html2pdf().set(opt).from(clone).save();
    Swal.close();
    toast('PDF downloaded','Only the CV template was exported.','success');
  }catch(err){
    console.error(err);
    Swal.fire({title:'PDF failed',text:'The browser blocked PDF generation. Use Print CV Only and choose Save as PDF.',icon:'error',confirmButtonText:'Print CV'}).then(()=>printCVOnly());
  }finally{
    clone.remove();
    document.body.classList.remove('pdf-preparing');
  }
}
function showModal(html){$('#modalBody').innerHTML=html;$('#modal').style.display='block'}$('#closeModal').onclick=()=>$('#modal').style.display='none';window.onclick=e=>{if(e.target.id==='modal')$('#modal').style.display='none'};
function toast(t,m,icon='info'){if(window.Swal)Swal.fire({title:t,text:m,icon,timer:1800,showConfirmButton:false,toast:true,position:'top-end'});}
function suggest(){Swal.fire('Smart suggestions','Fill summary, experience, skills and achievements to reach above 80%. Use action verbs, measurable achievements and career-specific keywords.','info')}
function exportJSON(){let blob=new Blob([JSON.stringify({cv,reviews,templates:JSON.parse(localStorage.getItem('cvCustomTemplates')||'[]')},null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cv-builder-data.json';a.click()}
function importJSON(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);if(d.cv)cv={...emptyCV,...d.cv};if(d.reviews)localStorage.setItem('cvMasterReviews',JSON.stringify(d.reviews));if(d.templates)localStorage.setItem('cvCustomTemplates',JSON.stringify(d.templates));save(false);location.reload()}catch(err){Swal.fire('Invalid JSON','Could not import file.','error')}};r.readAsText(f)}
function addCustomTemplate(){let custom=JSON.parse(localStorage.getItem('cvCustomTemplates')||'[]');custom.push({id:'custom_'+Date.now(),name:$('#customTemplateName').value||'Custom Internet Template',career:$('#customTemplateCareer').value||'Custom Career',accent:$('#customAccent').value,layout:$('#customLayout').value,desc:$('#customNotes').value||'Imported idea from internet/template notes.',premium:false,number:'C'});localStorage.setItem('cvCustomTemplates',JSON.stringify(custom));renderTemplates();toast('Custom template added','You can preview it from templates.','success')}

let deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',function(e){
  e.preventDefault();
  deferredInstallPrompt=e;
  const btn=document.getElementById('installAppBtn');
  if(btn) btn.style.display='inline-flex';
});
function installPWA(){
  const btn=document.getElementById('installAppBtn');
  if(!deferredInstallPrompt){
    Swal.fire('Install App','On mobile, open browser menu and choose Add to Home screen. On desktop, use the install icon in the address bar.','info');
    return;
  }
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.finally(()=>{deferredInstallPrompt=null;if(btn)btn.style.display='none'});
}
const installBtn=document.getElementById('installAppBtn');
if(installBtn) installBtn.onclick=installPWA;
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
}
window.selectTemplateFromModal=selectTemplateFromModal;window.downloadPDF=downloadPDF;window.printCVOnly=printCVOnly;window.installPWA=installPWA;
