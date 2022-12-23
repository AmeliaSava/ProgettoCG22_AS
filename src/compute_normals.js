function vec3add( v3,i,rs){
	v3[i*3] 	+= rs[0];
	v3[i*3+1] += rs[1];
	v3[i*3+2] += rs[2];
}

function vec3eq( v3,i,rs){
	v3 [i*3] 	  = rs [0];
	v3 [i*3+1]  = rs [1];
	v3 [i*3+2]  = rs [2];
}
function ComputeNormals(obj) {
	obj.name += "_Normals";

	var nv = obj.vertices.length/3;
	var nt = obj.triangleIndices.length/ 3;
	
	obj.normals = new Float32Array(nv*3);
	var star_size = new Float32Array(nv);
	
	for( var i = 0 ; i  < nv; ++i){
		star_size[i] = 0;
		obj.normals[3*i] = 0.0;
		obj.normals[3*i+1] = 0.0;
		obj.normals[3*i+2] = 0.0;
	}
	
	for( var i = 0 ; i  < nt; ++i){
		var i_v  = [ obj.triangleIndices[i*3+0], 	obj.triangleIndices[i*3+1], 	obj.triangleIndices[i*3+2]];
		
		var p0 = [obj.vertices[3*i_v[0]+0],obj.vertices[3*i_v[0]+1],obj.vertices[3*i_v[0]+2]];
		var p1 = [obj.vertices[3*i_v[1]+0],obj.vertices[3*i_v[1]+1],obj.vertices[3*i_v[1]+2]];
		var p2 = [obj.vertices[3*i_v[2]+0],obj.vertices[3*i_v[2]+1],obj.vertices[3*i_v[2]+2]];
	
		var p01 = glMatrix.vec3.sub(glMatrix.vec3.create(),p1,p0);
		var p02 = glMatrix.vec3.sub(glMatrix.vec3.create(),p2,p0);
		var n = glMatrix.vec3.cross(glMatrix.vec3.create(),p02,p01);
		
		n = glMatrix.vec3.normalize(n,n);
		
		vec3add(obj.normals,i_v[0],n);
		vec3add(obj.normals,i_v[1],n);
		vec3add(obj.normals,i_v[2],n);
	
		star_size[i_v[0]] += 1;
		star_size[i_v[1]] += 1;
		star_size[i_v[2]] += 1;
	}
	for( var i = 0 ; i  < nv; ++i){
		var n = [ obj.normals[ 3*i],	obj.normals[ 3*i+1],	obj.normals[ 3*i+2] ];

		glMatrix.vec3.mul(n,n,[1.0/star_size[i],1.0/star_size[i],1.0/star_size[i]]);
		n = glMatrix.vec3.normalize(n,n);
		
		vec3eq(obj.normals,i,[-n[0],-n[1],-n[2]]);
	}
	
	obj.numVertices = nv;
	obj.numTriangles = obj.triangleIndices.length/3;
	return obj;
};