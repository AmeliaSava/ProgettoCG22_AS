uniformShader = function (gl) {
    var vertexShaderSource = `
      uniform   mat4 uProjectionMatrix;
      uniform   mat4 uViewMatrix; 
      // transformation from object space to view space              
      uniform   mat4 uModelViewMatrix;
      uniform mat4 uModelMatrix;
  
      // light direction
      uniform vec3 uLightDirection;
      // point lights
      uniform vec3 uLampPositions[12];
      uniform vec3 uColor;
  
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec2 aTexCoords;
  
      // computed color to be interpolated 
      varying vec3 vShadedColor;  
      
      // transformed position to be interpolated
      varying vec3 vPosVS;
      // transformed light direction in view space
      varying vec3 vLVS;
      varying vec3 vLPVS[12];
      varying vec3 vLampDirVS;

      // view direction to be interpolated
      varying vec3 vViewVS;

      varying vec2 vTexCoords; 
  
      void main(void)                                
      {    
        for(int i = 0; i < 12; i++) {
          vLPVS[i] = (uViewMatrix * vec4(uLampPositions[i], 1)).xyz;
        }
        vLampDirVS = normalize(uViewMatrix * vec4(0, -1, 0, 0)).xyz;

        // light direction in view space
        vec3 lightDirectionVS = normalize((uViewMatrix * vec4(uLightDirection,0.0))).xyz;
        
        // normal in view space per vertex
        vec3 normalVS = normalize(uModelViewMatrix * vec4(aNormal,0.0)).xyz;
  
        // cosine term for diffuse component, if negative ignore
        float L_diffuse = max(dot(lightDirectionVS,normalVS),0.0);
  
        // use uColor ase base diffuse and multiply for cosine term
        vShadedColor = uColor*L_diffuse;  
        
        // vertex view space position
        vPosVS = (uModelViewMatrix*	vec4(aPosition, 1.0)).xyz;

        // passing values to the shaders
        vLVS = lightDirectionVS;
        // view direction in view space
        vViewVS = normalize(-vPosVS);

        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        vTexCoords = aTexCoords; 
      }                                              
    `;
  
    var fragmentShaderSource = `
    #extension GL_OES_standard_derivatives : enable
      precision highp float;                         
      uniform vec3 uColor;
      uniform sampler2D uSampler;
      uniform int uTextMode;
      
      uniform vec3 uLightDirection;
      varying vec3 vShadedColor;

      varying vec3 vPosVS;
      varying vec3 vLVS;
      varying vec3 vViewVS;
      varying vec3 vLPVS[12];
      varying vec3 vLampDirVS;

      varying vec2 vTexCoords; 

      const float kamb = 0.1;
  
      void main(void)                                
      { 
        vec3 currColor;
        if(uTextMode == 0)
          currColor = uColor;
        else currColor = texture2D(uSampler,vTexCoords).xyz;

        vec3 ambient = currColor * kamb;

        vec3 N = normalize(cross(dFdx(vPosVS),dFdy(vPosVS)));
        // diffusive
        float L_diffuse = max(dot(vLVS,N),0.0);
        //float L_diffuse = 0.0;
        // specular
        vec3 R = -vLVS+2.0 * dot(vLVS,N)*N;
        vec3 k_spec = currColor+vec3(0.0,0.0,currColor.z*1.3);
        float specular = max(0.0,pow(dot(vViewVS,R),5.0));

        for (int i = 0; i < 12; i++) {
        
          vec3 offset = vLPVS[i] - vPosVS;
          vec3 toLight = normalize(offset);

          float SL_diffuse = max(0.0, dot(toLight, N));
          float angleSur = dot(vLampDirVS, -toLight);
          float spot = smoothstep(0.9, 1.0, angleSur * 1.2);
          if ( angleSur > 0.0) L_diffuse += (SL_diffuse * spot);
        
        }
        
        //gl_FragColor = vec4(currColor*L_diffuse,1.0);
        gl_FragColor = vec4(ambient + currColor*L_diffuse + k_spec*specular,1.0);        
      }                                             
    `;
  
    // create the vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
  
    // create the fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
  
    // Create the shader program
    var aPositionIndex = 0;
    var aNormalIndex = 1;
    var aTexCoordsIndex = 2;
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.bindAttribLocation(shaderProgram, aPositionIndex, "aPosition");
    gl.bindAttribLocation(shaderProgram, aNormalIndex, "aNormal");
    gl.bindAttribLocation(shaderProgram, aTexCoordsIndex, "aTexCoords");
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      var str = "Unable to initialize the shader program.\n\n";
      str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
      str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
      str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
      alert(str);
    }
  
    shaderProgram.aPositionIndex = aPositionIndex;
    shaderProgram.aNormalIndex = aNormalIndex;
    shaderProgram.aTexCoordsIndex = aTexCoordsIndex;
  
    shaderProgram.uModelViewLocation  = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    shaderProgram.uModelLocation  = gl.getUniformLocation(shaderProgram, "uModelMatrix");
    shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
    shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
    shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
    shaderProgram.uSamplerLocation = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.uLightDirectionLocation  = gl.getUniformLocation(shaderProgram, "uLightDirection");
    shaderProgram.uLampPositionsLocation = [];
    for (var i = 0; i < Game.scene.lamps.length; ++i) {
      shaderProgram.uLampPositionsLocation[i] = gl.getUniformLocation(shaderProgram, "uLampPositions[",i,"]");
    }
    shaderProgram.uTextModeLocation = gl.getUniformLocation(shaderProgram, "uTextMode");
  
    shaderProgram.vertex_shader = vertexShaderSource;
    shaderProgram.fragment_shader = fragmentShaderSource;
  
    return shaderProgram;
  };