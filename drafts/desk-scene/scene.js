// Standalone static scene. Three.js 0.180.0 and all textures stay local.
import * as THREE from './vendor/three.module.min.js';
const stage=document.querySelector('[data-desk-scene]'),status=document.querySelector('#scene-status'),loading=document.querySelector('#loading'),hint=document.querySelector('#object-hint');
const embedded=stage.hasAttribute('data-embedded');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let language=embedded?document.documentElement.dataset.locale:(new URLSearchParams(location.search).get('lang')==='en'?'en':'zh');
const copy={
 zh:{draft:'场景草稿',title:'窗边的书桌',loading:'让阳光进来……',reset:'复位视角 ↺',gesture:'拖动看看 · 点点桌上的物件',caption:'读到一半的书，没凉的茶，还有一个刚想出来的小玩具。',book:'翻一页',lamp:'台灯',marble:'滚个小球',crystal:'转转重晶石',tea:'歇一会儿',sun:'换个时辰',ready:'随便坐坐。',day:'午后 · 15:00',evening:'傍晚 · 17:30',bookDone:'又翻过一页。',lampOn:'给这页纸留一盏灯。',lampOff:'让阳光照着就好。',marbleDone:'滚过小桥，稳稳停下。再来一次？',crystalDone:'换一个角度，看看重晶石的晶面。',teaDone:'茶还热着，歇一会儿。',sunDone:'窗外的光慢慢变了。',viewDone:'回到窗边的老位置。',unavailable:'这里暂时无法打开 3D 场景，请使用支持 WebGL 2 的浏览器。',lost:'画面暂停了，刷新页面可以重新打开。',sceneLabel:'可互动的三维书房。方向键调整视角，下面的按钮可以操作桌上的物件。',navLabel:'场景互动',bookHint:'书 · 翻一页',lampHint:'台灯 · 开 / 关',marbleHint:'小球 · 出发',crystalHint:'重晶石 · 转一转',teaHint:'热茶 · 歇一会儿',sunHint:'窗户 · 换个时辰'},
 en:{draft:'SCENE DRAFT',title:'A desk by the window',loading:'Letting the light in…',reset:'Reset view ↺',gesture:'Drag to look around · Tap an object',caption:'A book left open, a cup still warm, a little experiment in progress.',book:'Turn a page',lamp:'Desk lamp',marble:'Roll the marble',crystal:'Turn the baryte',tea:'Take a moment',sun:'Change the light',ready:'Stay a little while.',day:'Afternoon · 15:00',evening:'Golden hour · 17:30',bookDone:'One more page.',lampOn:'A little light for this page.',lampOff:'The sunlight is enough.',marbleDone:'Over the bridge, and gently to a stop. Again?',crystalDone:'Another angle on the crystal faces.',teaDone:'The tea is still warm. Take a moment.',sunDone:'The light outside has changed.',viewDone:'Back to our spot by the window.',unavailable:'The 3D scene could not start. Please use a browser with WebGL 2 support.',lost:'The scene paused. Reload the page to reopen it.',sceneLabel:'Interactive 3D study. Use arrow keys to adjust the view, or the buttons below to interact with objects.',navLabel:'Scene interactions',bookHint:'Book · Turn a page',lampHint:'Lamp · On / off',marbleHint:'Marble · Let it roll',crystalHint:'Baryte · Turn it',teaHint:'Tea · Take a moment',sunHint:'Window · Change the light'}
};
Object.assign(copy.zh,{caption:'书、唱片、吉他，还有一只晒太阳的小猫。',cat:'摸摸小猫',guitar:'拨拨琴弦',records:'墙上的唱片',close:'收起 ×',recordSource:'专辑官方页面 ↗',cover:'专辑封面',catHint:'白猫 · 摸摸头',guitarHint:'电吉他 · 拨拨琴弦',catDone:'伸个懒腰，继续晒太阳。',guitarDone:'琴弦轻轻晃了晃。',albumFailed:'有一张唱片封面没有加载成功，请刷新重试。'});
Object.assign(copy.en,{caption:'Books, records, a guitar, and a little cat in the sun.',cat:'Pet the cat',guitar:'Pluck the strings',records:'Records on the wall',close:'Close ×',recordSource:'Official album page ↗',cover:'album cover',catHint:'White cat · A little head scratch',guitarHint:'Electric guitar · Pluck the strings',catDone:'A little stretch, then back to the sunshine.',guitarDone:'The strings shimmer for a moment.',albumFailed:'An album cover could not load. Please reload to try again.'});
const albums=[
 {title:"What's Going On",artist:'Marvin Gaye',image:'./assets/whats-going-on.jpg',source:'https://classic.motown.com/story/marvin-gaye-whats-going-on/'},
 {title:'Abbey Road',artist:'The Beatles',image:'./assets/abbey-road.jpg',source:'https://www.thebeatles.com/abbey-road'},
 {title:'The Dark Side of the Moon',artist:'Pink Floyd',image:'./assets/dark-side-of-the-moon.jpg',source:'https://www.pinkfloyd.com/albums/the-dark-side-of-the-moon/'}
];
const recordDialog=document.querySelector('#record-dialog');
let selectedAlbum=null;
function updateRecord(){if(!recordDialog||!selectedAlbum)return;document.querySelector('#record-title').textContent=selectedAlbum.title;document.querySelector('#record-artist').textContent=selectedAlbum.artist;const image=document.querySelector('#record-image');image.src=selectedAlbum.image;image.alt=`${selectedAlbum.artist} — ${selectedAlbum.title} · ${copy[language].cover}`;document.querySelector('#record-source').href=selectedAlbum.source;}
function showRecord(index){if(!recordDialog)return;selectedAlbum=albums[index];updateRecord();if(!recordDialog.open)recordDialog.showModal();}
document.querySelector('#record-close')?.addEventListener('click',()=>recordDialog.close());
recordDialog?.addEventListener('click',event=>{const r=recordDialog.getBoundingClientRect();if(event.target===recordDialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))recordDialog.close();});
document.querySelectorAll('[data-album]').forEach(button=>button.addEventListener('click',()=>showRecord(Number(button.dataset.album))));
const state={lamp:false,evening:false,page:0};let statusKey='ready';
function say(key){statusKey=key;if(status)status.textContent=copy[language][key];}
function translate(){
 if(embedded)return;
 document.documentElement.lang=language==='zh'?'zh-CN':'en';document.title=`${copy[language].title} · ${copy[language].draft}`;
 document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=copy[language][el.dataset.i18n]);
 stage.setAttribute('aria-label',copy[language].sceneLabel);document.querySelector('#interactions').setAttribute('aria-label',copy[language].navLabel);
 document.querySelector('#time-label').textContent=copy[language][state.evening?'evening':'day'];
 document.querySelector('#language').textContent=language==='zh'?'EN':'中文';document.querySelector('#language').setAttribute('aria-label',language==='zh'?'Switch to English':'切换到中文');say(statusKey);updateRecord();
}
document.querySelector('#language')?.addEventListener('click',()=>{language=language==='zh'?'en':'zh';const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);translate();});translate();
try{init();}catch(error){console.error('Desk scene:',error);if(loading){loading.hidden=false;loading.textContent=copy[language].unavailable;}stage.setAttribute('aria-label',copy[language].unavailable);stage.dataset.state='error';}
function init(){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.domElement.setAttribute('aria-hidden','true');stage.prepend(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(embedded?'#f7f5ef':'#eeeae0');
 const camera=new THREE.OrthographicCamera(-5,5,4,-4,.1,60),target=new THREE.Vector3(0,2.1,0);
 let yaw=.60,pitch=.48,viewportAspect=1;
 const V=(x,y,z)=>new THREE.Vector3(x,y,z);
 const mat=(color,roughness=.75,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
 const M={plaster:mat('#ddd8c9'),leftWall:mat('#d2d2bc'),trim:mat('#ece3cd'),wood:mat('#a57a50'),edge:mat('#876244'),paleWood:mat('#c5a373'),sage:mat('#7f8a70'),dark:mat('#3f4b42'),paper:mat('#f5ecd8'),terracotta:mat('#b76343'),brass:mat('#aa8850',.34,{metalness:.55}),soil:mat('#514b3a'),leaf:mat('#6f805a'),tea:mat('#69462b',.23),linen:mat('#b8ad94'),cream:mat('#ead9b9'),bookRed:mat('#ad6650'),ink:mat('#686752')};
 const room=new THREE.Group();scene.add(room);
 function mesh(geo,material,parent=room,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w,h,d,material,parent=room,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z);}
 function rounded(w,h,d,r,material,parent=room,x=0,y=0,z=0){
  const s=new THREE.Shape(),a=-w/2,b=-d/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+d-r);s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);s.lineTo(a+r,b+d);s.quadraticCurveTo(a,b+d,a,b+d-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.012,curveSegments:5});g.rotateX(-Math.PI/2);g.translate(0,-h/2,0);return mesh(g,material,parent,x,y,z);
 }
 function cyl(rt,rb,h,material,parent=room,x=0,y=0,z=0,n=32){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),material,parent,x,y,z);}
 function sphere(r,material,parent=room,x=0,y=0,z=0){return mesh(new THREE.SphereGeometry(r,24,16),material,parent,x,y,z);}
 function tube(points,r,material,parent=room){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)));return mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*8),r,8,false),material,parent);}
 function rod(a,b,r,material,parent=room){const av=V(...a),bv=V(...b),m=cyl(r,r,av.distanceTo(bv),material,parent);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V(0,1,0),V(...b).sub(V(...a)).normalize());return m;}
 function group(x=0,y=0,z=0,parent=room){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
 function canvasTexture(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;}
 let seed=841;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 const grain=canvasTexture((c,w,h)=>{c.fillStyle='#bb9163';c.fillRect(0,0,w,h);for(let i=0;i<650;i++){const y=random()*h;c.strokeStyle=`rgba(${random()>.5?'86,57,30':'236,210,163'},${.025+random()*.09})`;c.lineWidth=random()*1.7+.3;c.beginPath();c.moveTo(0,y);for(let x=0;x<=w;x+=32)c.lineTo(x,y+Math.sin(x/95+i)*2.5);c.stroke();}},1024,512);
 const deskWood=mat('#ffffff',.69,{map:grain});
 const sun=new THREE.DirectionalLight('#ffe2ad',3.6);sun.position.set(-3.6,6.1,-6);sun.target.position.set(.1,.7,.8);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:22});sun.shadow.bias=-.00015;sun.shadow.normalBias=.018;sun.shadow.radius=3;
 const ambient=new THREE.HemisphereLight('#fff2db','#8f806b',1.55);scene.add(ambient);const fill=new THREE.DirectionalLight('#e6edf0',.85);fill.position.set(4,4,6);scene.add(fill);
 // Open-front room with a real opening in the back wall for sunlight.
 rounded(6.65,.22,4.85,.08,M.edge,room,0,-.13,0);
 for(let i=0;i<17;i++){const floorMat=mat(new THREE.Color('#baa17d').multiplyScalar(.94+random()*.12));box(.378,.055,4.66,floorMat,room,-3.08+i*.385,.01,0);}
 const wallZ=-2.31,wallH=4.25;
 box(.16,wallH,4.7,M.leftWall,room,-3.25,wallH/2,0);box(.7,wallH,.16,M.plaster,room,-2.9,wallH/2,wallZ);box(3.52,wallH,.16,M.plaster,room,1.49,wallH/2,wallZ);box(2.28,1.8,.16,M.plaster,room,-1.41,.9,wallZ);box(2.28,.45,.16,M.plaster,room,-1.41,4.025,wallZ);
 box(6.4,.13,.07,M.trim,room,0,.13,-2.18);box(.07,.13,4.6,M.trim,room,-3.13,.13,.08);
 const windowGroup=group(-1.41,2.8,-2.25);
 for(const x of [-1.14,1.14])box(.11,2.12,.18,M.trim,windowGroup,x,0,0);for(const y of [-1.04,1.04])box(2.38,.11,.18,M.trim,windowGroup,0,y,0);box(.055,2,.10,M.trim,windowGroup,0,0,-.01);box(2.28,.055,.10,M.trim,windowGroup,0,.07,-.01);rounded(2.56,.11,.47,.03,M.paleWood,windowGroup,0,-1.1,.10);
 const outsideTexture=canvasTexture((c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#ced6c5');gr.addColorStop(.7,'#f1e5c5');gr.addColorStop(1,'#ded8a9');c.fillStyle=gr;c.fillRect(0,0,w,h);c.fillStyle='#eae6be';c.beginPath();c.arc(345,108,43,0,Math.PI*2);c.fill();['#b5c1a3','#9cac8e','#829779'].forEach((col,i)=>{c.fillStyle=col;c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=8)c.lineTo(x,330+i*45+Math.sin(x/(84-i*13)+i*2)*35);c.lineTo(w,h);c.fill();});});
 const outside=mesh(new THREE.PlaneGeometry(2.29,2.03),new THREE.MeshBasicMaterial({map:outsideTexture}),windowGroup,0,0,-.12);outside.castShadow=false;outside.receiveShadow=false;
 const curtainGeo=new THREE.PlaneGeometry(.60,2.22,22,12),cp=curtainGeo.attributes.position;
 for(let i=0;i<cp.count;i++)cp.setZ(i,Math.sin(cp.getX(i)*53)*.045);curtainGeo.computeVertexNormals();
 mesh(curtainGeo,mat('#eee6ce',.95,{side:THREE.DoubleSide}),windowGroup,-.96,.02,.15);rod([-2.8,3.97,-2.06],[.01,3.97,-2.06],.025,M.brass);
 for(let i=0;i<6;i++){const ring=mesh(new THREE.TorusGeometry(.035,.008,6,16),M.brass,room,-2.65+i*.10,3.94,-2.06);ring.rotation.y=Math.PI/2;}
 // Shelves, books, and a framed sketch.
 rounded(1.85,.10,.42,.025,M.wood,room,1.65,3.12,-2.02);
 for(const x of [1,2.3]){box(.055,.3,.05,M.brass,room,x,2.94,-2.1);rod([x,2.8,-2.11],[x,3.08,-1.85],.018,M.brass);}
 for(let i=0;i<6;i++){const g=group(.9+i*.17,3.48,-2.05);g.rotation.z=i===5?-.17:0;box(.13,.60+(i%3)*.04,.28,[M.sage,M.cream,M.bookRed][i%3],g);box(.09,.015,.005,M.paper,g,0,-.17,.143);}
 const printTexture=canvasTexture((c,w,h)=>{c.fillStyle='#eee8d9';c.fillRect(0,0,w,h);c.strokeStyle='#8b866e';c.lineWidth=3;c.beginPath();c.moveTo(80,345);c.lineTo(177,190);c.lineTo(247,299);c.lineTo(317,140);c.lineTo(434,345);c.stroke();c.strokeStyle='#b3694e';c.beginPath();c.arc(348,129,37,0,Math.PI*2);c.stroke();c.fillStyle='#b5ad96';for(let i=0;i<3;i++)c.fillRect(95,403+i*12,230-i*35,2);});
 box(.93,1.04,.045,M.paleWood,room,1.57,2.32,-2.19);mesh(new THREE.PlaneGeometry(.83,.94),mat('#fff',.9,{map:printTexture}),room,1.57,2.32,-2.16);
 // Table and chair.
 const desk=group(0,0,-.05),top=1.75;rounded(4.75,.15,2.08,.07,deskWood,desk,0,top-.075,0);box(4.31,.24,.07,M.wood,desk,0,1.51,-.79);
 for(const x of [-2.04,2.04])for(const z of [-.76,.76]){const leg=box(.14,1.61,.14,M.wood,desk,x,.83,z);leg.rotation.z=x*.016;}
 rounded(1.2,.31,1.55,.025,M.paleWood,desk,1.37,1.46,0);box(1.11,.24,.045,M.wood,desk,1.37,1.46,.81);rod([1.18,1.46,.855],[1.56,1.46,.855],.025,M.brass,desk);
 const chair=group(-.65,0,1.55);chair.rotation.y=-.12;rounded(1.1,.13,1,.12,M.wood,chair,0,.89,0);rounded(.96,.055,.86,.13,M.sage,chair,0,.98,0);
 for(const x of [-.4,.4])for(const z of [-.34,.34])rod([x*1.2,.06,z*1.2],[x,.88,z],.047,M.wood,chair);
 for(const x of [-.43,.43])rod([x,.83,.40],[x,1.90,.45],.042,M.wood,chair);rounded(1.03,.14,.10,.035,M.wood,chair,0,1.82,.45);for(let i=0;i<4;i++)rod([-.30+i*.2,1.1,.43],[-.30+i*.2,1.78,.45],.021,M.paleWood,chair);
 rounded(3.3,.018,2.2,.12,M.linen,room,.1,.065,.65);for(let i=0;i<38;i++)for(const z of [-.49,1.79])rod([-1.50+i*.086,.08,z-.08],[-1.50+i*.086,.08,z+.08],.008,M.cream);
 const interactive=[];function register(object,id){object.userData.action=id;interactive.push(object);}register(windowGroup,'sun');
 // Plants: lathed ceramic pots and individual, softly curved leaves.
 function plant(x,y,z,size=1){
  const g=group(x,y,z);g.scale.setScalar(size);
  const profile=[[0,0],[.14,0],[.20,.36],[.205,.39],[.18,.39],[.17,.34]].map(p=>new THREE.Vector2(...p));
  mesh(new THREE.LatheGeometry(profile,32),M.terracotta,g);cyl(.176,.176,.015,M.soil,g,0,.34,0);
  for(let i=0;i<8;i++){
   const a=i*2.4,h=.68+(i%3)*.16,ex=Math.cos(a)*.30,ez=Math.sin(a)*.30;
   tube([[0,.34,0],[ex*.3,h*.75,ez*.3],[ex,h,ez]],.012,M.leaf,g);
   const leafGeo=new THREE.SphereGeometry(1,12,8);leafGeo.scale(.12,.026,.27);
   const leaf=mesh(leafGeo,i%2?M.sage:M.leaf,g,ex,h,ez);leaf.rotation.set(.35,a,.3);
   rod([ex,h+.026,ez-.1],[ex,h+.026,ez+.12],.003,M.sage,g);
  }
  return g;
 }
 plant(-.47,1.77,-2.13,.72);plant(2.24,3.18,-2,.47);
 plant(-2.71,.08,.94,1.25);
 // Three real album sleeves, hung with space between their thin wooden frames.
 const textureLoader=new THREE.TextureLoader();let coversLoaded=0;
 stage.dataset.covers='loading';
 albums.forEach((album,i)=>{
  const frame=group(-3.145,3.03,-1.36+i*1.34);frame.rotation.y=Math.PI/2;
  box(1.02,1.02,.065,M.edge,frame);box(.956,.956,.018,M.cream,frame,0,0,.043);
  const placeholder=canvasTexture((c,w,h)=>{c.fillStyle='#e6decb';c.fillRect(0,0,w,h);c.fillStyle='#7e725d';c.font='23px Georgia';c.textAlign='center';c.fillText(album.artist,w/2,h/2-15);c.font='18px Georgia';c.fillText(album.title,w/2,h/2+22);});
  const coverMat=mat('#ffffff',.95,{map:placeholder});
  mesh(new THREE.PlaneGeometry(.90,.90),coverMat,frame,0,0,.055);
  const texture=textureLoader.load(new URL(album.image,import.meta.url).href,()=>{coverMat.map=texture;coverMat.needsUpdate=true;placeholder.dispose();coversLoaded++;stage.dataset.covers=coversLoaded===albums.length?'ready':'loading';requestDraw();},undefined,()=>{stage.dataset.covers='error';say('albumFailed');requestDraw();});
  texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  if(!embedded)register(frame,`album${i}`);
 });

 // A wine-red electric guitar resting against the right-hand wall.
 const guitar=group(2.68,.08,-1.50);guitar.rotation.set(-.18,-.12,-.13);
 const enamel=mat('#8c4940',.30,{metalness:.15}),ivory=mat('#e8ddc4',.46),rosewood=mat('#4c382c'),chrome=mat('#c1c1b5',.22,{metalness:.70});
 const bodyShape=new THREE.Shape();
 bodyShape.moveTo(0,.04);bodyShape.bezierCurveTo(-.31,.02,-.45,.19,-.41,.40);bodyShape.bezierCurveTo(-.40,.55,-.24,.59,-.23,.72);bodyShape.bezierCurveTo(-.23,.82,-.26,1.02,-.17,1.07);bodyShape.bezierCurveTo(-.10,1.08,-.14,.83,-.035,.81);bodyShape.lineTo(.065,.81);bodyShape.bezierCurveTo(.18,.84,.14,1.0,.22,.96);bodyShape.bezierCurveTo(.31,.89,.19,.74,.25,.65);bodyShape.bezierCurveTo(.30,.57,.43,.55,.44,.35);bodyShape.bezierCurveTo(.47,.13,.28,.04,0,.04);
 const bodyGeo=new THREE.ExtrudeGeometry(bodyShape,{depth:.105,bevelEnabled:true,bevelSegments:3,bevelSize:.035,bevelThickness:.025,curveSegments:18,steps:1});
 mesh(bodyGeo,enamel,guitar);
 const pickguardGeo=new THREE.ShapeGeometry(bodyShape,18);pickguardGeo.scale(.74,.77,1);mesh(pickguardGeo,ivory,guitar,.01,.15,.139);
 box(.118,1.11,.07,M.paleWood,guitar,0,1.34,.046);box(.101,1.1,.014,rosewood,guitar,0,1.34,.091);
 // Headstock, tuning machines, bridge, pickups, controls and six strings.
 const headstock=box(.16,.32,.07,M.paleWood,guitar,.025,2.02,.045);headstock.rotation.z=-.14;
 for(let i=0;i<6;i++){const y=1.90+i*.043;rod([.09,y,.05],[.16,y,.05],.009,chrome,guitar);sphere(.021,chrome,guitar,.169,y,.05).scale.set(1.15,.65,.75);}
 for(let i=0;i<17;i++){const t=i/17;box(.105,.005,.005,chrome,guitar,0,.85+(1-Math.pow(1-t,1.4))*.96,.102);}
 for(const y of [1.02,1.21,1.40,1.58,1.74])sphere(.009,ivory,guitar,0,y,.105);
 for(const y of [.53,.67,.80]){const pickup=box(.15,.036,.022,ivory,guitar,0,y,.162);pickup.rotation.z=y===.53?-.18:0;for(let i=0;i<6;i++)sphere(.006,chrome,guitar,-.04+i*.016,y,.176);}
 box(.17,.065,.032,chrome,guitar,0,.39,.163);
 for(const [x,y] of [[.19,.46],[.22,.35],[.19,.25]]){const knob=cyl(.025,.025,.021,ivory,guitar,x,y,.16,16);knob.rotation.x=Math.PI/2;}
 rod([.065,.40,.18],[.21,.29,.23],.008,chrome,guitar);
 const strings=[];
 for(let i=0;i<6;i++){const x=-.035+i*.014;strings.push(rod([x,.38,.186],[x,2.11,.106],.0022,chrome,guitar));}
 const cable=tube([[.27,.18,.10],[.41,.08,.20],[.53,-.02,.40],[.31,-.02,.57],[-.12,-.02,.58],[-.22,-.02,.42]],.012,M.dark,guitar);
 register(guitar,'guitar');

 // A small white cat curled on a linen cushion in the warm patch beside the desk.
 const cat=group(1.20,.095,1.56);cat.rotation.y=.20;
 const cushion=cyl(.55,.52,.075,mat('#c1ab8c'),cat,0,.025,0,48);cushion.scale.z=.82;
 const fur=mat('#f5f2e8',.95),furShade=mat('#e7e3d9',.98),pink=mat('#d4a29a',.9),faceInk=mat('#69685e');
 function ellipsoid(parent,x,y,z,sx,sy,sz,material=fur){const m=sphere(1,material,parent,x,y,z);m.scale.set(sx,sy,sz);return m;}
 const catBody=ellipsoid(cat,-.05,.25,-.045,.37,.225,.29);
 ellipsoid(cat,-.24,.23,-.035,.24,.21,.25,furShade);
 const catTail=group(-.28,.10,-.02,cat);
 tube([[.02,.10,-.12],[-.13,.07,-.06],[-.20,.035,.18],[-.05,.02,.36],[.21,.02,.36],[.39,.045,.27]],.063,fur,catTail);
 sphere(.064,fur,catTail,.39,.045,.27);
 ellipsoid(cat,.23,.13,.23,.095,.065,.14);ellipsoid(cat,.37,.13,.13,.085,.065,.13);
 const catHead=group(.25,.34,.13,cat);catHead.rotation.y=.25;
 ellipsoid(catHead,0,0,0,.205,.182,.178);
 const ears=[];
 for(const side of [-1,1]){
  const ear=group(side*.128,.105,-.025,catHead);ear.rotation.z=-side*.15;
  const outer=new THREE.Shape();outer.moveTo(-.09,0);outer.quadraticCurveTo(-.065,.12,-.02,.20);outer.quadraticCurveTo(.035,.19,.09,0);outer.closePath();
  mesh(new THREE.ExtrudeGeometry(outer,{depth:.043,bevelEnabled:true,bevelThickness:.016,bevelSize:.016,bevelSegments:2,curveSegments:8,steps:1}),fur,ear);
  const inner=new THREE.Shape();inner.moveTo(-.047,.035);inner.lineTo(-.014,.151);inner.lineTo(.05,.035);inner.closePath();mesh(new THREE.ShapeGeometry(inner),pink,ear,0,0,.062);ears.push(ear);
 }
 for(const side of [-1,1]){
  tube([[side*.115,.025,.153],[side*.085,.008,.175],[side*.052,.019,.172]],.008,faceInk,catHead);
  ellipsoid(catHead,side*.046,-.048,.160,.054,.04,.03);
  for(let i=0;i<3;i++)tube([[side*.067,-.055,.183],[side*.15,-.06+(i-1)*.019,.177],[side*.235,-.05+(i-1)*.035,.15]],.0022,faceInk,catHead);
 }
 ellipsoid(catHead,0,-.031,.19,.018,.013,.01,pink);
 tube([[0,-.041,.189],[0,-.06,.19],[.018,-.068,.18]],.0035,faceInk,catHead);
 register(cat,'cat');

 // Curved paper surfaces, real page edges, and a ribbon left in the book.
 function pageTexture(variant){return canvasTexture((c,w,h)=>{
  c.fillStyle='#f5ecd9';c.fillRect(0,0,w,h);c.fillStyle='#8c8672';
  for(let i=0;i<13;i++){const y=100+i*25;c.globalAlpha=.50+(i%3)*.10;c.fillRect(66,y,230+((i*37+variant*53)%105),4);if(i%4===0)c.fillRect(66,y+8,180+((i*23)%100),2);}c.globalAlpha=1;
  c.fillStyle='#b66e4c';c.fillRect(65,55,88,6);
  if(variant%2===0){c.fillStyle='#f5ecd9';c.fillRect(56,170,400,160);c.strokeStyle='#9a9378';c.lineWidth=3;[[138,245],[254,218],[363,268]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,29,0,Math.PI*2);c.stroke();});c.beginPath();c.moveTo(168,238);c.lineTo(223,225);c.moveTo(284,230);c.lineTo(332,255);c.stroke();c.strokeStyle='#b66e4c';c.beginPath();c.arc(254,218,9,0,Math.PI*2);c.stroke();}
  c.fillStyle='#a69a80';c.font='16px Georgia';c.textAlign='center';c.fillText(String(24+variant),w/2,h-30);
 },512,640);}
 const pages=Array.from({length:4},(_,i)=>mat('#ffffff',.95,{map:pageTexture(i),side:THREE.DoubleSide}));
 const book=group(-.82,top+.025,.25,desk);book.rotation.y=-.14;
 rounded(1.52,.035,1.05,.025,M.sage,book,0,0,0);
 box(.044,.06,1.05,M.dark,book,0,.015,0);
 for(const side of [-1,1]){
  for(let i=0;i<5;i++)box(.69,.008,.98,i%2?M.paper:M.cream,book,side*.37,.027+i*.009,0);
 }
 function pageGeometry(){
  const g=new THREE.PlaneGeometry(.72,.98,18,4);g.rotateX(-Math.PI/2);g.translate(.36,0,0);
  const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,.018+Math.sin(p.getX(i)/.72*Math.PI)*.046+p.getX(i)*.018);g.computeVertexNormals();return g;
 }
 const rightPage=mesh(pageGeometry(),pages[0],book,0,.065,0),leftPage=mesh(pageGeometry(),pages[1],book,0,.065,0);leftPage.rotation.y=Math.PI;
 const turnPivot=group(0,.069,0,book),turnPage=mesh(pageGeometry(),pages[0],turnPivot);turnPivot.visible=false;
 tube([[-.09,.105,-.5],[-.10,.115,-.15],[-.13,.11,.34],[-.14,.04,.58],[-.13,-.01,.62]],.014,M.bookRed,book);
 register(book,'book');
 // A small notebook and pencil, slightly askew.
 const note=group(-.04,top+.018,.48,desk);note.rotation.y=.17;
 rounded(.42,.027,.57,.012,M.bookRed,note);box(.385,.015,.54,M.paper,note,0,.025,0);
 const noteFace=mesh(new THREE.PlaneGeometry(.37,.52),pages[3],note,0,.035,0);noteFace.rotation.x=-Math.PI/2;
 rod([.07,top+.05,.04],[.32,top+.05,.64],.017,M.terracotta,desk);rod([.32,top+.05,.64],[.35,top+.05,.70],.012,M.cream,desk);
 sphere(.012,M.dark,desk,.35,top+.05,.70);

 // Baryte: a cluster of tabular, bevelled crystals on a specimen plinth.
 const specimen=group(.90,top,-.57,desk);
 rounded(.99,.065,.72,.08,M.dark,specimen,0,.035,0);
 const crystal=group(0,.085,0,specimen);
 const crystalMats=['#d1b588','#e5ceb0','#bf9d73','#e7dbc2'].map(color=>new THREE.MeshPhysicalMaterial({color,roughness:.27,metalness:.12,clearcoat:.75,clearcoatRoughness:.23}));
 function crystalPlate(w,h,d,material,parent){
  const s=new THREE.Shape();s.moveTo(-w*.4,-h*.5);s.lineTo(w*.34,-h*.5);s.lineTo(w*.5,-h*.25);s.lineTo(w*.45,h*.38);s.lineTo(w*.22,h*.5);s.lineTo(-w*.4,h*.5);s.lineTo(-w*.5,h*.27);s.lineTo(-w*.5,-h*.28);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:1,bevelSize:.022,bevelThickness:.02,steps:1});g.translate(0,0,-d/2);return mesh(g,material,parent);
 }
 for(let i=0;i<9;i++){
  const p=crystalPlate(.24+(i%3)*.07,.30+(i%4)*.09,.055,crystalMats[i%4],crystal);
  p.position.set(Math.sin(i*2.4)*.24,.14+(i%3)*.045,Math.cos(i*2.4)*.17);p.rotation.set(-.25+(i%3)*.24,i*.72,(i-4)*.14);
 }
 const labelTexture=canvasTexture((c,w,h)=>{c.fillStyle='#eee5d0';c.fillRect(0,0,w,h);c.fillStyle='#605d4e';c.font='24px Georgia';c.textAlign='center';c.fillText('BARYTE',w/2,39);c.font='17px Georgia';c.fillText('BaSO₄',w/2,70);},256,96);
 const label=mesh(new THREE.PlaneGeometry(.37,.139),mat('#fff',.9,{map:labelTexture}),specimen,0,.071,.22);label.rotation.x=-Math.PI/2;register(specimen,'crystal');

 // A shaded desk lamp with a working pool of warm light.
 const lamp=group(-1.83,top,-.57,desk);
 cyl(.23,.25,.055,M.sage,lamp,0,.03,0);cyl(.12,.13,.025,M.brass,lamp,0,.065,0);
 tube([[0,.07,0],[0,.45,-.03],[.02,.80,-.06],[.24,.94,-.02],[.34,.92,.05]],.028,M.brass,lamp);
 const shade=group(.34,.89,.05,lamp);shade.rotation.z=-.16;
 mesh(new THREE.CylinderGeometry(.11,.31,.25,40,1,true),mat('#78836c',.6,{side:THREE.DoubleSide}),shade);
 const rim=mesh(new THREE.TorusGeometry(.307,.012,8,40),M.brass,shade,0,-.125,0);rim.rotation.x=Math.PI/2;
 const bulbMat=mat('#f2ddb2',.3,{emissive:'#ffcf83',emissiveIntensity:0});sphere(.065,bulbMat,shade,0,-.07,0);
 const lampLight=new THREE.SpotLight('#ffd18a',0,5,Math.PI/4,.65,1.8);lampLight.position.set(.32,.74,.06);lampLight.target.position.set(.55,-.05,.65);lamp.add(lampLight,lampLight.target);lampLight.castShadow=true;lampLight.shadow.mapSize.set(512,512);lampLight.shadow.bias=-.001;
 tube([[0,.04,-.08],[-.20,.015,-.20],[-.32,.015,-.35],[-.40,-.05,-.42],[-.42,-.8,-.42]],.009,M.dark,lamp);
 register(lamp,'lamp');

 // Tea, saucer, handle and a few rising threads of steam.
 const tea=group(-.16,top,-.58,desk);cyl(.235,.21,.024,M.cream,tea,0,.012,0);
 const cup=group(0,.026,0,tea);
 const cupProfile=[[0,0],[.105,0],[.13,.025],[.145,.25],[.135,.27],[.12,.25],[.11,.045],[0,.045]].map(p=>new THREE.Vector2(...p));
 mesh(new THREE.LatheGeometry(cupProfile,40),mat('#c1835b',.42),cup);
 const handle=mesh(new THREE.TorusGeometry(.085,.021,10,28),M.terracotta,cup,.16,.145,0);handle.scale.x=.8;
 cyl(.122,.122,.006,M.tea,cup,0,.223,0);
 const steam=group(0,.26,0,cup);steam.visible=false;
 const steamMats=[];
 for(let j=0;j<3;j++){
  const sm=new THREE.MeshBasicMaterial({color:'#fff9e7',transparent:true,opacity:.35,depthWrite:false});steamMats.push(sm);
  tube(Array.from({length:15},(_,i)=>{const t=i/14;return [Math.sin(t*9+j)*.035+(j-1)*.06,t*.58,Math.cos(t*7+j)*.025];}),.009,sm,steam).castShadow=false;
 }
 register(tea,'tea');

 // A little wooden marble run: two rails, a sloping start, an arch and a bowl.
 const toy=group(1.28,top+.02,.47,desk);toy.rotation.y=-.10;
 rounded(1.60,.055,.82,.10,M.cream,toy,0,.027,0);
 const runCurve=new THREE.CatmullRomCurve3([V(-.63,.49,-.21),V(-.30,.36,-.21),V(.17,.24,-.21),V(.51,.17,-.09),V(.51,.12,.12),V(.20,.10,.25),V(-.36,.085,.25)],false,'catmullrom',.1);
 for(const offset of [-.046,.046]){
  const points=Array.from({length:65},(_,i)=>{const t=i/64,p=runCurve.getPoint(t),tan=runCurve.getTangent(t),side=V(-tan.z,0,tan.x).normalize().multiplyScalar(offset);return p.add(side);});
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),96,.022,8,false),M.wood,toy);
 }
 for(const t of [.03,.3,.57,.83]){const p=runCurve.getPoint(t);box(.09,p.y-.035,.10,M.paleWood,toy,p.x,(p.y+.035)/2,p.z);}
 const archShape=new THREE.Shape();archShape.moveTo(-.19,0);archShape.lineTo(-.19,.29);archShape.absarc(0,.29,.19,Math.PI,0,true);archShape.lineTo(.19,0);archShape.lineTo(.12,0);archShape.lineTo(.12,.28);archShape.absarc(0,.28,.12,0,Math.PI,false);archShape.lineTo(-.12,0);archShape.closePath();
 const arch=mesh(new THREE.ExtrudeGeometry(archShape,{depth:.10,bevelEnabled:true,bevelSize:.01,bevelThickness:.01,bevelSegments:2,steps:1}),M.sage,toy,-.02,.06,-.26);arch.rotation.y=Math.PI/2;
 const bowlProfile=[[0,0],[.10,0],[.15,.04],[.15,.085],[.12,.06],[.04,.03],[0,.03]].map(p=>new THREE.Vector2(...p));mesh(new THREE.LatheGeometry(bowlProfile,28),M.terracotta,toy,-.40,.04,.25);
 const marble=sphere(.071,mat('#b65332',.2,{metalness:.2}),toy);marble.position.copy(runCurve.getPoint(0)).y+=.063;
 const band=mesh(new THREE.TorusGeometry(.071,.003,6,32),M.cream,marble);band.rotation.x=.6;
 register(toy,'marble');

 // A second closed book and a small paper fold left by the window.
 const stack=group(-2.07,top+.02,.37,desk);stack.rotation.y=.10;
 rounded(.40,.065,.63,.015,M.bookRed,stack);box(.36,.045,.58,M.paper,stack,0,.047,0);rounded(.40,.014,.63,.015,M.bookRed,stack,0,.078,0);
 const fold=group(.38,top+.02,-.03,desk);fold.rotation.y=.4;
 const paperGeo=new THREE.BufferGeometry();paperGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.17,0,.12,0,.16,0,.17,0,.12, -.17,0,.12,-.12,0,-.16,0,.16,0, 0,.16,0,-.12,0,-.16,.12,0,-.16, 0,.16,0,.12,0,-.16,.17,0,.12],3));paperGeo.computeVertexNormals();mesh(paperGeo,mat('#e4d7bb',.9,{side:THREE.DoubleSide}),fold);

 // Soft contact shadows anchor small objects without expensive postprocessing.
 const contactTexture=canvasTexture((c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(58,42,22,.26)');g.addColorStop(.5,'rgba(58,42,22,.12)');g.addColorStop(1,'rgba(58,42,22,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},128,128);
 for(const [x,z,w,d] of [[-.82,.25,1.85,1.3],[.9,-.57,1.25,.9],[-1.83,-.57,.65,.65],[-.16,-.58,.58,.58],[1.28,.47,1.8,1.05]]){
  const s=mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false}),desk,x,top+.002,z);s.rotation.x=-Math.PI/2;s.castShadow=false;s.receiveShadow=false;
 }

 // Render only on input, resize, or during a short, finite interaction.
 const animations=new Map();let frame=0,lastTime=0,visible=true,contextLost=false;
 function requestDraw(){if(!frame&&visible&&!document.hidden&&!contextLost)frame=requestAnimationFrame(draw);}
 function animate(key,duration,update,complete=()=>{}){
  if(reducedMotion.matches){animations.delete(key);update(1);complete();requestDraw();return;}
  animations.set(key,{elapsed:0,duration,update,complete});requestDraw();
 }
 const smooth=t=>t*t*(3-2*t);
 function updateCamera(){
  camera.position.set(target.x+12*Math.sin(yaw)*Math.cos(pitch),target.y+12*Math.sin(pitch),target.z+12*Math.cos(yaw)*Math.cos(pitch));camera.lookAt(target);camera.updateMatrixWorld();
  // Keep the whole diorama inside the frame even at the limits of the orbit.
  const horizontal=3.4*Math.abs(Math.cos(yaw))+2.5*Math.abs(Math.sin(yaw));
  const vertical=(3.4*Math.abs(Math.sin(yaw))+2.5*Math.abs(Math.cos(yaw)))*Math.sin(pitch)+2.35*Math.cos(pitch);
  const halfH=Math.max(4.1,vertical+.27,(horizontal+.35)/viewportAspect);
  camera.left=-halfH*viewportAspect;camera.right=halfH*viewportAspect;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();
 }
 function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;viewportAspect=w/h;
  renderer.setSize(w,h,false);requestDraw();
 }
 function draw(now){
  frame=0;const delta=lastTime?Math.min(now-lastTime,50):16;lastTime=now;
  for(const [key,a] of animations){a.elapsed+=delta;const t=Math.min(1,a.elapsed/a.duration);a.update(t);if(t===1){animations.delete(key);a.complete();}}
  updateCamera();renderer.render(scene,camera);
  if(animations.size)requestDraw();else lastTime=0;
 }
 function action(id){
  if(id.startsWith('album')){showRecord(Number(id.slice(5)));stage.dataset.lastAction=id;return;}
  if(id==='cat'){
   if(animations.has('cat'))return;
   animate('cat',1900,t=>{
    const stretch=Math.sin(Math.PI*t),wiggle=Math.sin(Math.PI*t*4)*stretch;
    catHead.position.y=.34+stretch*.10;catHead.rotation.z=-stretch*.16;catHead.rotation.y=.25+stretch*.16;
    catBody.scale.y=.225*(1+stretch*.09);catTail.rotation.y=wiggle*.18;
    ears.forEach((ear,i)=>ear.rotation.z=(i===0?.15:-.15)+wiggle*.10);
   },()=>say('catDone'));
  }
  if(id==='guitar'){
   if(animations.has('guitar'))return;
   animate('guitar',1200,t=>{
    const decay=Math.sin(Math.PI*t)*(1-t);
    strings.forEach((string,i)=>string.position.x=-.035+i*.014+Math.sin(t*Math.PI*24+i*.7)*decay*.018);
    guitar.rotation.z=-.13+Math.sin(t*Math.PI*5)*decay*.018;
   },()=>say('guitarDone'));
  }
  if(id==='book'){
   if(animations.has('book'))return;
   turnPage.material=rightPage.material;turnPivot.visible=true;turnPivot.rotation.z=0;
   state.page=(state.page+1)%4;rightPage.material=pages[state.page];
   animate('book',1050,t=>{turnPivot.rotation.z=smooth(t)*Math.PI;},()=>{leftPage.material=turnPage.material;turnPivot.visible=false;say('bookDone');});
  }
  if(id==='lamp'){
   state.lamp=!state.lamp;const start=lampLight.intensity,end=state.lamp?8:0;
   animate('lamp',420,t=>{lampLight.intensity=THREE.MathUtils.lerp(start,end,smooth(t));bulbMat.emissiveIntensity=lampLight.intensity/5;});
   document.querySelector('[data-action=lamp]')?.setAttribute('aria-pressed',String(state.lamp));say(state.lamp?'lampOn':'lampOff');
  }
  if(id==='marble'){
   if(animations.has('marble'))return;
   animate('marble',2900,t=>{
    const progress=1-Math.pow(1-t,1.45),p=runCurve.getPoint(progress);marble.position.copy(p);marble.position.y+=.063;
    if(t>.9)marble.position.y-=((t-.9)/.1)*.007;
    marble.rotation.z=-progress*17;marble.rotation.x=progress*7;
   },()=>say('marbleDone'));
  }
  if(id==='crystal'){
   if(animations.has('crystal'))return;
   const start=crystal.rotation.y;animate('crystal',1300,t=>{crystal.rotation.y=start+smooth(t)*Math.PI*.75;},()=>say('crystalDone'));
  }
  if(id==='tea'){
   steam.visible=true;
   animate('tea',2400,t=>{
    cup.position.y=.026+Math.sin(t*Math.PI)*.05;steam.position.y=.26+t*.12;
    steam.rotation.y=t*.7;steam.scale.setScalar(.8+t*.35);
    steamMats.forEach((m,i)=>m.opacity=Math.sin(t*Math.PI)*(.35-i*.055));
   },()=>{steam.visible=false;cup.position.y=.026;say('teaDone');});
  }
  if(id==='sun'){
   state.evening=!state.evening;
   const startPos=sun.position.clone(),endPos=state.evening?V(-4.6,4.6,-6):V(-3.6,6.1,-6),startColor=sun.color.clone(),endColor=new THREE.Color(state.evening?'#ffba70':'#ffe2ad');
   const startAmbient=ambient.intensity,startFill=fill.intensity,startBg=scene.background.clone(),endBg=new THREE.Color(embedded?'#f7f5ef':(state.evening?'#e9dfcd':'#eeeae0'));
   animate('sun',1700,t=>{const p=smooth(t);sun.position.lerpVectors(startPos,endPos,p);sun.color.copy(startColor).lerp(endColor,p);ambient.intensity=THREE.MathUtils.lerp(startAmbient,state.evening?1.0:1.55,p);fill.intensity=THREE.MathUtils.lerp(startFill,state.evening?.55:.85,p);scene.background.copy(startBg).lerp(endBg,p);});
   document.querySelector('[data-action=sun]')?.setAttribute('aria-pressed',String(state.evening));const timeLabel=document.querySelector('#time-label');if(timeLabel)timeLabel.textContent=copy[language][state.evening?'evening':'day'];say('sunDone');
  }
  stage.dataset.lastAction=id;requestDraw();
 }
 document.querySelectorAll('[data-action]').forEach(button=>{button.disabled=false;button.addEventListener('click',()=>action(button.dataset.action));});
 function resetView(){const sy=yaw,sp=pitch;animate('view',500,t=>{yaw=THREE.MathUtils.lerp(sy,.60,smooth(t));pitch=THREE.MathUtils.lerp(sp,.48,smooth(t));});say('viewDone');}
 document.querySelector('#reset')?.addEventListener('click',resetView);
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 function pick(event){
  const rect=stage.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(interactive,true);
  for(const hit of hits){let o=hit.object;while(o){if(o.userData.action)return o.userData.action;o=o.parent;}}
  return null;
 }
 let drag=null;
 stage.addEventListener('pointerdown',event=>{
  if(event.target!==renderer.domElement||!event.isPrimary||event.button!==0)return;
  animations.delete('view');drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false,action:pick(event)};
  stage.setPointerCapture(event.pointerId);if(hint)hint.hidden=true;
 });
 stage.addEventListener('pointermove',event=>{
  if(drag&&drag.id===event.pointerId){
   if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>5)drag.moved=true;
   if(drag.moved){yaw=THREE.MathUtils.clamp(yaw-(event.clientX-drag.lastX)*.004,-.12,1.15);if(event.pointerType!=='touch')pitch=THREE.MathUtils.clamp(pitch+(event.clientY-drag.lastY)*.003,.30,.82);stage.classList.add('is-held');requestDraw();}
   drag.lastX=event.clientX;drag.lastY=event.clientY;return;
  }
  if(event.pointerType==='touch')return;
  const id=pick(event);stage.classList.toggle('is-interactive',!!id);if(hint)hint.hidden=!id;
  if(id&&hint){const rect=stage.getBoundingClientRect();hint.textContent=id.startsWith('album')?albums[Number(id.slice(5))].title:copy[language][`${id}Hint`];hint.style.left=`${THREE.MathUtils.clamp(event.clientX-rect.left,90,rect.width-90)}px`;hint.style.top=`${Math.max(44,event.clientY-rect.top-15)}px`;}
 });
 function endDrag(event,cancelled=false){
  if(!drag||drag.id!==event.pointerId)return;const current=drag;drag=null;stage.classList.remove('is-held');if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
  if(!cancelled&&!current.moved&&current.action&&current.action===pick(event))action(current.action);
 }
 stage.addEventListener('pointerup',e=>endDrag(e));stage.addEventListener('pointercancel',e=>endDrag(e,true));stage.addEventListener('lostpointercapture',()=>{drag=null;stage.classList.remove('is-held');});
 stage.addEventListener('pointerleave',()=>{if(hint)hint.hidden=true;stage.classList.remove('is-interactive');});
 stage.addEventListener('keydown',event=>{
  if(event.target!==stage)return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)){
   event.preventDefault();if(event.key==='Home'){resetView();return;}
   animations.delete('view');if(event.key==='ArrowLeft')yaw-=.08;if(event.key==='ArrowRight')yaw+=.08;if(event.key==='ArrowUp')pitch+=.06;if(event.key==='ArrowDown')pitch-=.06;
   yaw=THREE.MathUtils.clamp(yaw,-.12,1.15);pitch=THREE.MathUtils.clamp(pitch,.30,.82);requestDraw();
  }
 });
 const observer=new ResizeObserver(resize);observer.observe(stage);
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){lastTime=0;requestDraw();}else{cancelAnimationFrame(frame);frame=0;}},{threshold:.01});visibility.observe(stage);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{lastTime=0;requestDraw();}});
 reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){for(const a of animations.values()){a.update(1);a.complete();}animations.clear();requestDraw();}});
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;if(loading){loading.hidden=false;loading.textContent=copy[language].lost;}document.querySelectorAll('[data-action]').forEach(b=>b.disabled=true);});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;if(loading)loading.hidden=true;document.querySelectorAll('[data-action]').forEach(b=>b.disabled=false);requestDraw();});
 if(loading)loading.hidden=true;stage.dataset.state='ready';resize();updateCamera();requestDraw();
}
