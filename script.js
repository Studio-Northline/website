  // 'app-spotit' is intentionally absent: the game listing is hidden for now
  // (commented out in index.html). Re-add it together with that section.
  const routes = ['home','about','contact','app-codesnap','app-codesnap-privacy','app-codesnap-terms','privacy','app-spotit-privacy','app-spotit-terms'];

  function nav(id){ location.hash = '#' + id; }

  function render(){
    let hash = location.hash.replace('#','') || 'home';
    const wantWhatsNew = hash === 'app-codesnap-whats-new';
    if(wantWhatsNew) hash = 'app-codesnap';
    if(!routes.includes(hash)) hash = 'home';
    const activeId = hash === 'privacy' ? 'app-codesnap-privacy' : hash;
    routes.forEach(r=>{
      const el = document.getElementById(r);
      if(el) el.classList.toggle('active', r === activeId);
    });
    const topLevel = ['home','about','contact'].includes(hash) ? hash : null;
    document.querySelectorAll('#nav a').forEach(a=>{
      a.classList.toggle('active', a.dataset.r === topLevel);
    });
    if(wantWhatsNew){
      scrollToWhatsNew();
      return;
    }
    window.scrollTo(0,0);
  }

  function scrollToWhatsNew(){
    const target = document.getElementById('whats-new');
    if(!target) { window.scrollTo(0,0); return; }
    const smooth = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const go = ()=> target.scrollIntoView({behavior:smooth, block:'start'});
    requestAnimationFrame(go);
    // showcase cards resize when their images finish loading, so settle again
    const imgs = [...document.querySelectorAll('#showcase img')];
    let pending = imgs.filter(i=>!i.complete).length;
    if(!pending) return;
    imgs.forEach(i=>{
      if(i.complete) return;
      const once = ()=>{ pending--; if(pending <= 0) go(); };
      i.addEventListener('load', once, {once:true});
      i.addEventListener('error', once, {once:true});
    });
  }
  window.addEventListener('hashchange', render);
  render();

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('nav');
  if(navToggle && navMenu){
    const setNav = open =>{
      navMenu.classList.toggle('open', open);
      document.body.classList.toggle('nav-locked', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };
    navToggle.addEventListener('click', ()=>{
      setNav(!navMenu.classList.contains('open'));
    });
    navMenu.addEventListener('click', e=>{
      if(e.target.closest('a')) setNav(false);
      else if(e.target === navMenu) setNav(false); // tap the empty backdrop
    });
    document.addEventListener('keydown', e=>{
      if(e.key === 'Escape' && navMenu.classList.contains('open')){
        setNav(false);
        navToggle.focus();
      }
    });
    window.addEventListener('resize', ()=>{
      if(window.innerWidth > 680) setNav(false);
    }, {passive:true});
    // the logo sits above the overlay, so it must also dismiss it
    const logo = document.querySelector('.logo');
    if(logo) logo.addEventListener('click', ()=> setNav(false));
  }

  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('cName').value;
      const email = document.getElementById('cEmail').value;
      const msg = document.getElementById('cMsg').value;
      const body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
      window.open('https://mail.google.com/mail/?view=cm&fs=1&to=northline.studio.developer@gmail.com&su=Portfolio%20contact&body=' + body, '_blank');
    });
  }

  // ---- screenshot galleries: one .showcase-wrapper per app section ----
  document.addEventListener('dragstart', e=>{ if(e.target.tagName === 'IMG') e.preventDefault(); });

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCount = document.getElementById('lbCount');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const hasLightbox = Boolean(lightbox && lbImg && lbCount && lbClose && lbPrev && lbNext);
  let lbList = [];
  let lbIdx = 0;
  let lbFocus = null;

  function lbShow(){
    if(!hasLightbox) return;
    // a screenshot can 404 while the viewer is open, so re-read what's still there
    lbList = lbList.filter(img => img.isConnected);
    if(!lbList.length){ lbHide(); return; }
    lbIdx = (lbIdx + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIdx].src;
    lbImg.alt = lbList[lbIdx].alt;
    lbCount.textContent = (lbIdx + 1) + ' / ' + lbList.length;
    lbPrev.hidden = lbNext.hidden = lbList.length < 2;
  }
  function lbHide(){
    if(!hasLightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if(lbFocus){ lbFocus.focus(); lbFocus = null; }
  }
  function lbOpen(list, i){
    if(!hasLightbox || !list.length) return;
    lbList = list;
    lbIdx = i;
    lbFocus = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbShow();
    lbClose.focus();
  }
  if(hasLightbox){
    lbClose.addEventListener('click', lbHide);
    lbPrev.addEventListener('click', ()=>{ lbIdx--; lbShow(); });
    lbNext.addEventListener('click', ()=>{ lbIdx++; lbShow(); });
    lightbox.addEventListener('click', e=>{ if(e.target === lightbox) lbHide(); });
    document.addEventListener('keydown', e=>{
      if(lightbox.hidden) return;
      if(e.key === 'Escape') lbHide();
      else if(e.key === 'ArrowLeft'){ lbIdx--; lbShow(); }
      else if(e.key === 'ArrowRight'){ lbIdx++; lbShow(); }
    });
  }

  function initGallery(wrap){
    const showcase = wrap.querySelector('.showcase');
    if(!showcase) return;
    const prev = wrap.querySelector('.sc-prev');
    const next = wrap.querySelector('.sc-next');
    if(prev && next){
      const upd = ()=>{
        prev.hidden = showcase.scrollLeft <= 4;
        next.hidden = showcase.scrollLeft + showcase.clientWidth >= showcase.scrollWidth - 4;
      };
      const step = ()=> Math.round(showcase.clientWidth * 0.8);
      next.addEventListener('click', ()=> showcase.scrollBy({left: step(), behavior:'smooth'}));
      prev.addEventListener('click', ()=> showcase.scrollBy({left: -step(), behavior:'smooth'}));
      showcase.addEventListener('scroll', upd, {passive:true});
      window.addEventListener('resize', upd, {passive:true});
      upd();
    }

    // the wrapper disappears entirely once every shot has failed to load,
    // so an app that ships before its screenshots leaves no empty shelf
    const settle = ()=>{ wrap.hidden = !showcase.querySelector('.screenshot'); };
    const dir = wrap.dataset.dir || 'showcase';
    const name = wrap.dataset.name || 'App';

    for(let i = 1; i <= 5; i++){
      const card = document.createElement('div');
      card.className = 'screenshot';
      const img = document.createElement('img');
      img.alt = `${name} screenshot ${i}`;
      img.width = 700;
      img.height = 1517;
      img.draggable = false;
      img.decoding = 'async';
      img.addEventListener('load', ()=>{ card.classList.add('loaded'); showcase.dispatchEvent(new Event('scroll')); settle(); });
      img.addEventListener('error', ()=>{ card.remove(); showcase.dispatchEvent(new Event('scroll')); settle(); });
      img.src = `assets/${dir}/${i}.webp`;
      card.appendChild(img);
      showcase.appendChild(card);
    }
    showcase.dispatchEvent(new Event('scroll'));
    settle();

    if(hasLightbox){
      showcase.addEventListener('click', e=>{
        const card = e.target.closest('.screenshot');
        if(!card) return;
        const cards = [...showcase.querySelectorAll('.screenshot')];
        lbOpen(cards.map(c => c.querySelector('img')), cards.indexOf(card));
      });
    }
  }
  document.querySelectorAll('.showcase-wrapper').forEach(initGallery);

  // every .share-btn shares this: Web Share, else copy the link and flash "Copied!"
  document.querySelectorAll('.share-btn').forEach(btn=>{
    btn.addEventListener('click', function(){
      const title = btn.dataset.shareTitle || document.title;
      const url = location.href;
      if(navigator.share){
        navigator.share({ title: title, url: url }).catch(function(){});
        return;
      }
      const feedback = function(){
        const label = btn.querySelector('.share-label');
        if(!label) return;
        const prev = label.textContent;
        label.textContent = 'Copied!';
        setTimeout(function(){ label.textContent = prev; }, 1600);
      };
      const fallbackCopy = function(text){
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly','');
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        let ok = false;
        try{ ok = document.execCommand('copy'); }catch(e){ ok = false; }
        document.body.removeChild(ta);
        return ok;
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(feedback).catch(function(){
          if(fallbackCopy(url)) feedback();
        });
        return;
      }
      if(fallbackCopy(url)) feedback();
    });
  });

  // "Read more" toggles — one pair per app section: an .about-desc and the
  // .read-more button sitting next to it in the same .page-section
  document.querySelectorAll('.about-desc').forEach(desc=>{
    const btn = desc.parentElement.querySelector('.read-more');
    if(!btn) return;
    const fit = ()=>{
      if(!desc.offsetHeight) return;
      if(desc.classList.contains('collapsed')){
        btn.hidden = desc.scrollHeight <= desc.clientHeight + 4;
      }else{
        btn.hidden = false;
      }
    };
    btn.addEventListener('click', ()=>{
      const collapsed = desc.classList.toggle('collapsed');
      btn.textContent = collapsed ? 'Read more' : 'Show less';
      btn.setAttribute('aria-expanded', String(!collapsed));
      fit();
    });
    window.addEventListener('resize', fit, {passive:true});
    window.addEventListener('hashchange', ()=> setTimeout(fit, 0));
    fit();
  });
