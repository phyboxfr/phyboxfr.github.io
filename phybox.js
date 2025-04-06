      const WIFI = {};
            WIFI.center = 'M18.667 35.1513L24.917 41.4013L31.167 35.1513C30.347 34.3292 29.3729 33.6769 28.3004 33.2318C27.2279 32.7867 26.0782 32.5576 24.917 32.5576C23.7558 32.5576 22.6061 32.7867 21.5336 33.2318C20.4611 33.6769 19.487 34.3292 18.667 35.1513Z';
            WIFI.mid    = 'M10.4165 27.0835L14.5832 31.2502C17.3466 28.489 21.0933 26.938 24.9998 26.938C28.9063 26.938 32.653 28.489 35.4165 31.2502L39.5832 27.0835C31.5415 19.0418 18.479 19.0418 10.4165 27.0835Z';
            WIFI.top    = 'M2.0835 18.75L6.25016 22.9167C16.6043 12.5625 33.396 12.5625 43.7502 22.9167L47.9168 18.75C35.271 6.10417 14.7502 6.10417 2.0835 18.75Z';

      var tube = {};

   function video(){
      fetch('/video/video.json').then(e => e.json() ).then( e => videoCB(e) );
   }
     
   function videoCB(e){
     let lang = document.documentElement.lang;
         let lg = lang == 'fr' ? '' : '.' + lang; //vid (en): add 'vid.en.mp4' 
         tube = e.tube;
     let videos = document.querySelectorAll('iframe.video');
         [...videos].forEach( e =>  e.src = tube.url + tube.id[e.dataset.id+lg] + tube.arg.replace('@',lang) );
  }

   // needed by preload="none" 
   function video_clic(){
     let videos = document.getElementsByTagName('video');
         [...videos].forEach( e => e.onclick = play );
   }

   function play(e){ 
      e.preventDefault();  //or click twice
      let video = e.target;
      video.paused ? video.play() : video.pause();
   }

   function init(isWifi=1){
      if( document.title.toLowerCase() == 'download' ) download();
      video();
      phybox();
      if(!!isWifi) wifi();
      wiggle();
   }

   //Download link
   function download(){
      fetch('/phybox.json').then(e => e.json() ).then( e => downloadCB(e) );
   }
   function downloadCB(e){
     let link    = e.phybox;
     let version = link.version;
     let size    = link.size;

     let p = document.querySelector('.text.link.download');
         p.innerHTML = p.innerHTML.replace('version',version).replace('size',size);

     let a = document.querySelector('.text.link.download a');
         a.href = link.url;

     let md5 = document.querySelector('.text.link.md5');
     let text = md5.innerHTML;
         md5.innerHTML = md5.innerHTML.replace('md5',link.md5);
   }

   // PhYBᯤX
   function phybox(){
    
     const span = WifiSVG(true);
     const BoX = '$1$3' + span.outerHTML + '$2$4';

     let paragraphs = document.querySelectorAll('p');
         [...paragraphs].forEach( p => p.innerHTML = p.innerHTML.replace( /(PhYB)o(X)|(B)o(X)/g, BoX ) );
   }

   function WifiSVG(anim=false){
     const s = ' ';
     const span = document.createElement('span');
           span.className = 'phybox wifi';

     const path = anim ? WIFI : WIFI.center + s +WIFI.mid + s + WIFI.top;
     const Path = anim ? path : { path: path};
     const sv   = svg(Path);
        
     if(anim) sv.classList.add('wifi','anim');
              span.append(sv);
              return span;
   }
   
   // Text Wiggle

   function wiggle(id='title'){  
     const title = document.querySelector('.'+id);
        if(!title) return;
       let text = title.innerText;
       let isBox = text.toLowerCase().includes('box');
           text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');  //remove accent
           title.innerText = '';
           for(i=0;i<text.length;i++){
              const isWifi = text[i].toLowerCase()=='o';
              const rr = RandomInt(10000);//max ms timing
              //color = Math.floor(Math.random()*16777215).toString(16);
              const color = 'FFFFFF';
              const anim = true;
              const letter = (isBox && isWifi) ?  WifiSVG(anim).outerHTML : text[i];
              title.innerHTML+=('<span style="animation-duration: '+rr+'ms; color:#'+color+';" class="wg wiggle" >'+letter+'</span>'); 
           }

   }
   function RandomInt(max) {
     return Math.floor(Math.random() * max + 500);
   }

   function wifi(id=''){

      if(id=='') id = 'Article';
      const root = document.getElementById(id);

      const div = document.createElement('div');
            div.id = 'wifi';
            div.className = 'absolute right';
      const icon = svg(WIFI);
            div.prepend(icon);
            root.prepend(div);
   }

   function svg(p){
      const vb = [50,50];
      const sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            sv.setAttribute('viewBox','0 0 ' + vb[0] + ' ' + vb[1]);
            sv.setAttribute('class','wifi');
            sv.setAttribute('fill','white');
            Object.keys(p).forEach( e => sv.append( path(e,p[e]) ) );
            return sv;
   
      function path(e,d){
         const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
               path.classList.add(e);
               path.setAttribute('d', d);
               return path;
      }
   }
