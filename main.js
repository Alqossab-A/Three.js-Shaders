import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


const _VS = `

varying vec3 v_Normal;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_Normal = normal;
}
`;

const _FS = `

uniform vec3 sphereColour;

varying vec3 v_Normal;

void main() {
    // gl_FragColor = vec4(v_Normal, 1.0);
    gl_FragColor = vec4(sphereColour, 1.0);
}
`


class BasicWorldDemo {
    constructor() {
        this._Initialize();
    }

    _Initialize() {
        this._threejs = new THREE.WebGLRenderer();
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this._threejs.domElement);

        window.addEventListener(
            'resize',
            () => {
                this._OnWindowResize();
            },
            false
        );

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(75, 20, 0);

        this._scene = new THREE.Scene();

        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(100, 100, 100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.01;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 1.0;
        light.shadow.camera.far = 500;
        light.shadow.camera.left = 200;
        light.shadow.camera.right = -200;
        light.shadow.camera.top = 200;
        light.shadow.camera.bottom = -200;
        this._scene.add(light);

        light = new THREE.AmbientLight(0x404040);
        this._scene.add(light);

        const controls = new OrbitControls(
            this._camera,
            this._threejs.domElement
        );
        controls.target.set(0, 0, 0);
        controls.update();

        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './resources/posx.jpg',
            './resources/negx.jpg',
            './resources/posy.jpg',
            './resources/negy.jpg',
            './resources/posz.jpg',
            './resources/negz.jpg',
        ]);
        this._scene.background = texture;

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 1, 1),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane);

        const s1 = new THREE.Mesh(
            new THREE.SphereGeometry(2, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        s1.position.set(-10, 5, 0);
        s1.castShadow = true;
        this._scene.add(s1);
        
        const s2 = new THREE.Mesh(
            new THREE.SphereGeometry(2, 32, 32),
            new THREE.ShaderMaterial({
                uniforms: {
                    sphereColour: {
                        value: new THREE.Vector3(0, 0, 1)
                    }
                },
                vertexShader: _VS,
                fragmentShader: _FS,
            })
        );
        s2.position.set(10, 5, 0);
        s2.castShadow = true;
        this._scene.add(s2);
        this._sphere = s2;

        this._totalTime = 0.0;

        this._RAF();
    }

    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }

    _RAF() {
        requestAnimationFrame((t) => {
            if (this._previousRAF === null) {
                this._previousRAF = t;
            }

            this._RAF();

            this._threejs.render(this._scene, this._camera);
            this._Step(t - this._previousRAF);
            this._previousRAF = t;
        });
    }

    // still doesnt work
    _Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;

        this._totalTime += timeElapsedS;
        const v = Math.sin(this._totalTime * 2.0) * 0.5 + 0.5;
        const c1 = new THREE.Vector3(1, 0, 0);
        const c2 = new THREE.Vector3(0, 1, 0);
        const sphereColour = c1.lerp(c2, v);

        this._sphere.material.uniforms.sphereColour.value = sphereColour;
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new BasicWorldDemo();
});
