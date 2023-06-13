function CalcOrtho(matrix, left, right, bottom, top, near, far) {
    let rl = 1 / (right - left);
    let tb = 1 / (top - bottom);
    let fn = 1 / (far - near);

    mat4.identity(matrix);
    // matrix[0] = 2*rl;
    // matrix[5] = 2*tb;
    // matrix[10] = 2*fn;
    // matrix[12] = -1*(left+right)*rl;
    // matrix[13] = -1*(top+bottom)*tb;
    // matrix[14] = -1*(near+far)*fn;
    matrix[0] = 1/right;
    matrix[5] = 1/top;
    matrix[10] = 2*fn;
    matrix[14] = -1*(near+far)*fn;
    return matrix;
}
class DirectionalLight {

    constructor(lightIntensity, lightColor, lightPos, focalPoint, lightUp, hasShadowMap, gl) {
        this.mesh = Mesh.cube(setTransform(0, 0, 0, 0.2, 0.2, 0.2, 0));
        this.mat = new EmissiveMaterial(lightIntensity, lightColor);
        this.lightPos = lightPos;
        this.focalPoint = focalPoint;
        this.lightUp = lightUp

        this.hasShadowMap = hasShadowMap;
        this.fbo = new FBO(gl);
        if (!this.fbo) {
            console.log("无法设置帧缓冲区对象");
            return;
        }
    }

    CalcLightMVP(translate, scale) {
        let lightMVP = mat4.create();
        let modelMatrix = mat4.create();
        let viewMatrix = mat4.create();
        let projectionMatrix = mat4.create();

        // Model transform
        mat4.identity(modelMatrix);
		mat4.translate(modelMatrix, modelMatrix, translate);
		mat4.scale(modelMatrix, modelMatrix, scale);

        // View transform
        mat4.identity(viewMatrix);
		mat4.lookAt(viewMatrix, this.lightPos, this.focalPoint, this.lightUp);
    
        // Projection transform
        CalcOrtho(projectionMatrix, -100,100,-80,80,0,-1000);

        mat4.multiply(lightMVP, projectionMatrix, viewMatrix);
        mat4.multiply(lightMVP, lightMVP, modelMatrix);
        // console.log(lightMVP);
        return lightMVP;
    }
}
