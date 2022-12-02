//Получаем поле из документа
let canvas = document.getElementById('game');
canvas.style.display = "none";
//Делаем это поле 2D
let context = canvas.getContext('2d');
//Указываем размер 1 игровой клетки
const grid = 15;
//Высота платформ
const paddleHeight = grid * 5;
//Максимальное значение на которое она может подняться по Y, по X она не двигается
const maxPaddleY = canvas.height - grid - paddleHeight;
//Указываем скорость объектов ( платформ, мяча)
var paddleSpeed = 8;
var paddleSpeedAI = 1;
var ballSpeed = 5;
//Переменная для определения стейта игры
var gameState;
//Очки и жизни
var scorePoints1p = 0;
var scorePoints2p = 0;
var lifePoints;
//Перменные для кнопок
//Получаем див, который мы настроили заранее и в котором будут находиться кнопки
const workZoneDiv = document.getElementById("workZone");
//Описываем платформы
const leftPaddle = {
    //Ставим её по центру с левой стороны
    x: grid * 2,
    y: canvas.height / 2 - paddleHeight / 2,
    //Высоту и ширину берём из заранее созданных констант
    width: grid,
    height: paddleHeight,
    //На старте платформа никуда не двигается
    dy: 0
};
const rightPaddle = {
    //Ставим её по центру с правой стороны, а дальше всё как в левой
    x: canvas.height + grid * 8,
    y: canvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,
    dy: 0
};
//Описываем мяч
const ball = {
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
//Создаём наши кнопки
const startBtn = btnCreate("Начать игру","500px");
var onePMBtn;
var twoPMBtn;
/*Создаём кнопку и настраиваем её параметры
По нажатию кнопки должны появиться ещё две с выбором режима игры, это будет выполняться в данной функции
Функция для создания кнопок
*/
function btnCreate(btnText, btnWidth) {
    var btnName;
    btnName = document.createElement("BUTTON");
    btnName.innerText = btnText;
    btnName.style.width = btnWidth;
    workZoneDiv.appendChild(btnName);
    return btnName;
}
//Функция для обработки выбора режима игры
function stateBtnEvent(numb, buffBTN1, buffBTN2){
    gameState = numb;
    buffBTN1.style.display = "none";
    buffBTN2.style.display = "none";
    canvas.style.display = "flex";
}
//Функция кнопки начала игры
function mainButtonHell() {
    startBtn.removeEventListener("click",mainButtonHell);
    onePMBtn = btnCreate("1 игрок","500px");
    twoPMBtn = btnCreate("2 игрока","500px");
    startBtn.style.display = "none";
    onePMBtn.addEventListener("click",  function() {stateBtnEvent(1, onePMBtn, twoPMBtn)});
    onePMBtn.removeEventListener("click",  function() {stateBtnEvent(1, onePMBtn, twoPMBtn)});
    twoPMBtn.addEventListener("click", function() {stateBtnEvent(0, twoPMBtn, onePMBtn)});
    twoPMBtn.removeEventListener("click", function() {stateBtnEvent(0, twoPMBtn, onePMBtn)});
}
//Функция проверки пересечения двух объектов
function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}
//Функция детекшона колизии платформ
function platformCollision(paddleName){
    if (paddleName.y < grid) {
        paddleName.y = grid;
    } else if (paddleName.y > maxPaddleY) {
        paddleName.y = maxPaddleY;
    }
}
startBtn.addEventListener("click",mainButtonHell);
//Основной цикл игры
function loop() {
    //Очистка игрового поля, этот метод окна(window) даст реквест браузеру о том, что необходимо перезапустить функцию для обновления анимации
    window.requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);
    //Продолжаем движение платформ если они уже двигались
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;
    platformCollision(leftPaddle);
    platformCollision(rightPaddle);
    //Рисуем платформы
    context.fillStyle = "purple";
    // Каждая платформа — прямоугольник
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
    //Продолжаем движение мяча, если он двигался
    ball.x += ball.dx;
    ball.y += ball.dy;
    //При касании мячом стен или платформ меняем его направление
    if (ball.y < grid) {
        ball.y = grid;
        ball.dy *= -1;
    } else if (ball.y + grid > canvas.height - grid) {
        ball.y = canvas.height - grid * 2;
        ball.dy *= -1;
    }
    //Проверяем не улител ли игровой мяч за поле
    if ((ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
        if(ball.x < 0){
            if (gameState === 1) {
                lifePoints -= 1;
            }
            scorePoints2p+=1;
            //TODO пофиксить баг с лишним очком у 1 из игроков
        }else if(ball.x >= 750){
            scorePoints1p+=1;
        }
        //Пометили что мяч ребутнут, чтобы не улететь в цикл
        ball.resetting = true;
        //Даём игрокам время на подготовку, меняем флаг ребута и ставим мяч по середине поля
        setTimeout(() => {
            ball.resetting = false;
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
        }, 1000);
    }
    //Проверки пересечения мяча с платформами
    if (collides(ball, leftPaddle)) {
        ball.dx *= -1;
        ball.x = leftPaddle.x + leftPaddle.width;
    } else if (collides(ball, rightPaddle)) {
        ball.dx *= -1;
        ball.x = rightPaddle.x - ball.width;
    }
    //Отрисовка игрового поля и мяча
    context.font = "48px serif";
    context.strokeText(scorePoints1p, canvas.width/4, 50);
    context.strokeText(scorePoints2p, canvas.width-canvas.width/4, 50);
    context.fillStyle = 'red';
    context.fillRect(ball.x, ball.y, ball.width, ball.height);
    context.fillStyle = 'lightgrey';
    context.fillRect(0, 0, canvas.width, grid);
    context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);
    for (let i = grid; i < canvas.height - grid; i += grid * 2) {
        context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
    }
    //Отслеживаем нажатия и отжатия клавиш
    document.addEventListener('keydown', function (e) {
        if (gameState == 0) {
            if (e.which === 38) {
                rightPaddle.dy = -paddleSpeed;
            } else if (e.which === 40) {
                rightPaddle.dy = paddleSpeed;
            }
        }
        if (e.which === 87) {
            leftPaddle.dy = -paddleSpeed;
        } else if (e.which === 83) {
            leftPaddle.dy = paddleSpeed;
        }
    });
    document.addEventListener('keyup', function (e) {
        if (gameState == 0) {
            if (e.which === 38 || e.which === 40) {
                rightPaddle.dy = 0;
            }
        }
        if (e.which === 83 || e.which === 87) {
            leftPaddle.dy = 0;
        }
    });
    //Добавим бота в случае режима на 1 игрока
    if (gameState == 1) {
            if ((rightPaddle.y <= ball.y) && (ball.x >= 475)) {
                rightPaddle.dy += paddleSpeedAI;
            } else if ((rightPaddle.y > ball.y) && (ball.x >= 475)) {
                rightPaddle.dy -= paddleSpeedAI;
            }
    }
}

window.requestAnimationFrame(loop);