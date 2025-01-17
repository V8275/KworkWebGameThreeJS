import { HexObject } from './ingridient.js';

export class HexGrid {
    rotAngle = 0;

    constructor(ingredients, center = new THREE.Vector3(0, 0, 0), angle = 0) {
        this.hexObjects = []; // Массив объектов HexObject
        this.center = center; // Установка центра
        this.rotAngle = angle;
        // Создаем объекты HexObject на основе переданных ингредиентов
        if (ingredients) {
            this.createHexObjects(ingredients);
        }
    }

    createHexObjects(ingredients) {
        ingredients.forEach(ingredient => {
            const hex = new HexObject(ingredient.model, ingredient.fats, ingredient.proteins, ingredient.carbohydrates, ingredient.categories, this.rotAngle);

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
        const newPosition = new THREE.Vector3(
            xOffset + this.center.x,
            yOffset + 1 + this.center.y,
            this.center.z
        );

        hex.hexMesh.position.copy(newPosition); // Обновляем позицию гекса
        return newPosition; // Возвращаем новую позицию
    }

    addHexObjects(newHexObjects) {
        newHexObjects.forEach(ingredient => {
            const hex = new HexObject(ingredient.model, ingredient.fats, ingredient.proteins, ingredient.carbohydrates, ingredient.categories, this.rotAngle);

            ingredient.categories.forEach(category => hex.addCategory(category));
            // Добавляем созданный объект в массив
            this.hexObjects.push(hex);

            this.positionHex(hex);
        });
    }

    removeHexObjects(hexObjectsToRemove) {
        hexObjectsToRemove.forEach(hexToRemove => {
            const index = this.hexObjects.indexOf(hexToRemove);
            if (index !== -1) {
                // Удаляем объект из массива
                this.hexObjects.splice(index, 1);
            }
        });
    }

    getHexObjects() {
        return this.hexObjects;
    }

    moveHexObject(sourceGrid, hexObject, scene, callback) {
        const index = sourceGrid.hexObjects.indexOf(hexObject);
        if (index !== -1) {
            // Удаляем объект из исходного грида
            sourceGrid.hexObjects.splice(index, 1);
    
            // Добавляем объект в текущий грид
            this.hexObjects.push(hexObject);
    
            // Устанавливаем целевую позицию для анимации
            hexObject.setTarget(this.positionHex(hexObject)); // Устанавливаем позицию в текущем классе
    
            // Запускаем анимацию перемещения
            hexObject.moveToTarget(() => {
                // Добавляем объект в сцену после завершения анимации
                scene.add(hexObject.hexMesh);
                console.log('Перемещение завершено.');
    
                // Пересчитываем позиции всех гексов в целевом гриде
                this.updateHexPositions(); // Обновляем позиции всех гексов
    
                // Вызов callback, если он передан
                if (callback && typeof callback === 'function') {
                    callback(hexObject); // Передаем перемещенный объект как аргумент
                }
            });
        } else {
            console.error('Объект не найден в исходном классе.');
        }
    }
    


    updateHexPositions(tempGrid) {
        this.hexObjects.forEach((hex, index) => {
            const newPosition = this.positionHex(hex);
            hex.hexMesh.position.copy(newPosition);
        });

        if (tempGrid) {
            // Обновляем позиции также для временного массива
            tempGrid.forEach(hex => {
                const newPosition = this.positionHex(hex);
                hex.hexMesh.position.copy(newPosition);
            });
        }

    }
}