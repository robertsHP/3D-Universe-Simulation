import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import sunTex from './2K_sun.jpg';
import earthTex from './2K_earth.jpg';
import marsTex from './2K_mars.jpg';
import moonTex from './2K_moon.jpg';
import starsTex from './2K_stars.jpg';
// import { PhysicsController } from './physics';
export class main {
    async init() {
        this.marsDistance = 227940;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1000, this.marsDistance * 20);
        this.camera.position.z = -100000;
        
        this.clock = new THREE.Clock();

        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xEEEEEE);
        renderer.shadowMap.enabled = true;
        this.renderer = renderer;
        document.body.appendChild(renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        var gui = new dat.GUI({name: 'My GUI'});
        gui.add({
            add: () => {
                const planet = this.createPlanet('earth', earthTex, 0, 6000);                
                const vector = new THREE.Vector3(0, 0, -1);
                vector.applyQuaternion(this.camera.quaternion);
                const cameraPos = this.camera.position.clone();
                const newPos = cameraPos.addScaledVector(vector, 24000);
                planet.position.copy(newPos);
                // const body = this.physicsCtrl.createPlanet(planet, 6000, 40, planet.position, planet.quaternion);
                // this.physicsCtrl.applyImpulse(body, vector.multiplyScalar(100000));
        }}, 'add');
        // this.physicsCtrl = new PhysicsController();
        // await this.physicsCtrl.init();

        this.setupEvents();
        this.createWorld();
        this.createLights();
        this.animate();
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createWorld() {
  
        this.createPlanet('earth');
        this.createMoon('moon')
        this.createSun();

        var geometry = new THREE.SphereGeometry(this.marsDistance * 9 + 10000, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(starsTex),
            side: THREE.DoubleSide
        });
        this.skysphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.skysphere);
    }

    createPlanet(name, texture_name, distance, radius) {
        var geometry = new THREE.SphereGeometry(radius, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(texture_name),
            metalness: 0
        });

        let planet = new THREE.Mesh(geometry, material);
        let system = new THREE.Object3D();
        system.add(planet);
        this.scene.add(system);
        planet.castShadow = true;
        planet.receiveShadow = true;
        return system;
    }

    createMoon(name, texture_name, distance, radius, system) {

    }

    createSun() {
        var geometry = new THREE.SphereGeometry(69700 / 2, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            emissive: 0xEEEE99,
            emissiveIntensity: 0.8,
            map: new THREE.TextureLoader().load(sunTex)
        });
        this.sun = new THREE.Mesh(geometry, material);
        this.scene.add(this.sun);
        // const body = this.physicsCtrl.createPlanet(this.sun, 69700 / 2, 10000000, this.sun.position, this.sun.quaternion);
    }

    createLights() {
        var sunLight = new THREE.PointLight(0xffffff, 1, this.marsDistance * 20, 1);
        this.scene.add(new THREE.AmbientLight(0x404040));
        this.scene.add(sunLight);

        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.near = this.camera.near;
        sunLight.shadow.camera.far = this.camera.far;
  }

    animate() {
        this.controls.update();
        requestAnimationFrame(() => this.animate());
        // this.physicsCtrl.animate(this.clock.getDelta());
        this.renderer.render(this.scene, this.camera);
    }
}
const module = new main();
module.init();
