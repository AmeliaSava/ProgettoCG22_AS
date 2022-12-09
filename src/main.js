/*car_position
the FollowFromUpCamera always look at the car from a position abova right over the car
*/
FollowFromUpCamera = function(){

    /* the only data it needs is the position of the camera */
    this.frame = glMatrix.mat4.create();
    
    /* update the camera with the current car position */
    this.update = function(car_position){
      this.frame = car_position;
    }
  
    /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
    this.matrix = function(){
      let eye = glMatrix.vec3.create();
      let target = glMatrix.vec3.create();
      let up = glMatrix.vec4.create();
      
      glMatrix.vec3.transformMat4(eye, [0,20,0], this.frame);
      glMatrix.vec3.transformMat4(target, [0.0,0.0,0.0,1.0], this.frame);
      glMatrix.vec4.transformMat4(up, [0.0,0.0,-1,0.0], this.frame);
      
      return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye,target,up.slice(0,3));	
    }
}

ChaseCamera = function(){

  /* the only data it needs is the position of the camera */
  this.frame = glMatrix.mat4.create();
  
  /* update the camera with the current car position */
  this.update = function(car_position){
    this.frame = car_position;
  }

  /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
  this.matrix = function(){
    let eye = glMatrix.vec3.create();
    let target = glMatrix.vec3.create();
    let up = glMatrix.vec4.create();
    
    glMatrix.vec3.transformMat4(eye, [0,10,25], this.frame);
    glMatrix.vec3.transformMat4(target, [0.0,0.0,0.0,1.0], this.frame);
    glMatrix.vec4.transformMat4(up, [0.0,0.0,-1,0.0], this.frame);
    
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye,target,up.slice(0,3));	
  }
}

UserCamera = function(){

  /* the only data it needs is the position of the camera */
  this.frame = glMatrix.mat4.create();
  
  /* update the camera with the current car position */
  this.update = function(car_position){
    this.frame = car_position;
  }

  /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
  this.matrix = function(){
    let eye = glMatrix.vec3.create();
    let target = glMatrix.vec3.create();
    let up = glMatrix.vec4.create();
    
    glMatrix.vec3.transformMat4(eye, [5,10,10], this.frame);
    glMatrix.vec3.transformMat4(target, [0.0,0.0,0.0,1.0], this.frame);
    glMatrix.vec4.transformMat4(up, [0.0,0.0,-1,0.0], this.frame);
    
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye,target,up.slice(0,3));	
  }
}

/* the main object to be implementd */
var Renderer = new Object();

/* array of cameras that will be used */
Renderer.cameras = [];
// add all the cameras
Renderer.cameras.push(new FollowFromUpCamera());
Renderer.cameras.push(new ChaseCamera());
Renderer.cameras.push(new UserCamera());
// set the camera currently in use
Renderer.currentCamera = 0;

/*
create the buffers for an object as specified in common/shapes/triangle.js
*/
Renderer.createObjectBuffers = function (gl, obj) {

  obj.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  obj.indexBufferTriangles = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // create edges
  var edges = new Uint16Array(obj.numTriangles * 3 * 2);
  for (var i = 0; i < obj.numTriangles; ++i) {
    edges[i * 6 + 0] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 1] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 2] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 3] = obj.triangleIndices[i * 3 + 2];
    edges[i * 6 + 4] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 5] = obj.triangleIndices[i * 3 + 2];
  }

  obj.indexBufferEdges = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

/*
draw an object as specified in common/shapes/triangle.js for which the buffer 
have alrady been created
*/
Renderer.drawObject = function (gl, obj, fillColor, lineColor) {

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.enableVertexAttribArray(this.uniformShader.aPositionIndex);
  gl.vertexAttribPointer(this.uniformShader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.uniform4fv(this.uniformShader.uColorLocation, fillColor);
  gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

  gl.disable(gl.POLYGON_OFFSET_FILL);
  
  gl.uniform4fv(this.uniformShader.uColorLocation, lineColor);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
  gl.drawElements(gl.LINES, obj.numTriangles * 3 * 2, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(this.uniformShader.aPositionIndex);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

/*
initialize the object in the scene
*/
Renderer.initializeObjects = function (gl) {
  Game.setScene(scene_0);
  this.car = Game.addCar("cubecar");

  Renderer.triangle = new Triangle();
  Renderer.createObjectBuffers(gl, this.triangle);

  Renderer.cube = new Cube();
  Renderer.createObjectBuffers(gl, this.cube);

  Renderer.cylinder = new Cylinder(10);
  Renderer.createObjectBuffers(gl, this.cylinder);
  
  Renderer.createObjectBuffers(gl,Game.scene.trackObj);
  Renderer.createObjectBuffers(gl,Game.scene.groundObj);
  for (var i = 0; i < Game.scene.buildings.length; ++i) 
	  	Renderer.createObjectBuffers(gl,Game.scene.buildingsObj[i]);
};

/*
draw the car
*/
Renderer.drawCar = function (gl) {
  
  // matrix for transformations
  translate_matrix = glMatrix.mat4.create();
  rotate_matrix = glMatrix.mat4.create();
  scale_matrix = glMatrix.mat4.create();
  
  // drawing the body of the car
  cube_mat = glMatrix.mat4.create();
  
  glMatrix.mat4.fromTranslation(translate_matrix, [0,3,-0.3]);
  glMatrix.mat4.fromScaling(scale_matrix, [1,1,2]);
  glMatrix.mat4.mul(cube_mat, translate_matrix, scale_matrix);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cube, [0.9, 0, 0.1, 1], [0, 1, 0, 1]);
  Renderer.stack.pop();

  pipe_mat = glMatrix.mat4.create();
  
  glMatrix.mat4.fromRotation(rotate_matrix,0.4,[0,1,0]);
  glMatrix.mat4.fromTranslation(translate_matrix, [0.7,4,6]);
  glMatrix.mat4.fromScaling(scale_matrix, [0.2,1,0.2]);
  glMatrix.mat4.mul(pipe_mat, rotate_matrix, translate_matrix);
  glMatrix.mat4.mul(pipe_mat, scale_matrix, pipe_mat);

  glMatrix.mat4.identity(cube_mat);
        
  glMatrix.mat4.fromTranslation(translate_matrix,[-1,0.2,-2.8]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,pipe_mat);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0,0.2,0.5,1], [0, 1, 0, 1]);
  Renderer.stack.pop();

  cabin_mat = glMatrix.mat4.create();
  
  glMatrix.mat4.fromRotation(rotate_matrix,0.1,[1,0,0]);
  glMatrix.mat4.fromTranslation(translate_matrix, [1.4,5.7,3]);
  glMatrix.mat4.fromScaling(scale_matrix, [0.7,0.7,0.7]);
  glMatrix.mat4.mul(cabin_mat, rotate_matrix, translate_matrix);
  glMatrix.mat4.mul(cabin_mat, scale_matrix, cabin_mat);

  glMatrix.mat4.identity(cube_mat);
        
  glMatrix.mat4.fromTranslation(translate_matrix,[-1,0.2,-2.8]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,cabin_mat);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cube, [0.2,0.9,1, 1], [0, 1, 0, 1]);
  Renderer.stack.pop();

  // wheels
  wheel_mat = glMatrix.mat4.create();
  wheel_speed = 0;
  glMatrix.mat4.fromRotation(rotate_matrix,3.14/2.0,[0,0,1]);
  glMatrix.mat4.fromScaling(scale_matrix, [1,1,1]);
  glMatrix.mat4.mul(wheel_mat, rotate_matrix, scale_matrix);

  glMatrix.mat4.identity(cube_mat);

  // rotate the wheels according to speed
  glMatrix.mat4.fromRotation(rotate_matrix, Renderer.car.rotationAngle,[1,0,0]);
  glMatrix.mat4.mul(wheel_mat, rotate_matrix, wheel_mat);

  // saving changes so the back wheels won't turn
  wheel_mat2 = glMatrix.mat4.clone(wheel_mat);

  // front wheels
  // rotate according to wheel angles
  glMatrix.mat4.fromRotation(rotate_matrix,Renderer.car.wheelsAngle * 0.6,[0,1,0]);
  glMatrix.mat4.mul(wheel_mat, rotate_matrix, wheel_mat);

  // attach wheels to the car
  glMatrix.mat4.fromTranslation(translate_matrix,[-0.8,1.6,-2.1]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0.1, 0, 0, 1], [0, 1, 0, 1]);
  Renderer.stack.pop();

  glMatrix.mat4.fromTranslation(translate_matrix,[2.8,1.6,-2.1]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat);

  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0.1, 0, 0, 1], [0, 1, 0, 1]);
  Renderer.stack.pop(); 

  // back wheels
  // making back wheels bigger
  glMatrix.mat4.fromScaling(scale_matrix,[1,1.8,2]);
  glMatrix.mat4.mul(wheel_mat2,scale_matrix,wheel_mat2);

  glMatrix.mat4.fromTranslation(translate_matrix,[-1,1.6,1.5]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat2);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0.1, 0, 0, 1], [0, 1, 0, 1]);
  Renderer.stack.pop();

  glMatrix.mat4.fromTranslation(translate_matrix,[3,1.6,1.5]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat2);

  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, this.stack.matrix);
  this.drawObject(gl, this.cylinder, [0.1, 0, 0, 1], [0, 1, 0, 1]);
  Renderer.stack.pop();
};


Renderer.drawScene = function (gl) {

  var width = this.canvas.width;
  var height = this.canvas.height
  var ratio = width / height;
  this.stack = new MatrixStack();

  gl.viewport(0, 0, width, height);
  
  gl.enable(gl.DEPTH_TEST);

  // Clear the framebuffer
  gl.clearColor(0.34, 0.5, 0.74, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(this.uniformShader);
  
  gl.uniformMatrix4fv(this.uniformShader.uProjectionMatrixLocation, false,glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14 / 4, ratio, 1, 500));

  Renderer.cameras[Renderer.currentCamera].update(this.car.frame);
  var invV = Renderer.cameras[Renderer.currentCamera].matrix();
  
  // initialize the stack with the identity
  this.stack.loadIdentity();
  // multiply by the view matrix
  this.stack.multiply(invV);

  // drawing the car
  this.stack.push();
  // projection * viewport
  this.stack.multiply(this.car.frame);
  this.drawCar(gl);
  this.stack.pop();

  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, this.stack.matrix);

  // drawing the static elements (ground, track and buldings)
	this.drawObject(gl, Game.scene.groundObj, [0.3, 0.7, 0.2, 1.0], [0, 0, 0, 1.0]);
 	this.drawObject(gl, Game.scene.trackObj, [0.9, 0.8, 0.7, 1.0], [0, 0, 0, 1.0]);
	for (var i in Game.scene.buildingsObj) 
		this.drawObject(gl, Game.scene.buildingsObj[i], [0.8, 0.8, 0.8, 1.0], [0.2, 0.2, 0.2, 1.0]);
	gl.useProgram(null);
};



Renderer.Display = function () {
  Renderer.drawScene(Renderer.gl);
  window.requestAnimationFrame(Renderer.Display) ;
};


Renderer.setupAndStart = function () {
 /* create the canvas */
	Renderer.canvas = document.getElementById("OUTPUT-CANVAS");
  
 /* get the webgl context */
	Renderer.gl = Renderer.canvas.getContext("webgl");

  /* read the webgl version and log */
	var gl_version = Renderer.gl.getParameter(Renderer.gl.VERSION); 
	log("glversion: " + gl_version);
	var GLSL_version = Renderer.gl.getParameter(Renderer.gl.SHADING_LANGUAGE_VERSION)
	log("glsl  version: "+GLSL_version);

  /* create the matrix stack */
	Renderer.stack = new MatrixStack();

  /* initialize objects to be rendered */
  Renderer.initializeObjects(Renderer.gl);

  /* create the shader */
  Renderer.uniformShader = new uniformShader(Renderer.gl);

  /*
  add listeners for the mouse / keyboard events
  */
  Renderer.canvas.addEventListener('mousemove',on_mouseMove,false);
  Renderer.canvas.addEventListener('click', on_mouseClick,false);
  Renderer.canvas.addEventListener('keydown',on_keydown,false);
  Renderer.canvas.addEventListener('keyup',on_keyup,false);

  Renderer.Display();
}

on_mouseMove = function(e){}

on_mouseClick = function(e){
  if(Renderer.currentCamera != 2) Renderer.currentCamera ++;
  else Renderer.currentCamera = 0;
}

on_keyup = function(e){
	Renderer.car.control_keys[e.key] = false;
}
on_keydown = function(e){
	Renderer.car.control_keys[e.key] = true;
}

window.onload = Renderer.setupAndStart;



