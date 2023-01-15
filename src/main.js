/*
* The FollowFromUpCamera always look at the car from a position abova right over the car
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
      
      glMatrix.vec3.transformMat4(eye, [0,50,0], this.frame);
      glMatrix.vec3.transformMat4(target, [0.0,0,0.0,1.0], this.frame);
      glMatrix.vec4.transformMat4(up, [0.0,0.0,-1,0.0], this.frame);
      
      return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye,target,up);	
    }
}

/*
* The ChaseCamera follows the car from behind and slightly above
*/
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
    
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(),eye,target,up);	
  }
}

/*
* The UserCamera is a camera that can be controlled by the user using arrow keys and mouse
*/
UserCamera = function(){
  
  let translation = glMatrix.vec3.create();
  let rotationY = 0.0;
  let rotationX = 0.0;

  let mouseX = 0.0;
  let mouseY = 0.0;
  let mouseDown = false;

  let rotate_camera = glMatrix.mat4.create();
  
  /* update the camera */
  this.update = function(car_position){
    let x_axis = glMatrix.vec4.fromValues(1,0,0,0);
    let y_axis = glMatrix.vec4.fromValues(0,1,0,0);
    let z_axis = glMatrix.vec4.fromValues(0,0,1,0);

    glMatrix.mat4.multiply(x_axis, rotate_camera, x_axis);
    glMatrix.vec3.normalize(x_axis, x_axis);

    glMatrix.mat4.multiply(y_axis, rotate_camera, y_axis);
    glMatrix.vec3.normalize(y_axis, y_axis);

    glMatrix.mat4.multiply(z_axis, rotate_camera, z_axis);
    glMatrix.vec3.normalize(z_axis, z_axis);

    let move_z = glMatrix.vec3.create();
    glMatrix.vec3.scale(move_z, z_axis.slice(0,3), 0.3);

    let move_x = glMatrix.vec3.create();
    glMatrix.vec3.scale(move_x, x_axis.slice(0,3), 0.2);

    if(Renderer.car.control_keys["ArrowUp"])
      glMatrix.vec3.subtract(translation, translation, move_z);
    if(Renderer.car.control_keys["ArrowDown"])
      glMatrix.vec3.add(translation, translation, move_z);
    if(Renderer.car.control_keys["ArrowLeft"])
      glMatrix.vec3.subtract(translation, translation, move_x);
    if(Renderer.car.control_keys["ArrowRight"])
      glMatrix.vec3.add(translation, translation, move_x);  

    if(this.mouseDown == true) {
      rotationY -= (this.mouseX - 300) * 0.00001;
      rotationX -= (this.mouseY - 300) * 0.00001;
    }
  }
  
  /* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
  this.matrix = function() {
    let translate_camera = glMatrix.mat4.create();
    let move_camera = glMatrix.mat4.create();

    glMatrix.mat4.fromTranslation(translate_camera, translation);
    
    let x_rotate = glMatrix.mat4.create();
    glMatrix.mat4.fromRotation(x_rotate, rotationX, [1,0,0]);

    let y_rotate = glMatrix.mat4.create();
    glMatrix.mat4.fromRotation(y_rotate, rotationY, [0,1,0]);

    glMatrix.mat4.multiply(rotate_camera, y_rotate, x_rotate);
    glMatrix.mat4.multiply(move_camera, translate_camera, rotate_camera);

    let inverted = glMatrix.mat4.create();
    glMatrix.mat4.invert(inverted, move_camera);

    return inverted;	
  }
}

// the main object to be implementd
var Renderer = new Object();

// array of cameras that will be used
Renderer.cameras = [];
// add all the cameras
Renderer.cameras.push(new FollowFromUpCamera());
Renderer.cameras.push(new ChaseCamera());
Renderer.cameras.push(new UserCamera());
// set the camera currently in use
Renderer.currentCamera = 0;
// Number of pixels dedicated to the shadow map
Renderer.shadowMapSize = 2048;

/**
 * Create the buffers for an object as specified in common/shapes/triangle.js
 */
Renderer.createObjectBuffers = function (gl, obj) {

  obj.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  if(typeof obj.normals != 'undefined'){
    obj.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.normals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  // Textures
  if(typeof obj.texCoords != 'undefined'){
    obj.texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.texCoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  if(typeof obj.tangents != 'undefined'){
    obj.tangentsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.tangentsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, obj.tangents, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

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

/**
 * Creates a framebuffer for shadow mapping
 */
Renderer.createFramebuffer = function(gl, size) {
  Renderer.gl.activeTexture(Renderer.gl.TEXTURE6);
  var depthTexture = gl.createTexture();
	const depthTextureSize = size;
	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	gl.texImage2D(
	  gl.TEXTURE_2D,      // target
		0,                  // mip level
		gl.DEPTH_COMPONENT, // internal format
		depthTextureSize,   // width
		depthTextureSize,   // height
		0,                  // border
		gl.DEPTH_COMPONENT, // format
		gl.UNSIGNED_INT,    // type
		null);              // data
		
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
 
	var depthFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
	gl.framebufferTexture2D(
			gl.FRAMEBUFFER,       // target
			gl.DEPTH_ATTACHMENT,  // attachment point
			gl.TEXTURE_2D,        // texture target
			depthTexture,         // texture
			0);                   // mip level
    	
  // create a color texture of the same size as the depth texture
	var colorTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, colorTexture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			depthTextureSize,
			depthTextureSize,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null,
	);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
 
	// attach it to the framebuffer
	gl.framebufferTexture2D(
 	   gl.FRAMEBUFFER,        // target
 	   gl.COLOR_ATTACHMENT0,  // attachment point
 	   gl.TEXTURE_2D,         // texture target
 	   colorTexture,         // texture
 	   0);                    // mip level
    	
  gl.bindTexture(gl.TEXTURE_2D,null);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  depthFramebuffer.depthTexture = depthTexture;
  depthFramebuffer.colorTexture = colorTexture;
  depthFramebuffer.size = depthTextureSize;
    	
  return depthFramebuffer;
};

/**
 * draw an object as specified in common/shapes/triangle.js for which the buffer 
 * have alrady been created
 */
Renderer.drawObject = function (gl, shader, shadow_pass, obj, fillColor, normal_map) {

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.enableVertexAttribArray(shader.aPositionIndex);
  gl.vertexAttribPointer(shader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);
  
  if(!shadow_pass) {

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.enableVertexAttribArray(shader.aNormalIndex);
    gl.vertexAttribPointer(shader.aNormalIndex, 3, gl.FLOAT, false, 0, 0);

    if(typeof obj.texCoords != 'undefined'){
      gl.uniform1i(shader.uModeLocation, 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordsBuffer);	
      gl.enableVertexAttribArray(shader.aTexCoordsIndex);
      gl.vertexAttribPointer(shader.aTexCoordsIndex, 2, gl.FLOAT, false, 0, 0);
    } else {
      gl.uniform1i(shader.uModeLocation, 0);
      gl.disableVertexAttribArray(shader.aTexCoordsIndex);
    }
  }

  if( typeof obj.tangentsBuffer != 'undefined'){ 
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.tangentsBuffer);
    gl.enableVertexAttribArray(shader.aTangentsIndex);
    gl.vertexAttribPointer(shader.aTangentsIndex, 3, gl.FLOAT, false, 0, 0);
  }

  if(normal_map) gl.uniform1i(shader.uModeLocation,2);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  if(!shadow_pass) gl.uniform3fv(shader.uColorLocation, fillColor);
  gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(shader.aPositionIndex);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

/**
 * Fuction used to load textures
 */
Renderer.loadTexture = function (gl, tu, url, object){
  var image = new Image();
  image.src = url;
  image.addEventListener('load',function(){	
      gl.activeTexture(gl.TEXTURE0+tu);
      var texture = gl.createTexture();
      if( typeof object != 'undefined') object.texture = texture;
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);

      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      
  });
};

/*
 * initialize the object in the scene
 */
Renderer.initializeObjects = function (gl) {
  Game.setScene(scene_0);
  this.car = Game.addCar("cubecar");

  Renderer.triangle = new Triangle();
  ComputeNormals(Renderer.triangle);
  Renderer.createObjectBuffers(gl, this.triangle);

  Renderer.cube = new Cube();
  ComputeNormals(Renderer.cube);
  Renderer.createObjectBuffers(gl, this.cube);

  Renderer.cylinder = new Cylinder(10);
  ComputeNormals(Renderer.cylinder);
  Renderer.createObjectBuffers(gl, this.cylinder);
  
  ComputeNormals(Game.scene.trackObj);
  Renderer.createObjectBuffers(gl,Game.scene.trackObj);
  ComputeNormals(Game.scene.groundObj);
  Renderer.createObjectBuffers(gl,Game.scene.groundObj);

  for (var i = 0; i < Game.scene.buildings.length; ++i){ 
    ComputeNormals(Game.scene.buildingsObjTex[i]);
    Renderer.createObjectBuffers(gl,Game.scene.buildingsObjTex[i]);
    ComputeNormals(Game.scene.buildingsObjTex[i].roof);
    Renderer.createObjectBuffers(gl, Game.scene.buildingsObjTex[i].roof)
  }
  
  Renderer.loadTexture(gl,3,"../common/texture/street4.png", Game.scene.trackObj);
  Renderer.loadTexture(gl,3,"../common/texture/facade1.jpg", Game.scene.buildingsObjTex[0]);
  Renderer.loadTexture(gl,3,"../common/texture/facade3.jpg", Game.scene.buildingsObjTex[1]);
  Renderer.loadTexture(gl,3,"../common/texture/roof.jpg", Game.scene.buildingsObjTex[2]);
  Renderer.loadTexture(gl,3,"../common/texture/grass_tile.png", Game.scene.groundObj);
  Renderer.loadTexture(gl,4,"../common/texture/headlight.png");
  Renderer.loadTexture(gl,5,"../common/texture/asphalt_normal_map.jpg");
};

/**
 * Takes the direction of the light and returns the light matrix for shadow mapping
 */
Renderer.createLightMatrix = function (dir) {
  var light_matrix = glMatrix.mat4.create();
  var light_proj = glMatrix.mat4.create();
  
  glMatrix.mat4.lookAt(light_matrix, [0.0,0.0,0.0], [-dir[0],-dir[1],-dir[2]],[0,1,0]);
  glMatrix.mat4.ortho(light_proj, -110.0, 110.0, -120.0, 120.0, -100.0, 100.0);

  glMatrix.mat4.multiply(light_matrix, light_proj, light_matrix);
  return light_matrix;
};

/**
 * Draws the car model
 */
Renderer.drawCar = function (gl, shader, invV) {
  
  // matrix for transformations
  translate_matrix = glMatrix.mat4.create();
  rotate_matrix = glMatrix.mat4.create();
  scale_matrix = glMatrix.mat4.create();
  
  // drawing the body of the car
  cube_mat = glMatrix.mat4.create();
  
  glMatrix.mat4.fromTranslation(translate_matrix, [0,2,0]);
  glMatrix.mat4.fromScaling(scale_matrix, [1,1,2]);
  glMatrix.mat4.mul(cube_mat, translate_matrix, scale_matrix);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
  this.drawObject(gl, shader, false, this.cube, [0.9, 0, 0.1]);
  Renderer.stack.pop();

  pipe_mat = glMatrix.mat4.create();
  
  glMatrix.mat4.fromRotation(rotate_matrix,0.4,[0,1,0]);
  glMatrix.mat4.fromTranslation(translate_matrix, [0.7,2.5,6]);
  glMatrix.mat4.fromScaling(scale_matrix, [0.2,1,0.2]);
  glMatrix.mat4.mul(pipe_mat, rotate_matrix, translate_matrix);
  glMatrix.mat4.mul(pipe_mat, scale_matrix, pipe_mat);

  glMatrix.mat4.identity(cube_mat);
        
  glMatrix.mat4.fromTranslation(translate_matrix,[-1,0.2,-2.8]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,pipe_mat);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
  this.drawObject(gl, shader, false, this.cylinder, [0,0.5,0.9]);
  Renderer.stack.pop();

  cabin_mat = glMatrix.mat4.create();
  
  glMatrix.mat4.fromRotation(rotate_matrix,0.1,[1,0,0]);
  glMatrix.mat4.fromTranslation(translate_matrix, [1.4,4.7,4]);
  glMatrix.mat4.fromScaling(scale_matrix, [0.7,0.7,0.7]);
  glMatrix.mat4.mul(cabin_mat, rotate_matrix, translate_matrix);
  glMatrix.mat4.mul(cabin_mat, scale_matrix, cabin_mat);

  glMatrix.mat4.identity(cube_mat);
        
  glMatrix.mat4.fromTranslation(translate_matrix,[-1,0.2,-2.8]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,cabin_mat);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
  this.drawObject(gl, shader, false, this.cube, [0.1,0.9,1]);
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
  glMatrix.mat4.fromTranslation(translate_matrix,[-0.8,0.9,-2.1]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
  this.drawObject(gl, shader, false, this.cylinder, [0.3, 0.2, 0.2]);
  Renderer.stack.pop();

  glMatrix.mat4.fromTranslation(translate_matrix,[2.8,0.9,-2.1]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat);

  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
  this.drawObject(gl, shader, false, this.cylinder, [0.3, 0.2, 0.2]);
  Renderer.stack.pop(); 

  // back wheels
  // making back wheels bigger
  glMatrix.mat4.fromScaling(scale_matrix,[1,1.8,2]);
  glMatrix.mat4.mul(wheel_mat2,scale_matrix,wheel_mat2);

  glMatrix.mat4.fromTranslation(translate_matrix,[-1,1.6,1.5]);
  glMatrix.mat4.mul(cube_mat, translate_matrix,wheel_mat2);
  
  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
  this.drawObject(gl, shader, false,this.cylinder, [0.3, 0.2, 0.2]);
  Renderer.stack.pop();

  glMatrix.mat4.fromTranslation(translate_matrix,[3,1.6,1.5]);
  glMatrix.mat4.mul(cube_mat,translate_matrix,wheel_mat2);

  Renderer.stack.push();
  Renderer.stack.multiply(cube_mat);
  Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
  this.drawObject(gl, shader, false, this.cylinder, [0.3, 0.2, 0.2]);
  Renderer.stack.pop();

};

/**
 * Updates the model matrix in the shader and creates the inverse transpose to pass 
 * as the normal matrix
 */
Renderer.updateModelNormalMatrix = function (gl, ModelMatrix, ViewMatrix) {
  gl.uniformMatrix4fv(Renderer.uniformShader.uModelMatrixLocation, false, ModelMatrix);
  let normalMatrix = glMatrix.mat4.create();
  glMatrix.mat4.multiply(normalMatrix, ViewMatrix, ModelMatrix);
  glMatrix.mat4.invert(normalMatrix, normalMatrix);
  glMatrix.mat4.transpose(normalMatrix, normalMatrix);
  gl.uniformMatrix4fv(Renderer.uniformShader.uNormalMatrixLocation, false, normalMatrix);
}

Renderer.drawScene = function (gl, shader, shadow_pass, HL) {

  var width = this.canvas.width;
  var height = this.canvas.height
  var ratio = width / height;
  this.stack = new MatrixStack();

  Renderer.gl.useProgram(shader);

  if(!shadow_pass) gl.viewport(0, 0, width, height);
  
  gl.enable(gl.DEPTH_TEST);

  // Clear the framebuffer
  gl.clearColor(0.34, 0.5, 0.74, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create the light matrix for the depth shader
  dirlight_mat = Renderer.createLightMatrix(Game.scene.weather.sunLightDirection);
  if(HL == 0) gl.uniformMatrix4fv(shader.uLightMatrixLocation, false, dirlight_mat);

  Renderer.cameras[Renderer.currentCamera].update(this.car.frame);
  var invV = Renderer.cameras[Renderer.currentCamera].matrix();
  
  if(!shadow_pass) {
    gl.uniformMatrix4fv(shader.uProjectionMatrixLocation, false,glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14 / 4, ratio, 1, 500));
    gl.uniform3fv(shader.uLightDirectionLocation, Game.scene.weather.sunLightDirection);
    gl.uniformMatrix4fv(shader.uViewMatrixLocation, false, invV);
  }

  //headlights
  // position of the headlights
  gl.uniform1i(shader.uSamplerHLLocation,4);
  let hl_left_eye = glMatrix.vec4.create();
  let hl_right_eye = glMatrix.vec4.create();
  glMatrix.mat4.multiply(hl_left_eye, Renderer.car.frame, [-0.2,2.4,1.7,1]);
  glMatrix.mat4.multiply(hl_right_eye, Renderer.car.frame, [0.2,2.4,1.7,1]);
  // direction of the headlights
  let hl_left_target = glMatrix.vec4.create();
  let hl_right_target = glMatrix.vec4.create();
  glMatrix.mat4.multiply(hl_left_target, Renderer.car.frame, [-0.8,1,-4,1]);
  glMatrix.mat4.multiply(hl_right_target, Renderer.car.frame, [0.8,1,-4,1]);

  let hl_left = glMatrix.mat4.lookAt(glMatrix.mat4.create(), hl_left_eye, hl_left_target, [0,1,0]);
  let hl_right = glMatrix.mat4.lookAt(glMatrix.mat4.create(), hl_right_eye, hl_right_target, [0,1,0]);

  let hl_projection = glMatrix.mat4.perspective(glMatrix.mat4.create(), 0.4, 1, 5.4, 100);
  if(!shadow_pass) {
    gl.uniformMatrix4fv(shader.uHeadLightLeftViewLocation, false, hl_left);
    gl.uniformMatrix4fv(shader.uHeadLightRightViewLocation, false, hl_right);
    gl.uniformMatrix4fv(shader.uHeadLightProjectionLocation, false, hl_projection);
  } else {
    if(HL > 0) {
      let hl_lightmat = glMatrix.mat4.create();
      if(HL == 1) glMatrix.mat4.multiply(hl_lightmat, hl_projection, hl_left);
        else glMatrix.mat4.multiply(hl_lightmat, hl_projection, hl_right);
      gl.uniformMatrix4fv(shader.uLightMatrixLocation, false, hl_lightmat);
    }
  }

  if(!shadow_pass || HL > 0) {
    // drawing lamps
    let lamp_mat = glMatrix.mat4.create();
    let light_mat = glMatrix.mat4.create();
    
    let lamps = [];

    for (var i = 0; i < Game.scene.lamps.length; ++i) {
      glMatrix.mat4.identity(lamp_mat);
      Renderer.stack.push();
      Renderer.stack.multiply(glMatrix.mat4.fromTranslation(lamp_mat,Game.scene.lamps[i].position));
      Renderer.stack.multiply(glMatrix.mat4.fromScaling(lamp_mat, [0.2, 4, 0.2]));
      if(HL > 0) gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, this.stack.matrix);
        else Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
      this.drawObject(gl, shader, shadow_pass, this.cylinder, [0.5, 0.5, 0.5]);
      Renderer.stack.pop();
      let lamp_pos = glMatrix.vec3.create();
      glMatrix.vec3.add(lamp_pos, Game.scene.lamps[i].position, [0.0, 7.0, 0.0]);
      glMatrix.mat4.identity(light_mat);
      Renderer.stack.push();
      Renderer.stack.multiply(glMatrix.mat4.fromTranslation(light_mat, lamp_pos));
      Renderer.stack.multiply(glMatrix.mat4.fromScaling(light_mat, [0.6, 0.3, 0.5]));
      if(HL > 0) gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, this.stack.matrix);
        else Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
      this.drawObject(gl, shader, shadow_pass, this.cylinder, [0.1, 0.9, 0.7]);
      Renderer.stack.pop();
      for(var j = 0; j < 3; ++j)
      if(j == 1) lamps.splice((i*3)+j, 0, lamp_pos[j]+2.0);
        else lamps.splice((i*3)+j, 0, lamp_pos[j]);
    }

    for (var i = 0; i < 12; ++i) {
      if(!shadow_pass) gl.uniform3fv(shader.uLampPositionsLocation, lamps);
    }
  }

  // initialize the stack with the identity
  this.stack.loadIdentity();

  this.stack.push();
  if(!shadow_pass) {
    this.stack.multiply(this.car.frame);
    this.drawCar(gl, shader, invV);
    this.stack.pop();
  }

  if(shadow_pass) gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, this.stack.matrix);
    else Renderer.updateModelNormalMatrix(gl, this.stack.matrix, invV);
  // drawing the static elements (ground, track and buldings)
  if(!shadow_pass){
    gl.activeTexture(gl.TEXTURE3);
    gl.uniform1i(shader.uSamplerLocation,3);
    gl.bindTexture(gl.TEXTURE_2D, Game.scene.groundObj.texture);
  } 
	this.drawObject(gl, shader, shadow_pass, Game.scene.groundObj, [0.3, 0.7, 0.2]);

  if(!shadow_pass) {
    gl.bindTexture(gl.TEXTURE_2D,  Game.scene.trackObj.texture);
    gl.uniform1i(shader.uNormalSamplerLocation,5);
  }
 	this.drawObject(gl, shader, shadow_pass, Game.scene.trackObj, [0.9, 0.8, 0.7], true);
  
	for (var i in Game.scene.buildingsObj) {
    if(!shadow_pass) {
      if(i%2 == 0) {
        gl.bindTexture(gl.TEXTURE_2D,  Game.scene.buildingsObjTex[0].texture);
      }
      else {
        gl.bindTexture(gl.TEXTURE_2D,  Game.scene.buildingsObjTex[1].texture);
      }
    }
    this.drawObject(gl, shader, shadow_pass, Game.scene.buildingsObjTex[i], [0.8, 0.8, 0.8]);
  }
		
  if(!shadow_pass) {
    gl.bindTexture(gl.TEXTURE_2D,  Game.scene.buildingsObjTex[2].texture);
  }
  for (var i in Game.scene.buildingsObj) 
    this.drawObject(gl, shader, shadow_pass, Game.scene.buildingsObjTex[i].roof, [0.9, 0.8, 0.7]);
 
  gl.useProgram(null);
};

Renderer.Display = function () {
  
  Renderer.gl.viewport(0,0, Renderer.shadowMapSize, Renderer.shadowMapSize);
  Renderer.gl.clearDepth(1.0);

  // shadow pass
  Renderer.gl.bindFramebuffer(Renderer.gl.FRAMEBUFFER, Renderer.framebuffer);
  Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT|Renderer.gl.DEPTH_BUFFER_BIT);

  Renderer.drawScene(Renderer.gl, Renderer.depthShader, true, 0);
   
  // shadow pass left headlight
  Renderer.gl.bindFramebuffer(Renderer.gl.FRAMEBUFFER, Renderer.framebuffer_HLL);
  Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT|Renderer.gl.DEPTH_BUFFER_BIT);
  
  Renderer.drawScene(Renderer.gl, Renderer.depthShader, true, 1);
  
  // shadow pass right headlight
  Renderer.gl.bindFramebuffer(Renderer.gl.FRAMEBUFFER, Renderer.framebuffer_HLR);
  Renderer.gl.clear(Renderer.gl.COLOR_BUFFER_BIT|Renderer.gl.DEPTH_BUFFER_BIT);
  
  Renderer.drawScene(Renderer.gl, Renderer.depthShader, true, 2);
  Renderer.gl.bindFramebuffer(Renderer.gl.FRAMEBUFFER, null);

  // light pass  
  Renderer.drawScene(Renderer.gl, Renderer.uniformShader, false, 0);
  window.requestAnimationFrame(Renderer.Display) ;
};

Renderer.setupAndStart = function () {
 /* create the canvas */
	Renderer.canvas = document.getElementById("OUTPUT-CANVAS");
  
 /* get the webgl context */
	Renderer.gl = Renderer.canvas.getContext("webgl");

  Renderer.gl.getExtension('OES_standard_derivatives');
  Renderer.gl.getExtension('WEBGL_depth_texture');

  /* read the webgl version and log */
	var gl_version = Renderer.gl.getParameter(Renderer.gl.VERSION); 
	log("glversion: " + gl_version);
	var GLSL_version = Renderer.gl.getParameter(Renderer.gl.SHADING_LANGUAGE_VERSION)
	log("glsl  version: "+GLSL_version);

  /* create the matrix stack */
	Renderer.stack = new MatrixStack();

  /* initialize objects to be rendered */
  Renderer.initializeObjects(Renderer.gl);

  /* create the shaders */
  Renderer.uniformShader = new uniformShader(Renderer.gl);
  Renderer.depthShader = new depthShader(Renderer.gl);
  Renderer.gl.useProgram(Renderer.uniformShader);

  Renderer.gl.uniform1f(Renderer.uniformShader.uShadowMapSizeLocation, Renderer.shadowMapSize);
  
  Renderer.framebuffer = Renderer.createFramebuffer(Renderer.gl, Renderer.shadowMapSize);
  Renderer.gl.activeTexture(Renderer.gl.TEXTURE0);
  Renderer.gl.bindTexture(Renderer.gl.TEXTURE_2D, Renderer.framebuffer.depthTexture);
  Renderer.gl.uniform1i(Renderer.uniformShader.uDepthSamplerLocation,0);

  Renderer.framebuffer_HLL = Renderer.createFramebuffer(Renderer.gl, Renderer.shadowMapSize);
  Renderer.gl.activeTexture(Renderer.gl.TEXTURE1);
  Renderer.gl.bindTexture(Renderer.gl.TEXTURE_2D, Renderer.framebuffer_HLL.depthTexture);
  Renderer.gl.uniform1i(Renderer.uniformShader.uDepthHLLSamplerLocation,1);

  Renderer.framebuffer_HLR = Renderer.createFramebuffer(Renderer.gl, Renderer.shadowMapSize);
  Renderer.gl.activeTexture(Renderer.gl.TEXTURE2);
  Renderer.gl.bindTexture(Renderer.gl.TEXTURE_2D, Renderer.framebuffer_HLR.depthTexture);
  Renderer.gl.uniform1i(Renderer.uniformShader.uDepthHLRSamplerLocation,2);
  
  /*
  add listeners for the mouse / keyboard events
  */
  Renderer.canvas.addEventListener('mousemove',on_mouseMove,false);
  Renderer.canvas.addEventListener('mouseup', on_mouseup,false);
  Renderer.canvas.addEventListener('mousedown', on_mousedown,false);
  Renderer.canvas.addEventListener('keydown',on_keydown,false);
  Renderer.canvas.addEventListener('keyup',on_keyup,false);

  Renderer.Display();
}

on_mouseup = function(e) {
  Renderer.cameras[2].mouseDown = false;
}
on_mousedown = function(e) {
  Renderer.cameras[2].mouseDown = true;
}
on_mouseMove = function(e){
  Renderer.cameras[2].mouseX = e.clientX;
  Renderer.cameras[2].mouseY = e.clientY;
}

on_ekey = function(){
  if(Renderer.currentCamera != 2) Renderer.currentCamera ++;
  else Renderer.currentCamera = 0;
}

on_keyup = function(e){
  if(e.key == 'e') on_ekey();
	Renderer.car.control_keys[e.key] = false;
}
on_keydown = function(e){
	Renderer.car.control_keys[e.key] = true;
}

window.onload = Renderer.setupAndStart;



