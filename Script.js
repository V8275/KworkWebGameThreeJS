// Объявляем глобальные переменные
let scene, camera, renderer;
const hexagons = []; // Массив для хранения гексов
const ingredients = [
    { name: "Авокадо", fats: 15, proteins: 2, carbs: 9, categories: ["фрукты", "жиры"] },
    { name: "Куриная грудка", fats: 3, proteins: 31, carbs: 0, categories: ["мясо", "белки"] },
    { name: "Рис", fats: 0.5, proteins: 2.7, carbs: 28, categories: ["зерновые", "углеводы"] },
    { name: "Брокколи", fats: 0.4, proteins: 2.8, carbs: 7, categories: ["овощи", "углеводы"] },
    { name: "Орехи", fats: 50, proteins: 20, carbs: 20, categories: ["жиры", "белки"] },
    // Добавьте больше ингредиентов по необходимости
];

let currentCategoryIndex = 0;
const categories = ["жиры", "белки", "углеводы", "овощи", "хрустящие", "мягкое", "сладкое"];

// Функция для создания 3D-гексагона с ингредиентом
function createIngredientHexagon(ingredient) {
    const geometry = new THREE.CylinderGeometry(1, 1, 0.5, 6);
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff, flatShading: true });
    const hexagon = new THREE.Mesh(geometry, material);
    
    // Включаем тени
    hexagon.castShadow = true;
    hexagon.receiveShadow = true;

    // Наклоняем гексагон
    hexagon.rotation.x = Math.PI / 6; // Наклон по оси X

    // Создание текста с именем ингредиента
    const textGeometry = new THREE.TextGeometry(ingredient.name, {
        font: new THREE.FontLoader().load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'),
        size: 0.2,
        height: 0.05,
    });
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    textMesh.position.set(-0.5, 0.25, 0); // Позиционируем текст
    hexagon.add(textMesh);
    
    hexagon.userData = ingredient; // Сохраняем данные об ингредиенте
    return hexagon;
}

// Функция для размещения ингредиентов на гексах
function placeIngredientsOnHexagons() {
    const hexagonSpacing = 2; // Расстояние между гексами
    const category = categories[currentCategoryIndex];
    const filteredIngredients = ingredients.filter(ingredient => ingredient.categories.includes(category));
    
    // Удаляем старые гексы из сцены
    hexagons.forEach(hex => scene.remove(hex));
    hexagons.length = 0; // Очищаем массив

    filteredIngredients.forEach((ingredient, index) => {
        const hexagon = createIngredientHexagon(ingredient);
        hexagon.position.x = (index % 5) * hexagonSpacing - (hexagonSpacing * 2); // Расположение по X
        hexagon.position.y = Math.floor(index / 5) * hexagonSpacing; // Расположение по Y
        scene.add(hexagon);
        hexagons.push(hexagon); // Добавляем гекс в массив
    });

    // Настройка камеры в зависимости от количества гексов
    if (filteredIngredients.length > 0) {
        camera.position.z = Math.max(5, filteredIngredients.length / 2); // Увеличиваем/уменьшаем расстояние
    } else {
        camera.position.z = 5; // Возвращаем в исходное положение, если ничего нет
    }
}

// Функция для переключения категорий
function switchCategory() {
    currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    document.getElementById('categoryButton').innerText = categories[currentCategoryIndex];
    placeIngredientsOnHexagons();
}

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

    camera.position.z = 5; // Устанавливаем позицию камеры
    
    // Добавляем свет для теней
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    light.castShadow = true;
    scene.add(light);
    
    placeIngredientsOnHexagons(); // Размещаем ингредиенты
    
    // Обработчик события для кнопки
    document.getElementById('categoryButton').addEventListener('click', switchCategory);

    // Запускаем анимацию
    animate();
}

// Основной цикл анимации
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Запускаем инициализацию
init();
