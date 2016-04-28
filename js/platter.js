function Platter()
{
    this.init = function()
    {
        this.spots = [];
    }

    this.update = function()
    {

    }

    this.addSpot = function(spot)
    {
        this.spots.push(spot);
    }
}

function Spot()
{
    this.init = function()
    {
        this.position = { x: 0, y: 0 };
        this.osc = new Tone.Oscillator(440, "sawtooth");
        this.osc.toMaster();
        this.osc.setVolume(-15);
    }

    this.update = function()
    {

    }
}
