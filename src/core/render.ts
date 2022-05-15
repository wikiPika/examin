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
    WebGLRenderer,
    GridHelper,
    SphereGeometry,
    EdgesGeometry,
    BufferGeometry,
    LineDashedMaterial,
    LineBasicMaterial,
    LineSegments,
    Line,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    Color
} from "three";

let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let stop: boolean = false;

//uses three.js to render an ocean with sun
//meshes and textures used to emulate water
//offscreen canvas used to increase performance

//render an open ocean
export function renderOcean(canvas: HTMLCanvasElement, width: number, height: number, dpr: number) {
    scene = buildScene();
    camera = buildOceanCamera();
    renderer = buildRenderer(canvas, width, height, dpr);
    const sky = buildSky(); //build skybox
    buildSun(); //build sun, a point of light
    const water = buildWater(); //build water and add textures
    animate();

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
                }), //load textures for water which it give it that realistic look
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

    function buildOceanCamera() {
        const camera = new PerspectiveCamera(55, width / height, 1, 20000);
        camera.position.set(30, 30, 100);
        return camera;
    }

    function animate() {
        if(stop) {
            stop = false;
            return;
        }

        requestAnimationFrame(animate);

        water.material.uniforms[ 'time' ].value += 1.0 / 60.0; //create waves

        renderer.render(scene, camera);
    }
}

//render space scene
export function renderSpace(canvas: HTMLCanvasElement, width: number, height: number, dpr: number) {
    scene = buildScene();
    camera = buildSpaceCamera(); //different cameras due to different positions and rotations
    renderer = buildRenderer(canvas, width, height, dpr);
    buildGrid(); //build the grid that will be below the planet
    const planet = buildPlanet(); //build the planet and the line connecting its poles
    const moon = buildMoon(); //build the moon
    buildStars(); //build the stars, a random collection of spheres spread around the canvas
    animate(); //finally, animate

    function buildSpaceCamera() {
        camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(-1, 3, 5);
        camera.rotation.set(-0.4, 0, 0);
        return camera;
    }

    function buildGrid() {
        const grid = new GridHelper(10, 10, '#c0c0c0', '#c0c0c0');
        scene.add(grid);
    }

    function buildPlanet() {
        const geometry = new SphereGeometry(5, 20, 20);
        const lines = new EdgesGeometry(geometry);

        const material = new LineBasicMaterial({color: '#0B7CFA', linewidth: 2});
        const sphere = new LineSegments(lines, material);
        sphere.position.set(5, -1, -5);

        const linePoints = [
            new Vector3(5, 5.5, -5),
            new Vector3(5, -8.5, -5)
        ]
        const geo = new BufferGeometry().setFromPoints(linePoints);
        const line = new Line(geo, new LineDashedMaterial({color: '#c0c0c0'}));
        scene.add(sphere, line);
        return sphere;
    }

    function buildMoon() {
        const moonGeo = new EdgesGeometry(
            new SphereGeometry(1, 20, 20)
        );
        const moonMat = new LineBasicMaterial({linewidth: 1, color: '#8b8b8b'});
        const moon = new LineSegments(moonGeo, moonMat);
        moon.rotation.x = 0.3;
        scene.add(moon);
        return moon;
    }

    function buildStars() {
        let stars : Object3D[] = [];
        for (let i = 0; i < 200; i++) {
            const star = new SphereGeometry(0.01, 20, 20);
            const mat = new MeshBasicMaterial();
            mat.color = new Color("#F4E98C");
            const mesh = new Mesh(star, mat);
            mesh.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
            stars.push(mesh);
        }
        scene.add(...stars);
    }

    function rotate() {
        planet.rotation.y -= 0.0005;
        moon.rotation.y -= 0.005;
    }

    function orbit() {
        const date = Date.now() * 0.0002;
        moon.position.set(
            Math.cos(date) * 7 + 2,
            -1 * Math.cos(date) * 2,
            Math.sin(date) * 7
        );
    }

    function animate() {
        if(stop) {
            stop = false;
            return;
        }

        requestAnimationFrame(animate);

        orbit();
        rotate();

        renderer.render(scene, camera);
    }
}

//resize function to update camera aspect ratio and canvas size
export function resize(width: number, height: number) {
    if(!(scene && camera && renderer))
        return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}

function buildScene() {
    return new Scene();
}

function buildRenderer(canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number, dpr: number) {
    const renderer = new WebGLRenderer({
        canvas: canvas
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    return renderer;
}
