import * as THREE from 'https://threejs.org/build/three.module.js';
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js';

import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js'; import { STLLoader } from 'https://threejs.org/examples/jsm/loaders/STLLoader.js';

import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://threejs.org/examples/jsm/postprocessing/RenderPass.js';
import { MaskPass, ClearMaskPass } from 'https://threejs.org/examples/jsm/postprocessing/MaskPass.js';
import { ShaderPass } from 'https://threejs.org/examples/jsm/postprocessing/ShaderPass.js';
import { BloomPass } from 'https://threejs.org/examples/jsm/postprocessing/BloomPass.js';
import { ClearPass } from 'https://threejs.org/examples/jsm/postprocessing/ClearPass.js';
import { CopyShader } from 'https://threejs.org/examples/jsm/shaders/CopyShader.js';
import { FXAAShader } from 'https://threejs.org/examples/jsm/shaders/FXAAShader.js';

var particleNetworkCount = 60;
var particleLineNetworkGroup, particleNetworkGroup, particleDataNetworkGroup, logoNetworkGroup;

let cameraNetwrok;
let sceneNetwork, rendererNetwork;
let canvasNetworkDom;


var frameNetworkCount = 238;
var nAngle = 0;

let particleCount = 300;
const r = 350;
const rHalf = r / 2;
var logoStrengthGroup, particleStrengthGroup;

let particlesData = [];
let positions, colors;
let particles;
let pointCloud;
let particlePositions;
let linesMesh;

let cameraStrength;
let sceneStrengthWire, rendererStrength, sceneBg;
let canvasStrengthDom;

let composer;

initThreeStrength("three-container");
initThreeNetwork("three-container");
window.addEventListener('resize', onWindowResize);
animate();


function initThreeStrength(id, width, height) {
  if (id == undefined) {
    canvasStrengthDom = document.body;
  }
  else
    canvasStrengthDom = document.getElementsByClassName(id)[1];

  if (width == undefined) {
    width = canvasStrengthDom.offsetWidth;
  }
  if (height == undefined) {
    height = canvasStrengthDom.offsetHeight;
  }
  //init camera
  const aspect = width / height;
  cameraStrength = new THREE.PerspectiveCamera(50, aspect, 100, 3000);
  cameraStrength.position.x = 0;
  cameraStrength.position.y = 0;
  cameraStrength.position.z = 500;
  //cameraStrength.layers.enable(BLOOM_LAYER);
  cameraStrength.lookAt(0, 0, 0);

  //init scene
  sceneStrengthWire = new THREE.Scene();
  //sceneStrengthColor = new THREE.Scene();
  //sceneStrength.background = new THREE.Color(0xf8f8f8);

  sceneBg = new THREE.Scene();
  sceneBg.background = new THREE.Color(0xf8f8f8);

  //init renderer
  rendererStrength = new THREE.WebGLRenderer({ antialias: true });
  rendererStrength.setPixelRatio(window.devicePixelRatio);
  rendererStrength.setSize(width, height);
  rendererStrength.autoClear = false;
  rendererStrength.shadowMap.enable = true;
  rendererStrength.shadowMap.type = THREE.PCFSoftShadowMap;
  rendererStrength.interpolateneMapping = THREE.ACESFilmicToneMapping;
  canvasStrengthDom.appendChild(rendererStrength.domElement);

  //init Group
  logoStrengthGroup = new THREE.Group();
  particleStrengthGroup = new THREE.Group();

  //init controler
  const controls = new OrbitControls(cameraStrength, rendererStrength.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.mouseButtons = {
    // LEFT: THREE.MOUSE.ROTATE,
    // MIDDLE: THREE.MOUSE.DOLLY,
    // RIGHT: THREE.MOUSE.PAN
  }
  //create logo model
  const stlLoader = new STLLoader();
  stlLoader.load(
    'https://uploads-ssl.webflow.com/61936e390cd7e0109be166bb/61d6a11e8797357e87d192d3_logo_svg.stl.txt',
    function (geometry) {
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.3,
          color: 0x1f1f1f,
        }));
      mesh.position.copy(new THREE.Vector3(-160, -40, 0));
      mesh.rotation.copy(
        new THREE.Euler(
          0 * THREE.MathUtils.DEG2RAD,
          0 * THREE.MathUtils.DEG2RAD,
          0 * THREE.MathUtils.DEG2RAD)
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = "logo_3d";
      mesh.scale.set(1, 1, 3);
      sceneStrengthWire.add(mesh);

      const meshWire = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.1,
          color: 0x1f1f1f,
          wireframe: true,
          wireframeLinewidth: 0.8,
          wireframeLinecap: "round"
        }));
      meshWire.position.copy(new THREE.Vector3(-160, -40, 0));
      meshWire.rotation.copy(
        new THREE.Euler(
          0 * THREE.MathUtils.DEG2RAD,
          0 * THREE.MathUtils.DEG2RAD,
          0 * THREE.MathUtils.DEG2RAD)
      );
      meshWire.castShadow = true;
      meshWire.receiveShadow = true;
      meshWire.name = "logo_3d_wire";
      meshWire.scale.set(1, 1, 3);
      sceneStrengthWire.add(meshWire);
    }
  );





  const segments = particleCount * particleCount;

  positions = new Float32Array(segments * 3);
  colors = new Float32Array(segments * 3);

  const pMaterial = new THREE.PointsMaterial({
    color: 0xafafaf,
    size: 5,
    blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: false
  });

  particles = new THREE.BufferGeometry();
  particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * r - r / 2;
    const y = Math.random() * r - r / 2;
    const z = Math.random() * r - r / 2;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    // add it to the geometry
    particlesData.push({
      velocity: new THREE.Vector3(- 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2),
      numConnections: 0
    });

  }

  particles.setDrawRange(0, particleCount);
  particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage));

  // create the particle system
  pointCloud = new THREE.Points(particles, pMaterial);
  particleStrengthGroup.add(pointCloud);


  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));

  geometry.computeBoundingSphere();

  geometry.setDrawRange(0, 0);

  const material = new THREE.LineBasicMaterial({
    transparent: true,
    opacity: 0.8,
    color: 0x3f3f3f
  });

  linesMesh = new THREE.LineSegments(geometry, material);
  linesMesh.visible = true;
  particleStrengthGroup.add(linesMesh);
  particleStrengthGroup.visible = true;


  //init composer      
  const clearPass = new ClearPass();
  const clearMaskPass = new ClearMaskPass();
  const maskPass = new MaskPass(sceneStrengthWire, cameraStrength);
  const bloomPass = new BloomPass();
  //maskPass.inverse = true;
  const renderPass = new RenderPass(particleStrengthGroup, cameraStrength);
  renderPass.clear = false;
  const renderBg = new RenderPass(sceneBg, cameraStrength);
  const renderWire = new RenderPass(sceneStrengthWire, cameraStrength);
  const outputPass = new ShaderPass(CopyShader);
  outputPass.renderToScreen = true;

  const fxaaPass = new ShaderPass(FXAAShader);
  const pixelRatio = rendererStrength.getPixelRatio();
  fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);

  const parameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBFormat,
    stencilBuffer: true
  };

  const renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);
  composer = new EffectComposer(rendererStrength, renderTarget);
  composer.addPass(clearPass);
  composer.addPass(renderBg);
  //composer.addPass(renderWire);
  composer.addPass(maskPass);
  composer.addPass(renderPass);
  //composer.addPass(bloomPass)
  composer.addPass(clearMaskPass);
  composer.addPass(fxaaPass);
  composer.addPass(outputPass);

  //create light
  const light = new THREE.DirectionalLight(0xf8f8f8, 0.8);
  sceneStrengthWire.add(light);

  function createCube(name, group, scene, pos, rot, width, height, depth, color, material = null) {
    if (material == null) {
      material = new THREE.MeshBasicMaterial({ color: color });
    }

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pos);
    mesh.rotation.copy(rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.geometry.computeVertexNormals(true);
    if (name != undefined) { mesh.name = name; }
    if (group != undefined) { group.add(mesh) }
    if (scene != undefined) { scene.add(mesh); }

    return mesh;
  }
}

function initThreeNetwork(id, width, height) {
  if (id == undefined) {
    canvasNetworkDom = document.body;
  }
  else
    canvasNetworkDom = document.getElementsByClassName(id)[0];

  if (width == undefined) {
    width = canvasNetworkDom.offsetWidth;
  }
  if (height == undefined) {
    height = canvasNetworkDom.offsetHeight;
  }
  //init camera
  const aspect = width / height;
  cameraNetwrok = new THREE.PerspectiveCamera(50, aspect, 300, 3000);
  //cameraNetwrok = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 3000 );
  cameraNetwrok.position.x = 0;
  cameraNetwrok.position.y = -300;
  cameraNetwrok.position.z = 1000;
  cameraNetwrok.position.x = -200;
  cameraNetwrok.lookAt(0, 0, 0);

  //Perspective
  //              camera.fov 50    -> 5
  //              far 3000  -> 10000
  //camera.position.x -200  -> 0 
  //camera.position.y -300  -> 0 
  //camera.position.z 1000  -> 8000 

  //init scene
  sceneNetwork = new THREE.Scene();
  sceneNetwork.background = new THREE.Color(0xf8f8f8);

  //init renderer
  rendererNetwork = new THREE.WebGLRenderer({ antialias: true });
  rendererNetwork.setPixelRatio(window.devicePixelRatio);
  rendererNetwork.setSize(width, height);
  rendererNetwork.autoClear = false;
  rendererNetwork.shadowMap.enable = true;
  rendererNetwork.shadowMap.type = THREE.PCFSoftShadowMap;
  rendererNetwork.interpolateneMapping = THREE.ACESFilmicToneMapping;
  canvasNetworkDom.appendChild(rendererNetwork.domElement);

  //init controler
  const controls = new OrbitControls(cameraNetwrok, rendererNetwork.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.mouseButtons = {
    // LEFT: THREE.MOUSE.ROTATE,
    // MIDDLE: THREE.MOUSE.DOLLY,
    // RIGHT: THREE.MOUSE.PAN
  }

  //init Group     
  particleLineNetworkGroup = new THREE.Group();
  particleNetworkGroup = new THREE.Group();
  particleDataNetworkGroup = new THREE.Group();
  logoNetworkGroup = new THREE.Group();

  //create particles
  for (var i = 0; i < particleNetworkCount; i++) {
    const rho = (Math.PI) * 6 * i / particleNetworkCount + (Math.random() * Math.PI / 6 - Math.PI / 12);
    const theta = (Math.PI) * 8 * i / particleNetworkCount + (Math.random() * Math.PI / 6 - Math.PI / 12);
    const r = (Math.random() * 200 + 300);

    const x = 0.8 * (r * Math.sin(rho) * Math.cos(theta));
    const y = 0.8 * (r * Math.sin(rho) * Math.sin(theta));
    const z = 0.8 * (r * Math.cos(rho));
    const size = Math.random() * 1.5 + 2;

    const particle = createSphere(
      undefined, particleNetworkGroup, undefined,
      new THREE.Vector3(x, y, z),
      new THREE.Euler(0, 0, 0),
      size, 0x8f8f8f,
    );
    const particleData = createSphere(
      undefined, particleDataNetworkGroup, undefined,
      new THREE.Vector3(x, y, z),
      new THREE.Euler(0, 0, 0),
      2, 0xafafaf,
    );
  }

  //create lines
  for (var i = 0; i < particleNetworkCount; i++) {
    var distanceList = [];
    for (var j = 0; j < particleNetworkCount; j++) {
      const v1 = particleNetworkGroup.children[i].position;
      const v2 = particleNetworkGroup.children[j].position;
      if (i != j)
        distanceList.push({ i: i, j: j, d: getDistance(v1, v2) });
    }
    distanceList.sort((a, b) => { return a.d - b.d; });
    for (var k = 2; k < 6 && k < distanceList.length; k++) {
      const v1 = particleNetworkGroup.children[distanceList[k].i].position;
      const v2 = particleNetworkGroup.children[distanceList[k].j].position;

      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(v1.x, v1.y, v1.z),
        new THREE.Vector3(v2.x, v2.y, v2.z)]);

      const material = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.2,
        color: 0xbfbfbf
      });

      const mesh = new THREE.Line(geo, material);
      particleLineNetworkGroup.add(mesh);
    }
  }

  //create logo model
  const stlLoader = new STLLoader();
  stlLoader.load(
    'https://uploads-ssl.webflow.com/61936e390cd7e0109be166bb/61d6a11e8797357e87d192d3_logo_svg.stl.txt',
    function (geometry) {
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.5,
          color: 0x1f1f1f,
        }));
      mesh.position.copy(new THREE.Vector3(-160, -40, 0));
      mesh.rotation.copy(
        new THREE.Euler(
          0 * THREE.MathUtils.DEG2RAD,
          0 * THREE.MathUtils.DEG2RAD,
          0 * THREE.MathUtils.DEG2RAD)
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = "logo_3d";
      mesh.scale.set(1, 1, 3);
      logoNetworkGroup.add(mesh);

      const meshWire = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.2,
          color: 0x1f1f1f,
          wireframe: true,
          wireframeLinewidth: 0.2,
          wireframeLinecap: "round"
        }));
      meshWire.position.copy(new THREE.Vector3(-160, -40, 0));
      meshWire.rotation.copy(
        new THREE.Euler(
          0 * THREE.MathUtils.DEG2RAD,
          0 * THREE.MathUtils.DEG2RAD,
          0 * THREE.MathUtils.DEG2RAD)
      );
      meshWire.castShadow = true;
      meshWire.receiveShadow = true;
      meshWire.name = "logo_3d_wire";
      meshWire.scale.set(1, 1, 3);
      logoNetworkGroup.add(meshWire);
      logoNetworkGroup.rotation.y = Math.PI / (18);
    }
  );

  //create light
  const light = new THREE.AmbientLight(0xf8f8f8, 1.0);
  sceneNetwork.add(light);

  //add group to scene
  sceneNetwork.add(particleNetworkGroup);
  sceneNetwork.add(particleDataNetworkGroup);
  sceneNetwork.add(particleLineNetworkGroup);
  sceneNetwork.add(logoNetworkGroup);

  /*
    Function methods
    getDistance({x,y,z}, {x,y,z}) => number
  */
  function getDistance(v1, v2) {
    const dX = v1.x - v2.x;
    const dY = v1.y - v2.y;
    const dZ = v1.z - v2.z;
    const distance = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
    const xCenter = (v1.x + v2.x) / 2;
    const yCenter = (v1.y + v2.y) / 2;

    if ((xCenter >= -160 && xCenter <= 160)
      && (yCenter >= -60 && yCenter <= 60))
      return distance * 2;
    return distance;
  }
  function createSphere(name, group, scene, pos, rot, radius, color, material = null) {
    if (material == null) {
      material = new THREE.MeshBasicMaterial({ color: color });
    }

    const geometry = new THREE.SphereGeometry(radius);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pos);
    mesh.rotation.copy(rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.geometry.computeVertexNormals(true);
    if (name != undefined) { mesh.name = name; }
    if (group != undefined) { group.add(mesh) }
    if (scene != undefined) { scene.add(mesh); }

    return mesh;
  }

}

function onWindowResize() {
  const width = canvasNetworkDom.clientWidth;
  const height = canvasNetworkDom.clientHeight

  cameraNetwrok.aspect = width / height;
  cameraNetwrok.updateProjectionMatrix();

  cameraStrength.aspect = width / height;
  cameraStrength.updateProjectionMatrix();

  rendererNetwork.setSize(width, height);
  rendererStrength.setSize(width, height);
}

function componentFromStr(numStr, percent) {
  var num = Math.max(0, parseInt(numStr, 10));
  return percent ?
    Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
}

function rgbToHex(rgb) {
  var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
  var result, r, g, b, hex = "";
  if ((result = rgbRegex.exec(rgb))) {
    r = componentFromStr(result[1], result[2]);
    g = componentFromStr(result[3], result[4]);
    b = componentFromStr(result[5], result[6]);

    hex = ((r << 16) + (g << 8) + b);
  }
  return hex;
}

function animate(time) {
  requestAnimationFrame(animate);
  rendererNetwork.clear();
  rendererNetwork.render(sceneNetwork, cameraNetwrok);
  TWEEN.update(time);
  rendererStrength.clear();
  //rendererStrength.render(sceneBg, cameraStrength);
  composer.render();
  rendererStrength.clearDepth();
  rendererStrength.render(sceneStrengthWire, cameraStrength);
  //rendererStrength.render(sceneStrengthColor, cameraStrength);

  const bgColor = rgbToHex(document.body.getElementsByClassName("bottom-section-1")[0].style.backgroundColor);
  const txColor = bgColor == 0x1f1f1f?0xf8f8f8:0x1f1f1f;
  
  sceneNetwork.background = new THREE.Color(bgColor);
  logoNetworkGroup.children[0].material.color.setHex(txColor);
  logoNetworkGroup.children[1].material.color.setHex(txColor);

  sceneBg.background = new THREE.Color(bgColor);
  linesMesh.material.color.setHex(txColor);

  let vertexpos = 0;
  let colorpos = 0;
  let numConnected = 0;

  for (let i = 0; i < particleCount; i++)
    particlesData[i].numConnections = 0;

  for (let i = 0; i < particleCount; i++) {

    // get the particle
    const particleData = particlesData[i];

    particlePositions[i * 3] += particleData.velocity.x;
    particlePositions[i * 3 + 1] += particleData.velocity.y;
    particlePositions[i * 3 + 2] += particleData.velocity.z;

    if (particlePositions[i * 3 + 1] < - rHalf || particlePositions[i * 3 + 1] > rHalf)
      particleData.velocity.y = - particleData.velocity.y;

    if (particlePositions[i * 3] < - rHalf || particlePositions[i * 3] > rHalf)
      particleData.velocity.x = - particleData.velocity.x;

    if (particlePositions[i * 3 + 2] < - rHalf || particlePositions[i * 3 + 2] > rHalf)
      particleData.velocity.z = - particleData.velocity.z;

    if (particleData.numConnections >= 300)
      continue;

    // Check collision
    for (let j = i + 1; j < particleCount; j++) {

      const particleDataB = particlesData[j];
      if (particleDataB.numConnections >= 300)
        continue;

      const dx = particlePositions[i * 3] - particlePositions[j * 3];
      const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
      const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 150) {

        particleData.numConnections++;
        particleDataB.numConnections++;

        const alpha = 1.0 - dist / 5;

        positions[vertexpos++] = particlePositions[i * 3];
        positions[vertexpos++] = particlePositions[i * 3 + 1];
        positions[vertexpos++] = particlePositions[i * 3 + 2];

        positions[vertexpos++] = particlePositions[j * 3];
        positions[vertexpos++] = particlePositions[j * 3 + 1];
        positions[vertexpos++] = particlePositions[j * 3 + 2];

        colors[colorpos++] = alpha;
        colors[colorpos++] = alpha;
        colors[colorpos++] = alpha;

        colors[colorpos++] = alpha;
        colors[colorpos++] = alpha;
        colors[colorpos++] = alpha;

        numConnected++;

      }

    }

  }

  linesMesh.geometry.setDrawRange(0, numConnected * 2);
  linesMesh.geometry.attributes.position.needsUpdate = true;
  linesMesh.geometry.attributes.color.needsUpdate = true;

  pointCloud.geometry.attributes.position.needsUpdate = true;

  const t = Date.now() * 0.001;

  particleStrengthGroup.rotation.y = t * 0.1;


  frameNetworkCount++;
  if (frameNetworkCount > 240) {
    //play animation for 2 sec on every 4 sec
    frameNetworkCount = 0;

    const len = particleDataNetworkGroup.children.length;
    for (var i = 0; i < len; i++) {
      const p = particleDataNetworkGroup.children[i].position;
      const pNext = particleDataNetworkGroup.children[(i + 1) % len].position;
      const coords = { i: i, x: p.x, y: p.y, z: p.z };

      const newX = pNext.x;
      const newY = pNext.y;
      const newZ = pNext.z;

      const tween = new TWEEN.Tween(coords)
        .to({ i: i, x: newX, y: newY, z: newZ }, 2000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          particleDataNetworkGroup.children[coords.i].position.x = coords.x;
          particleDataNetworkGroup.children[coords.i].position.y = coords.y;
          particleDataNetworkGroup.children[coords.i].position.z = coords.z;
        })
        .start();
    }
  }

  nAngle += (Math.PI / 180);
  particleNetworkGroup.rotation.x = particleNetworkGroup.rotation.x + (Math.PI / (180 * 5)) * Math.sin(nAngle / 50);
  particleNetworkGroup.rotation.z = particleNetworkGroup.rotation.z + (Math.PI / (180 * 5)) * Math.sin(nAngle / 50);

  particleDataNetworkGroup.rotation.x = particleDataNetworkGroup.rotation.x + (Math.PI / (180 * 5)) * Math.sin(nAngle / 50);
  particleDataNetworkGroup.rotation.z = particleDataNetworkGroup.rotation.z + (Math.PI / (180 * 5)) * Math.sin(nAngle / 50);

  particleLineNetworkGroup.rotation.x = particleLineNetworkGroup.rotation.x + (Math.PI / (180 * 5)) * Math.sin(nAngle / 50);
  particleLineNetworkGroup.rotation.z = particleLineNetworkGroup.rotation.z + (Math.PI / (180 * 5)) * Math.sin(nAngle / 50);
}