
		 class Car {
      constructor(name, start_position){
         this.name = name;
         this.position = start_position;
         this.max_speed = 0.4;
         this.max_back_speed = 0.1;
      }
     
      isRotatingLeft	 = false;
      isRotatingRight	 = false;           
      isAccelerating	 = false;
      isBraking			   = false;
      wheelsAngle 		 = 0;
	  // wheel spinning angle
	  rotationAngle		= 0.0;
      speed				     = 0;
      angle				     = Math.PI;
      direction  		   = [0.0,0.0,0.0];
      position			   = [0.0,0.0,0.0];
      control_keys		 = [];
      frame            = glMatrix.mat4.create();
      lastAnimationTime = -1.0;
       
      update_step 		 = function( currTime ){
        if(this.lastAnimationTime === -1){
          this.lastAnimationTime = currTime;
          return;
        }
			const deltaV = (currTime-this.lastAnimationTime);
      this.lastAnimationTime = currTime; 
      this.isRotatingLeft  = this.control_keys['a'];
      this.isRotatingRight = this.control_keys['d'];
      this.isAccelerating  = this.control_keys['w'];
      this.isBraking 			 = this.control_keys['s'];
            
     if (this.isRotatingLeft){
          this.wheelsAngle += .004;
        if( this.wheelsAngle > 0.3)   
           this.wheelsAngle = .3;
       }
       else
     if (this.isRotatingRight){
          this.wheelsAngle -= .004;
          if( this.wheelsAngle < -0.3)   
           this.wheelsAngle  = -.3;
       }       
       else 
      this.wheelsAngle*= 1.0/(1.0+0.5*Math.abs(this.speed));
       
      if(this.isAccelerating && this.speed < 0  || this.isBraking && this.speed > 0 )
        this.speed *= 0.88;
        
      if (!this.isAccelerating && !this.isBraking ) 
        this.speed *= 0.98;
          
      if(this.isAccelerating) 	 	
          this.speed +=deltaV;
        
      if(this.isBraking) 	 	
          this.speed -=deltaV;

      if(this.speed>this.max_speed)
        this.speed  = this.max_speed;

      if(this.speed < -this.max_back_speed)
       this.speed = -this.max_back_speed;
        
			this.angle += this.wheelsAngle * 0.5 *this.speed;

      let sinC = Math.sin(this.angle);
			let cosC = Math.cos(this.angle);
			
			
      this.direction = [cosC,0, -sinC];
      
      this.position[0] = this.position[0] + this.direction[0]*this.speed;
      this.position[2] = this.position[2] + this.direction[2]*this.speed;
      
      this.isAccelerating 	= false;
      this.isRotatingLeft   = false;
      this.isRotatingRight  = false;
      this.isBraking   			= false;

	  this.rotationAngle -= this.speed * 0.20;
      var o =  this.position; 
      var y_axis = [0,1,0];  
      var z_axis =   [-this.direction[0],-this.direction[1],-this.direction[2]];
      var x_axis = glMatrix.vec3.create();
      glMatrix.vec3.cross(x_axis,y_axis,z_axis);
      
      glMatrix.mat4.set(this.frame,
                        x_axis[0],x_axis[1],x_axis[2],0.0,
                        y_axis[0],y_axis[1],y_axis[2],0.0,
                        z_axis[0],z_axis[1],z_axis[2],0.0,
                        o[0],o[1],o[2],1.0
                        )
      }       

       key_down(key){
         
       }
		};		

Game = {
  cars : [],
  addCar: function (name){
    newCar = new Car(name,Game.scene.startPosition);
    Game.cars.push(newCar);
    if(Game.cars.length===1)
      window.requestAnimationFrame(Game.update_step) ;
    return newCar;
  },
  update_step : function(currTime){
    for(i=0; i < Game.cars.length;++i)
      Game.cars[i].update_step.call(Game.cars[i],currTime);
  window.requestAnimationFrame(Game.update_step) ;

  },
  setScene(scene){
    Game.scene = new Parser.Race(scene)

    Game.scene.trackObj = new TrackMaker(Game.scene.track);
	  var bbox = scene.bbox;
  	var quad = [bbox[0], bbox[1] - 0.01, bbox[2],
  		bbox[3], bbox[1] - 0.01, bbox[2],
  		bbox[3], bbox[1] - 0.01, bbox[5],
  		bbox[0], bbox[1] - 0.01, bbox[5]
  	];

	  Game.scene.groundObj = new Quadrilateral(quad);

	  Game.scene.buildingsObj  = new Array(Game.scene.buildings.length);
  	for (var i = 0; i < Game.scene.buildings.length; ++i) 
	  	Game.scene.buildingsObj[i] = new BuildingMaker(Game.scene.buildings[i]);
  }
};

var Parser = Parser || { };
  
 Parser.Tunnel = function (obj) {
	this._parse(obj);
};

 Parser.Tunnel.prototype = {
	_reset : function () {
		this._height = null;
		this._leftCurb      = null;
		this._rightCurb     = null;
	},

	_parse : function (obj) {
		this._reset();
		this._height      = obj.height;
		this._leftCurb      = obj.leftCurb.slice();
		this._rightCurb     = obj.rightCurb.slice();
	},

	get pointsCount() {
		return this._leftCurb.length / 3;
	},
	
	get height(){
		return this._height;
	},

	leftSideAt : function (index) {
		var idx = index * 3;
		return this._leftCurb.slice(idx, idx + 3);
	},

	rightSideAt : function (index) {
		var idx = index * 3;
		return this._rightCurb.slice(idx, idx + 3);
	},
};


Parser.Track = function (obj) {
	this._parse(obj);
};

Parser.Track.prototype = {
	_reset : function () {
		this._leftCurb      = null;
		this._rightCurb     = null;
	},

	_parse : function (obj) {
		this._reset();

		this._leftCurb      = obj.leftCurb.slice();
		this._rightCurb     = obj.rightCurb.slice();
	},

	get pointsCount() {
		return this._leftCurb.length / 3;
	},

	leftSideAt : function (index) {
		var idx = index * 3;
		return this._leftCurb.slice(idx, idx + 3);
	},

	rightSideAt : function (index) {
		var idx = index * 3;
		return this._rightCurb.slice(idx, idx + 3);
	},
};

 Parser.AreaLigth = function (obj) {
	this._parse(obj);
};

 Parser.AreaLigth.prototype = {
	_reset : function () {
		this._frame = [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,  0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ],
		this._size = [1,1],
		this._color = [0.8,0.8,0.8]
	},

	_parse : function (obj) {
		this._reset();

		this._frame = obj.frame;
		this._size   = obj.size;
		this._color   = obj.color;
	},

	get frame() {
		return this._frame;
	},

	get size() {
		return this._size;
	},

	get color() {
		return this._color;
	}
	
};
 Parser.Lamp = function (obj) {
	this._parse(obj);
};

 Parser.Lamp.prototype = {
	_reset : function () {
		this._position = [ 0.0, 0.0, 0.0 ];
		this._height   = 0.0;
	},

	_parse : function (obj) {
		this._reset();

		this._position = obj.position.slice();
		this._height   = obj.height;
	},

	get position() {
		return this._position.slice();
	},

	get height() {
		return this._height;
	}
};

 Parser.Tree = function (obj) {
	this._parse(obj);
};

Parser.Tree.prototype = {
	_reset : function () {
		this._position = [ 0.0, 0.0, 0.0 ];
		this._height   = 0.0;
	},

	_parse : function (obj) {
		this._reset();

		this._position = obj.position.slice();
		this._height   = obj.height;
	},

	get position() {
		return this._position.slice();
	},

	get height() {
		return this._height;
	}
};

 Parser.Building = function (obj) {
	this._parse(obj);
};

 Parser.Building.prototype = {
	_reset : function () {
		this._outline = null;
	},

	_parse : function (obj) {
		this._reset();

		this._outline = obj.outline.slice();
	},

	get pointsCount() {
		return this._outline.length / 4;
	},

	positionAt : function (index) {
		var idx = index * 4;
		return this._outline.slice(idx, idx + 3);
	},

	heightAt : function (index) {
		var idx = index * 4;
		return this._outline[idx + 3];
	}
};

 Parser.Weather = function (obj) {
	this._parse(obj);
};

 Parser.Weather.prototype = {
	_reset : function () {
		this._sunDir       = null
		this._cloudDensity = 0;
		this._rainStrength = 0;
	},

	_parse : function (obj) {
		this._reset();

		this._sunDir       = obj.sunLightDirection.slice();
		this._cloudDensity = obj.cloudDensity;
		this._rainStrength = obj.rainStrength;
	},

	get sunLightDirection() {
		return this._sunDir.slice();
	},

	get cloudDenstity() {
		return this._cloudDenstity;
	},

	get rainStrength() {
		return this._rainStrength;
	}
};

 Parser.Race = function (obj) {
	this._parse(obj);
};

 Parser.Race.prototype = {
	_reset : function () {
		this._startPosition = null;
		this._observerPosition = null;
		this._photoPosition = null;

		this._bbox 	= null;
		this._track     = null;
		this._tunnels     = null;
		this._arealigths     = null;
		this._lamps     = null;
		this._trees     = null;
		this._buildings = null;
		this._weather   = null;
	},
	_parseStartPosition:function (obj){
		if(!obj) return;
		this._startPosition =  obj;
	},
	_parsePhotoPosition:function (obj){
		if(!obj) return;
		this._photoPosition =  obj;
	},
	_parseObserverPosition:function (obj){
		if(!obj) return;
		this._observerPosition =  obj;
	},
	_parseBBox : function (obj) {
		if(!obj) return;
		this._bbox = [obj[0],obj[1],obj[2],obj[3],obj[4],obj[5]];
	},

	_parseTrack : function (obj) {
		this._track = new  Parser.Track(obj);
	},

	_parseTunnels : function (obj) {
		if (!obj) return;
		this._tunnels = new Array(obj.length);
		for (var i=0, n=this._tunnels.length; i<n; ++i) {
			this._tunnels[i] = new  Parser.Tunnel(obj[i]);
		}
	},

	_parseAreaLigths : function (obj) {
		if (!obj) return;
		this._arealigths = new Array(obj.length);
		for (var i=0, n=this._arealigths.length; i<n; ++i) {
			this._arealigths[i] = new  Parser.AreaLigth(obj[i]);
		}
	},

	_parseLamps : function (obj) {
		if (!obj) return;
		this._lamps = new Array(obj.length);
		for (var i=0, n=this._lamps.length; i<n; ++i) {
			this._lamps[i] = new  Parser.Lamp(obj[i]);
		}
	},

	_parseTrees : function (obj) {
		if (!obj) return;
		this._trees = new Array(obj.length);
		for (var i=0, n=this._trees.length; i<n; ++i) {
			this._trees[i] = new  Parser.Tree(obj[i]);
		}
	},

	_parseBuildings : function (obj) {
		if (!obj) return;
		this._buildings = new Array(obj.length);
		for (var i=0, n=this._buildings.length; i<n; ++i) {
			this._buildings[i] = new Parser. Building(obj[i]);
		}
	},

	_parseWeather : function (obj) {
		this._weather = new  Parser.Weather(obj);
	},

	_parse : function (obj) {
		this._reset();

		this._parseStartPosition  (obj.startPosition);
		this._parsePhotoPosition   (obj.photoPosition);
		this._parseObserverPosition   (obj.observerPosition);
		this._parseBBox     (obj.bbox);
		this._parseTrack     (obj.track);
		this._parseTunnels     (obj.tunnels);
		this._parseAreaLigths     (obj.arealigths);
		this._parseLamps     (obj.lamps);
		this._parseTrees     (obj.trees);
		this._parseBuildings (obj.buildings);
		this._parseWeather   (obj.weather);
	},

	get startPosition(){
		return this._startPosition;
	},
	get photoPosition(){
		return this._photoPosition;
	},
	get observerPosition(){
		return this._observerPosition;
	},
	get bbox(){
		return this._bbox;
	},
	get track() {
		return this._track;
	},

	get tunnels() {
		return this._tunnels;
	},

	get arealigths() {
		return this._arealigths;
	},

	get lamps() {
		return this._lamps;
	},

	get trees() {
		return this._trees;
	},

	get buildings() {
		return this._buildings;
	},

	get weather() {
		return this._weather;
	}
  };

