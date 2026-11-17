/* Cash World admin dashboard backed by PHP/MySQL */
(function(){
 const $=id=>document.getElementById(id), R=window.CWReviews;
 let reviews=[], enquiries=[], filter='all';
 const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
 const btn=(txt,cls,fn)=>{const b=el('button',cls,txt);b.type='button';b.addEventListener('click',fn);return b;};
 function note(txt,bad){const n=$('adminMsg');n.hidden=!txt;n.textContent=txt||'';n.className='notice'+(bad?' bad':'');}
 async function api(url,body){const r=await fetch(url,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.message||'Request failed');return d;}
 async function load(){try{const r=await fetch('api/admin.php?action=list',{credentials:'same-origin'}),d=await r.json();if(!r.ok||!d.ok)throw Error(d.message||'Please sign in.');reviews=d.reviews;enquiries=d.enquiries;note('');render();}catch(e){note(e.message,true);}}
 function render(){
  const counts={all:reviews.length,pending:0,approved:0,hidden:0};reviews.forEach(r=>counts[r.status]=(counts[r.status]||0)+1);
  const stats=$('stats');stats.textContent='';[['Total',counts.all],['Waiting',counts.pending],['Published',counts.approved],['Hidden',counts.hidden]].forEach(([k,v])=>{const d=el('div','stat');d.appendChild(el('b',null,String(v)));d.appendChild(el('span',null,k));stats.appendChild(d);});
  const filters=$('filters');filters.textContent='';[['all','All'],['pending','Waiting'],['approved','Published'],['hidden','Hidden']].forEach(([k,v])=>filters.appendChild(btn(v+' ('+counts[k]+')','tab'+(filter===k?' active':''),()=>{filter=k;render();})));
  const box=$('adminList');box.textContent='';const list=reviews.filter(r=>filter==='all'||r.status===filter);
  if(!list.length)box.appendChild(el('p','empty','No reviews in this filter.'));
  list.forEach(r=>{
   const card=el('article','a-review status-'+r.status),top=el('div','a-top'),who=el('div');who.appendChild(el('b','review-name',r.name));who.appendChild(el('small','review-date',new Date(r.createdAt).toLocaleString('en-GB')));top.appendChild(who);top.appendChild(el('span','badge badge-'+r.status,r.status==='approved'?'Published':r.status==='hidden'?'Hidden':'Waiting for approval'));card.appendChild(top);card.appendChild(el('span','review-stars','★'.repeat(r.rating)));card.appendChild(el('p','review-text',r.text));
   const actions=el('div','a-actions');
   if(r.status!=='approved')actions.appendChild(btn('Publish','btn btn-gold btn-sm',async()=>{try{await api('api/admin.php?action=review',{id:r.id,operation:'status',status:'approved'});await load();}catch(e){note(e.message,true);}}));
   if(r.status!=='hidden')actions.appendChild(btn('Hide','btn btn-line btn-sm',async()=>{try{await api('api/admin.php?action=review',{id:r.id,operation:'status',status:'hidden'});await load();}catch(e){note(e.message,true);}}));
   actions.appendChild(btn('Delete','btn btn-danger btn-sm',async()=>{if(confirm('Delete this review permanently?'))try{await api('api/admin.php?action=review',{id:r.id,operation:'delete'});await load();}catch(e){note(e.message,true);}}));card.appendChild(actions);
   const reply=el('div','a-reply'),ta=el('textarea');ta.rows=3;ta.maxLength=600;ta.value=r.reply||'';ta.placeholder='Write a public reply';reply.appendChild(el('label',null,'Reply from Cash World'));reply.appendChild(ta);reply.appendChild(btn('Save reply','btn btn-navy btn-sm',async()=>{try{await api('api/admin.php?action=review',{id:r.id,operation:'reply',reply:ta.value});await load();}catch(e){note(e.message,true);}}));card.appendChild(reply);box.appendChild(card);
  });
  const enq=$('enquiryList');if(enq){enq.textContent='';if(!enquiries.length)enq.appendChild(el('p','empty','No enquiries yet.'));enquiries.forEach(q=>{const c=el('article','a-review');c.appendChild(el('b','review-name',q.name+' · '+q.phone));c.appendChild(el('small','review-date',new Date(q.createdAt).toLocaleString('en-GB')));c.appendChild(el('p','review-text',(q.topic||'General enquiry')+'\n'+q.message));c.appendChild(btn('Delete enquiry','btn btn-danger btn-sm',async()=>{if(confirm('Delete this enquiry?'))try{await api('api/admin.php?action=enquiry-delete',{id:q.id});await load();}catch(e){note(e.message,true);}}));enq.appendChild(c);});}
 }
 $('loginForm').addEventListener('submit',async e=>{e.preventDefault();$('loginBtn').disabled=true;$('loginMsg').textContent='';try{await R.auth.signIn($('admEmail').value.trim(),$('admPass').value);$('loginForm').hidden=true;$('panel').hidden=false;$('signOut').hidden=false;await load();}catch(err){$('loginMsg').textContent=err.message;}finally{$('loginBtn').disabled=false;}});
 $('signOut').addEventListener('click',async()=>{try{await R.auth.signOut();location.reload();}catch(e){note(e.message,true);}});
 $('loginForm').hidden=false;$('panel').hidden=true;$('signOut').hidden=true;
 // A valid existing session can load the panel; otherwise the protected endpoint returns 401.
 load().then(()=>{if(!$('adminMsg').hidden){$('loginForm').hidden=false;$('panel').hidden=true;}else{$('loginForm').hidden=true;$('panel').hidden=false;$('signOut').hidden=false;}});
})();