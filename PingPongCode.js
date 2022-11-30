//Получаем поле из документа
let canvas = document.getElementById('game');
canvas.style.display="none";
//Делаем это поле 2D
let context = canvas.getContext('2d');
//Указываем размер 1 игровой клетки
const grid = 15;
//Высота платформ
const paddleHeight = grid * 5;
//Максимальное значение на которое она может подняться по Y, по X она не двигается
const maxPaddleY = canvas.height - grid - paddleHeight;
//Указываем скорость объектов ( платформ, мяча)
var paddleSpeed = 6;
var ballSpeed = 5;
//Переменная для определения стейта игры
var gameState;
//Перменные для кнопок
//Получаем див, который мы настроили заранее и в котором будут находиться кнопки
const workZoneDiv = document.getElementById("workZone")
//Создаём кнопку и настраиваем её параметры
const startBtn = document.createElement("BUTTON");
startBtn.innerText = "Начать игру";
startBtn.style.width = "500px";
//Добавляем кнопку на див
workZoneDiv.appendChild(startBtn);
//По нажатию кнопки должны появиться ещё две с выбором режима игры, это будет выполняться в данной функции
startBtn.onclick = function (){
    let onePMBtn = document.createElement("BUTTON");
    let twoPMBtn = document.createElement("BUTTON");
    onePMBtn.innerText = "1 игрок";
    onePMBtn.style.width = "500px";
    twoPMBtn.innerText = "2 игрока";
    twoPMBtn.style.width = "500px";
    workZoneDiv.appendChild(onePMBtn);
    workZoneDiv.appendChild(twoPMBtn);
    startBtn.style.display="none";
    onePMBtn.onclick = function(){
        gameState = 0;
        onePMBtn.style.display="none";
        twoPMBtn.style.display="none";
        canvas.style.display="flex";
        console.log(gameState);
    }
    twoPMBtn.onclick = function(){
        gameState = 1;
        onePMBtn.style.display="none";
        twoPMBtn.style.display="none";
        canvas.style.display="flex";
        console.log(gameState);
    }
}
//Описываем платформы
const leftPaddle = {
    //Ставим её по центру с левой стороны
    x: grid * 2,
    y: canvas.height/2 - paddleHeight/2,
    //Высоту и ширину берём из заранее созданных констант
    width: grid,
    height: paddleHeight,
    //На старте платформа никуда не двигается
    dy: 0
};
const rightPaddle = {
    //Ставим её по центру с правой стороны, а дальше всё как в левой
    x: canvas.height + grid * 8 ,
    y: canvas.height/2 - paddleHeight/2,
    width: grid,
    height: paddleHeight,
    dy: 0
};
//Описываем мяч
const ball={
    //Меч должен появиться в центре поля.
    x: canvas.width / 2,
    y: canvas.height / 2,
    //Мяч размером в 1 игровую клетку
    width: grid,
    height: grid,
    //Boolean для того чтобы отслеживать, нужно ли ввести мяч в игру заного
    resetting: false,
    dx: ballSpeed,
    dy: -ballSpeed
};
//Функция проверки пересечения двух объектов
function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}
//TODO заменить повторяющийся код для платформ двумя вызовами 1 функции, написать эту функцию
//Основной цикл игры
function loop(){
    //Очистка игрового поля, этот метод окна(window) даст реквест браузеру о том, что необходимо перезапустить функцию для обновления анимации
    window.requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);
    //Продолжаем движение платформ если они уже двигались
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;
    //Не даём обеим платформам вылезти за игровое поле
    if (leftPaddle.y < grid) {
        leftPaddle.y = grid;
    }else if (leftPaddle.y > maxPaddleY){
        leftPaddle.y = maxPaddleY;
    }
    if (rightPaddle.y < grid) {
        rightPaddle.y = grid;
    }else if (rightPaddle.y > maxPaddleY){
        rightPaddle.y = maxPaddleY;
    }

    //Рисуем платформы
    context.fillStyle = "purple";
    // Каждая платформа — прямоугольник
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    //Продолжаем движение мяча, если он двигался
    ball.x += ball.dx;
    ball.y += ball.dy;
    //При качании мячом стен или платформ меняем его направление
    if (ball.y < grid){
        ball.y = grid;
        ball.dy *= -1;
    }else if (ball.y + grid > canvas. height - grid){
        ball.y = canvas.height - grid * 2;
        ball.dy *= -1;
    }
    //TODO добавить счётчик очков и детектить куда улетел мяч, и обратный отсчёт перед подачей, мб даже с визуальным эффектом
    //Проверяем не улител ли игровой мяч за поле
    if((ball.x < 0 || ball.x > canvas.width) && !ball.resetting){
        //Пометили что мяч ребутнут, чтобы не улететь в цикл
        ball.resetting = true;
        //Даём игрокам время на подготовку, меняем флаг ребута и ставим мяч по середине поля
        setTimeout(()=> {
            ball.resetting = false;
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
        },1000);
    }
    //Проверки пересечения мяча с платформами
    if (collides(ball, leftPaddle)){
        ball.dx *=-1;
        ball.x = leftPaddle.x + leftPaddle.width;
    }else if (collides(ball, rightPaddle)){
        ball.dx *= -1;
        ball.x = rightPaddle.x - ball.width;
    }
    //Отрисовка игрового поля и мяча
    context.fillStyle = 'red';
    context.fillRect(ball.x, ball.y, ball.width, ball.height);
    context.fillStyle = 'lightgrey';
    context.fillRect(0, 0, canvas.width, grid);
    context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);
    //TODO Попробовать сделать узор вместо банальных пунктирных линий
    for (let i = grid; i < canvas.height - grid; i += grid * 2) {
        context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
    }
    //Отслеживаем нажатия и отжатия клавиш
    document.addEventListener('keydown', function (e) {
        if (e.which === 38) {
            rightPaddle.dy = -paddleSpeed;
        } else if (e.which === 40) {
            rightPaddle.dy = paddleSpeed;
        }
        if (e.which === 87) {
            leftPaddle.dy = -paddleSpeed;
        }
        else if (e.which === 83) {
            leftPaddle.dy = paddleSpeed;
        }
    });
    document.addEventListener('keyup', function (e) {
        if (e.which === 38 || e.which === 40) {
            rightPaddle.dy = 0;
        }
        if (e.which === 83 || e.which === 87) {
            leftPaddle.dy = 0;
        }
    });
}
    window.requestAnimationFrame(loop);