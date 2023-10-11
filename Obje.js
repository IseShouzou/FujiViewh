

//****************************************
// 
//        Obje
// 
//****************************************

function Obje( glview, name, kind, pnt, nor, idx, clr){

    this.glview = glview;
    this.name   = name;
    this.kind   = kind;

    this.shadow = false;

    if ( nor.length == 0 ){
        var nor = pnt.slice();
        for ( var i=0; i<pnt.length ; i+=9 ){
            var a = [ pnt[i+3] -  pnt[i  ],
                      pnt[i+4] -  pnt[i+1], 
                      pnt[i+5] -  pnt[i+2] ] ;
            var b = [ pnt[i+6] -  pnt[i  ],
                      pnt[i+7] -  pnt[i+1], 
                      pnt[i+8] -  pnt[i+2] ] ;
            var v = normalize( cross( a, b ) );
            [ nor[i  ], nor[i+1], nor[i+2] ] = [ v[0], v[1], v[2] ];
            [ nor[i+3], nor[i+4], nor[i+5] ] = [ v[0], v[1], v[2] ];
            [ nor[i+6], nor[i+7], nor[i+8] ] = [ v[0], v[1], v[2] ];
        }
    }

    if ( idx.length == 0 ){
        var idx = Array( pnt.length / 3);
        for ( var i=0; i<pnt.length/3 ; i++ ){
            idx[i] = i;
        }
    }

    if ( clr.length == 0 ){
        this.ambient = [ 0.2, 0.0, 0.0, 1.0 ];
        this.diffuse = [ 0.5, 0.0, 0.0, 1.0 ];
        this.specula = [ 0.5, 0.5, 0.5, 1.0 ];
        this.shine   = 5.0;
    }else{
        this.ambient = [ clr[ 0], clr[ 1], clr[ 2], clr[ 3] ];
        this.diffuse = [ clr[ 4], clr[ 5], clr[ 6], clr[ 7] ];
        this.specula = [ clr[ 8], clr[ 9], clr[10], clr[11] ];
        this.shine   = clr[12];
    }


    this.nElt = idx.length;
    this.posiMat = identity();

    var gl = this.glview.gl;

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pnt), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nor), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(idx), gl.STATIC_DRAW);

    gl.bindVertexArray(null);


    this.MinMax = [ [ pnt[0], pnt[1], pnt[2], 1.0 ], [ pnt[0], pnt[1], pnt[2], 1.0 ] ]
    for ( var i=0; i<pnt.length ; i+=3 ){
        for ( var j=0; j<3 ; j++ ){
            if ( pnt[i+j] < this.MinMax[0][j] ) this.MinMax[0][j] = pnt[i+j];
            if ( pnt[i+j] > this.MinMax[1][j] ) this.MinMax[1][j] = pnt[i+j];
        }
    }

}


Obje.prototype.draw = function (  clr ){

    var gl = this.glview.gl;

    var xambient;
    var xdiffuse;
    var xspecula;
    var xshine;

    if ( clr == null ){
        xambient = this.ambient;
        xdiffuse = this.diffuse;
        xspecula = this.specula;
        xshine   = this.shine;
    }else{
        xambient = [ clr[ 0], clr[ 1], clr[ 2], clr[ 3] ];
        xdiffuse = [ clr[ 4], clr[ 5], clr[ 6], clr[ 7] ];
        xspecula = [ clr[ 8], clr[ 9], clr[10], clr[11] ];
        xshine   =   clr[12];
    }



    if ( this.glview.currentProgram == 0 ){

        gl.uniformMatrix4fv( this.glview.positionalMatrixLoc0, true, this.posiMat );

    }else if( this.glview.currentProgram == 1 ){

        gl.uniformMatrix4fv( this.glview.positionalMatrixLoc1, true, this.posiMat );

        gl.uniform4fv( this.glview.ambientLoc1, xambient );
        gl.uniform4fv( this.glview.diffuseLoc1, xdiffuse );
        gl.uniform4fv( this.glview.speculaLoc1, xspecula );
        gl.uniform1f ( this.glview.shineLoc1,   xshine   );

    }


    gl.bindVertexArray(this.vao);
    gl.drawElements( this.kind, this.nElt, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);


}

Obje.prototype.calcMinMax = function( looAtMat ){

    var mm = this.MinMax;
    var mat = productMat( looAtMat, this.posiMat );
    var xMinMax = [ [ 0.0, 0.0, 0.0, 1.0 ], [ 0.0, 0.0, 0.0, 1.0 ] ];
    for(var i=0;i<8;i++) {
        var xyz = productMV( mat,
                             Array( mm[ i                 % 2 ][0],
                                    mm[ Math.floor( i/2 ) % 2 ][1],
                                    mm[ Math.floor( i/4 ) % 2 ][2],
                                    1.0 ) );
        if(i==0) {
            for(var j=0;j<3;j++) {
                xMinMax[0][j] = xyz[j];
                xMinMax[1][j] = xyz[j];
            }
        }else{
            for(var j=0;j<3;j++) {
                if( xyz[j] < xMinMax[0][j] ) xMinMax[0][j] = xyz[j];
                if( xyz[j] > xMinMax[1][j] ) xMinMax[1][j] = xyz[j];
            }
        }
    }
    return xMinMax;
}





