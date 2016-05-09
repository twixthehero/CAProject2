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
        for (var i = 0; i < this.spots.length; i++)
        {
            this.spots[i].update();
        }
    };

    this.render = function()
    {
        this.g.clear();

        for (var i = 0; i < this.spots.length; i++)
            this.spots[i].render(this.g);
    };

    this.onMouseDown = function(pos)
    {
        for (var i = 0; i < this.spots.length; i++)
        {
            if (this.spots[i].contains(pos.x, pos.y))
            {
                this.index = i;
                break;
            }
        }
    };

    this.onMouseUp = function(pos)
    {
        if (this.index == -1)
            this.createSpot(pos.x, pos.y);
        else
            this.index = -1;
    };

    this.onMouseDrag = function()
    {
        if (this.index != -1)
        {
            //console.log(g_mouseDelta);
            this.spots[this.index].move(g_mouseDelta);
        }
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

        this.osc = new Tone.Oscillator(440, "sawtooth").toMaster();
        this.osc.volume.value = -15;
    };

    this.move = function(delta)
    {
        this.position.x += delta.x;
        this.position.y += delta.y;
    };

    this.update = function() {

    };

    this.render = function(g)
    {
        g.beginFill(0x2222FF, 1.0);
        g.drawCircle(this.position.x, this.position.y, this.radius);
        g.endFill();
    };

    this.onClick = function() {

    };

    this.contains = function(xpos, ypos)
    {
        return Math.sqrt(Math.pow(xpos - this.position.x, 2) + Math.pow(ypos - this.position.y, 2)) < this.radius;
    };
}
