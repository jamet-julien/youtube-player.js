(function( _global){

    //DOCUMENT YOUTUBE PLAYER
    // https://developers.google.com/youtube/player_parameters?playerVersion=HTML5


    /**
     * [extend description]
     * @param  {[type]} object_2 [description]
     * @param  {[type]} object_1 [description]
     * @return {[type]}          [description]
     */
    function extend( object_2, object_1){
        for( sAttr in object_1){
            object_2[sAttr] = object_1[sAttr];
        }

        return object_2;
    }

    /**
     * [roundNumber description]
     * @param  {[type]} number        [description]
     * @param  {[type]} decimalPlaces [description]
     * @return {[type]}               [description]
     */
    function roundNumber(number, decimalPlaces) {
      decimalPlaces = (!decimalPlaces) ? 2 : decimalPlaces;
      return Math.round(number * Math.pow(10, decimalPlaces)) /
          Math.pow(10, decimalPlaces);
    }

    /**
     * [clone description]
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    function clone( obj) {
        if(obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
            return obj;

        var temp = obj.constructor(); // changed

        for(var key in obj) {
            if(Object.prototype.hasOwnProperty.call(obj, key)) {
                obj['isActiveClone'] = null;
                temp[key] = clone(obj[key]);
                delete obj['isActiveClone'];
            }
        }

        return temp;
    }


    /**
     .o88b. db       .d8b.  .d8888. .d8888.
    d8P  Y8 88      d8' `8b 88'  YP 88'  YP
    8P      88      88ooo88 `8bo.   `8bo.
    8b      88      88~~~88   `Y8b.   `Y8b.
    Y8b  d8 88booo. 88   88 db   8D db   8D
     `Y88P' Y88888P YP   YP `8888Y' `8888Y'
    **/

    var PlayerYT = function( aArgs){
        var oDefault = clone( Youtube.getParam());

        var oArgs = {};

        if( aArgs.length == 1 && typeof( aArgs[0]) == 'string'){

            oArgs.target    = 'player';
            oArgs.idVideo   = aArgs[0];

        }else if( aArgs.length == 1 && typeof( aArgs[0]) == 'object'){

            oArgs = aArgs[0];

         }else if( aArgs.length == 2){

            oArgs.target    = aArgs[1];
            oArgs.idVideo   = aArgs[0];

        }
        this.oParent   = null;
        this.oScreen   = null;
        oArgs.target   = this._buildContener( oArgs.target );

        this.playerVars = extend( oDefault,  oArgs);
        this._oPLayer   = null;
        this.iDuration  = 0;

        this.onReady    = function launchReady(){
            this.play();
        };

        this.oState = {};


//-1 : non démarré
// 0 : arrêté
// 1 : en lecture
// 2 : en pause
// 3 : en mémoire tampon
// 5 : en file d'attente
    }

    PlayerYT.prototype.getScreen = function(){
        return this.oScreen;
    };

    PlayerYT.prototype._buildContener = function( sIdParent){

        var iId = Math.round((Math.random() * 1000000));
        var sId = 'player_'+iId;
        var oPlayer = document.createElement('div');
        oPlayer.setAttribute('id', sId);

        this.oParent = document.getElementById(sIdParent);
        this.oParent.innertHTML = '';
        this.oParent.style.position = "relative";
        this.oParent.appendChild(oPlayer);
        return sId;
    };

    PlayerYT.prototype._buildWall = function(){

        this.oScreen = document.createElement('div');
        this.oScreen.setAttribute( 'style', "position:absolute;top:0;left:0;bottom:0;right:0;z-index:2");

        this.oParent.appendChild( this.oScreen);
    };

    PlayerYT.prototype.mute      = function(){ this._oPLayer.mute(); return this;};
    PlayerYT.prototype.unMute    = function(){ this._oPLayer.unMute(); return this;};
    PlayerYT.prototype.isMute    = function(){ return this._oPLayer.isMute();};
    PlayerYT.prototype.getVolume = function(){ return this._oPLayer.getVolume();};
    PlayerYT.prototype.setVolume = function( iVol){ return this._oPLayer.setVolume( iVol);};
    PlayerYT.prototype.stop      = function(){ this._oPLayer.stopVideo(); return this;};
    PlayerYT.prototype.pause     = function(){ ;this._oPLayer.pauseVideo(); return this;};
    PlayerYT.prototype.getSpeed  = function(){ this._oPLayer.getPlaybackRate(); return this;};
    PlayerYT.prototype.setSpeed  = function( iSpeed){ this._oPLayer.setPlaybackRate( iSpeed); return this;};

    PlayerYT.prototype.setQuality= function( sQuality){ this._oPLayer.setPlaybackQuality( sQuality);}

    PlayerYT.prototype.goTo      = function( iSec, bAllowSeekAhead){
        bAllowSeekAhead = bAllowSeekAhead || false;
        this._oPLayer.seekTo( iSec, bAllowSeekAhead);
        return this;
    };

    PlayerYT.prototype.getCurrentPos = function(){
        var iCurrentTime = (this._oPLayer.getCurrentTime() * 100) / this._oPLayer.getDuration();
        return Math.round( iCurrentTime);
    }

    /**
     * [onStateChange description]
     * @param  {[type]} sState    [description]
     * @param  {[type]} fCallBack [description]
     * @return {[type]}           [description]
     */
    PlayerYT.prototype.onStateChange = function( sState, fCallBack){
        this.oState[sState] = fCallBack;
        return this;
    }

    /**
     * [launchState description]
     * @param  {[type]} iSate [description]
     * @return {[type]}       [description]
     */
    PlayerYT.prototype.launchState = function( iState){
        var aState = ['stop','play','pause', 'temp','wait'];
        var sState = ( iState > -1)? aState[iState] : aState['start'];
        if( this.oState[sState]){
            this.oState[sState].apply( this);
        }
    }

    /**
     * [play description]
     * @return {[type]} [description]
     */
    PlayerYT.prototype.play = function(){


        if( !Youtube.getReady()){
            Youtube.pushOnQueue( this);
            return this;
        }

        if( !this._oPLayer &&  this.playerVars.idVideo != '' &&  this.playerVars.target != ''){

            if( this.playerVars.loop){
                this.playerVars.playlist = this.playerVars.idVideo;
            }

            this._oPLayer = new YT.Player( this.playerVars.target, {

                height    : '100%',
                width     : '100%',
                videoId   : this.playerVars.idVideo,
                playerVars: this.playerVars,
                events: {

                    onReady: (function( eElement){
                        return function(e){
                            eElement.onReady.apply( eElement);
                        }
                    })( this),
                    //une foi la lecture terminé
                    onStateChange : (function( eElement){
                        return function(e){
                            var iState =  e.data;
                            eElement.launchState.apply( eElement,[iState]);
                        }
                    })( this)
                }

            });

            this._buildWall();

        }else{
            this._oPLayer.playVideo();
        }

        return this;

    }



    /**
    .o88b.  .d88b.  d8b   db d888888b d8888b.  .d88b.  db      db      d88888b d8888b.
   d8P  Y8 .8P  Y8. 888o  88 `~~88~~' 88  `8D .8P  Y8. 88      88      88'     88  `8D
   8P      88    88 88V8o 88    88    88oobY' 88    88 88      88      88ooooo 88oobY'
   8b      88    88 88 V8o88    88    88`8b   88    88 88      88      88~~~~~ 88`8b
   Y8b  d8 `8b  d8' 88  V888    88    88 `88. `8b  d8' 88booo. 88booo. 88.     88 `88.
    `Y88P'  `Y88P'  VP   V8P    YP    88   YD  `Y88P'  Y88888P Y88888P Y88888P 88   YD
     */
    var Youtube = ( function(){

        var _aAllPlayer    = [];
        var _aQueuePayer   = [];
        var _bReady        = false;
        var _oDefaultParam = {

                enablejsapi    : 1,//active API
                fs             : 0,//btn plein ecran
                modestbranding : 1,
                showinfo       : 0,
                iv_load_policy : 3,//annotation video
                rel            : 0,
                loop           : 0,
                html5          : 1,
                controls       : 0,
                autoplay       : 1,
                wmode          : 'transparent',

                target         : '',
                idVideo        : ''
        };


        /**
         * [_addScriptAPI description]
         */
        function _addScriptAPI(){
            var sTag         = 'script';
            var oTag         = document.createElement( sTag);

            oTag.src         = "//www.youtube.com/iframe_api";
            var oFirstScript = document.getElementsByTagName( sTag)[0];
            oFirstScript.parentNode.insertBefore( oTag, oFirstScript);
        }

        /**
         * [createPlayer description]
         * @return {[type]} [description]
         */
        function createPlayer( /** PARAMS **/){
            var oPlayer   = new PlayerYT( arguments);
            _aAllPlayer.push( oPlayer);
            return oPlayer;
        }

        /**
         * [getReady description]
         * @return {[type]} [description]
         */
        function getReady(){
            return _bReady;
        }

        /**
         * [setParam description]
         * @param {[type]} oParam [description]
         */
        function setParam( oParam){
             _oDefaultParam = extend( _oDefaultParam,  oParam);
             return this;
        }

         /**
         * [setParam description]
         * @param {[type]} oParam [description]
         */
        function getParam(){
            return _oDefaultParam;
        }

        /**
         * [pushOnQueue description]
         * @return {[type]} [description]
         */
        function pushOnQueue( oPlayer){
            _aQueuePayer.push( oPlayer);
            return this;
        }


        /**
         * [apiLoad description]
         * @return {[type]} [description]
         */
        function apiLoad(){
            _bReady = true;
            var oPlayer;
            while( oPlayer = _aQueuePayer.shift()){
                oPlayer.play();
            }
        }


        /**
         * [self description]
         * @type {Object}
         */
        var self = {

            apiLoad      : apiLoad,
            createPlayer : createPlayer,
            getReady     : getReady,
            pushOnQueue  : pushOnQueue,
            setParam     : setParam,
            getParam     : getParam


        }

        _addScriptAPI();

        return self;


    })();

    /**
    .d8888.  .d88b.  d8888b. d888888b d888888b d88888b
    88'  YP .8P  Y8. 88  `8D `~~88~~'   `88'   88'
    `8bo.   88    88 88oobY'    88       88    88ooooo
      `Y8b. 88    88 88`8b      88       88    88~~~~~
    db   8D `8b  d8' 88 `88.    88      .88.   88.
    `8888Y'  `Y88P'  88   YD    YP    Y888888P Y88888P
    **/

    _global.Youtube = Youtube;
    _global.onYouTubeIframeAPIReady = Youtube.apiLoad;

})( window);