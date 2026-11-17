/* Cash World reviews API client: PHP/MySQL */
(function () {
  async function call(url, options) {
    const response = await fetch(url, Object.assign({credentials:'same-origin'}, options || {}));
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || 'Request failed. Please try again.');
    return data;
  }
  window.CWReviews = {
    mode: 'mysql',
    check: function (v) {
      const name=String(v.name||'').trim(), text=String(v.text||'').trim(), rating=Number(v.rating);
      if (!name || name.length>60) return {ok:false,error:'Please enter your name (up to 60 characters).'};
      if (!Number.isInteger(rating)||rating<1||rating>5) return {ok:false,error:'Please choose a star rating.'};
      if (text.length<5||text.length>800) return {ok:false,error:'Please write 5–800 characters about your experience.'};
      return {ok:true,review:{name,rating,text}};
    },
    submit: async function (v) {
      const c=this.check(v); if(!c.ok) throw new Error(c.error);
      return call('api/reviews.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(c.review)});
    },
    listPublic: async function () { return (await call('api/reviews.php')).reviews; },
    listAll: async function () { return (await call('api/admin.php?action=list')).reviews; },
    setStatus: async function(id,status){return call('api/admin.php?action=review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,operation:'status',status})});},
    setReply: async function(id,reply){return call('api/admin.php?action=review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,operation:'reply',reply})});},
    remove: async function(id){return call('api/admin.php?action=review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,operation:'delete'})});},
    auth:{
      signIn:async function(email,password){return call('api/admin.php?action=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});},
      signOut:async function(){return call('api/admin.php?action=logout',{method:'POST'});},
      onChange:function(cb){cb(null);}
    }
  };
})();