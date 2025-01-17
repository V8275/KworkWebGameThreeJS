// Объявляем глобальные переменные
let scene, camera, renderer, fats = 0, proteins = 0, carbohydrates = 0;
let hexObjects = []; // Массив для хранения объектов HexObject
let mainGrid, cartGrid;
let currentCategory = null; // Переменная для хранения текущей категории
let tempGrid = []; // Глобальный массив для хранения невидимых гексов


// Импортируем функции из других файлов
import { HexGrid } from './Hexgrid.js';

// Функция инициализации
function init() {
    // Создаем сцену, камеру и рендерер
    scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10; // Размер фрустрации
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / - 2, 
        frustumSize * aspect / 2, 
        frustumSize / 2, 
        frustumSize / - 2, 
        1, 
        1000
    );
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
    const ingredients = [
        {fats: 5, proteins: 30, carbohydrates: 0, categories: ['белки'] },
        
        { fats: 10, proteins: 25, carbohydrates: 0, categories: ['белки'] },
        { fats: 15, proteins: 20, carbohydrates: 0, categories: ['жиры', 'белки'] },
        { fats: 20, proteins: 3, carbohydrates: 12, categories: ['жиры', 'овощи'] },
        { fats: 0, proteins: 3, carbohydrates: 7, categories: ['овощи'] },
        { fats: 0, proteins: 1, carbohydrates: 10, categories: ['овощи'] },
        { fats: 2, proteins: 8, carbohydrates: 50, categories: ['углеводы', 'хрустящие'] },
        { fats: 0, proteins: 2, carbohydrates: 45, categories: ['углеводы'] },
        { fats: 2, proteins: 7, carbohydrates: 40, categories: ['углеводы'] },
        { fats: 15, proteins: 5, carbohydrates: 5, categories: ['жиры', 'хрустящие'] },
        { fats: 10, proteins: 2, carbohydrates: 60, categories: ['сладкое'] },
        { fats: 8, proteins: 3, carbohydrates: 25, categories: ['сладкое', 'мягкое'] },
        { fats: 0, proteins: 1, carbohydrates: 27, categories: ['углеводы', 'сладкое'] },
        { fats: 0, proteins: 0, carbohydrates: 25, categories: ['углеводы', 'сладкое'] },
        { fats: 4, proteins: 10, carbohydrates: 5, categories: ['белки', 'мягкое'] },
        { fats: 1, proteins: 11, carbohydrates: 4, categories: ['белки', 'мягкое'] },
        { fats: 0, proteins: 1, carbohydrates: 3, categories: ['овощи'] },
        { fats: 0, proteins: 1, carbohydrates: 6, categories: ['овощи'] },
        { fats: 10, proteins: 2, carbohydrates: 50, categories: ['жиры', 'хрустящие'] },
        { fats: 0, proteins: 2, carbohydrates: 60, categories: ['сладкое', 'углеводы'] },
        { fats: 6, proteins: 3, carbohydrates: 16, categories: ['жиры', 'сладкое'] },
        // Добавьте другие ингредиенты здесь
    ];
    cartGrid = new HexGrid(null, new THREE.Vector3(0, -3, 0), 27);
    mainGrid = new HexGrid(ingredients, new THREE.Vector3(0, 0, 0), 27); // Передаем ингредиенты в HexGrid
    hexObjects = mainGrid.getHexObjects(); // Получаем массив объектов
    updateVisibleHexes(); // Обновляем видимые гексы после инициализации
}

// Функция анимации
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onMouseClick(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Проверяем пересечения с объектами в основном гриде, исключая временные объекты
    const mainIntersects = raycaster.intersectObjects(
        hexObjects
            .filter(hex => !tempGrid.includes(hex)) // Исключаем невидимые гексы
            .map(hex => hex.hexMesh)
    );

    const cartIntersects = raycaster.intersectObjects(cartGrid.getHexObjects().map(hex => hex.hexMesh));

    if (mainIntersects.length > 0) {
        const intersectedHex = mainIntersects[0].object;
        const hexObject = hexObjects.find(hex => hex.hexMesh === intersectedHex);

        if (hexObject) {
            // Перемещаем объект из mainGrid в cartGrid
            cartGrid.moveHexObject(mainGrid, hexObject, scene, tempGrid);
            scene.remove(intersectedHex); // Убираем объект из сцены
            cartGrid.getHexObjects().forEach(hex => {
                scene.add(hex.hexMesh); // Добавляем объект в корзину
            });
        }
    } else if (cartIntersects.length > 0) {
        const intersectedHex = cartIntersects[0].object;
        const cartHexObject = cartGrid.getHexObjects().find(hex => hex.hexMesh === intersectedHex);

        if (cartHexObject) {
            // Перемещаем объект из cartGrid обратно в mainGrid
            mainGrid.moveHexObject(cartGrid, cartHexObject, scene, tempGrid);
            scene.remove(intersectedHex); // Убираем объект из сцены
            mainGrid.getHexObjects().forEach(hex => {
                scene.add(hex.hexMesh); // Добавляем объект обратно в основную сетку
            });
        }
    }
}


window.setCategory = function(category) {
    currentCategory = category; // Обновляем текущую категорию
    updateVisibleHexes(); // Обновляем видимые гексы
};

function updateVisibleHexes() {
    // Удаляем все гексы из сцены
    hexObjects.forEach(hex => {
        scene.remove(hex.hexMesh);
    });

    mainGrid.addHexObjects(getHiddenHexes());

    // Очищаем временный массив
    tempGrid = [];

    // Фильтруем гексы по текущей категории
    const filteredHexes = mainGrid.hexObjects.filter(hex => {
        const isVisible = currentCategory ? hex.categories.includes(currentCategory) : true;
        if (!isVisible) {
            tempGrid.push(hex); // Добавляем невидимые гексы в tempGrid
        }
        return isVisible;
    });

    mainGrid.removeHexObjects(getHiddenHexes());

    // Обновляем позиции видимых гексов
    filteredHexes.forEach((hex) => {
        mainGrid.updateHexPositions(tempGrid);
        scene.add(hex.hexMesh); // Добавляем гекс в сцену
    });
    
    console.log(getHiddenHexes());
    console.log(`Количество объектов в mainGrid: ${getMainGridObjectCount()}`);
    // Обновляем позиции всех гексов в mainGrid, если это необходимо
     // Это может быть не нужно, если позиции уже установлены
}

function getHiddenHexes() {
    return tempGrid; // Возвращаем массив скрытых гексов
}

function getMainGridObjectCount() {
    return mainGrid.hexObjects.length; // Возвращаем количество объектов в mainGrid
}

// Запускаем инициализацию
init();

// Запускаем анимацию
animate();