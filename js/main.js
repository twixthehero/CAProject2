"use strict";

let g_renderer = new PIXI.WebGLRenderer(window.width, window.height);
g_renderer.view.style.display = "block";
let g_container = new PIXI.Container();
g_container.hitArea = new PIXI.Rectangle(0, 0, g_renderer.width, g_renderer.height);
g_container.interactive = true;
g_container.buttonMode = true;

var g_mouseDown = false;
var g_mousePos = {
    x: 0,
    y: 0
};
var g_lastMousePos = {
    x: 0,
    y: 0
};
var g_mouseDelta = {
    x: 0,
    y: 0
}

g_container.mousedown = function(mouseData)
{
    g_mouseDown = true;
    g_mousePos = {
        x: mouseData.data.global.x,
        y: mouseData.data.global.y
    };
    platter.onMouseDown(mouseData.data.global);
};
g_container.mouseup = function(mouseData)
{
    platter.onMouseUp(mouseData.data.global);

    g_mouseDown = false;
};
g_container.mousemove = function(mouseData)
{
    g_lastMousePos = {x: g_mousePos.x, y: g_mousePos.y};
    g_mousePos = {x: mouseData.data.global.x, y: mouseData.data.global.y};
    g_mouseDelta = {x: g_mousePos.x - g_lastMousePos.x, y: g_mousePos.y - g_lastMousePos.y};

    if (g_mouseDown)
        platter.onMouseDrag();
};

function update()
{
    platter.update();

    platter.render();
    g_renderer.render(g_container);

    requestAnimationFrame(update);
};

document.body.appendChild(g_renderer.view);
var platter = new Platter();
platter.init();

requestAnimationFrame(update);

window.onload = init;

var g_guiContainer = undefined;
var gui = new dat.GUI({autoPlace: false});
var MIN_TEMPO = 60;
var MAX_TEMPO = 180;
var MIN_PITCH = 27.5;
var MAX_PITCH = 4186;
var TEMPO_RANGE;
var PITCH_RANGE;

function init()
{
    g_guiContainer = document.getElementById("guicont");

    let settings = {
        minTempo: MIN_TEMPO,
        maxTempo: MAX_TEMPO,
        minPitch: MIN_PITCH,
        maxPitch: MAX_PITCH
    };

    var minTCont = gui.add(settings, "minTempo", 20, 120);
    var maxTCont = gui.add(settings, "maxTempo", 120, 240);
    var minPCont = gui.add(settings, "minPitch", 27.5, 2000);
    var maxPCont = gui.add(settings, "maxPitch", 2000, 4186);

    minTCont.onChange(function(value)
    {
        MIN_TEMPO = value;
        calcRanges();
    });
    maxTCont.onChange(function(value)
    {
        MAX_TEMPO = value;
        calcRanges();
    });
    minPCont.onChange(function(value)
    {
        MIN_PITCH = value;
        calcRanges();
    });
    maxPCont.onChange(function(value)
    {
        MAX_PITCH = value;
        calcRanges();
    });

    addGui(gui);

    calcRanges();
}

function calcRanges()
{
    TEMPO_RANGE = MAX_TEMPO - MIN_TEMPO;
    PITCH_RANGE = MAX_PITCH - MIN_PITCH;
}

function addGui(gui)
{
    g_guiContainer.appendChild(gui.domElement);
}

function removeGui(gui)
{
    g_guiContainer.removeChild(gui.domElement);
}
