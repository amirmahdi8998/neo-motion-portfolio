/* Neo Motion Portfolio — interactions */
(() => {
  const clamp = (n, mi, ma) => Math.max(mi, Math.min(ma, n));

  // Smooth scrolling
  const lenis = new Lenis({ smoothWheel: true, smoothTouch: false });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf) }
  requestAnimationFrame(raf);

  // Custom cursor
  const cursor = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = 0, my = 0, x = 0, y = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.display = 'block';
  });
  function move(){ x += (mx - x) * 0.18; y += (my - y) * 0.18;
    dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    ring.style.transform = `translate(${x - 18}px, ${y - 18}px)`;
    requestAnimationFrame(move);
  } move();

  // Magnetic buttons
  const mags = [...document.querySelectorAll('.magnetic')];
  mags.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      el.style.setProperty('--mx', `${relX}px`);
      el.style.setProperty('--my', `${relY}px`);
      const dx = (relX - rect.width/2) * 0.15;
      const dy = (relY - rect.height/2) * 0.15;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power3.out' });
      ring.style.width = '56px'; ring.style.height = '56px'; ring.style.borderColor = 'rgba(255,255,255,0.6)';
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
      ring.style.width = '36px'; ring.style.height = '36px'; ring.style.borderColor = 'rgba(255,255,255,0.35)';
    });
  });

  // Tilt cards
  const tilts = [...document.querySelectorAll('.tilt')];
  tilts.forEach(card => {
    let rx = 0, ry = 0;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rx = clamp((py - 0.5) * -20, -12, 12);
      ry = clamp((px - 0.5) * 20, -12, 12);
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0) rotateY(0)';
    });
  });

  // Three.js starfield
  const canvas = document.getElementById('bg');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 8;

  const geo = new THREE.BufferGeometry();
  const COUNT = 1200;
  const positions = new Float32Array(COUNT * 3);
  for (let i=0;i<COUNT;i++){
    positions[i*3+0] = (Math.random()-0.5) * 40;
    positions[i*3+1] = (Math.random()-0.5) * 24;
    positions[i*3+2] = (Math.random()-0.5) * 20;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size: 0.035, color: 0x8efcff, transparent:true, opacity:0.65 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e)=>{
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate(){
    points.rotation.y += 0.0009;
    points.rotation.x += mouseY * 0.0005;
    points.rotation.y += mouseX * 0.0005;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  } animate();

  window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Blob morphing
  const blobPath = document.getElementById('blob-path');
  const shapes = [
    "M300,520 C440,520 540,420 540,300 C540,180 430,80 300,80 C160,80 60,180 60,300 C60,420 160,520 300,520 Z",
    "M300,540 C420,540 560,420 520,300 C500,220 420,120 300,120 C180,120 120,220 100,300 C60,420 180,540 300,540 Z",
    "M300,520 C480,520 560,420 500,280 C460,200 380,140 300,160 C220,180 160,220 120,300 C80,380 120,520 300,520 Z"
  ];
  let idx = 0;
  setInterval(()=>{
    idx = (idx+1) % shapes.length;
    blobPath.setAttribute('d', shapes[idx]);
  }, 3200);

  // Scroll reveals
  gsap.registerPlugin(ScrollTrigger);
  const revealEls = gsap.utils.toArray('.reveal');
  revealEls.forEach(el => {
    gsap.fromTo(el, { y: 20, opacity:0 }, {
      y: 0, opacity:1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Count-up stats
  const nums = document.querySelectorAll('.stat-num');
  nums.forEach((el)=>{
    const target = Number(el.dataset.count || 0);
    ScrollTrigger.create({
      trigger: el, start: 'top 80%', once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target, duration: 1.4, ease: 'power2.out',
          onUpdate: function(){
            el.textContent = Math.round(this.targets()[0].val);
          }
        });
      }
    });
  });

  // Hover scale for nav
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('mouseenter', ()=> gsap.to(a, { scale:1.05, duration:.2 }));
    a.addEventListener('mouseleave', ()=> gsap.to(a, { scale:1, duration:.2 }));
  });

})();

// --- Upload logic ---
(() => {
  const dz = document.getElementById('upload-dropzone');
  const input = document.getElementById('file-input');
  const list = document.getElementById('upload-list');
  const bar = dz?.querySelector('.dz-bar');
  if(!dz || !input || !list || !bar) return;

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const allowed = ['image/png','image/jpeg','image/gif','image/webp','application/pdf'];

  function formatBytes(b){
    if(b < 1024) return b + ' B';
    const units = ['KB','MB','GB']; let u=-1; do { b/=1024; u++; } while(b>=1024 && u<units.length-1);
    return b.toFixed(1) + ' ' + units[u];
  }

  function addItem(file){
    const li = document.createElement('li');
    li.className = 'upload-item';
    const thumb = document.createElement('div');
    thumb.className = 'upload-thumb';

    if(file.type.startsWith('image/')){
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.readAsDataURL(file);
      thumb.appendChild(img);
    } else {
      thumb.textContent = '📄';
      thumb.style.display = 'grid';
      thumb.style.placeItems = 'center';
      thumb.style.fontSize = '18px';
    }

    const name = document.createElement('div');
    name.className = 'upload-name';
    name.textContent = file.name;

    const meta = document.createElement('div');
    meta.className = 'upload-meta';
    meta.textContent = formatBytes(file.size);

    const remove = document.createElement('button');
    remove.className = 'upload-remove';
    remove.type = 'button';
    remove.textContent = '✕';
    remove.addEventListener('click', () => { li.remove(); });

    li.appendChild(thumb);
    li.appendChild(name);
    li.appendChild(meta);
    li.appendChild(remove);
    list.appendChild(li);
  }

  function validate(files){
    const valids = [];
    for(const f of files){
      if(!allowed.includes(f.type)){
        alert('Unsupported type: ' + f.type);
        continue;
      }
      if(f.size > MAX_SIZE){
        alert('File too large (max 10 MB): ' + f.name);
        continue;
      }
      valids.push(f);
    }
    return valids;
  }

  function simulateUpload(count){
    // simple simulated progress for UX demo
    let p = 0;
    const total = 100;
    bar.style.width = '0%';
    const int = setInterval(()=>{
      p += Math.random() * 12 + 6;
      if(p >= total){ p = total; clearInterval(int); setTimeout(()=>{ bar.style.width = '0%'; }, 400); }
      bar.style.width = p + '%';
    }, 120);
  }

  dz.addEventListener('click', ()=> input.click());
  dz.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); input.click(); }});

  dz.addEventListener('dragover', (e)=>{
    e.preventDefault();
    dz.classList.add('dragover');
    dz.style.setProperty('--mx', e.offsetX + 'px');
    dz.style.setProperty('--my', e.offsetY + 'px');
  });
  dz.addEventListener('dragleave', ()=> dz.classList.remove('dragover'));
  dz.addEventListener('drop', (e)=>{
    e.preventDefault();
    dz.classList.remove('dragover');
    const files = validate(e.dataTransfer.files);
    if(files.length){
      files.forEach(addItem);
      simulateUpload(files.length);
    }
  });

  input.addEventListener('change', ()=>{
    const files = validate(input.files);
    if(files.length){
      files.forEach(addItem);
      simulateUpload(files.length);
      input.value = '';
    }
  });
})();
