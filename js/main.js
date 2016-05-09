"use strict";

var g_renderer = new PIXI.WebGLRenderer(window.width, window.height);
g_renderer.view.style.display = "block";
var g_container = new PIXI.Container();
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
