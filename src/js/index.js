console.log("index.js is working ");

import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Text } from 'troika-three-text'
import { gsap, Power1 } from "gsap"
import vertexPlaneShader from "../shaders/planes/vertex.glsl"
import fragmentPlaneShader from "../shaders/planes/fragment.glsl"
import vertexBackgroundShader from "../shaders/background/vertex.glsl"
import fragmentBackgroundShader from "../shaders/background/fragment.glsl"
import vertexParticulesShader from "../shaders/particules/vertex.glsl"
import fragmentParticulesShader from "../shaders/particules/fragment.glsl"

//-------------------------------------------------------------------------------------------------------------------
// Global varibale
//-------------------------------------------------------------------------------------------------------------------

const player = document.querySelector(".player")
const playerClose = document.querySelector(".player-close")
const playerSource = document.querySelector(".player-source")
const counterLoading = document.querySelector(".counterLoading")
const header = document.querySelector("header")
const h1 = document.querySelector("h1")
const footer = document.querySelector("footer")
const loading = document.querySelector(".loading")
const started = document.querySelector(".started")
const startedBtn = document.querySelector(".started-btn")
let touchValue = 1
let videoLook = false
let scrollI = 0.0
let initialPositionMeshY = -1
let initialRotationMeshY = Math.PI * 0.9
let planeClickedIndex = -1
let isLoading = false
let lastPosition = {
    px: null,
    py: null,
    pz: null,
    rx: null,
    ry: null,
    rz: null
}

const localLinks = [].slice.call(document.querySelectorAll('a')).filter((a) => /^#.+/.test(a.getAttribute('href')));

localLinks.forEach((link) => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const eID = this.getAttribute('href').substr(1);
    const top = Math.max(document.getElementById(eID).offsetTop - 40, 0);
    window.scroll({ 
      behavior: 'smooth' ,
      left: 0,
      top: top
    });
  })
})

let detailsImage = [
    {
        "url": "https://youtu.be/Yz6Ffc6ShCE?si=iVwHWQeESMZ5N2wR",
        "name": "Transformation Dark Vador\n - Anakin devient Dark Vador"
    },
    {
        "url": "https://youtu.be/_YrrE0VnTSA?si=V4Rh4HxtLHpEZ2Ps",
        "name": "Arrivée Dark Vador\n Étoile de la Mort"
    },
    {
        "url": "https://youtu.be/sD8jLq42Td4?si=JkcDyvUkNCUJN3jS",
        "name": "Hitachi Solar Energy"
    },
    {
        "url": "https://youtu.be/5_l7ACxmziE?si=5uTDIi1jOk9WJLFS",
        "name": "Toyota Motor Show"
    },
    {
        "url": "https://youtu.be/pfU0QORkRpY?si=2b-ru2Z3Omaq1Mcg",
        "name": "Garena Gaming"
    },
    {
        "url": "https://youtu.be/q4xKvHANqjk?si=3syi7a4l1FPUwUsw",
        "name": "Racing Master"
    },
    {
        "url": "https://youtu.be/1VTDdRAL6cg",
        "name": "Michelin PS4 Launch"
    },
    {
        "url": "https://youtu.be/_DqjfAEObas",
        "name": "Hitachi Annual Party"
    },
    {
        "url": "https://www.youtube.com/watch?v=1b1LH6LNWHo",
        "name": "Lexus Glamping"
    },
    {
        "url": "https://youtu.be/ydl2CPuA9Hw",
        "name": "Unite with Tomorrowland"
    }
]

// mobile hack

// Debug
const debugObject = {}

// canvas
const canvas = document.querySelector(".main-webgl")

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color("#fff")

// background scene
const backgroundScene = new THREE.Scene()

// sizes
const sizesCanvas = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener("resize", () => {
    // Update size
    sizesCanvas.width = window.innerWidth
    sizesCanvas.height = window.innerHeight

    // Update camera
    camera.aspect = sizesCanvas.width / sizesCanvas.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizesCanvas.width, sizesCanvas.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Raycaster
const raycatser = new THREE.Raycaster()
let currentIntersect = null;

// Mouse move
let mouse = new THREE.Vector2()

window.addEventListener("mousemove", e => {
    mouse.x = e.clientX / sizesCanvas.width * 2 - 1
    mouse.y = - (e.clientY / sizesCanvas.height) * 2 + 1
})

// Audio

const music = new Audio("/sounds/music-bg.mp3");

music.volume = 0.1

const respiration = new Audio("/sounds/music-bg.mp3")
respiration.volume = 0.01

//-------------------------------------------------------------------------------------------------------------------
// Loaders
//-------------------------------------------------------------------------------------------------------------------

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        window.setTimeout(() => {
            gsap.to(header, 0.5, {
                top: 10,
                left: 10,
                transform: "translate(0, 0)",
                ease: Power1.easeIn
            })

            gsap.to(h1, 0.5, {
                fontSize: 25,
                top: 10,
                left: 10,
                transform: "translate(0, 0)",
                width: 150,
                ease: Power1.easeIn
            })

            gsap.to(footer, 0.5, {
                delay: 0.4,
                opacity: 1,
                ease: Power1.easeIn
            })

            gsap.to(footer, 0.5, {
                delay: 0.4,
                opacity: 1,
                ease: Power1.easeIn
            })

            gsap.to(counterLoading, 0.5, {
                delay: 0.4,
                opacity: 0,
                ease: Power1.easeIn
            })

            gsap.to(started, 0.5, {
                delay: 0.9,
                opacity: 1
            })

            startedBtn.addEventListener("click", () => continueAnimation())
        }, 50)
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal

        counterLoading.innerHTML = `${(progressRatio * 100).toFixed(0)}%`
        header.style.width = `${(progressRatio * 550).toFixed(0)}px`
    }
)

// Continue animation loading
const continueAnimation = () => {
    music.play()
    respiration.play()

    gsap.to(started, 0.5, {
        opacity: 0
    })

    gsap.to(loading, 0.5, {
        opacity: 0
    })

    gsap.from(camera.position, 1.5, {
        x: 4.0,
        z: - 8.5,
        y: 3.0
    })

    setTimeout(() => {
        loading.style.visibility = "hidden"
        started.style.visibility = "hidden"
        groupPlane.visible = true
        groupText.visible = true
        isLoading = true
    }, 250);
}

const textureLoader = new THREE.TextureLoader(loadingManager)

const imagesLoad1 = textureLoader.load("/photo/image-1.jpg")
const imagesLoad2 = textureLoader.load("/photo/image-2.jpg")
const imagesLoad3 = textureLoader.load("/Barry/Hitachi Solar Energy/Hitachi Solar Energy.jpg")
const imagesLoad4 = textureLoader.load("/Barry/Toyota Motor Show/Toyota Motor Show.jpg")
const imagesLoad5 = textureLoader.load("/Barry/Garena Gaming/Garena Gaming.jpg")
const imagesLoad6 = textureLoader.load("/Barry/Racing Master/Racing Master.jpg")
const imagesLoad7 = textureLoader.load("/Barry/Michelin PS4 Launch/Michelin PS4 Launch.jpg")
const imagesLoad8 = textureLoader.load("/Barry/Hitachi Annual Party/Hitachi Annual Party.jpg")
const imagesLoad9 = textureLoader.load("/Barry/Lexus Glamping/Lexus Glamping.jpg")
const imagesLoad10 = textureLoader.load("/Barry/Unite with Tomorrowland/Unite with Tomorrowland.jpg")

const images = [imagesLoad1, imagesLoad2, imagesLoad3, imagesLoad4, imagesLoad5, imagesLoad6, imagesLoad7, imagesLoad8, imagesLoad9, imagesLoad10]

const gltfLoader = new GLTFLoader(loadingManager)
let models = []

// Dark Vador
gltfLoader.load(
    "/models/Dark_vador/nintendo_switch.glb",
    (gltf) => {
        gltf.scene.scale.set(0.321, 0.321, 0.321)
        gltf.scene.position.y = initialPositionMeshY 
        gltf.scene.rotation.y = initialRotationMeshY

        scene.add(gltf.scene)
        models.push(gltf.scene)

        scene.traverse((child) =>
        {
            if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
            {
                child.material.envMapIntensity = debugObject.envMapIntensity
                child.material.needsUpdate = true
            }
        })
    },
    undefined,
    (err) => {
        console.log(err)
    }
)

let startTouch = 0

// Rock
gltfLoader.load(
    "/models/Rock/scene.gltf",
    (gltf) => {
        gltf.scene.scale.set(0.008, 0.008, 0.008)
        gltf.scene.position.y = initialPositionMeshY 
        gltf.scene.rotation.y = initialRotationMeshY

        scene.add(gltf.scene)
        models.push(gltf.scene)

        scene.traverse((child) =>
        {
            if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
            {
                child.material.envMapIntensity = debugObject.envMapIntensity
                child.material.needsUpdate = true
            }
        })

        // Event Animation
        let startTouch = 0;
        let startTouchX = 0;

        // Event Animation
        if ("ontouchstart" in window) {
            window.addEventListener('touchstart', (e) => {
                startTouch = e.touches[0].clientY; // 記錄初始觸控位置（垂直方向）
                startTouchX = e.touches[0].clientX; // 記錄初始觸控位置（水平方向）
            }, false);

            window.addEventListener('touchmove', (e) => {
                const currentTouchY = e.touches[0].clientY;
                const currentTouchX = e.touches[0].clientX;

                let touchDeltaY = startTouch - currentTouchY; // 計算垂直方向移動差值
                let touchDeltaX = startTouchX - currentTouchX; // 計算水平方向移動差值
                startTouch = currentTouchY; // 更新起始點位置（垂直）
                startTouchX = currentTouchX; // 更新起始點位置（水平方向）

                // 調整觸控差值縮放因子
                const scaledDeltaY = touchDeltaY * 0.1;
                let scaledDeltaX = touchDeltaX * 0.3; // 增大左右滑動效果，統一增大滾動距離

                // 處理垂直方向的滾動
                if (touchDeltaY > 0) {
                    animationScroll(e, true, scaledDeltaY, "up");  // 向上滾動
                } else {
                    animationScroll(e, true, scaledDeltaY, "down"); // 向下滾動
                }

                // 增加左右滑動的滾動幅度
                if (touchDeltaX !== 0) {
                    animationScroll(e, true, scaledDeltaX, touchDeltaX < 0 ? "right" : "left");
                }
            }, false);
        } else {
            window.addEventListener("wheel", (e) => animationScroll(e), false);
        }
    },
    undefined,
    (err) => {
        console.log(err)
    }
)

debugObject.envMapIntensity = 5

//-------------------------------------------------------------------------------------------------------------------
// Camera aaa
//-------------------------------------------------------------------------------------------------------------------

// camera
const camera = new THREE.PerspectiveCamera(83, sizesCanvas.width / sizesCanvas.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = - 5
scene.add(camera)

// background camera
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 0)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enabled = false
controls.enableZoom = false

//-------------------------------------------------------------------------------------------------------------------
// Light
//-------------------------------------------------------------------------------------------------------------------

const ambientLight = new THREE.AmbientLight(0xff0000, 1.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 15)
pointLight.position.set(-5.5, 5.5, -5)
scene.add(pointLight)

//-------------------------------------------------------------------------------------------------------------------
// Model
//-------------------------------------------------------------------------------------------------------------------

// mesh background
const backgroundPlane = new THREE.PlaneGeometry(2, 2)
const backgroundMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexBackgroundShader,
    fragmentShader: fragmentBackgroundShader,
    uniforms: {
        uScrollI: { value: scrollI },
        uResoltion: { value: new THREE.Vector2(sizesCanvas.width, sizesCanvas.height) },
        uTime: { value: 0.0 }
    }
})

backgroundScene.add(new THREE.Mesh(backgroundPlane, backgroundMaterial))

//-------------------------------------------------------------------------------------------------------------------
// Plane and Text
//-------------------------------------------------------------------------------------------------------------------

// group
const groupPlane = new THREE.Group()
const groupText = new THREE.Group()
groupPlane.visible = false
groupText.visible = false
scene.add(groupPlane, groupText)

// geometry
const planeGeometry = new THREE.PlaneGeometry(2, 1.25, 32, 32)
const planesMaterial = []

// Create planes
for (let i = 0; i < 10; i++) {
    planesMaterial.push(new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        vertexShader: vertexPlaneShader,
        fragmentShader: fragmentPlaneShader,
        uniforms: {
            uScrollI: { value: scrollI },
            uTexture: { value: images[i] },
            uTime: { value: 0.0 },
            uTouch: { value: touchValue }
        }
    }))

    // Plane
    const plane = new THREE.Mesh(planeGeometry, planesMaterial[i])
    plane.position.y = i - 14.2
    plane.position.x = - Math.cos(i) * Math.PI
    plane.position.z = - Math.sin(i) * Math.PI
    plane.lookAt(0, plane.position.y, 0)
    
    // 設置 userData，儲存點擊後要用到的值
    plane.userData = {
        name: detailsImage[i].name,
        url: detailsImage[i].url
    };

    groupPlane.add(plane)

    // Text
    const newText = new Text()
    newText.text = detailsImage[i].name.toString();
    newText.fontSize = 0.1
    newText.position.y = plane.position.y
    newText.position.x = plane.position.x
    newText.position.z = plane.position.z
        
    groupText.add(newText)
}

// 在你的初始化或主程式中，新增以下點擊事件處理邏輯：

window.addEventListener("click", (event) => {
    // 計算滑鼠在 WebGL 畫布中的位置
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 設置 Raycaster
    raycatser.setFromCamera(mouse, camera);

    // 檢查是否有與 Raycaster 相交的物體
    const intersects = raycatser.intersectObjects(groupPlane.children);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        // 檢查 userData 是否存在，確保是指定的物體
        if (clickedObject.userData && clickedObject.userData.name) {
            const clickedValue = clickedObject.userData.name;
            console.log(`Clicked on: ${clickedValue}`);
            addCards(clickedValue);
        }
    }
});


//-------------------------------------------------------------------------------------------------------------------
// Particules
//-------------------------------------------------------------------------------------------------------------------

const particuleGeometry = new THREE.BufferGeometry()
const particulesCount = 30
const particulesPositions = new Float32Array(particulesCount * 3)
const particulesScales = new Float32Array(particulesCount)

for (let i = 0; i < particulesCount; i++) {
    const i3 = i * 3

    particulesPositions[i3] = (Math.random() - 0.5) * 10
    particulesPositions[i3 + 1] = (Math.random() * 1.5) - 2
    particulesPositions[i3 + 2] = ((Math.random() - 0.5) * 10) + 2.5

    particulesScales[i] = Math.random()
}

particuleGeometry.setAttribute("position", new THREE.BufferAttribute(particulesPositions, 3))
particuleGeometry.setAttribute("aScale", new THREE.BufferAttribute(particulesScales, 1))

const particulesMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    vertexShader: vertexParticulesShader,
    fragmentShader: fragmentParticulesShader,
    uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: 10.0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    }
})

const particules = new THREE.Points(particuleGeometry, particulesMaterial)
scene.add(particules)

//-------------------------------------------------------------------------------------------------------------------
// Renderer
//-------------------------------------------------------------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizesCanvas.width, sizesCanvas.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.autoClear = false

//-------------------------------------------------------------------------------------------------------------------
// Animation
//-------------------------------------------------------------------------------------------------------------------

window.addEventListener("keydown", function(event) {
    // Check for both ArrowRight and ArrowDown to scroll down
    if (event.code === 'ArrowRight' || event.code === 'ArrowDown') {
        // Simulate mouse wheel scroll down with larger scroll step
        let e = { deltaY: 1 }; // Increase the deltaY value for more scrolling
        animationScroll(e, false); // Trigger the scroll function with this mock event
    } 
    // Check for both ArrowLeft and ArrowUp to scroll up
    else if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') {
        // Simulate mouse wheel scroll up with larger scroll step
        let e = { deltaY: -1 }; // Increase the deltaY value for more scrolling
        animationScroll(e, false); // Trigger the scroll function
    }
});


const animationScroll = (e, touchEvent, value, downOrUp) => {
    let deltaY;

    // 檢查是否為手機裝置
    const isMobile = window.innerWidth <= 768;

    if (touchEvent && isMobile) {
        // 如果是手機並且是觸控事件，直接使用傳入的值
        deltaY = value;
    } else if (!isMobile) {
        // 非手機裝置處理滑鼠滾輪和鍵盤事件
        const scrollStepKeyboard = 20;  // 鍵盤觸發時的滾動幅度
        const scrollStepMouse = 3;      // 滑鼠滾輪觸發時的滾動幅度

        if (e.type === "wheel") {
            deltaY = e.deltaY > 0 ? scrollStepMouse : -scrollStepMouse; // 滑鼠滾輪事件
        } else {
            deltaY = e.deltaY > 0 ? scrollStepKeyboard : -scrollStepKeyboard; // 鍵盤事件
        }
    }

    // 確認是否在正確狀態下滾動
    if (videoLook === false && isLoading && typeof deltaY !== 'undefined') {
        if (deltaY < 0 && scrollI > 0) {
            scrollI -= Math.abs(deltaY); // 向上滾動
        } else if (deltaY > 0 && scrollI <= 435) {
            scrollI += Math.abs(deltaY); // 向下滾動
        }

        const speed = 0.01; // 控制滾動速度的係數

        // 更新模型位置
        models.forEach((model, index) => {
            model.rotation.y = (initialRotationMeshY) - scrollI * 0.01355; // 更新旋轉
            if (index === 0) {
                model.position.y = (initialPositionMeshY) - scrollI * (speed * 0.6); // 更新 Y 位置
            } else if (index === 1) {
                model.position.y = (initialPositionMeshY - 0) - scrollI * (speed * 0.6);
            }
            model.position.z = - scrollI * (speed * 0.55); // 更新 Z 位置
        });

        // 更新平面和文字位置
        for (let i = 0; i < groupPlane.children.length; i++) {
            const plane = groupPlane.children[i];
            const text = groupText.children[i];

            plane.position.z = - Math.sin(i + 1 * scrollI * (speed * 10)) * Math.PI;
            plane.position.x = - Math.cos(i + 1 * scrollI * (speed * 10)) * Math.PI;
            plane.position.y = (i - 14.2) + (scrollI * (speed * 10));

            plane.lookAt(0, plane.position.y, 0); // 更新平面朝向

            text.position.z = plane.position.z - 0.5;
            text.position.x = plane.position.x;
            text.position.y = plane.position.y - 0.3;

            text.lookAt(plane.position.x * 2, plane.position.y - 0.3, plane.position.z * 2); // 更新文字朝向
        }
    }
};


function getVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);

    return (match && match[2].length === 11)
      ? match[2]
      : null;
}

function addCards(eventName) {
    console.log(eventName);

    const main = document.getElementById("player");

    // 檢查是否已有 .page-event 區域，如果有則先清除其內容
    const existingPageEvent = main.querySelector(".page-event");
    if (existingPageEvent) {
        main.removeChild(existingPageEvent);  // 或者也可以用 existingPageEvent.innerHTML = '';
    }
    
    let cardsHTML = `
        <div class="page-event">
            <div class="cover">
                <div class="heading">${eventName}</div>
    `;

    // 假設最多有 20 張圖片，依序嘗試載入
    for (let i = 1; i <= 30; i++) {
        cardsHTML += `
            <a id="image-${eventName}-${i}" class="logo-image">
                <img src="/Barry/${eventName}/${i}.jpg" onerror="this.parentElement.style.display='none'">
            </a>
        `;
    }

    cardsHTML += `
            </div>
        </div>
    `;

    main.insertAdjacentHTML('beforeend', cardsHTML);
    initializeElements(eventName);


    // Add the dynamic CSS
    const style = document.createElement('style');
    style.id = 'dynamic-style'; // Add an ID for later removal

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // Adjust the camera field of view (FOV) for a more zoomed-out view
        camera.fov = 75; // Increase the FOV for mobile (default is around 50-60)
        camera.position.set(0, 1, 4); // Adjust position slightly if necessary
        camera.updateProjectionMatrix();
    }
    
    

    if (isMobile) {
        // Mobile-specific CSS without min-height
        style.innerHTML = `
            .player {
                overflow-y: scroll !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
            }
    
            .player-source {
                position: relative !important;
                top: 80px !important;
                left: auto !important;
                right: auto !important;
                transform: none !important;
                min-height: 260px !important;
            }
        `;
    } else {
        // Default CSS with min-height
        style.innerHTML = `
            .player {
                overflow-y: scroll !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
            }
    
            .player-source {
                position: relative !important;
                top: 80px !important;
                left: auto !important;
                right: auto !important;
                transform: none !important;
                min-height: 700px !important;
            }
        `;
    }
    document.head.appendChild(style); // Append the CSS to the document
}

function removeCards() {
    console.log('Executing removeCards');
    const main = document.getElementById("player");
    const cardSections = main.querySelectorAll('.main-cards');
    
    console.log(cardSections); // Ensure that cards are being selected

    // Remove all card sections
    if (cardSections.length > 0) {
        cardSections.forEach(cardSection => {
            cardSection.remove();
        });
    }

    
    if (style.innerHTML) {
        style.innerHTML='';
    }
}

window.addEventListener("click", (event) => {
    handlePlane()
    const clickedElement = event.target;
    const pageEventElement = document.querySelector('.page-event');
    const clickedValue = clickedObject.userData.name;

    console.log(event.target);

    if (!clickedElement.classList.contains('started-btn') && !pageEventElement) {
        addCards(clickedValue)
    }

})

// 新增 touchstart 事件來支援手機點擊
window.addEventListener("touchstart", (event) => {
    // 防止觸控的默認行為
    event.preventDefault();

    // 創建一個新的 click 事件
    const simulatedClickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY
    });

    // 將 click 事件派發到觸控點的目標元素
    event.target.dispatchEvent(simulatedClickEvent);
});

const handlePlane = () => {
    if (currentIntersect && videoLook === false && isLoading) {
        for (let i = 0; i < groupPlane.children.length; i++) {
            if (groupPlane.children[i] === currentIntersect.object) {
                planeClickedIndex = i
                music.pause()
                respiration.pause()

                lastPosition = {
                    px: groupPlane.children[i].position.x,
                    py: groupPlane.children[i].position.y,
                    pz: groupPlane.children[i].position.z,
                    rx: groupPlane.children[i].rotation.x,
                    ry: groupPlane.children[i].rotation.y,
                    rz: groupPlane.children[i].rotation.z
                }

                gsap.to(groupPlane.children[i].position, 0.5, {
                    z: camera.position.z + 0.5,
                    x: camera.position.x,
                    y: camera.position.y,
                    ease: Power1.easeIn
                })

                gsap.to(groupPlane.children[i].rotation, 0.5, {
                    z: 0,
                    x: 0,
                    y: 0,
                    ease: Power1.easeIn
                })

                const videoId = getVideoId(detailsImage[i].url);
                playerSource.src = "https://www.youtube.com/embed/" + videoId
                
                setTimeout(() => {
                    player.style.visibility = "visible"

                    gsap.to(player, 0.5, {
                        opacity: 1,
                        ease: Power1.easeIn
                    }) 
                }, 400);

                videoLook = true
            }
        }
    }
}

playerClose.addEventListener("click", () => {
    event.stopPropagation();  // 防止點擊事件冒泡到 WebGL 場景
    playerSource.src = ""
    music.play()
    respiration.play()

    gsap.to(player, 0.5, {
        opacity: 0,
        ease: Power1.easeIn
    }) 
    player.style.visibility = "hidden"

    gsap.to(groupPlane.children[planeClickedIndex].position, 0.5, {
        x: lastPosition.px,
        y: lastPosition.py,
        z: lastPosition.pz,
        ease: Power1.easeIn
    }) 

    gsap.to(groupPlane.children[planeClickedIndex].rotation, 0.5, {
        x: lastPosition.rx,
        y: lastPosition.ry,
        z: lastPosition.rz,
        ease: Power1.easeIn
    }) 

    planeClickedIndex = -1

    setTimeout(() => {
        videoLook = false
    }, 500);

    setTimeout(() => {
        removeCards(); // Now execute the remove after some delay
        console.log('執行囉');
    }, 500);
    

})

// Animation hover plane black and white to color
let goalValue = 0

const changeTouchValue = (index) => {
    if (index >= 0) {
        const interval = setInterval(() => {
            if (goalValue === 1) touchValue += 0.01
            else if (goalValue === 0) touchValue -= 0.01
    
            groupPlane.children[index].material.uniforms.uTouch.value = touchValue
    
            if (parseFloat(touchValue.toFixed(1)) === goalValue) {
                clearInterval(interval)
                goalValue = goalValue === 0 ? 1 : 0
            }
        }, 7);
    }
}

const clock = new THREE.Clock()

let callChangeTouchValue = 0
let touchI = - 1

const init = () => {
    const elapsedTime = clock.getElapsedTime()
        
    // Update shaders
    planesMaterial.forEach(plane => {
        plane.uniforms.uTime.value = elapsedTime
        plane.uniforms.uScrollI.value = scrollI
    })
    backgroundMaterial.uniforms.uScrollI.value = scrollI
    backgroundMaterial.uniforms.uTime.value = elapsedTime
    particulesMaterial.uniforms.uTime.value = elapsedTime

    // Upadate raycaster
    if(!("ontouchstart" in window)) raycatser.setFromCamera(mouse, camera)
    const intersects = raycatser.intersectObjects(groupPlane.children)

    // black and white to colo animation with raycaster
    if (isLoading) {
        if (intersects.length === 1) {
            if (currentIntersect === null) {
                currentIntersect = intersects[0]
            } else {
                for (let i = 0; i < groupPlane.children.length; i++) {
                    if (groupPlane.children[i] === currentIntersect.object) {
                        if (callChangeTouchValue === 0) {
                            touchI = i
                            changeTouchValue(i)
                            callChangeTouchValue = 1
                            document.body.style.cursor = "pointer"               
                        }
                    }
                }
            }
        } else {
            if (callChangeTouchValue === 1 && touchI >= 0) {
                changeTouchValue(touchI)
                callChangeTouchValue = 0
                document.body.style.cursor = "auto" 
                currentIntersect = null
                touchI = - 1
            }
        }
    }

    // Update renderer
    renderer.render(scene, camera)
    renderer.render(backgroundScene, backgroundCamera)

    // Call this function
    window.requestAnimationFrame(init)
}

init();

let currentIndex = 0; // 將變量放在全局作用域
let elements = []; // 初始化為空數組

function initializeElements(eventName) {
    currentIndex = 0; // Reset the index
    const elements = [];
    for (let i = 1; i <= 30; i++) {
        // 使用動態生成的 id 格式來選取元素
        const element = document.getElementById(`image-${eventName}-${i}`);
        if (element) {
            elements.push(element);
        } else {
            break; // 若未找到更多元素，則停止
        }
    }

    // 確認抓取到的元素數量
    // console.log("初始化元素數量:", elements.length);
    // 在這裡可以進行接下來的初始化邏輯，例如將元素存入其他結構等
}

// Attach your keydown event listener
window.addEventListener("keydown", (event) => {
    event.preventDefault(); // 防止其他處理影響

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        if (currentIndex < elements.length && elements[currentIndex]) {
            elements[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
            currentIndex = Math.min(currentIndex + 1, elements.length - 1);
        }
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        if (currentIndex > 0) {
            currentIndex = Math.max(currentIndex - 1, 0);
            if (elements[currentIndex]) {
                elements[currentIndex].scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    } else if (event.key === "Backspace") {
        // 按下 Backspace 時，觸發點擊
        const backButton = document.getElementById("btn-back-to-home");
        if (backButton) {
            backButton.click(); // 模擬點擊按鈕
        }
    }
});

