var colorBackground = "#f0faef";
var ax = 100,
    ay = 50; // положение подвеса
var canvas, ctx; 
var width, height; // область рисования?
var bu1, bu2; // кнопки сброса старта
var ipD, ipM; // поля ввода
var on;
var t; // время
var tU; // время начала
var timer; 
var D; // константа упруг
var m; 
var g;
var A; 
var omega; 
var T; 
var phi; 
var py; 
//достаем элемент хтмл
function getElement(id, text) {
    var e = document.getElementById(id);
    if (text) e.innerHTML = text; 
    return e; 
}

var text02 = ["Старт", "Пауза", "Продолжить"];
function start() {
    canvas = getElement("cv");
    width = canvas.width;
    height = canvas.height; 
    ctx = canvas.getContext("2d"); 
    bu1 = getElement("bu1", 'Сброс'); // кнопка сброса
    bu2 = getElement("bu2", text02[0]); // кнопка старта
    bu2.state = 0; // начальное состояние 
    getElement("ipDa", 'Коэффициент упругости '); 
    ipD = getElement("ipDb"); // конст упруг
    getElement("ipDc", 'N/m'); 
    getElement("ipMa", 'Macca '); 
    ipM = getElement("ipMb"); // масса
    getElement("ipMc", 'kg');
    
    D = 25; 
    m = 5; 
    g = 9.81; 
    A = 0.1; 

    updateInput();  
    omega = Math.sqrt(D / m); 
    T = 2 * Math.PI / omega; 
    on = false; 
    t = tU = 0; // текущее время
    bu1.onclick = reactionReset; 
    bu2.onclick = reactionStart; 
    ipD.onkeydown = reactionEnter; 
    ipM.onkeydown = reactionEnter;  
    paint();
} 

// изменение состояния
function setButton2State(st) {
    bu2.state = st; // сохранили состояние
    bu2.innerHTML = text02[st]; // обновили текст на кнопке
}
// ридонли для полей во время анимации
function enableInput(p) {
    ipD.readOnly = !p; 
    ipM.readOnly = !p;  
}

// кнопка сброса
function reactionReset() {
    setButton2State(0); 
    enableInput(true); // убираем ридонли
    stopAnimation(); 
    t = tU = 0; // сбрасываем время
    on = false;
    reaction(); // принимаем новые значения констант
    paint(); 
}

// кнопка старт
function reactionStart() {
    if (bu2.state != 1) t0 = new Date(); 
    var st = bu2.state; 
    if (st == 0) st = 1; // если состояние 0 - то запускаем
    else st = 3 - st; 
    setButton2State(st); 
    enableInput(false); 
    if (bu2.state == 1) startAnimation(); 
    else stopAnimation(); 
    reaction(); 
    paint(); 
}

// ограничение на вводимые константы (можно поменять если надо), и перерасчет периода
function reaction() {
    D = inputNumber(ipD, 3, false, 5, 50); 
    m = inputNumber(ipM, 3, false, 1, 10); 
    omega = Math.sqrt(D / m); 
    T = 2 * Math.PI / omega;
}
// реакция на ввод констант
function reactionEnter(e) {
    if (e.key && String(e.key) == "Enter" || e.keyCode == 13)         reaction(); 
    paint();
}
// анимация
function startAnimation() {
    on = true; 
    timer = setInterval(paint, 40);
    t0 = new Date();
}
function stopAnimation() {
    on = false; 
    clearInterval(timer); 
}

// округление + замена точки на запутую вводимого числа
function ToString(n, d, fix) {
    var s = (fix ? n.toFixed(d) : n.toPrecision(d)); 
    return s.replace(".", ",");
}

// ограничение на вводимые числа
function inputNumber(ef, d, fix, min, max) {
    var s = ef.value; 
    s = s.replace(",", "."); 
    var n = Number(s); 
    if (isNaN(n)) n = 0;  
    if (n < min) n = min; 
    if (n > max) n = max; 
    ef.value = ToString(n, d, fix); 
    return n; 
}

// обновление полей ввода перед стартом

function updateInput() {
    ipD.value = ToString(D, 3, false); 
    ipM.value = ToString(m, 3, false);  
}


function newPath() {
    ctx.beginPath(); 
    ctx.strokeStyle = "#000000"; 
    ctx.lineWidth = 1;
}

// рисуем линию x1 y1 ---> x2 y2

function line(x1, y1, x2, y2, c, w) {
    newPath(); 
    if (c) ctx.strokeStyle = c; 
    if (w) ctx.lineWidth = w; // устанавливаем цвет и толщину 
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2); 
    ctx.stroke();
}

// подвес ширина высота, координаты
function rectangle(x, y, w, h, c) {
    if (c) ctx.fillStyle = c; 
    newPath(); 
    ctx.fillRect(x, y, w, h); 
    ctx.strokeRect(x, y, w, h); 
}

// тело (радиус + координаты)
function circle(x, y, r, c) {
    if (c) ctx.fillStyle = c;
    newPath(); 
    ctx.arc(x, y, r * 2, 0, 2 * Math.PI, true); 
    ctx.fill(); 
    ctx.stroke();
}

// пружина через синус задаем
function spring() {
    var per = (py - ay - 25) / 10.0; // период
    var ampl = 10; 
    var omega = 2 * Math.PI / per; 
    newPath(); 
    ctx.moveTo(ax, ay + 10); // координаты подвеса
    for (var y = ay + 13; y <= py - 15; y++) { 
        var x = ax + ampl * Math.sin(omega * (y - ay - 10)); 
        if (y > py - 16) x = Math.max(x, ax); 
        ctx.lineTo(x, y); 
    }
    ctx.stroke();
}

// собираем маятник воедино (сверху вниз)
function springpendulum() {
    rectangle(ax - 50, ay - 5, 100, 10, "#000000"); // подвес
    line(ax, ay, ax, ay + 10); // верхний конец пружинки
    spring(); // пружина через синус
    line(ax, py - 15, ax, py - 5); // нижний конец
    circle(ax, py, 5, '#ffffff'); // тело

}

// для надписей
function alignText(s, t, x, y) {
    ctx.font = "normal normal 14px sans-serif"; 
    if (t == 0) ctx.textAlign = "left"; 
    else if (t == 1) ctx.textAlign = "center"; 
    else ctx.textAlign = "right"; 
    ctx.fillText(s, x, y); }


// рисование
function paint() {
    ctx.fillStyle = colorBackground; 
    ctx.fillRect(0, 0, width, height); // фон
    ctx.font = "normal normal 14px sans-serif"; // шрифт
    if (on) { // если нажата кнопка старт --> анимация включена
        var t1 = new Date(); // текущее время
        var dt = (t1 - t0) / 1000; // dt - для обновления
        t += dt; 
        t0 = t1; 
        tU = (t < 5 ? 0 : t - 5); 
    }
    phi = omega * t; 
    py = 180 - 500 * A * Math.cos(phi); // положение тела маятника
    springpendulum(); // отрисовка маятника 
    var s = "Период колебаний:  " + T.toPrecision(3) + " s"; 
    s = s.replace(".", ","); 
    ctx.fillStyle = "#000000"; 
    alignText(s, 1, ax, height - 35); // пишем период
}

document.addEventListener("DOMContentLoaded", start, false);