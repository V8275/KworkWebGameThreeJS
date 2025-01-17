export class HexObject {
    constructor(model, fats, proteins, carbohydrates, targetPosition, angle) {
        
        this.model = model; // Модель объекта
        this.fats = fats; // Жиры
        this.proteins = proteins; // Белки
        this.carbohydrates = carbohydrates; // Углеводы
        this.categories = []; // Категории
        this.targetPosition = targetPosition; // Позиция, куда переносить объект
        this.angle = angle; // Угол вращения в радианах
        this.init();
    }

    init() {
        // Создание гекса
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 6);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, flatShading: true });
        this.hexMesh = new THREE.Mesh(geometry, material);
        this.hexMesh.rotation.x = THREE.MathUtils.degToRad(this.angle);

        this.hexMesh.castShadow = true;
        this.hexMesh.receiveShadow = false;

        // Добавление модели на гекс (если есть)
        if (this.model) {
            this.addModel();
        }

        // Добавление обработчика событий
        this.hexMesh.userData = { hexObject: this }; // Сохраняем ссылку на объект
        this.hexMesh.onClick = this.handleClick.bind(this);
        
        // Начальная позиция
        this.currentPosition = this.hexMesh.position.clone();
    }

    addModel() {
        // Предполагается, что модель загружена и готова к добавлению
        this.hexMesh.add(this.model);
    }

    addCategory(category) {
        if (!this.categories.includes(category)) {
            this.categories.push(category);
        }
    }

    setTarget(target){
        this.targetPosition = target;
    }

    getInfo() {
        return {
            fats: this.fats,
            proteins: this.proteins,
            carbohydrates: this.carbohydrates,
            categories: this.categories
        };
    }

    handleClick() {
        // Перемещение объекта к целевой позиции с callback
        this.moveToTarget(() => {
            console.log("Анимация завершена!");
            // Здесь можно выполнить дополнительные действия
        });
    }

    moveToTarget(callback) {
        // Запускаем анимацию
        this.animateMovement(callback);
    }
    
    animateMovement(callback) {
        const animationSpeed = 0.1; // Скорость анимации
        const target = new THREE.Vector3(this.targetPosition.x, this.targetPosition.y, this.targetPosition.z);
        
        const animate = () => {
            this.currentPosition.lerp(target, animationSpeed);
            this.hexMesh.position.copy(this.currentPosition);
            
            if (this.currentPosition.distanceTo(target) > 0.01) {
                requestAnimationFrame(animate);
            } else {
                this.hexMesh.position.copy(target);
                this.currentPosition.copy(target); // Сохраняем текущую позицию
                callback(); // Вызываем callback по завершении анимации
            }
        };
        animate();
    }
    
    
}