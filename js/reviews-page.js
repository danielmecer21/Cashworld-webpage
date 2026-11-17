/* Cash World public reviews page */
(function () {
  const $=id=>document.getElementById(id), R=window.CWReviews;
  const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
  const el=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!=null)e.textContent=value;return e;};
  function render(list){
    const box=$('reviewList'); box.textContent='';
    if(!list.length){$('ratingSummary').hidden=true;box.appendChild(el('p','empty','No published reviews yet. Be the first to share your experience.'));return;}
    const avg=list.reduce((s,r)=>s+Number(r.rating),0)/list.length;
    $('avgNum').textContent=avg.toFixed(1);$('avgStars').textContent=stars(Math.round(avg));
    $('avgCount').textContent=list.length+(list.length===1?' review':' reviews');$('ratingSummary').hidden=false;
    list.forEach(r=>{
      const card=el('article','review'),head=el('div','review-head');
      head.appendChild(el('b','review-name',r.name));
      const st=el('span','review-stars',stars(Number(r.rating)));st.setAttribute('aria-label',r.rating+' out of 5 stars');head.appendChild(st);
      card.appendChild(head);card.appendChild(el('small','review-date',new Date(Number(r.createdAt)).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})));
      card.appendChild(el('p','review-text',r.text));
      if(r.reply){const rep=el('div','review-reply');rep.appendChild(el('b',null,'Reply from Cash World'));rep.appendChild(el('p',null,r.reply));card.appendChild(rep);}
      box.appendChild(card);
    });
  }
  async function load(){try{render(await R.listPublic());}catch(e){const box=$('reviewList');box.textContent='';box.appendChild(el('p','empty','Reviews could not be loaded right now. Please try again later.'));}}
  $('reviewForm').addEventListener('submit',async e=>{
    e.preventDefault();const msg=$('rvMsg'),btn=$('rvSend');msg.className='form-msg';msg.textContent='';
    if($('rvWebsite').value){msg.textContent='Thank you.';return;}
    const chosen=document.querySelector('input[name="rating"]:checked');btn.disabled=true;
    try{await R.submit({name:$('rvName').value,rating:chosen?chosen.value:0,text:$('rvText').value});
      $('reviewForm').reset();msg.className='form-msg ok';msg.textContent='Thank you. Your review has been sent for approval before it appears publicly.';
    }catch(err){msg.className='form-msg bad';msg.textContent=err.message||'Sorry, something went wrong.';}
    finally{btn.disabled=false;}
  });
  load();
})();