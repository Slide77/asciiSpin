import * as THREE from 'three'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import{RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import{OutputPass} from 'three/examples/jsm/postprocessing/OutputPass'
import{ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight, 0.01,10000)
const renderer = new THREE.WebGLRenderer()
document.body.appendChild(renderer.domElement)
renderer.setSize(window.innerWidth,window.innerHeight)
renderer.pixelRatio = 3
window.addEventListener('resize',()=>{
    renderer.setSize(window.innerWidth,window.innerHeight)
    camera.aspect = window.innerWidth/window.innerHeight
    camera.updateProjectionMatrix()
})
document.body.style.margin = 0

/*const geometry = new THREE.TorusKnotGeometry()
const material = new THREE.MeshStandardMaterial({color:0xffffff})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)*/


let loadedModel
const loader = new OBJLoader()
let name = 2
function next(){
    name++
    console.log(name)
}

document.addEventListener('keydown',function(event){
    if (event.code == 'Space')
    next()
})
loader.load(`/models/${name}.obj`, function( model ){
   
    model.scale.set(2,2,2)
   
    scene.add( model ) 

    

    model.rotation.x += -90
    model.position.y -=0
    model.position.z -=30
    loadedModel = model
})



camera.position.z = 5

const dome = new THREE.AmbientLight(0xffffff, 0.2)
scene.add(dome)

const sun = new THREE.DirectionalLight()
sun.position.set(1,1,1)
scene.add(sun)

new OrbitControls(camera, renderer.domElement)

const composer = new EffectComposer(renderer)

const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const textureLoader = new THREE.TextureLoader()
const asciiTexture = textureLoader.load('/ascii3.png')

const asciiShader={
    uniforms:{
        'amount':{value:150},
        'tDiffuse':{value:null},
        'asciiTex':{value: asciiTexture},
        'aspect':{value: camera.aspect},
        'debug':{value:0}
    },
    vertexShader: `
        varying vec2 vUv;
        void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform int amount;
        uniform sampler2D tDiffuse;
        uniform sampler2D asciiTex;
        uniform float aspect;
        void main(){
            vec2 grid_uv = round(vUv * float(amount)) / float(amount);
            vec4 tex = texture2D(tDiffuse, grid_uv);

            int charIndex = 0;

            float g = (tex.r + tex.g + tex.b) / 3.0;
            if(g > 0.30) charIndex = 16;
            else if (g>0.36) charIndex = 15;
            else if (g>0.34) charIndex = 14;
            else if (g>0.32) charIndex = 13;
            else if (g>0.30) charIndex = 12;
            else if (g>0.28) charIndex = 11;
            else if (g>0.26) charIndex = 10;
            else if (g>0.24) charIndex = 9;
            else if (g>0.22) charIndex = 8;
            else if (g>0.20) charIndex = 7;
            else if (g>0.18) charIndex = 6;
            else if (g>0.16) charIndex = 5;
            else if (g>0.14) charIndex = 4;
            else if (g>0.12) charIndex = 3;
            else if (g>0.10) charIndex = 2;
            else if (g>0.08) charIndex = 1;
            
            
            float div = 17.25;
            float x = fract(vUv.x * float(amount)) / div + float(charIndex) / div;
            float y = fract(vUv.y * float(amount) / aspect);
            vec4 ascii_tex = texture2D(asciiTex, vec2(x,y));
            

            gl_FragColor = ascii_tex;
        }
    `
}

const asciiPass = new ShaderPass( asciiShader )
composer.addPass(asciiPass)

const outputPass = new OutputPass()
composer.addPass(outputPass)


function animate(){
    requestAnimationFrame(animate)
    
    
    if(loadedModel){
        loadedModel.rotation.z += 5*(Math.PI/180)//кручение модели по z
        
        
        //console.log(loadedModel.rotation.z)
    }
    
    //console.log("test")
    //console.log(uniforms.debug.value)
    renderer.render(scene,camera)
    composer.render()
}


animate()
