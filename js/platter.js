function Platter()
{
    this.init = function()
    {
        this.spots = [];
        this.g = new PIXI.Graphics();
        g_container.addChild(this.g);

        this.index = -1;
    };

    this.update = function()
    {
        for (let i = 0; i < this.spots.length; i++)
            this.spots[i].update();
    };

    this.render = function()
    {
        this.g.clear();

        for (let i = 0; i < this.spots.length; i++)
            this.spots[i].render(this.g);
    };

    this.onMouseDown = function(pos)
    {
        for (let i = 0; i < this.spots.length; i++)
            if (this.spots[i].contains(pos.x, pos.y))
            {
                this.index = i;
                break;
            }
    };

    this.onMouseUp = function(pos)
    {
        if (this.index == -1)
            this.createSpot(pos.x, pos.y);
        else
        {
            if (this.spots[this.index].contains(pos.x, pos.y))
                this.spots[this.index].onClick();
            else
            {
                for (let i = 0; i < this.spots.length; i++)
                    this.spots[i].offClick();

                this.index = -1;
            }
        }
    };

    this.onMouseDrag = function()
    {
        if (this.index != -1)
            this.spots[this.index].move(g_mouseDelta);
    };

    this.createSpot = function(x, y)
    {
        let spot = new Spot();
        spot.init();
        spot.position.x = x;
        spot.position.y = y;

        this.spots.push(spot);
    };
}

function Controls(pat, rad, vol, col)
{
    this.pattern = pat;
    this.radius = rad;
    this.volume = vol;
    this.color = col;
    this.mute = false;

    this.gui = new dat.GUI({autoPlace: false});
    this.gui.add(this, "pattern");
    this.gui.addColor(this, "color");
    this.gui.add(this, "radius", 3, 20);
    this.gui.add(this, "volume", -30, 0);
    this.gui.add(this, "mute");

    this.add = function()
    {
        addGui(this.gui);
    };

    this.remove = function()
    {
        removeGui(this.gui);
    };
}

function Spot()
{
    this.init = function(xpos, ypos, rad)
    {
        if (xpos == undefined)
            xpos = 0;
        if (ypos == undefined)
            ypos = 0;
        if (rad == undefined)
            rad = 10;

        this.position = {
            x: xpos,
            y: ypos
        };
        this.radius = rad;
        this.pattern = "";
        this.color = 0x0000FF;

        this.osc = new Tone.Oscillator(440, "sawtooth").toMaster();
        this.osc.volume.value = -15;

        this.tempo = this.calcTempo();
        this.pitch = this.calcPitch();

        this.controls = new Controls(this.pattern, this.radius, this.osc.volume.value, this.color);

        this.enabled = true;
        this.osc.start();
    };

    this.calcTempo = function()
    {
        this.tempo = MIN_TEMPO + TEMPO_RANGE * (this.position.x / g_renderer.width);
    };

    this.calcPitch = function()
    {
        this.pitch = MIN_PITCH + PITCH_RANGE * ((g_renderer.height - this.position.y) / g_renderer.height);
    };

    this.move = function(delta)
    {
        this.position.x += delta.x;
        this.position.y += delta.y;

        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x >= g_renderer.width) this.position.x = g_renderer.width - 1;
        if (this.position.y < 0) this.position.y = 0;
        if (this.position.y >= g_renderer.height) this.position.y = g_renderer.height - 1;
    };

    this.update = function()
    {
        this.pattern = this.controls.pattern;
        this.radius = this.controls.radius;
        this.osc.volume.value = this.controls.volume;
        this.color = this.controls.color;

        if (this.osc.state == "started" && this.controls.mute)
            this.osc.stop();
        else if (this.osc.state == "stopped" && !this.controls.mute)
            this.osc.start();

        this.calcTempo();
        this.calcPitch();

        this.osc.frequency.value = this.pitch;
    };

    this.render = function(g)
    {
        g.beginFill(this.color, 1.0);
        g.drawCircle(this.position.x, this.position.y, this.radius);
        g.endFill();
    };

    this.onClick = function()
    {
        this.controls.add();
    };

    this.offClick = function()
    {
        this.controls.remove();
    };

    this.contains = function(xpos, ypos)
    {
        return Math.pow(xpos - this.position.x, 2) + Math.pow(ypos - this.position.y, 2) < this.radius * this.radius;
    };
}
