function CalcOrtho(matrix, left, right, bottom, top, near, far) {
    let rl = 1 / (right - left);
    let tb = 1 / (top - bottom);
    let nf = 1 / (near - far);//Games101与OpenGL NDC的手向性不同，前者Z朝向屏幕外
    let fn = 1 / (far - near);

    mat4.identity(matrix);
    //Games101正交投影矩阵
    matrix[0] = 2*rl;
    matrix[5] = 2*tb;
    matrix[10] = 2*nf;
    matrix[12] = -1*(left+right)*rl;
    matrix[13] = -1*(top+bottom)*tb;
    matrix[14] = -1*(near+far)*nf;

    //为了与OpenGL做兼容, 需要Z轴反向(即乘以一个Z轴反向的缩放矩阵)，此时far和near同时为正值, 需改写
    matrix[10] = -2*fn;
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
        // mat4.ortho的生成的投影矩阵是按照 z轴向屏幕里 来计算的，与此lab框架相反。
        // 因此在函数的参数里取 想要的zNear、zFar 的相反数
        // mat4.ortho(projectionMatrix,-100,100,-100,100,0,500)

        // 通过以下代码 将mvp变换后的坐标的z轴 取相反数，因为opengl 比较深度值按照近小远大的原则。
        CalcOrtho(projectionMatrix, -100,100,-80,80,0,1000);

        mat4.multiply(lightMVP, projectionMatrix, viewMatrix);
        mat4.multiply(lightMVP, lightMVP, modelMatrix);
        // console.log(lightMVP);
        return lightMVP;
    }
}
