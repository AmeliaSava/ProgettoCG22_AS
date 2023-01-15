uniformShader = function (gl) {
    var vertexShaderSource = `
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix; 
      uniform mat4 uModelMatrix;
      uniform mat4 uNormalMatrix;
      uniform mat4 uLightMatrix;

      //headlights
      uniform mat4 uHeadLightLeftView;
      uniform mat4 uHeadLightRightView;
      uniform mat4 uHeadLightProjection;
  
      // light direction
      uniform vec3 uLightDirection;
      // point lights
      uniform vec3 uLampPositions[12];
      uniform vec3 uColor;
  
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec2 aTexCoords;
       
      // transformed position to be interpolated
      varying vec3 vPosVS;
      // transformed light direction in view space
      varying vec3 vLVS;
      varying vec3 vLPVS[12];
      varying vec3 vLampDirVS;

      // view direction to be interpolated
      varying vec3 vViewVS;
      varying vec3 vNVS;

      varying vec2 vTexCoords; 
      varying vec4 vHLLposProjVS;
      varying vec4 vHLRposProjVS;
      varying vec4 vHLLposVS;
      varying vec4 vHLRposVS;

      varying vec4 vDepthTexCoords; 
  
      void main(void)                                
      {    
        // transformation from object space to view space
        mat4 toViewSpace = uViewMatrix * uModelMatrix;

        // lamps in view space
        for(int i = 0; i < 12; i++) {
          vLPVS[i] = (uViewMatrix * vec4(uLampPositions[i], 1)).xyz;
        }
        vLampDirVS = normalize(uViewMatrix * vec4(0, -1, 0, 0)).xyz;

        // light direction in view space
        vec3 lightDirectionVS = normalize((uViewMatrix * vec4(uLightDirection,0.0))).xyz;
        
        // normal in view space per vertex
        vNVS = normalize(uNormalMatrix  * vec4(aNormal,0.0)).xyz;
        
        // vertex view space position
        vPosVS = (toViewSpace *	vec4(aPosition, 1.0)).xyz;

        // passing values to the shaders
        vLVS = lightDirectionVS;
        // view direction in view space
        vViewVS = normalize(-vPosVS);
        
        //headlights
        vHLLposVS = uHeadLightLeftView*uModelMatrix*vec4(aPosition, 1.0);
        vHLRposVS = uHeadLightRightView*uModelMatrix*vec4(aPosition, 1.0);
        vHLLposProjVS = uHeadLightProjection*vHLLposVS;
        vHLRposProjVS = uHeadLightProjection*vHLRposVS;
        
        vTexCoords = aTexCoords; 
        vDepthTexCoords = (uLightMatrix * vec4(aPosition, 1.0)); 

        gl_Position = uProjectionMatrix * toViewSpace * vec4(aPosition, 1.0);
        //gl_Position = uLightMatrix * uModelMatrix * vec4(aPosition, 1.0);
 	
      }                                              
    `;
  
    var fragmentShaderSource = `
    #extension GL_OES_standard_derivatives : enable
      precision highp float;                         
      uniform vec3 uColor;
      uniform sampler2D uSampler;
      uniform sampler2D uNormalSampler;
      uniform sampler2D uSamplerHL;
      uniform sampler2D uDepthSampler;
      uniform sampler2D uDepthSamplerHLL;
      uniform sampler2D uDepthSamplerHLR;
      uniform int uMode; // 0 = No Texture; 1 = Texture; 2 = NormalMapping
      uniform float uShadowMapSize;
      
      uniform vec3 uLightDirection;

      varying vec3 vPosVS;
      varying vec3 vLVS;
      varying vec3 vViewVS;
      varying vec3 vNVS;

      varying vec3 vLPVS[12];
      varying vec3 vLampDirVS;

      varying vec2 vTexCoords; 
      varying vec4 vHLLposProjVS;
      varying vec4 vHLRposProjVS;
      varying vec4 vHLLposVS;
      varying vec4 vHLRposVS;

      varying vec4 vDepthTexCoords; 

      const float kamb = 0.1;
      float bias = 0.0007;
  
      void main(void)                                
      { 
        float light_contr = 1.0;
        vec3 currColor;
        
        // If the object has no texture coordinates use its color
        if(uMode == 0)
          currColor = uColor;
        else currColor = texture2D(uSampler,vTexCoords).xyz;

        // Ambient lighting
        vec3 ambient = currColor * kamb;
        
        vec3 N;
        // phong shading
        if(uMode == 0) N = normalize(vNVS);
        // Flat Shading
        if(uMode == 1) N = normalize(cross(dFdx(vPosVS),dFdy(vPosVS)));
        // normal mapping
        if(uMode == 2) N = texture2D(uNormalSampler, vTexCoords).xyz;

        vec3 normLVS = normalize(vLVS);

        // diffusive
        float L_diffuse = max(dot(normLVS,N),0.0);
        // specular
        vec3 R = -normLVS + 2.0*dot(normLVS,N)*N;
        vec3 k_spec = currColor+vec3(0.0,0.0,currColor.z*1.3);
        float specular = max(0.0, pow(dot(vViewVS,R), 1.0));
        
        // lamps
        for (int i = 0; i < 12; i++) {
        
          vec3 offset = vLPVS[i] - vPosVS;
          vec3 toLight = normalize(offset);

          float SL_diffuse = max(0.0, dot(toLight, N));
          float angleSur = dot(vLampDirVS, -toLight);
          float spot = smoothstep(0.7, 1.0, angleSur * 1.2);
          if ( angleSur > 0.0) L_diffuse += (SL_diffuse * spot);
        
        }
                
        // Texture coordinates where the depth map is accessed for this specific fragment
        vec3 tC = ((vDepthTexCoords/vDepthTexCoords.w).xyz) * 0.5 + 0.5;

        if(tC.x > 0.0 || tC.x < 1.0 || tC.y > 0.0 || tC.y < 1.0) {
          float storedDepth;
          for( float x = 0.0; x < 5.0; x+=1.0)
						for( float y = 0.0; y < 5.0; y+=1.0) {
              storedDepth =  texture2D(uDepthSampler,tC.xy + vec2(-2.0+x,-2.0+y)/uShadowMapSize).x;
              // Is the fragment in shadow?
              if(storedDepth+bias <= tC.z || dot(N,normalize(vLVS)) < 0.0)
              light_contr -= 0.5/25.0;
          }
        }

        // Headlights
        vec4 HLLTexCoords = (vHLLposProjVS/vHLLposProjVS.w) * 0.5 + 0.5;
        vec4 HLRTexCoords = (vHLRposProjVS/vHLRposProjVS.w) * 0.5 + 0.5;

        vec3 HLLColor = texture2D(uSamplerHL, HLLTexCoords.xy).xyz;
        vec3 HLRColor = texture2D(uSamplerHL, HLRTexCoords.xy).xyz;

        float HLLDepth = texture2D(uDepthSamplerHLL, HLLTexCoords.xy).x;
        float HLRDepth = texture2D(uDepthSamplerHLR, HLRTexCoords.xy).x;
        
        vec3 finalHLLColor;
        vec3 finalHLRColor;

        if(HLLTexCoords.x <= 1.0 
          && HLLTexCoords.y <= 1.0 
          && HLLTexCoords.z <= 1.0 
          && HLLTexCoords.x >= 0.0 
          && HLLTexCoords.y >= 0.0 
          && HLLTexCoords.z >= 0.0 
          && (HLLDepth+bias > HLLTexCoords.z)) {
          float d = length(vHLLposVS);
          float falloffL = max(0.0, min(50.0, 80.0 / (d*d - d)));
          finalHLLColor += HLLColor * falloffL;
        }

        if(HLRTexCoords.x <= 1.0 
          && HLRTexCoords.y <= 1.0 
          && HLRTexCoords.z <= 1.0 
          && HLRTexCoords.x >= 0.0 
          && HLRTexCoords.y >= 0.0 
          && HLRTexCoords.z >= 0.0
          && HLRDepth+bias > HLRTexCoords.z) {
          float d = length(vHLRposVS);
          float falloffR = max(0.0, min(50.0, 80.0 / (d*d - d)));
          finalHLRColor += HLRColor * falloffR; 
        }

        gl_FragColor = vec4((ambient + currColor*L_diffuse + k_spec*specular + finalHLLColor + finalHLRColor) *light_contr,1.0);        
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
  
    shaderProgram.uModelMatrixLocation  = gl.getUniformLocation(shaderProgram, "uModelMatrix");
    shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
    shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
    shaderProgram.uNormalMatrixLocation = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
    shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram, "uColor");
    shaderProgram.uSamplerLocation = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.uNormalSamplerLocation = gl.getUniformLocation(shaderProgram, "uNormalSampler");
    shaderProgram.uSamplerHLLocation = gl.getUniformLocation(shaderProgram, "uSamplerHL");
    shaderProgram.uDepthSamplerLocation = gl.getUniformLocation(shaderProgram, "uDepthSampler");
    shaderProgram.uLightMatrixLocation = gl.getUniformLocation(shaderProgram, "uLightMatrix");
    shaderProgram.uShadowMapSizeLocation = gl.getUniformLocation(shaderProgram, "uShadowMapSize");
    shaderProgram.uLightDirectionLocation  = gl.getUniformLocation(shaderProgram, "uLightDirection");
    shaderProgram.uLampPositionsLocation = gl.getUniformLocation(shaderProgram, "uLampPositions");
    shaderProgram.uModeLocation = gl.getUniformLocation(shaderProgram, "uMode");
    shaderProgram.uHeadLightLeftViewLocation  = gl.getUniformLocation(shaderProgram, "uHeadLightLeftView");
    shaderProgram.uHeadLightRightViewLocation = gl.getUniformLocation(shaderProgram, "uHeadLightRightView");
    shaderProgram.uHeadLightProjectionLocation = gl.getUniformLocation(shaderProgram, "uHeadLightProjection");
    shaderProgram.uDepthHLLSamplerLocation = gl.getUniformLocation(shaderProgram, "uDepthSamplerHLL");
    shaderProgram.uDepthHLRSamplerLocation = gl.getUniformLocation(shaderProgram, "uDepthSamplerHLR");
    
    shaderProgram.vertex_shader = vertexShaderSource;
    shaderProgram.fragment_shader = fragmentShaderSource;
  
    return shaderProgram;
  };