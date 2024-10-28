import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import sunTex from '../images/2k_sun.jpg';
import earthTex from '../images/2k_earth.jpg';
import moonTex from '../images/2k_moon.jpg';
import skyBox from '../images/2k_stars.jpg';
import marsTex from '../images/2k_mars.jpg';

export class main {
    init() {
        this.marsDistance = 228000;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1000, this.marsDistance * 20);
        this.camera.position.z = -100000;
        this.clock = new THREE.Clock();

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xEEEEEE);
        this.renderer.shadowMap.enabled = true;

        document.body.appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

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
        var geometry = new THREE.SphereGeometry(this.marsDistance * 9 + 10000, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(skyBox),
            side: THREE.DoubleSide
        });
        this.skysphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.skysphere);

        this.createPlanet('earth', earthTex, 149.6 * 1000, 12756 / 2);
        this.createMoon(20 * 1000, 3475 / 2);
        this.createPlanet('mars', marsTex, this.marsDistance, 6792 / 2);
        this.createSun();
    }

    createPlanet(name, texture_name, distance, radius) {
        var geometry = new THREE.SphereGeometry(radius, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(texture_name),
            metalness: 0
        });

        let planet = new THREE.Mesh(geometry, material);
        planet.distance = distance;
        planet.castShadow = true;
        planet.receiveShadow = true;

        let system = new THREE.Object3D();
        system.add(planet);
        this.scene.add(system);
        this[name] = planet;
    }

    createMoon(distance, radius) {
        var geometry = new THREE.SphereGeometry(radius, 32, 32);
        var material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(moonTex),
            metalness: 0
        });

        this.moon = new THREE.Mesh(geometry, material);
        this.moon.distance = distance;
        this.moon.castShadow = true;
        this.moon.receiveShadow = true;

        this.earth.add(this.moon);
        this.moon.position.x = this.moon.distance;
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
        var me = this;
        requestAnimationFrame(function(){me.animate.call(me)});
        this.renderer.render(this.scene, this.camera);
        let tick = this.clock.getElapsedTime() / 10;

        [this.earth].forEach(planet => {
            planet.parent.position.z = Math.sin(tick) * planet.distance;
            planet.parent.position.x = Math.cos(tick) * planet.distance;
            planet.rotation.y = -tick * 30;
        });
        [this.mars].forEach(planet => {
            planet.parent.position.z = Math.sin(tick / 2) * planet.distance;
            planet.parent.position.x = Math.cos(tick / 2) * planet.distance;
            planet.rotation.y = -tick * 30;
        });
        this.controls.update();
    }
}
const module = new main ();
module.init();