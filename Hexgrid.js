import { HexObject } from './ingridient.js';

export class HexGrid {
    constructor(ingredients, center = new THREE.Vector3(0, 0, 0)) {
        this.hexObjects = []; // Массив объектов HexObject
        this.center = center; // Установка центра

        // Создаем объекты HexObject на основе переданных ингредиентов
        if (ingredients) {
            this.createHexObjects(ingredients);
        }
    }

    createHexObjects(ingredients) {
        ingredients.forEach(ingredient => {
            const hex = new HexObject(ingredient.model, ingredient.fats, ingredient.proteins, ingredient.carbohydrates, ingredient.categories);

            ingredient.categories.forEach(category => hex.addCategory(category));
            // Добавляем созданный объект в массив
            this.hexObjects.push(hex);

            this.positionHex(hex);
        });
    }

    positionHex(hex) {
        const hexWidth = 1; // Ширина одного гекса
        const hexHeight = 0.5; // Высота одного гекса

        const index = this.hexObjects.indexOf(hex);
        const row = Math.floor(index / 5); // Количество гексов в ряду
        const col = index % 5; // Индекс гекса в ряду

        // Смещение по оси X и Y
        const xOffset = (col * hexWidth) - (2 * hexWidth) + (row % 2) * (hexWidth / 2);
        const yOffset = (row * hexHeight);

        // Устанавливаем позицию с учетом центра
        hex.hexMesh.position.set(
            xOffset + this.center.x,
            yOffset + 1 + this.center.y,
            this.center.z
        );
    }

    getHexObjects() {
        return this.hexObjects;
    }

    moveHexObject(sourceGrid, hexObject, scene) {
        // Проверяем, есть ли объект в исходном классе
        const index = sourceGrid.hexObjects.indexOf(hexObject);
        if (index !== -1) {
            // Удаляем объект из исходного класса
            sourceGrid.hexObjects.splice(index, 1);
            
            // Добавляем объект в текущий класс
            this.hexObjects.push(hexObject);
            
            // Обновляем позицию объекта
            this.positionHex(hexObject); // Пересчитываем позицию
            
            // Добавляем объект в сцену
            scene.add(hexObject.hexMesh);
        } else {
            console.error('Объект не найден в исходном классе.');
        }
    }
}
