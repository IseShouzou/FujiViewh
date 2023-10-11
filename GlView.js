
//****************************************
// 
//        GlView
// 
//****************************************

function GlView( canvas ){

    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2');

    canvas.addEventListener('dblclick'  , { handleEvent: dblClick  , glview: this } );
    canvas.addEventListener('mousedown' , { handleEvent: mouseDown , glview: this } );
    canvas.addEventListener('mouseup'   , { handleEvent: mouseUp   , glview: this } );
    canvas.addEventListener('mousemove' , { handleEvent: mouseMove , glview: this } );
    canvas.addEventListener('mousewheel', { handleEvent: mouseWheel, glview: this } );

    var gl = this.gl;
    var viewWidth  = this.canvas.width;
    var viewHeight = this.canvas.height;


    this.objes = [];
    this.currentProgram = -1;

    this.selPt  = [ [ 0.0, 0.0, 0.0, 1.0 ],
                    [ 0.0, 0.0, 0.0, 1.0 ],
                    [ 0.0, 0.0, 0.0, 1.0 ] ] ;

    this.dropPt = [ [ 0.0, 0.0, 0.0, 1.0 ],
                    [ 0.0, 0.0, 0.0, 1.0 ],
                    [ 0.0, 0.0, 0.0, 1.0 ] ] ;


    this.vehiclePosMat = identity();

    this.pilotPos = [ 0.0, 0.0, 0.0 ];
    this.pilotEul = [ 0.0, 0.0, 0.0 ];

    this.chaserPos = [ 10.0, 10.0, 10.0 ];



    //var pt = [ -1.0, -1.0,  0.0, 1.0,
    //            1.0, -1.0,  0.0, 1.0,
    //            1.0,  1.0,  0.0, 1.0,
    //           -1.0,  1.0,  0.0, 1.0 ]

    //var nl = [ 0.0, 0.0, 1.0, 0.0,
    //           0.0, 0.0, 1.0, 0.0,
    //           0.0, 0.0, 1.0, 0.0,
    //           0.0, 0.0, 1.0, 0.0 ]

    var pt = [ -1.0, -1.0,  0.0,
                1.0, -1.0,  0.0,
                1.0,  1.0,  0.0,
               -1.0,  1.0,  0.0, ]

    var nl = [ 0.0, 0.0, 1.0,
               0.0, 0.0, 1.0,
               0.0, 0.0, 1.0,
               0.0, 0.0, 1.0, ]

    var id = [ 0, 1, 2, 3] ;

    var cl = [ 1.0, 0.0, 0.0, 1.0 ] ;

    //this.squre = new Obje( this, 'squre', 6, pt, nl, cl, id);
    this.squre = new Obje( this, 'squre', 6, pt, nl, id, cl);



    //console.log( viewWidth, viewHeight  );

    this.texWidth  = 1024;
    this.texHeight = 1024;



    //this.viewport = [ [ 0, 0, viewWidth, viewHeight ] ]

    //var e = [ 0.0, 0.0, 10000.0 ];
    //var t = [ 0.0, 0.0, 0.0 ];
    //var u = [ 1.0, 0.0, 0.0 ];

    //this.lookAtMat[0] = calcLookAt( e, t, u );
    //this.lookAtMat[1] = calcLookAt( e, t, u );
    //this.lookAtMat[2] = calcLookAt( e, t, u );


    //this.lightPosi = [ 0.0, 0.0, 10.0, 1.0 ];
    this.lightPosi = [ 15000.0, 15000.0, 100000.0, 1.0 ];

    this.tMat = [ 0.5, 0.0, 0.0, 0.5,
                  0.0, 0.5, 0.0, 0.5,
                  0.0, 0.0, 1.0, 0.0,
                  0.0, 0.0, 0.0, 1.0 ];

    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);



    //-------------------
    //    program0
    //-------------------

    this.prog0 = CreateProrgam(
        [
        "#version 300 es",
        "layout (location = 0) in vec3 position;",
	"uniform mat4 projectionalMatrix;",
	"uniform mat4 positionalMatrix;",
	"out vec4 vPosition;",
        "void main()",
        "{",
	"  vPosition = projectionalMatrix * positionalMatrix * vec4(position,1.0);",
	"  //vPosition.z *= vPosition.w;",
	"  gl_Position = vPosition;",
        "}",
        ].join("\n"),
        [
        "#version 300 es", 
        "precision highp float;", 
        "in vec4 vPosition;", 
        "out vec4 outColor;", 
        "vec4 convRGBA(float depth){", 
        "  float r = depth;", 
        "  float g = fract(r * 255.0);", 
        "  float b = fract(g * 255.0);", 
        "  float a = fract(b * 255.0);", 
        "  float coef = 1.0 / 255.0;", 
        "  r -= g * coef;", 
        "  g -= b * coef;", 
        "  b -= a * coef;", 
        "  return vec4(r, g, b, a);", 
        "}", 
        "void main()", 
        "{",
        "  //outColor = convRGBA( gl_FragCoord.z * 2.0 - 0.5  );",
        "  //outColor = convRGBA( gl_FragCoord.z / gl_FragCoord.w );",
        "  //outColor = convRGBA( ( vPosition.z / vPosition.w + 1.0 ) * 0.5 );",
        "  outColor = convRGBA( ( vPosition.z + 1.0 ) * 0.5 );",
        "  //outColor = convRGBA( vPosition.z / vPosition.w );",
        "  //outColor = vec4( vPosition.z / vPosition.w , 0.0, 0.0, 1.0);",
        "}",
        ].join("\n")
        );

    this.projectionalMatrixLoc0 = gl.getUniformLocation( this.prog0, 'projectionalMatrix');
    this.positionalMatrixLoc0   = gl.getUniformLocation( this.prog0, 'positionalMatrix');



    //-------------------
    //    program1
    //-------------------

    this.prog1 = CreateProrgam(
        [
        "#version 300 es",
        "precision highp float;", 
        "layout (location = 0) in vec3 position;",
        "layout (location = 1) in vec3 normal;",
	"uniform mat4 projectionalMatrix;",
	"uniform mat4 positionalMatrix;",
	"//uniform mat4 lightProjMatrix;",
	"uniform mat4 tLightProjMatrix;",
	"out vec4 P;",
	"out vec3 N;",
        "out vec4 vTexCoord;",
        "void main()",
        "{",
	"  P = positionalMatrix * vec4(position,1.0);",
	"  N = normalize( vec3( positionalMatrix * vec4(normal,0.0) ) );",
	"  gl_Position = projectionalMatrix * P;",
	"  gl_Position.z *= gl_Position.w;",
	"  vTexCoord   = tLightProjMatrix * P;",
	"  //vTexCoord.z *= vTexCoord.w;",
        "}",
        ].join("\n"),
        [
        "#version 300 es", 
        "precision highp float;", 
	"uniform vec4  eyePos;",
	"uniform vec4  lightPos;",
	"uniform vec4  ambient;",
	"uniform vec4  diffuse;",
	"uniform vec4  specula;",
	"uniform float shine;",
	"uniform sampler2D texture2D;",
	"uniform sampler2D geomTex;",
	"uniform bool flag;",
	"in vec4 P;",
	"in vec3 N;",
        "in vec4 vTexCoord;",
        "out vec4 outColor;", 
        "float restDepth(vec4 RGBA){",
        "  const float rMask = 1.0;",
        "  const float gMask = 1.0 / 255.0;",
        "  const float bMask = 1.0 / (255.0 * 255.0);",
        "  const float aMask = 1.0 / (255.0 * 255.0 * 255.0);",
        "  float depth = dot(RGBA, vec4(rMask, gMask, bMask, aMask));",
        "  return depth;",
        "}",
        "void main()", 
        "{",
        "  float shadow = restDepth(textureProj(texture2D, vTexCoord));",
	"  vec3 L = normalize( lightPos.xyz * P.w - P.xyz * lightPos.w);",
	"  vec3 E = normalize( eyePos.xyz   * P.w - P.xyz * eyePos.w);",
	"  vec3 H = normalize( L + E );",
	"  float DF = abs( dot( N, L ) );",
	"  float SP = pow( abs( dot( N, H ) ), shine );",
	"  //vec4 color = ambient + diffuse * DF + specula * SP ;",
	"  vec4 color = (flag)? texture( geomTex, vec2( - P.y / 31716.0 + 0.5 , - P.x / 31716.0 + 0.5 ) ) ",
	"                     : ambient + diffuse * DF + specula * SP ;",
        "  //if( shadow > 0.999 || vTexCoord.z / vTexCoord.w - 0.001 < shadow ){",
        "  if( shadow > 0.999 || ( vTexCoord.z + 1.0 ) * 0.5 - 0.001 < shadow ){",
        "    outColor  = color;",
        "  }else{",
        "     outColor  = color * vec4(0.5, 0.5, 0.5, 1.0);",
        "     //if( shadow > 0.9 ) shadow = 0.0;",
        "     //outColor  = vec4( vTexCoord.z /50000.0 * vec3( 1.0, 1.0, 1.0) , 1.0);",
        "  }",
        "}",
        ].join("\n")
        );

    this.projectionalMatrixLoc1 = gl.getUniformLocation( this.prog1, 'projectionalMatrix');
    this.positionalMatrixLoc1   = gl.getUniformLocation( this.prog1, 'positionalMatrix');
    this.eyePosLoc1             = gl.getUniformLocation( this.prog1, 'eyePos');
    this.lightPosLoc1           = gl.getUniformLocation( this.prog1, 'lightPos');
    this.ambientLoc1            = gl.getUniformLocation( this.prog1, 'ambient');
    this.diffuseLoc1            = gl.getUniformLocation( this.prog1, 'diffuse');
    this.speculaLoc1            = gl.getUniformLocation( this.prog1, 'specula');
    this.shineLoc1              = gl.getUniformLocation( this.prog1, 'shine');

    this.tLightProjMatrixLoc1   = gl.getUniformLocation( this.prog1, 'tLightProjMatrix');
    this.texture2DLoc1          = gl.getUniformLocation( this.prog1, 'texture2D');
    this.geomTexLoc1            = gl.getUniformLocation( this.prog1, 'geomTex');

    this.flagLoc1               = gl.getUniformLocation( this.prog1, 'flag');




    //-------------------
    //    program3
    //-------------------

    var vs_source3 =  [
        "#version 300 es",
        "layout (location = 0) in vec4 position;",
	"out vec4 P;",
        "void main()",
        "{",
	"  P = position;",
	"  gl_Position = position;",
        "}",
        ].join("\n");

    var fs_source3 =  [
        "#version 300 es", 
        "precision highp float;", 
	"uniform mat4  invMatrix;",
	"uniform vec4  viewPort;",
	"uniform vec4  colorSky;",
	"uniform vec4  colorSea;",
	"uniform float earthR;",
	"in vec4 P;",
        "out vec4 outColor;", 
        "void main()", 
        "{",
        "  float dX = 1.0 / viewPort[2];",
        "  float dY = 1.0 / viewPort[3];",
        "  vec4 ptA = invMatrix * vec4( P.xy, 0.0, 1.0);",
        "  vec4 ptS = - vec4( invMatrix[2] );",
        "  vec3 vCA = vec3( ptA.xy / ptA.w, ptA.z / ptA.w + earthR);",
        "  //vec3 vCA = vec3( ptA.xy / ptA.w, ptA.z / ptA.w - earthR);",
        "  vec3 vSA = ptA.xyz * ptS.w - ptS.xyz * ptA.w;",
        "  vec3 UU = normalize( vSA );",
        "  float t = - dot( vCA, UU );",
        "  if( t > 0.0 ){",
        "    vec3 vCP = vCA + t * UU;",
        "    float LL = length( vCP );",
        "    float AL = 1.0 + t * ptS.w * ptA.w / length( vSA ) ;",
        "    mat4x3 A1 = mat4x3 ( vec3( 1.0, 0.0, 0.0 ), ",
        "                         vec3( 0.0, 1.0, 0.0 ), ",
        "                         vec3( 0.0, 0.0, 1.0 ), ",
        "                         - ptA.xyz / ptA.w    );",
        "    mat2x4 A2 = mat2x4( invMatrix ) / ptA.w ;",
        "    vec2 dL = AL / LL * transpose( A1 * A2 ) * vCP;",
        "    mat2x4 GG = mat2x4( vec4( dX,-dX,-dX, dX ),  ",
        "                        vec4( dY, dY,-dY,-dY ) );",
        "    vec4 dD = LL - earthR + GG * dL;",
        "    //outColor = colorSea;",
        "    //if( LL < earthR ) outColor = colorSea;",
        "    float R = ( max(dD[0],0.0) + max(dD[1],0.0) + max(dD[2],0.0) + max(dD[3],0.0) )",
        "            / ( abs(dD[0])     + abs(dD[1])     + abs(dD[2])     + abs(dD[3])     );",
        "    outColor = R * colorSky +  ( 1.0 - R ) * colorSea;",
        "  }else{",
        "    outColor = colorSky;",
        "  }",
        "}",
        ].join("\n");

    this.program3 = CreateProrgam( vs_source3, fs_source3 );
    this.invMatrixPosLoc3 = gl.getUniformLocation( this.program3, 'invMatrix');
    this.viewPortLoc3     = gl.getUniformLocation( this.program3, 'viewPort');
    this.colorSkyPosLoc3  = gl.getUniformLocation( this.program3, 'colorSky');
    this.colorSeaPosLoc3  = gl.getUniformLocation( this.program3, 'colorSea');
    this.earthRPosLoc3    = gl.getUniformLocation( this.program3, 'earthR');







    //-------------------
    //    framebuffer
    //-------------------

    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);


    // 深度バッファ用レンダーバッファの生成とバインド
    var depthRenderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    
    // レンダーバッファを深度バッファとして設定
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.texWidth, this.texHeight);
    
    // フレームバッファにレンダーバッファを関連付ける
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
    

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.texWidth, this.texHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //-------------------
    //    texture
    //-------------------

/*
    var glView = this;

    var img = new Image();
    img.onload = function(){

        //console.log( img );

        var gl = glView.gl;
        glView.geomTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, glView.geomTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    img.src = getImageData();

*/


    function CreateProrgam( vs, fs ){

        var vertexShader   = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertexShader  , vs);
        gl.shaderSource(fragmentShader, fs);

        gl.compileShader(vertexShader);
        if( ! gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
            alert(gl.getShaderInfoLog(vertexShader));
        }

        gl.compileShader(fragmentShader);
        if( ! gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
           alert(gl.getShaderInfoLog(fragmentShader));
        }

        var program = gl.createProgram();
        if (!program){
            alert("fail to create program !!");
            return false;
        }

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked){
            var error = gl.getProgramInfoLog(program);
            alert('fail to link programs !! ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return false;
        }

        return program;

    }



    function getViewId( glview, x, y ){
        var k = -1;
        for( var vp of glview.viewport ){
            k += 1;
            if ( x >= vp[0] ){
                if ( x <= vp[0] + vp[2] ){
                    if ( y >= vp[1] ){
                        if ( y <= vp[1] + vp[3] ){
                            break;
                        }
                    }
                }
            }
        }
        return k;
    }



    function getPt( glview, e){
        //console.log("getPt");
        var gl = glview.gl; 

        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left ;
        var y = rect.height + rect.top - e.clientY ;

        glview.currentProgram = 0;
        gl.useProgram( glview.prog0 );

        gl.bindFramebuffer(gl.FRAMEBUFFER, glview.framebuffer);

        gl.viewport(0, 0, glview.texWidth, glview.texHeight );
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //var k = x < glview.viewport[1][0] ? 0 : 1;
        //var k = x < glview.viewport[1][0] ? 0 :
        //        y > glview.viewport[1][1] ? 1 : 2;


        var k = getViewId( glview, x, y );

        x -= glview.viewport[k][0];
        y -= glview.viewport[k][1];

        var xf = x / glview.viewport[k][2] * glview.texWidth;
        var yf = y / glview.viewport[k][3] * glview.texHeight;

        gl.uniformMatrix4fv( glview.projectionalMatrixLoc0, true, glview.projMat[k] );

        for ( obje of glview.objes ){
            obje.draw( null );
        }

        var u8 = new Uint8Array(4);
        gl.readPixels(xf, yf, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, u8);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        x = 2.0 * x / glview.viewport[k][2] - 1.0 ;
        y = 2.0 * y / glview.viewport[k][3] - 1.0 ;
        var z = 2.0 * ( u8[0] + ( u8[1] + ( u8[2] + u8[3] / 255 ) / 255 ) / 255 ) / 255 - 1.0 ;

        //console.log( x, y, z);
        return [ k, [ x, y, z, 1.0] ]; 
    }




    function dblClick(e){
        //console.log("dblClick");
        var glview = this.glview ;

        var [ k, p ] = getPt( glview, e );
        if ( p == null ) return;

        //var s1 = productMV( invViewMat( glview.viewMat[k] ), p );
        var s1 = [ 0.0, 0.0, 0.0, 1.0 ];
        s1[2] = ( p[2] - glview.viewMat[k][11] ) / glview.viewMat[k][10];
        s1[0] = - s1[2] / glview.viewMat[k][0] * p[0];
        s1[1] = - s1[2] / glview.viewMat[k][5] * p[1];

        var s2 = productMV( invLookAtMat( glview.lookAtMat[k] ), s1 );
        glview.selPt[k] = [ s2[0]/s2[3], s2[1]/s2[3], s2[2]/s2[3], 1.0 ];
        //console.log( glview.selPt[k] );
    }


    function mouseDown(e){
        //console.log("mouseDown");
        var glview = this.glview ;
        e.preventDefault();
        //var glview = this.parent;
        glview.mousePressed = e.button;
        var rect = e.target.getBoundingClientRect();
        glview.mousePosX = e.clientX - rect.left;
        glview.mousePosY = rect.height + rect.top - e.clientY;
        var [ k, p ] = getPt( glview, e );
        if ( p == null ) return;
        glview.dropPt[k] = p;
    }


    function mouseUp(e){
        //console.log("mouseUp");
        var glview = this.glview ;
        glview.mousePressed = -1;
    }


    function mouseMove(e){
        //console.log("mouseMove");
        e.preventDefault();
        var glview = this.glview;

        var lookAtMat = glview.lookAtMat;
        var viewMat   = glview.viewMat;
        var selPt     = glview.selPt;
        var dropPt    = glview.dropPt;

        if ( glview.mousePressed != -1 ){

            var rect = e.target.getBoundingClientRect();
            var x = e.clientX - rect.left ;
            var y = rect.height + rect.top - e.clientY ;

            var dx = x - glview.mousePosX;
            var dy = y - glview.mousePosY;
            glview.mousePosX = x ;
            glview.mousePosY = y ;

            //var k = x < glview.viewport[1][0] ? 0 : 1;
            //var k = x < glview.viewport[1][0] ? 0 :
            //        y > glview.viewport[1][1] ? 1 : 2;

            var k = getViewId( glview, x, y );

            //console.log(k);


            x -= glview.viewport[k][0];
            y -= glview.viewport[k][1];

            var viewWidth  = glview.viewport[k][2];
            var viewHeight = glview.viewport[k][3];

            if ( glview.mousePressed == 0 ){  // left button
                //console.log( mousePressed );
                //var zz = ( - viewMat[k][15] * dropPt[k][2] + viewMat[k][11] ) / ( viewMat[k][14] * dropPt[k][2] - viewMat[k][10]);
                var zz = ( dropPt[k][2] - viewMat[k][11] ) /  viewMat[k][10];
                var dd = viewMat[k][14] * zz + viewMat[k][15];
                lookAtMat[k][3] += dx / viewWidth  * 2 * dd / viewMat[k][0] ;
                lookAtMat[k][7] += dy / viewHeight * 2 * dd / viewMat[k][5] ;

            }
            else if ( glview.mousePressed == 2 ){      // right button
                //console.log( "mousePressed" );
                var L = 0.8 * Math.min( viewWidth, viewHeight );
                var [ ang1, ang2 ] = [ - dy / L,  dx / L ];
                var [  c1 ,  s1  ] = [ Math.cos( ang1 ), Math.sin( ang1 ) ];
                var [  c2 ,  s2  ] = [ Math.cos( ang2 ), Math.sin( ang2 ) ];

                if ( Math.abs( x / viewWidth - 0.5 ) < 0.3 ){ //>
                    var rotMat =[   c2, s2*s1, s2*c1,  0.0,
                                   0.0,    c1,   -s1,  0.0,
                                   -s2, c2*s1, c2*c1,  0.0,
                                   0.0,   0.0,   0.0,  1.0  ];
                }else{
                    if ( x / viewWidth > 0.5 ) s1 = -s1;
                    var rotMat =[   c1, -s1, 0.0, 0.0,
                                    s1,  c1, 0.0, 0.0,
                                   0.0, 0.0, 1.0, 0.0,
                                   0.0, 0.0, 0.0, 1.0  ];
                }
                var ss = productMV( lookAtMat[k], selPt[k] );
                var ds = productMV( rotMat, ss );
                glview.lookAtMat[k] = productMat( rotMat, lookAtMat[k] );
                glview.lookAtMat[k][ 3] += ss[0] - ds[0];
                glview.lookAtMat[k][ 7] += ss[1] - ds[1];
                glview.lookAtMat[k][11] += ss[2] - ds[2];
            }
            glview.update();
        }

    }



    function mouseWheel(e){
        //console.log("mouseWheel");
        var glview = this.glview ;

        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left ;
        var y = rect.height + rect.top - e.clientY ;

        //var k = x < glview.viewport[1][0] ? 0 : 1;
        //var k = x < glview.viewport[1][0] ? 0 :
        //        y > glview.viewport[1][1] ? 1 : 2;

        var k = getViewId( glview, x, y );


        if( !e.shiftKey ){
            var ivL = invLookAtMat( glview.lookAtMat[k] );
            var sPt = glview.selPt[k];
            var L = Math.sqrt( ( ivL[ 3] - sPt[0] ) * ( ivL[ 3] - sPt[0] )
                             + ( ivL[ 7] - sPt[1] ) * ( ivL[ 7] - sPt[1] )
                             + ( ivL[11] - sPt[2] ) * ( ivL[11] - sPt[2] ) ) / 20.0;
            if(e.deltaY>0){
                glview.lookAtMat[k][11] += L;
            }else{
                glview.lookAtMat[k][11] -= L;
            }
        }else{
            var d = 0.05 * Math.min( glview.viewFov[k], 180 - glview.viewFov[k] );
            if( e.deltaY<0 ){
                glview.viewFov[k] = 180.0 + ( glview.viewFov[k] - 180.0 ) / 1.2;
                //glview.viewFov[k] += d;
            }else{
                glview.viewFov[k] /= 1.2;
                //glview.viewFov[k] -= d;
            }
        }
        glview.update();

    }

}



//GlView.prototype.resize = function (){
//
//    //console.log("resize GlView ");
//
//    this.viewport = [ [ 0, 0, this.canvas.width, this.canvas.height ] ]
//    this.update();
//
//}


GlView.prototype.update = function (){

    //console.log("update GlView ");

    //this.updatePreprocess();

    var gl = this.gl;
    //var viewWidth  = this.canvas.width;
    //var viewHeight = this.canvas.height;

    //this.lookAtMat[0] = calcPilotLookAtMat( this.vehiclePosMat, this.pilotPos, this.pilotEul );
    //this.lookAtMat[1] = calcChaserLookAtMat( this.vehiclePosMat, this.chaserPos );



    var MinMax2 = [];
    for ( obje of this.objes ) {
        if ( obje.shadow ) MinMax2.push( obje.calcMinMax( identity() ) );
    }

    if( MinMax2.length == 0 ){
        MinMax2 = [ [ 0.0, 0.0, 0.0, 1.0 ], [ 0.0, 0.0, 0.0, 1.0 ] ];
    }

    MinMax2 = MinMax2.reduce( (a,b)=> compare(a,b) );

    //console.log( MinMax2 );

    var lightProjMat = calcLightProjMat(this.lightPosi, MinMax2);
    var tLightProjMat = productMat( this.tMat, lightProjMat );








    //---------------
    //	 Program0
    //---------------

    this.currentProgram = 0;
    gl.useProgram( this.prog0 );

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

    gl.viewport(0, 0, this.texWidth, this.texHeight );
    //gl.clearColor(1.0, 1.0, 1.0, 1.0);
    //gl.clearDepth(1.0);
    //gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv( this.projectionalMatrixLoc0, true, lightProjMat );

    for ( obje of this.objes ){
        if( obje.shadow ) obje.draw( null );
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


   //========================

    //gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(var k=0; k<this.numViews; k++){

        var MinMax1 = [];
        for ( obje of this.objes ) {
            MinMax1.push( obje.calcMinMax( this.lookAtMat[k] ) );
        }
        MinMax1 = MinMax1.reduce( (a,b)=> compare(a,b) )
        
        var near = - MinMax1[1][2];
        var far  = - MinMax1[0][2];
        
        near -= 0.1;
        far += 0.1;
        if ( near < 0.01 ) near = 0.01;
        if ( far  < 1.0 )   far = 1.0;
        
        this.viewMat[k] = perspectiveMatrix( this.viewFov[k], this.viewport[k][2] / this.viewport[k][3] , near, far );
        this.projMat[k] = productMat( this.viewMat[k], this.lookAtMat[k] );

    }

    //---------------
    //	 Program3
    //---------------

    gl.useProgram( this.program3 );
    this.currentProgram = 3;
    
    gl.uniform4fv( this.colorSkyPosLoc3, [ 0.529, 0.808, 0.922, 1.0] ); //rgb(135, 206, 235)
    gl.uniform4fv( this.colorSeaPosLoc3, [ 0.0  , 0.0  , 0.502, 1.0] ); //rgb(0, 0, 128)
    gl.uniform1f ( this.earthRPosLoc3, 6500000.0 );
    
    
    for(var k=0; k<this.numViews; k++){
        gl.viewport( ...this.viewport[k] );

        var invMatrix = productMat( invLookAtMat( this.lookAtMat[k] ), invViewMat( this.viewMat[k] ) );

        gl.uniform4fv      ( this.viewPortLoc3, this.viewport[k] );
        //gl.uniformMatrix4fv( this.invMatrixPosLoc3, false, invMatrix );
        gl.uniformMatrix4fv( this.invMatrixPosLoc3, true, invMatrix );

        this.squre.draw( null );
    }



    //---------------
    //	 Program1
    //---------------
    this.currentProgram = 1;
    gl.useProgram( this.prog1 );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.geomTex);

    gl.uniform4fv( this.lightPosLoc1 , this.lightPosi );
    gl.uniformMatrix4fv( this.tLightProjMatrixLoc1 , true, tLightProjMat );
    gl.uniform1i       ( this.texture2DLoc1, 0);

    gl.uniform1i       ( this.geomTexLoc1, 1);


    //gl.clearColor(1.0, 1.0, 1.0, 1.0);
    //gl.clearDepth(1.0);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



    for(var k=0; k<this.numViews; k++){

        gl.viewport( ...this.viewport[k] );
        gl.enable(gl.DEPTH_TEST);
        gl.clear( gl.DEPTH_BUFFER_BIT);

        //var MinMax1 = [];
        //for ( obje of this.objes ) {
        //    MinMax1.push( obje.calcMinMax( this.lookAtMat[k] ) );
        //}
        //MinMax1 = MinMax1.reduce( (a,b)=> compare(a,b) )
        //
        //var near = - MinMax1[1][2];
        //var far  = - MinMax1[0][2];
        //
        //near -= 0.1;
        //far += 0.1;
        //if ( near < 0.01 ) near = 0.01;
        //if ( far  < 1.0 )   far = 1.0;
        //
        //this.viewMat[k] = perspectiveMatrix( this.viewFov[k], this.viewport[k][2] / this.viewport[k][3] , near, far );
        //this.projMat[k] = productMat( this.viewMat[k], this.lookAtMat[k] );



        var invLookAt = invLookAtMat( this.lookAtMat[k] );
        var eyePosi = [ invLookAt[3], invLookAt[7], invLookAt[11], 1.0];

        gl.uniformMatrix4fv( this.projectionalMatrixLoc1, true, this.projMat[k] );
        gl.uniform4fv( this.eyePosLoc1   , eyePosi );

        for ( obje of this.objes ){
            if(obje.name == 'geom') { gl.uniform1i( this.flagLoc1, true);  }
            else                    { gl.uniform1i( this.flagLoc1, false); }
            obje.draw( null );
        }

    }

    gl.bindTexture(gl.TEXTURE_2D, null );



    gl.flush();


}



GlView.prototype.mkGeomTexture = function ( img ){
    //console.log( 'mkGeomTexture' );

    var gl = this.gl;
    this.geomTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.geomTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

}



GlView.prototype.addObje = function ( name, xkind, pnt, nor, idx, clr ){

    var gl = this.gl;

    switch (xkind) {
        case 'TRIANGLES':
            kind = gl.TRIANGLES; break ;
        case 'LINES':
            kind = gl.LINES; break ;
        case 'POINTS':
            kind = gl.POINTS; break ;
        case 'TRIANGLE_FAN':
            kind = gl.TRIANGLE_FAN; break ;
        case 'LINE_LOOP':
            kind = gl.LINE_LOOP; break ;
        case 'LINE_STRIP':
            kind = gl.LINE_STRIP; break ;
        case 'TRIANGLE_STRIP':
            kind = gl.TRIANGLE_STRIP; break ;
        case 'TRIANGLE_FAN':
            kind = gl.TRIANGLE_FAN; break ;
        case 'QUADS':
            kind = gl.QUADS; break ;
        case 'QUAD_STRIP':
            kind = gl.QUAD_STRIP; break ;
        case 'POLYGON':
            kind = gl.POLYGON; break ;
    } 

    //this.objeDict[name] = new Obje( this, kind, pnt, nor, idx, clr );


    this.objes.push( new Obje( this, name, kind, pnt, nor, idx, clr ) );

}



GlView.prototype.setShadow = function ( name ){

    for ( obje of this.objes ){
        if( obje.name == name ){
            obje.shadow = true;
         }
    }

}



GlView.prototype.getPosMatByName = function ( name ){

    for ( var obje of this.objes ){
        if( obje.name == name ) return obje.posiMat;
    }

}


GlView.prototype.setPosByName = function ( name, x, y, z ){

    for ( var obje of this.objes ){
        if( obje.name == name ){
            obje.posiMat[ 3] = x;
            obje.posiMat[ 7] = y;
            obje.posiMat[11] = z;
         }
    }

}

GlView.prototype.setEulByName = function ( name, phi, the, psi ){

    var mat = transpose( calcDCM( [ phi, the, psi ], false ) );
    var mx = getPosMatByName( name );

    mat[ 3] = mx[ 3];
    mat[ 7] = mx[ 7];
    mat[11] = mx[11];


    for ( var obje of this.objes ){
        if( obje.name == name ){
            obje.posiMat = mat;
         }
    }

}





GlView.prototype.setVehiclePos = function ( x, y, z ){

    this.vehiclePosMat[ 3] = x;
    this.vehiclePosMat[ 7] = y;
    this.vehiclePosMat[11] = z;

    for ( var obje of this.objes ){
        if( obje.name == 'vehicle' ){
            obje.posiMat = this.vehiclePosMat;
         }
    }

}


GlView.prototype.setVehicleEul = function ( phi, the, psi ){

    var dcm = transpose( calcDCM( [ phi, the, psi ], false ) );
    dcm[ 3] = this.vehiclePosMat[ 3];
    dcm[ 7] = this.vehiclePosMat[ 7];
    dcm[11] = this.vehiclePosMat[11];

    this.vehiclePosMat = dcm;

    for ( var obje of this.objes ){
        if( obje.name == 'vehicle' ){
            obje.posiMat = this.vehiclePosMat;
         }
    }

}


GlView.prototype.movVehicle = function ( x, y, z ){

    var mat = identity();
    mat[ 3] = x;
    mat[ 7] = y;
    mat[11] = z;

    this.vehiclePosMat = productMat( this.vehiclePosMat, mat);

    for ( var obje of this.objes ){
        if( obje.name == 'vehicle' ){
            obje.posiMat = this.vehiclePosMat;
         }
    }

}




GlView.prototype.addGeomObje = function ( name ){

    //console.log('addGeomObje');

    var [ L, M, N ] = [ 10, 906, 404 ]  ;
    var X = 2 * Math.PI * ( 0.5 - N / Math.pow( 2, L ) );
    var tanh = ( Math.exp(X) - Math.exp(-X) ) / ( Math.exp(X) + Math.exp(-X) ) ;
    var F = Math.asin( tanh );
    var D = 2 * Math.PI * 6371000.0  *  Math.cos(F) / Math.pow( 2, L ) / 256

    var A = 255.0 * D / 2.0 - D / 2.0;
    //console.log( A, D );

    var Nelm = 255 * 255 * 2;
    var Nmax = 20000;

    var geomData = get10_906_404();

    var ZZ = Array(256);
    for (var i=0; i<256; i++){
        ZZ[i] = Array(256);
        for (var j=0; j<256; j++){
            //ZZ[i][j] = geomData[ i + 256 * j ];
            ZZ[i][j] = geomData[ 256 * i + j ];

            if( i>=114 && i<=140 && j>=45 && j<=48){
                ZZ[i][j] = 600.0;
            }
        }
    }


    var pnt = Array( Nelm * 3 * 3 );
    for (var i=0; i<255; i++){
        for (var j=0; j<255; j++){

            var k = 18 * ( 255 * i + j );

            //pnt[k   ] = - A + i * D;
            //pnt[k+ 1] =   A - j * D;
            pnt[k   ] = A - i * D;
            pnt[k+ 1] = A - j * D;
            pnt[k+ 2] = ZZ[i][j];

            pnt[k+ 3] = A - (i+1) * D;
            pnt[k+ 4] = A -  j    * D;
            pnt[k+ 5] = ZZ[i+1][j];

            pnt[k+ 6] = A -  i    * D;
            pnt[k+ 7] = A - (j+1) * D;
            pnt[k+ 8] = ZZ[i][j+1];

            pnt[k+ 9] = pnt[k+ 3];
            pnt[k+10] = pnt[k+ 4];
            pnt[k+11] = pnt[k+ 5];

            pnt[k+12] = A - (i+1) * D;
            pnt[k+13] = A - (j+1) * D;
            pnt[k+14] = ZZ[i+1][j+1];

            pnt[k+15] = pnt[k+ 6];
            pnt[k+16] = pnt[k+ 7];
            pnt[k+17] = pnt[k+ 8];

        }
    }

    var count = 0;

    var NR = Nelm;
    var k = 0;
    while (NR > 0) {
        //console.log(NR);
        var Nx = Math.min( Nmax, NR );
        NR -= Nx;
        var px = Array( 9 * Nx );
        for (var i=0; i<9*Nx; i++){
            px[i] = pnt[k+i];
        }
        k += 9 * Nx

        if( count % 2 == 0 ){
            var color = [ 0.2, 0.0, 0.0, 1.0,
                          0.5, 0.0, 0.0, 1.0,
                          0.5, 0.0, 0.0, 1.0,
                          5.0 ];
        }else{
            var color = [ 0.0, 0.2, 0.0, 1.0,
                          0.0, 0.5, 0.0, 1.0,
                          0.0, 0.5, 0.0, 1.0,
                          5.0 ];
        }


        //this.objeDict[ name + String(count) ] = new Obje( this, this.gl.TRIANGLES, px, [], [], color );

        this.objes.push( new Obje( this, name, this.gl.TRIANGLES, px, [], [], color ) );

        count ++;

    }

}




GlView.prototype.addSTLdataObje = function ( name ){

    var pnt = [];
    var dd = getPoints();
    for( d of dd){
        var vv = new Float32Array( base64ToArrayBuffer( d ) );
        for( v of vv){
            pnt.push( v / 10.0 );
        }
    }

    //console.log( pnt.length );
    var Nmax = 20000;
    var NR = pnt.length / 9;
    var k = 0;
    while (NR > 0) {
        //console.log(NR);
        var Nx = Math.min( Nmax, NR );
        NR -= Nx;
        var px = Array( 9 * Nx );
        for (var i=0; i<9*Nx; i++){
            px[i] = pnt[k+i];
        }
        k += 9 * Nx
        this.objes.push( new Obje( this, name, this.gl.TRIANGLES, px, [], [], [] ) );
    }


}


GlView.prototype.addRectObje = function ( name, color, abd , xyz ){

    var [ a, b, d ] = abd;
    var [ x, y, z ] = xyz;

    var na = Math.ceil( a / d );
    var nb = Math.ceil( b / d );

    //console.log( 'addRectObje' );
    //console.log( na,nb );

/*
    var p = new Array( na+1 );
    for( i=0; i<na+1; i++){
        p[i] = new Array( nb+1 )
        for( j=0; j<nb+1; j++){
            p[i][j] = [ x + ( i/na - 0.5 ) * a,
                        y + ( j/nb - 0.5 ) * b,
                        z ];
        }
    }
*/

    var p = [];
    for( i=0; i<na+1; i++){
        p.push( Array(0) );
        for( j=0; j<nb+1; j++){
            p[i].push( [ x + ( i/na - 0.5 ) * a,
                         y + ( j/nb - 0.5 ) * b,
                         z                      ] );
        }
    }

    var pnt = [];

    for( i=0; i<na; i++){
        for( j=0; j<nb; j++){

            pnt.push( ...p[i  ][j  ]  );
            pnt.push( ...p[i+1][j  ]  );
            pnt.push( ...p[i  ][j+1]  );

            pnt.push( ...p[i  ][j+1]  );
            pnt.push( ...p[i+1][j  ]  );
            pnt.push( ...p[i+1][j+1]  );

        }
    }


    var Nmax = 20000;
    var NR = pnt.length / 9;
    var k = 0;
    while (NR > 0) {
        //console.log(NR);
        var Nx = Math.min( Nmax, NR );
        NR -= Nx;
        var px = Array( 9 * Nx );
        for (var i=0; i<9*Nx; i++){
            px[i] = pnt[k+i];
        }
        k += 9 * Nx
        this.objes.push( new Obje( this, name, this.gl.TRIANGLES, px, [], [], color ) );
    }

    //console.log( pnt.length );
    //console.log( 'addRectObje ZZ' );
/*
*/

}



GlView.prototype.addTriangleObje = function ( name, color, n , abc ){

    function ex( a, b, t ){
        return a.map( (v,i) => v + ( b[i] - v ) * t );
    }

    var A = abc.slice( 0, 3);
    var B = abc.slice( 3, 6);
    var C = abc.slice( 6, 9);
    var pnt = [];

    for( var i=0; i<n; i++){

        var P = ex( A, B, i     / n );
        var Q = ex( A, C, i     / n );
        var R = ex( A, B, (i+1) / n );
        var S = ex( A, C, (i+1) / n );

        for( var j=0; j<i; j++){
            pnt.push( ...ex( P, Q,  j    /  i    ) );
            pnt.push( ...ex( R, S, (j+1) / (i+1) ) );
            pnt.push( ...ex( P, Q, (j+1) /  i    ) );
        }

        for( var j=0; j<i+1; j++){
            pnt.push( ...( ( i == 0 ) ? P : ex( P, Q, j/i ) ) );
            pnt.push( ...ex( R, S,  j    / (i+1) ) );
            pnt.push( ...ex( R, S, (j+1) / (i+1) ) );
        }

    }

    this.objes.push( new Obje( this, name, this.gl.TRIANGLES, pnt, [], [], color ) );

}



