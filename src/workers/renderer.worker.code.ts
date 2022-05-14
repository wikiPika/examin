import {Sky} from "three/examples/jsm/objects/Sky";
import {Water} from "three/examples/jsm/objects/Water";
import {
    PerspectiveCamera,
    PlaneGeometry,
    PMREMGenerator,
    RepeatWrapping,
    Scene,
    TextureLoader,
    Vector3,
    WebGLRenderer
} from "three";

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let sky: Sky;
let sun: Vector3;
let water: Water;

export function renderOcean(canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number, dpr: number) {
    scene = buildScene();
    camera = buildCamera();
    renderer = buildRenderer();
    sky = buildSky();
    sun = buildSun();
    water = buildWater();
    animate();

    function buildScene() {
        return new Scene();
    }

    function buildCamera() {
        const camera = new PerspectiveCamera(55, width / height, 1, 20000);
        camera.position.set(30, 30, 100);
        return camera;
    }

    function buildRenderer() {
        const renderer = new WebGLRenderer({
            canvas: canvas
        });
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        return renderer;
    }

    function buildSky() {
        const sky = new Sky();
        sky.scale.setScalar(10000);
        scene.add(sky);
        return sky;
    }

    function buildSun() {
        const pmremGenerator = new PMREMGenerator(renderer);
        const sun = new Vector3();

        // Defining the x, y and z value for our 3D Vector
        const theta = Math.PI * (0.49 - 0.5);
        const phi = 2 * Math.PI * (0.205 - 0.5);
        sun.x = Math.cos(phi);
        sun.y = Math.sin(phi) * Math.sin(theta);
        sun.z = Math.sin(phi) * Math.cos(theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        scene.environment = pmremGenerator.fromScene(scene).texture;
        return sun;
    }

    function buildWater() {
        const waterGeometry = new PlaneGeometry(10000, 10000);
        const water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg', function ( texture ) {
                    texture.wrapS = texture.wrapT = RepeatWrapping;
                }),
                alpha: 1.0,
                sunDirection: new Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: scene.fog !== undefined
            }
        );
        water.rotation.x =- Math.PI / 2;
        scene.add(water);
        return water;
    }

    function animate() {
        requestAnimationFrame(animate);

        water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

        renderer.render(scene, camera);
    }
}

export function resize(width: number, height: number) {
    if(!(scene && camera && renderer && sky && sun && water))
        return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}