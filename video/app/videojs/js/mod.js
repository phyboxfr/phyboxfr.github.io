

 // ************** BUG CHROME66 ***************

   //Bug Chrome66:   Chrome before version 66 was the only browser that returns DeviceMotion RotationRate event value, in Radian instead of Degree, need to be corrected, otherwise gyroscope view move to fast. If Chrome66, angle are in radians, so don't need to slow motion with Deg2Rad so mobileVibrationValue is set to 1, otherwise set to Deg2Rad.
     var Deg2Rad = Math.PI / 180;
     var mobileVibrationValue = isChromeMinus(66)  ? 1 : Deg2Rad;   


 // ************** HOTSPOTS ***************


       
       var SpotHtml = {
             id: "hotspot_1",
             element: {},               //rempli dans le html, car sinon element pas défini car appelé avant la def du dom
             location: {lat: 0, lon: 0},
             radius: 500,
             duration: 200,
             keypoint: -1,
             onShow: function(){  },   // console.log(" "); 
             onHide: function(){  }               
       };
       
    function Hotspots(){               //mis dans une fonction, car sinon la propriété .id était modifiée par le code de panorama à chaque appel et augmentait dès qu'on rechargeait Panorama
       var lat = -15; var lonFront = 180; var spc = 10; lonBack = 0;
       function Spot(id, evt, side, loc){
              lon = (side=='back' ? lonBack : lonFront);
          return {                      // id: id,
              element: 'link',
              className: 'vjs-marker-' + id,
              location: { lat: lat, lon: lon + loc, lon180: lon + 2*loc},   //VR180: double space between hotspot to compensate 360 -> 180, otherwise get too close
              view: 'L',                                                    // VR: show markers on left/right (choice: L, R, LR)
              side: side,
              radius: 500,               
              onClick: evt 
        }};
       
       return [ 
                 Spot('prev', 'NextTrack(-1)', 'front', -spc ),
                 Spot('play', 'TooglePlay()' , 'front', 0    ),
                 Spot('next', 'NextTrack(1)' , 'front', spc  ),
                 Spot('prev', 'NextTrack(-1)', 'back', -spc  ),
                 Spot('play', 'TooglePlay()' , 'back',  0    ),
                 Spot('next', 'NextTrack(1)' , 'back',  spc  )
               ];
    };

    function TooglePlay() { 
       TooglePlayIcon();
       if(player.paused()) player.play(); else player.pause(); 
    }
    function TooglePlayIcon() {
       document.querySelector('.vjs-marker-play').classList.toggle('pause', !player.paused() );  // $('.vjs-marker-container');
    }
    
    function ShowMarkers(show){ 
                 var markers = $('.vjs-marker-container');
                 var Class = 'vjs-marker-container-visible';
                 if(show) markers.addClass(Class);
                 else     markers.removeClass(Class);
              };

   
 // ************** PLAYER & PANORAMA OPTIONS ***************

    var PlayerOptions = {             
            controlBar: {                              // Volume vertical
               volumeMenuButton: {inline: false}      // V5   
            // volumePanel:      {inline: false}      // V6
    }};

    Options = {

           videoType: 'equirectangular',   //equirectangular,VR3603D,VR3603DLR,VR1803D,fisheye,dual_fisheye,
           PanoramaThumbnail: true,       //enable panorama thumbnail
           KeyboardControl: true,      
           VREnable: true,
            
           clickToToggle: true,           //click on video to play/stop
           clickAndDrag: true,
           autoMobileOrientation: true,
           mobileVibrationValue: mobileVibrationValue,
            
           backToInitLat: false,          //sinon retourne au centre (default: true pour desktop
           backToInitLon: false,
           initFov: 70,                   // 50: trop serré, 100: trop large
           maxFov: 100,
           minFov: 50,  
           InitLat: 0,  //marche pas ?    //initial lat for camera angle, Defaults value is 0, range between -90 to 90.
           InitLon: 0,                    //initial lot for camera angle, Defaults value is -180, don't have range.
                       
           Notice: false,
           HideTime: 0,
           Message: (isMobile())? " " : " ",  

           Markers: Hotspots(),
           ready: function() { OnReady(); }
    }; 
   

    function OnReady() {
     // TestGyroscope();
     // var canvas = document.querySelector(".vjs-panorama-canvas" );
        var canvas = $( ".vjs-panorama-canvas" );
      
        var isMob = isMobile();
        var evtStart = isMob ? 'touchstart' : 'mousedown';
        var evtMove  = isMob ? 'touchmove'  : 'mousemove';
        var evtEnd   = isMob ? 'touchend'   : 'mouseup';
      
            canvas.on(evtStart, () => drag = false);
            canvas.on(evtMove,  () => drag = true);
            canvas.on(evtEnd,   () => {if(!drag){ if(player.paused()) NextTrack(1); else player.play(); }}); 
        
        player.on('play', TooglePlayIcon); player.on('pause', TooglePlayIcon);
               
        if (isVRMode) { ToogleVR(); }
            if (VRStart) { 
                VRStart = false; 
                player.play();
                player.pause();           // player.one('play', function(){alert('start')});
                player.one('loadeddata', function(){ ShowMarkers(true); });   //wait video is truly loaded to show markers, otherwise they are show at their origin position (top/left) during video loading because js is stuck before loading is finished
            } else player.play();        //VRStart = true in VR.php: flag for not autoplay video at first load)    //chrome://flags/#autoplay-policy
    };
   
   
    function TestGyroscope(){
       var isDevicemotion = false;
       
       player.one('devicemotion', function(event){
         isDevicemotion = true;
         if(event.rotationRate.alpha || event.rotationRate.beta || event.rotationRate.gamma)
             isGyro = true;
       });
       
       setTimeout(function(){ alertGyro(); }, 2000 );
       
       function alertGyro(){
          if(!isDevicemotion || !isGyro) {
               alert("La VR n'est pas disponible sur votre appareil, \n" + 
                     "car les données du Gyroscope ne sont pas détectées: \n\n" +
                     ". Votre appareil a un Gyroscope:  " + (isGyro ? 'OUI' : 'NON') + "\n\n" + 
                     ". Les fonctionnalités du Gyroscope sont bloquées par votre navigateur:  " + (isDevicemotion ? 'NON' : 'OUI') + "\n\n" +
                     "  (essayer de vous connecter sur le serveur en mode sécurisé https:// plutôt que http://)" 
               );
          };
       };
    };


// ************** CLASS: PLAYLIST ***************
// Gère la playlist des vidéos (propriétés: nom, path, isHD, VideoType)

    var playlst = new Playlist();

    function mod(player, pls){

            playlst.doList(pls);
            
            Replay    (player,playlst);
            HD        (player, playlst);
            Next      (player,playlst);
            Vibration (player);
            
            player.on('ended', function(){NextTrack(1)});
            player.src(playlst.src);
            Options.videoType = playlst.videoType;
    };

         function Playlist() {
             this.path      = "";
             this.Sources   = [];
             this.tracks    = 0;
             this.track     = 0;
             this.src       = "";
             this.videoType = "";
         }
         
         Playlist.prototype.doList = function(vid) {
                 var HDtracks = [];
                 //this.path = PathVideo;  //IMPORTANT:  if PathVideo begins with a slash /path/to.. -> dir is absolute to root, but if only path/to.. -> path is relative to script folder
            for (var i = 0, len = vid.length; i < len; i++) {
                  var name  = vid[i].name;
                  var ext   = vid[i].ext; 
                  var isHD = (name.toLowerCase().indexOf('hd') > 0);
                  var videoType = getvideoType(name);
                  if (!isHD){
                      Src = {};
                      Src.name      = name;
                      Src.ext       = ext;
                      Src.src       = vid[i].path;
                      Src.srcHD     = '';
                      Src.type      = "video/" + ext;
                      Src.videoType = videoType;                      
                      Src.isHD      = false;
                      this.Sources.push(Src);
                  }
                 else {HDtracks.push(vid[i].path); }};
                
            for (var i = 0, lenHD = HDtracks.length; i < lenHD; i++) {           // Associate non HD & HD sources
                 for (var j = 0, len = this.Sources.length; j < len; j++) {    
                       if ( HDtracks[i].indexOf(this.Sources[j].name) >= 0 ) {
                            this.Sources[j].isHD  = true;
                            this.Sources[j].srcHD = HDtracks[i];
                            break;
            }}};      
            this.tracks    = this.Sources.length
            this.src       = this.Sources[0].src;
            this.videoType = this.Sources[0].videoType;
       };         
       
       function getvideoType (vid) {
           var VR = [ {vid:'3D360LR',  type:'VR3603DLR'},   //BUG: mis en 1° sinon 3D360 détecté même si 3D360LR car le indexOf de VR3603DLR, match aussi avec VR3603D
                      {vid:'3D360',    type:'VR3603D'}, 
                      {vid:'3D180',    type:'VR1803D'},
                      {vid:'fisheye',  type:'fisheye'},
                      {vid:'fisheye2', type:'dual_fisheye'}
                    ];
                for (var i = 0, len = VR.length; i < len; i++) {
                   if (vid.indexOf(VR[i].vid) > -1) { return VR[i].type; }
                };
                return 'equirectangular';
       };
       
       
// ************** CONTROLBAR MOD ***************


   // ************** BUTTON: REPLAY ***************

   function Replay (player,pls) {
       var Button = videojs.getComponent("Button");
       var ReplayClass = videojs.extend(Button, {
                      constructor: function(player, options){
                          Button.call(this, player, options);
                             this.el().setAttribute('title','Relire');    //V5    this.controlText= 'Relire';     //V7
                             this.addClass('vjs-icon-replay');            //Font icon (no real icon in videojs)
                      },
                      handleClick: function() { player.currentTime(0); }  //set Play time back to 'O'
            });            
                           Button.registerComponent('ReplayClass', ReplayClass);        //V5: don't work ?
              var Replay = player.controlBar.addChild(new ReplayClass(player), {});
                            player.controlBar.el().insertBefore(Replay.el(), player.controlBar.volumeMenuButton.el());
   };
 
 
   // ************** BUTTON: NEXT/PREVIOUS TRACK ***************
   
   function Next (player,pls) {
       
       var ClassIco = 'Next-Ico';
       var Button = videojs.getComponent("Button");
       
       //BUTTON: Previous
       var PrevClass = videojs.extend(Button, {
                      constructor: function(player, options){
                          Button.call(this, player, options);
                             this.id='butPrev';                                    //V7   
                             this.controlText('Vidéo Précédente');                 //V7
                             this.el().setAttribute('title','Vidéo Précédente');   //V5
                             this.addClass('vjs-icon-previous-item');              //Font icon (no real icon in videojs)
                      },
                      handleClick: function() { NextTrack(-1); }
            });            
                    videojs.registerComponent('PrevClass', PrevClass);                 //V5: don't work ?
                                 
              var butPrev = player.controlBar.addChild(new PrevClass(player), {});    // V5
                         // player.controlBar.addChild('PrevClass', {});               // V7                              // ou player.getChild('controlBar').addChild('butPrev', {}); 
                            player.controlBar.el().insertBefore(butPrev.el(), player.controlBar.volumeMenuButton.el());   // ou player.controlBar.getChild('butPrevClass').el()
       
       //BUTTON: Next 
       var NextClass = videojs.extend(Button, {
                      constructor: function(player, options){
                          Button.call(this, player, options);
                             this.id='butNext';                    //V7
                             this.controlText('Vidéo Suivante');   //V7
                             this.el().setAttribute('title','Vidéo suivante');                              
                             this.addClass('vjs-icon-next-item');  //Font icon (no real icon in videojs)
                             this.addClass(ClassIco)
                      },
                      handleClick: function() { NextTrack(1); }
            });
                      videojs.registerComponent('butNextClass', NextClass);                        //V5: don't work ?
              // V5:
                var butNext = player.controlBar.addChild(new NextClass(player), {});
                              player.controlBar.el().insertBefore(butNext.el(), player.controlBar.volumeMenuButton.el()); 
              // V7:                
                           // player.controlBar.addChild('NextClass', {});  
                           // player.controlBar.el().insertBefore(player.controlBar.getChild('NextClass').el(), player.controlBar.volumePanel.el());          
    };
            
         //CALLBACK:  Passe à la vidéo suivante/précédente (step: 1/-1)
         function NextTrack(step) {
                   ShowMarkers(false);
               var pls = playlst;
               var videoTypeLast = pls.Sources[pls.track].videoType;
                    isVRMode = panorama.player.getComponent("VideoCanvas").VRMode;
                
                    pls.track = pls.track + step;
                if (step>0 && pls.track >= pls.tracks) {pls.track = 0}
              else if (step<0 && pls.track < 0) {pls.track = pls.tracks-1}
                    
               var isHD = isPlayerHD();
               var TrackisHd = pls.Sources[pls.track].isHD;
                    
                if (isHD && TrackisHd) { 
                     pls.src = pls.Sources[pls.track].srcHD; }              //if no HD source available, take SD      
              else { pls.src = pls.Sources[pls.track].src;   }
                      var videoType = pls.Sources[pls.track].videoType;
                       if (videoType != videoTypeLast){ 
                            Panorama_Reset(); }   //if not same VR mode, reload panorama with new Options.videoType
                            player.src(pls.src);
                            player.play();
                            player.one('loadeddata', function(){ ShowMarkers(true);});
                };
                
         function Panorama_Reset(){
            if(!player.paused()){ 
                player.pause();}
                panorama_dispose();                                             //Dispose all Panorama objects and dom el
                panorama.dispose();
                panorama = {};
                Options.videoType = playlst.Sources[playlst.track].videoType;   //Load new video
                Options.Markers = Hotspots();                                   //reset Markers because .id property is modified by Markers code (add left_group at each call)
                panorama = player.panorama(Options);                            //Load Panorama
         };
         
       //Reset Panorama to restore it with new option VideoType when it has changed
       //This code has also been put commented in panorama code at panorama.dispose();
       //Keep it here for more visibility because it touch different component and it was difficult to find !
         function panorama_dispose(){
            var pan = panorama.player;

                //del evt called when VR button pushed (otherwise previous video evt stay in memory and is called simultanously with new event and cause error because objects are no more defined
                pan.off('VRModeOn');   // .off = alias for removeListener, should work ?: panorama.player.getComponent("markerContainer").removeListener("VRModeOn");
                pan.off('VRModeOff');
                pan.off('fullscreenchange');
                
                pan.removeComponent("VideoCanvas");   //removeComponent remonte la chaine d'inheritance des .dispose de tous les enfants jusqu'à BaseCanvas.dispose() ou pan.getComponent("VideoCanvas").dispose() à condition de mettre dans chaque méthode des enfants 'child.dispose()' un appel au parent pour continuer à remonter la chaine des dispose:  _BaseCanvas.prototype.dispose.call(this)
                pan.removeComponent("HelperCanvas");
                pan.removeComponent('Thumbnail'); 
                pan.removeComponent('ThumbnailCanvas'); 
                pan.removeComponent("markerContainer");
                pan.removeComponent('Notice'); 
                pan.removeComponent('VRButton');
                panorama.options.markers = null;
                pan.getVideoEl().remove();
         }
         
         function ToogleVR(){
         
            var pan = panorama.player;
            var canvas = pan.getComponent("VideoCanvas");
            var VRMode = panorama.player.getComponent("VideoCanvas").VRMode;
            var VRModeOn = VRMode ? "VRModeOff" : "VRModeOn";

                VRMode ? canvas.disableVR() : canvas.enableVR();
                pan.getComponent('VRButton').toggleClass("enable");        
                pan.trigger(VRModeOn)
                isVRMode = VRMode;
         };         

   // ************** BUTTON: SD/HD ***************
   // Change la version du fichier pour augmenter la résolution si l'appareil le permet
     
       var ClassIco = 'HD-Ico';
       var ClassSD  = 'HD-Ico-SD';
       var ClassHD  = 'HD-Ico-HD';
       
   function HD (player,pls) {

     //BUTTON:        
       var Button = videojs.getComponent("Button");
       var HDClass = videojs.extend(Button, {
                        constructor: function(player, options){
                          Button.call(this, player, options);
                             this.id='bHD';                 //V7
                             this.controlText('HD');        //V7   Ce n'est pas un tag HTLM, mais un élément Span ajouté par Videojs pour afficher un titre à l'endroit du bouton: <span class='vjs-control-text">HD</span> (avec la version 5, il est bien présent, mais ne s'affiche pas ?
                             this.addClass(ClassIco)
                             this.addClass(ClassSD);
                      },
                      handleClick: function() { HDtoggle(pls); }
            });
               videojs.registerComponent('HDClass', HDClass);                //V5: don't work ?
           var butHD = player.controlBar.addChild(new HDClass(player)); 
                       player.controlBar.el().insertBefore(butHD.el(), player.controlBar.fullscreenToggle.el());  
               butHD.el().setAttribute('title','Passer en HD');
               butHD.el().setAttribute('id','butHD');
                    // player.getChild('controlBar').addChild('butHDClass', {});   // FOR V7 ONLY, gives ERROR in V5: butHDClass don't exist ? because registerComponent('butHDClass', butHDClass) failed somehow to register component whithout telling, don't know why
                    // player.controlBar.el().insertBefore(butHD.el(), player.controlBar.playToggle.el());

     //CALLBACK: Change SD->HD        
       function HDtoggle(pls) {
    
           var isHD      = isPlayerHD(); 
           var TrackisHd = pls.Sources[pls.track].isHD;
           
               butHD.removeClass( isHD ? ClassHD : ClassSD );  //V5: player.controlBar.getChild('butHD') don't exist because registerComponent('butHDClass', butHDClass) failed somehow to register component whithout telling, don't know why
               butHD.addClass   ( isHD ? ClassSD : ClassHD );
            // player.controlBar.getChild('butHD').removeClass( isHD ? ClassHD : ClassSD );   //V7 ONLY if button' component registered with videojs.registerComponent('butHDClass', butHDClass); 
            // player.controlBar.getChild('butHD').addClass   ( isHD ? ClassSD : ClassHD );   //V7 ONLY        

           if (!TrackisHd) {return};    // HD is On and turn Off, although a SD video is playing: don't do anything (just change button text)
           
           var Source = pls.Sources[pls.track];               
           var src = isHD ? Source.src : Source.srcHD;
               pls.src = src;           
          
               time = player.currentTime();
		       player.src([{type: "video/mp4", src: src }]);
               player.one('loadedmetadata', function(){      //loadeddata existe aussi
                      player.currentTime(time);
                      player.play();
             });
         }; 
    };
         
         function isPlayerHD(){  
                  //document.getElementById('butHD').innerHTML;
           return (document.getElementById('butHD').getAttribute('Class').indexOf(ClassHD) > 0);
         };
         
         
   // ************** BUTTON MENU: VITESSE ***************
   // Change la valeur de mobileVibrationValue (1 ou Deg2Rad) pour Chrome<66

   function Vibration (player) {

         var Vibration = [ {label:'Rapide', vib:1},{label:'Lent', vib:Deg2Rad} ];
       
       //MENU-BUTTON:  
         var MenuButton   = videojs.getComponent("MenuButton");
         var MenuButtonClass = videojs.extend(MenuButton, {
                                  constructor: function(player, options){
                                      MenuButton.call(this, player, options);
                                          this.el().setAttribute('title','Vitesse');   // V5     
                                          this.controlText('Vitesse');                 // V7 
                                          this.addClass('vjs-icon-cog');               // Icon
                                        $(this.el()).find('.vjs-menu').addClass('vjs-menu-vib');   // Style du Menu de la classe: vjs-menu-vib override vjs-menu class (qui détermine la taille du menu) child of vjs-menu-button
                                  },
                                      createItems: function(){ return MenuItemsCreate() }
                               });            
         var butVib = player.controlBar.addChild(new MenuButtonClass(player), {});
                      player.controlBar.el().insertBefore(butVib.el(), player.controlBar.fullscreenToggle.el());
 
 
       //CALLBACK:  Add items to menu with content of Vibration array
         function MenuItemsCreate() {
              var MenuItem      = videojs.getComponent('MenuItem');
              var MenuItemClass = videojs.extend(MenuItem, {
                                      constructor: function(player, options){
                                            options.selectable = true;
                                            MenuItem.call(this, player, options);
                                                this.label      = options.label;
                                                this.vib        = options.vib;
                                                this.isSelected = options.selected;
                                              $(this.el()).addClass('vjs-menu-item-vib');
                                                this.on('click',      this.onClick);
                                                this.on('touchstart', this.onClick);
                                      },
                                      onClick: function () { UnSelect(this); setVibration(this.vib); },
                                  });
                                  
              var menuItems = [];
              var vibValue = isIos() ? Deg2Rad : 1;   // Default selected value
              
              for (var key in Vibration) {
                         menuItems.push( new MenuItemClass(player, { 
                                               label:     Vibration[key].label,
                                               vib:       Vibration[key].vib,
                                               selected:  Vibration[key].vib == vibValue ? true : false     // Choose selected item at start (selected is a method, not a property)
                                        }));
              };
            
             //Select clicked items and Unselect all others
              function UnSelect (clickItem) {
                   menuItems.map(function (item) {
                       if ($(item.el()).hasClass('vjs-selected')) {
                           $(item.el()).removeClass('vjs-selected'); }
                   });
                   $(clickItem.el()).addClass('vjs-selected');
               };
              return menuItems;
         };
                          
       //Change value of mobileVibrationValue (needed for Chrome<66):
         function setVibration(value){
              //var value =  Vibration.find(x => x.label === label).vib         
              panorama.player.getComponent("VideoCanvas").options.mobileVibrationValue = value; };      
       };



 // ************** TOOLS: MOBILE DECTECTION ***************


   function isMobile() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
   };
   
   function isIos() {
        return (/iPhone|iPad|iPod/i.test(navigator.userAgent));
   };
   
 //detect if Chrome is used in version<66 to protect against bug Chrome66 (see doc)
   function isChromeMinus(version){
         var isChrome = getChromeVersion();
      return (isChrome > 0 && isChrome < version) ? true : false;
   };
   
   function getChromeVersion(){
       var match = navigator.userAgent.match(/.*Chrome\/([0-9]+)/);
           return match ? parseInt(match[1], 10) : 0;
   };
