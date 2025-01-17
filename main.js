// Объявляем глобальные переменные
let scene, camera, renderer, fats = 0, proteins = 0, carbohydrates = 0;
let hexObjects = []; // Массив для хранения объектов HexObject
const targetPosition = new THREE.Vector3(-2, -2, 0); // Задайте целевую позицию
let selectedCategory = null; // Переменная для хранения выбранной категории

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

// Глобальная функция для установки выбранной категории
window.setCategory = function(category) {
    selectedCategory = category;
    updateVisibleHexes();
};

// Функция для обновления видимости объектов
function updateVisibleHexes() {
    hexObjects.forEach(hex => {
        if (selectedCategory === null || hex.categories.includes(selectedCategory)) {
            hex.hexMesh.visible = true; // Показываем объект
        } else {
            hex.hexMesh.visible = false; // Скрываем объект
        }
    });
}

// Функция для размещения ингредиентов на гексах
function placeIngredientsOnHexagons() {
    const ingredients = [
        {fats: 5, proteins: 30, carbohydrates: 0, categories: ['белки'] },
        {fats: 10, proteins: 25, carbohydrates: 0, categories: ['белки'] },
        {fats: 15, proteins: 20, carbohydrates: 0, categories: ['жиры', 'белки'] },
        {fats: 20, proteins: 3, carbohydrates: 12, categories: ['жиры', 'овощи'] },
        {fats: 0, proteins: 3, carbohydrates: 7, categories: ['овощи'] },
        {fats: 0, proteins: 1, carbohydrates: 10, categories: ['овощи'] },
        {fats: 2, proteins: 8, carbohydrates: 50, categories: ['углеводы', 'хрустящие'] },
        {fats: 0, proteins: 2, carbohydrates: 45, categories: ['углеводы'] },
        {fats: 2, proteins: 7, carbohydrates: 40, categories: ['углеводы'] },
        {fats: 15, proteins: 5, carbohydrates: 5, categories: ['жиры', 'хрустящие'] },
        {fats: 10, proteins: 2, carbohydrates: 60, categories: ['сладкое'] },
        {fats: 8, proteins: 3, carbohydrates: 25, categories: ['сладкое', 'мягкое'] },
        {fats: 0, proteins: 1, carbohydrates: 27, categories: ['углеводы', 'сладкое'] },
        {fats: 0, proteins: 0, carbohydrates: 25, categories: ['углеводы', 'сладкое'] },
        {fats: 4, proteins: 10, carbohydrates: 5, categories: ['белки', 'мягкое'] },
        {fats: 1, proteins: 11, carbohydrates: 4, categories: ['белки', 'мягкое'] },
        {fats: 0, proteins: 1, carbohydrates: 3, categories: ['овощи'] },
        {fats: 0, proteins: 1, carbohydrates: 6, categories: ['овощи'] },
        {fats: 10, proteins: 2, carbohydrates: 50, categories: ['жиры', 'хрустящие'] },
        {fats: 0, proteins: 2, carbohydrates: 60, categories: ['сладкое', 'углеводы'] },
        {fats: 6, proteins: 3, carbohydrates: 16, categories: ['жиры', 'сладкое'] },
    ];
    
    ingredients.forEach(ingredient => {
        NewHex(null, ingredient.fats, ingredient.proteins, ingredient.carbohydrates, ingredient.categories);
    });
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

    console.log(intersects);
    if (intersects.length > 0) {
        // Получаем первый найденный объект
        const hex = intersects[0].object.userData.hexObject;

        // Обновляем глобальные переменные
        fats += hex.fats;
        proteins += hex.proteins;
        carbohydrates += hex.carbohydrates;

        // Обновляем значения на странице
        document.getElementById('proteinValue').textContent = proteins;
        document.getElementById('fatValue').textContent = fats;
        document.getElementById('carboValue').textContent = carbohydrates;

        // Перемещаем объект к целевой позиции (если необходимо)
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
