import "./styles.css";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { ShadowMapViewer } from "three/examples/jsm/utils/ShadowMapViewer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./obj.vert";
import fragmentShader from "./obj.frag";
import shadowFragmentShader from "./shadow.frag";
import blendShader from "./blendShader.frag";
import blendShaderF from "./blendShader.vert";
import objFinalV from "./objfinal.vert";
import objFinalF from "./objfinal.frag";

let app = document.getElementById("app");

const blendMaterial = new THREE.ShaderMaterial({
  vertexShader: blendShaderF,
  fragmentShader: blendShader,
  uniforms: {
    texture2: { value: null },
    texture1: { value: null },
    iterations: { value: 0 }
  }
});
const blender = {
  quad: new THREE.Mesh(new THREE.PlaneBufferGeometry(), blendMaterial),
  cam: new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -0.5, 0.5),
  renderBuffer: new THREE.WebGLRenderTarget(app.clientWidth, app.clientHeight, {
    type: THREE.FloatType
  }),
  frontBuffer: new THREE.WebGLRenderTarget(app.clientWidth, app.clientHeight, {
    type: THREE.FloatType
  }),
  backBuffer: new THREE.WebGLRenderTarget(app.clientWidth, app.clientHeight, {
    type: THREE.FloatType
  }),
  iteration: 0,
  blenderScene: new THREE.Scene()
};
blender.blenderScene.add(blender.quad);

function createMaterial(color, light) {
  const uniforms = {
    uTime: {
      value: 0
    },
    uColor: {
      value: new THREE.Color(color)
    },
    uLightPos: {
      value: light.position
    },
    uDepthMap: {
      value: light.shadow.map.texture
    },
    uShadowCameraP: {
      value: light.shadow.camera.projectionMatrix
    },
    uShadowCameraV: {
      value: light.shadow.camera.matrixWorldInverse
    },
    uIntensity_0: {
      value: new THREE.Vector4(1, 0, 0, 0)
    }
  };
  console.log(light.shadow.camera.matrixWorldInverse);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms
  });

  const shadowMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: shadowFragmentShader,
    uniforms
    // side: THREE.BackSide
  });

  const finalMaterial = new THREE.ShaderMaterial({
    vertexShader: objFinalV,
    fragmentShader: objFinalF,
    uniforms: {
      screenSize: {
        value: new THREE.Vector2(app.clientWidth, app.clientHeight)
      },
      blendTexture: {
        value: null
      }
    }
  });
  return { material, shadowMaterial, finalMaterial };
}

const scene = new THREE.Scene();
new RGBELoader().load(
  "https://metazph.yixueyun.cn/metazph/threeImg/sky.hdr",
  function (texture) {
    alert("@");
    console.warn(scene.background);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.environment = texture;
    scene.background = texture;
  }
);
scene.background = new THREE.Color(0x555555);
const camera = new THREE.PerspectiveCamera(
  75,
  app.clientWidth / app.clientHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(app.clientWidth, app.clientHeight);
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.addEventListener("change", () => {
  blender.iteration = 0;
});
camera.position.set(25, 25, 25);

const light = new THREE.DirectionalLight(0xffffff, 1.0);
//　The light is directed from the light's position to the origin of the world coordinates.
light.position.set(-30, 40, 10);
scene.add(light);
const frustumSize = 100;
light.shadow.camera = new THREE.OrthographicCamera(
  -frustumSize / 2,
  frustumSize / 2,
  frustumSize / 2,
  -frustumSize / 2,
  1,
  1280
);
light.shadow.mapSize.x = 1024;
light.shadow.mapSize.y = 1024;
const pars = {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  format: THREE.RGBAFormat
};
light.shadow.map = new THREE.WebGLRenderTarget(
  light.shadow.mapSize.x,
  light.shadow.mapSize.y,
  pars
);
// Same position as LIGHT position.
light.shadow.camera.position.copy(light.position);
light.shadow.camera.lookAt(scene.position);
scene.add(light.shadow.camera);
// const helper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(helper);

const depthViewer = new ShadowMapViewer(light);
depthViewer.size.set(300, 300);

//物体
let mats1 = createMaterial(0xaaaaaa, light);
const geometry = new THREE.BoxGeometry(250, 1, 250);
const material = mats1.material;
const cube = new THREE.Mesh(geometry, material);
cube.userData.mat = mats1;
scene.add(cube);

const geometry3 = new THREE.BoxGeometry(100, 10, 10);
const material3 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube3 = new THREE.Mesh(geometry3, material3);
scene.add(cube3);
cube3.position.y = 10;

let mats2 = createMaterial(0xaa0000, light);
const geometry2 = new THREE.SphereGeometry(15, 20, 20); //new THREE.BoxGeometry(10, 5, 20);
const material2 = mats2.material;
const cube2 = new THREE.Mesh(geometry2, material2);
cube2.userData.mat = mats2;
cube2.position.y = 15;
scene.add(cube2);
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 1;
  cube3.position.x = Math.sin(time * 0.01) * 20;
  cube3.visible = false;
  for (var i = 0; i < 10; i++) {
    light.position.x = Math.random() * 15 + 20;
    light.position.y = Math.random() * 15 + 20;
    light.position.z = Math.random() * 15 + 20;
    light.lookAt(scene.position);

    light.shadow.camera.position.copy(light.position);
    light.shadow.camera.lookAt(scene.position);
    // update every frame
    cube.material = cube.userData.mat.shadowMaterial;
    cube2.material = cube2.userData.mat.shadowMaterial;
    renderer.setRenderTarget(light.shadow.map);
    renderer.render(scene, light.shadow.camera);
    renderer.setRenderTarget(null);
    cube.material = cube.userData.mat.material;
    cube2.material = cube2.userData.mat.material;
    blender.iteration += 1;

    renderer.setRenderTarget(blender.renderBuffer); //改 渲染到target中，
    renderer.render(scene, camera);

    blender.quad.material.uniforms.texture2.value =
      blender.renderBuffer.texture;
    blender.quad.material.uniforms.texture1.value = blender.frontBuffer.texture;
    blender.quad.material.uniforms.iterations.value = blender.iteration;

    // 把画面渲染到backBuffer中
    renderer.setRenderTarget(blender.backBuffer);
    renderer.render(blender.blenderScene, blender.cam);
    [blender.backBuffer, blender.frontBuffer] = [
      blender.frontBuffer,
      blender.backBuffer
    ];
  }
  //把混合叠加的阴影传入到每个物体的finalMaterial中
  //正式渲染
  let blendTexture = blender.backBuffer.texture;

  cube.userData.mat.finalMaterial.uniforms.blendTexture.value = blendTexture;
  cube2.userData.mat.finalMaterial.uniforms.blendTexture.value = blendTexture;
  cube.material = cube.userData.mat.finalMaterial;
  cube2.material = cube2.userData.mat.finalMaterial;

  cube3.visible = true;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  // depthViewer.render(renderer);
}

animate();

function resize() {
  camera.aspect = app.clientWidth / app.clientHeight;
  camera.updateProjectionMatrix();
  depthViewer.updateForWindowResize();
  renderer.setSize(app.clientWidth, app.clientHeight);
  blender.backBuffer.setSize(app.clientWidth, app.clientHeight);
  blender.frontBuffer.setSize(app.clientWidth, app.clientHeight);
  blender.renderBuffer.setSize(app.clientWidth, app.clientHeight);

  blender.cam.aspect = app.clientWidth / app.clientHeight;
  blender.cam.updateProjectionMatrix();
  cube.userData.mat.finalMaterial.uniforms.screenSize.value.set(
    app.clientWidth,
    app.clientHeight
  );
  cube2.userData.mat.finalMaterial.uniforms.screenSize.value.set(
    app.clientWidth,
    app.clientHeight
  );
  blender.iteration = 0;
}
window.addEventListener("resize", resize);
