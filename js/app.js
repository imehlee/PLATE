import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';


class App {
    constructor() {
        const divContainer = document.querySelector("#webgl-container");
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        divContainer.appendChild(renderer.domElement);

        this._renderer = renderer;

        const scene = new THREE.Scene();
        this._scene = scene;

        this._setupCamera();
        this._setupLight();
        this._setupModel();


        this._updateZ = 0;
        this._rotateY = 0; 
        this._lastZ = 0;
       
        window.onresize = this.resize.bind(this);
        this.resize();

        requestAnimationFrame(this.render.bind(this));

        //마우스 관련
        const moveHandler = (e) => {
            const cursorX = e.clientX || e.touches[0].clientX;
            const cursorY = e.clientY || e.touches[0].clientY;
            const tx = ((cursorX/window.innerWidth)*2 - 1);
            const ty = ((cursorY/window.innerHeight)*2 - 1);
            const updateZ = Math.sqrt(Math.pow( Math.abs(tx), 2 ) + Math.pow(Math.abs(ty), 2 ))*2;
            const rotateY = tx;
            
            console.log(updateZ);
            this._rotateY = rotateY;
            this._updateZ = updateZ; 
            gsap.to(this._camera.position, {
                z: updateZ+0.5,
                duration: 0.5
            });

          }
         
          var btn = document.querySelector(".modal-exit");
          btn.addEventListener("click", function(){
            document.body.addEventListener('mousedown', function(e) {
                this.addEventListener("mousemove", moveHandler);
              
            });
            
            document.body.addEventListener('mouseup', function(e) {
                this.removeEventListener('mousemove', moveHandler);
            });

            document.body.addEventListener('touchstart', function(e) {
                this.addEventListener('touchmove', moveHandler);
              });
              
              document.body.addEventListener('touchend', function(e) {
                this.removeEventListener('touchmove', moveHandler);
              });
          });


    }
    


    _setupModel() {
        const textureLoader = new THREE.TextureLoader();
        const mapHeight = textureLoader.load("../source/stripes.png");

        const material2 = new THREE.MeshStandardMaterial({
            map: mapHeight,
            displacementMap: mapHeight,
            displacementScale: 0.2,
            displacementBias: -0.1,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });

        this._material2 = material2;
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(10 , 10, 100, 100), material2);
        plane.position.set(0, 0, 1);
        this._plane = plane;
        this._scene.add(plane);

        //particle만들기
        const vertices = [];

        for (let i = 0; i < 8000; i++) {
            const x = THREE.MathUtils.randFloatSpread(5);
            const y = THREE.MathUtils.randFloatSpread(5);
            const z = THREE.MathUtils.randFloatSpread(5);

            vertices.push(x, y, z);
        }

        const particle = new THREE.BufferGeometry();
        particle.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
        );

        const sprite = new THREE.TextureLoader().load(
            "../source/particles-single.png");

        const material = new THREE.PointsMaterial({
            map: sprite,
            alphaTest: 0.5,
            size: 0.03,
            sizeAttenuation: true
        });

    

        //shpere만들기
        const geometry2 = new THREE.SphereGeometry(0.05);
        //const fillMaterial2 = new THREE.MeshPhongMaterial({color: 0x515151});

        const lineMaterial = new THREE.LineBasicMaterial({color:0xfff06});
        const sphere = new THREE.LineSegments(
            new THREE.WireframeGeometry(geometry2), lineMaterial);

        //const sphere = new THREE.Mesh(geometry2, fillMaterial2);
       



        const system = new THREE.Points(particle, material);
        
        this._sphere = sphere;
        this._system = system;

        this._scene.add(sphere);
        this._scene.add(system);
       
    }
    

    _setupCamera() {
        const camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            100
        );
        this._camera = camera;
        camera.position.z = 2;

    }

    _setupLight() {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        this._scene.add(light);
    }

    update(time) {
        time *= 0.001;  
        this._system.rotation.y = this._rotateY;
        this._material2.displacementScale = (time % 10)*0.1;
        if (this._material2.displacementScale > 0.5) {
            this._material2.displacementScale = 0.5 - (time % 5) * 0.1;
        }

        this._sphere.rotation.y += 0.001;
    }

    render(time) {
        this._renderer.render(this._scene, this._camera);   
        this.update(time);
        requestAnimationFrame(this.render.bind(this));
    }


    resize() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
        
        this._renderer.setSize(width, height);
    }
}

window.onload = function () {
    new App();
}