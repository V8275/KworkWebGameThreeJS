// Объявляем глобальные переменные
let scene, camera, renderer;
let hexObjects = []; // Массив для хранения объектов HexObject
const targetPosition = new THREE.Vector3(-2, -2, 0); // Задайте целевую позицию

// Импортируем функции из других файлов
import { HexObject } from './ingridient.js';

// Функция инициализации
function init() {
    // Создаем сцену, камеру и рендерер
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Включаем тени в рендерере
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x3b3b3b);

    camera.position.z = 5; // Устанавливаем позицию камеры

    // Добавляем свет для теней
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(5, 10, 13);
    light.castShadow = true;
    scene.add(light);

    // Размещение ингредиентов на гексах
    placeIngredientsOnHexagons();

    // Добавляем обработчик кликов
    window.addEventListener('click', onMouseClick);
}

// Функция для размещения ингредиентов на гексах
function placeIngredientsOnHexagons() {
    const categories = ['жиры', 'овощи', 'белки', 'хрустящие'];
    for (let i = 0; i < 11; i++) {
        NewHex(null, 15, 8, 25, categories);
    }
}

function NewHex(Object, fats, proteins, carbohydrates, categories) {
    const hex = new HexObject(Object, fats, proteins, carbohydrates, targetPosition);

    categories.forEach(category => hex.addCategory(category));
    // Добавляем созданный объект в массив
    hexObjects.push(hex);
    
    // Добавляем гекс в сцену
    scene.add(hex.hexMesh);
    
    // Позиционирование гекса
    positionHex(hex, 1);
}

// Функция для позиционирования гекса
function positionHex(hex, height = 0) {
    const hexWidth = 1; // Ширина одного гекса
    const hexHeight = 0.5; // Высота одного гекса

    const row = Math.floor(hexObjects.length / 5); // Количество гексов в ряду
    const col = hexObjects.length % 5; // Индекс гекса в ряду

    // Смещение по оси X и Y
    const xOffset = (col * hexWidth) - (2 * hexWidth) + (row % 2) * (hexWidth / 2); // Добавлено смещение для чередующихся рядов
    const yOffset = (row * hexHeight); // Убираем шахматный порядок, чтобы гексы шли вниз

    // Устанавливаем позицию с учетом высоты
    hex.hexMesh.position.set(xOffset, yOffset + height, 0);
}


// Функция для обработки кликов
function onMouseClick(event) {
    // Преобразуем координаты мыши в нормализованные устройства координат
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    // Создаем луч для raycasting
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Проверяем пересечения с объектами
    const intersects = raycaster.intersectObjects(hexObjects.map(hex => hex.hexMesh));

    if (intersects.length > 0) {
        // Перемещаем первый найденный объект
        const hex = intersects[0].object.userData.hexObject;
        hex.moveToTarget();
    }
}

// Функция для наклона всех объектов на сцене
function tiltAllHexes(angle) {
    const radians = THREE.MathUtils.degToRad(angle); // Преобразуем градусы в радианы
    hexObjects.forEach(hex => {
        hex.hexMesh.rotation.x += radians; // Наклоняем по оси X
    });
}

// Функция анимации
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Запускаем инициализацию
init();

// Запускаем анимацию
animate();

tiltAllHexes(40);
