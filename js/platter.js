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
        if (Tone.Transport.state == "started" && this.spots.length == 0)
        {
            this.index = -1;
            Tone.Transport.stop();
        }

        if (Tone.Transport.state == "stopped" && this.spots.length > 0)
            Tone.Transport.start();

        for (let i = 0; i < this.spots.length; i++)
        {
            this.spots[i].update();

            if (this.spots[i].delete)
            {
                this.spots.splice(i, 1);
                i--;
            }
        }
    };

    this.render = function()
    {
        this.g.clear();

        for (let i = 0; i < this.spots.length; i++)
            this.spots[i].render(this.g);
    };

    this.play = function()
    {
        for (let i = 0; i < this.spots.length; i++)
            this.spots[i].play();
    };

    this.onMouseDown = function(pos)
    {
        for (let i = 0; i < this.spots.length; i++)
            if (this.spots[i].contains(pos.x, pos.y))
            {
                if (this.index != -1)
                    this.spots[this.index].offClick();

                this.index = i;
                break;
            }
    };

    this.onMouseUp = function(pos)
    {
        if (this.index == -1)
        {
            this.createSpot(pos.x, pos.y);
            Tone.Transport.start();
        }
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

    this.createSpot = function(x, y, pat)
    {
        let spot = new Spot();
        spot.init(x, y, undefined, pat);
        spot.position.x = x;
        spot.position.y = y;

        this.spots.push(spot);
        return spot;
    };

    this.loadPreset = function()
    {
        let spot1 = this.createSpot(100, 100, "8n2n2n");
        let spot2 = this.createSpot(300, 250, "8n4r4n4r4n");
        let spot3 = this.createSpot(500, 400, "8n8n16r16n4n8n16r16n8n8n");
        let spot4 = this.createSpot(700, 550, "8n");
    };

    this.deleteAll = function()
    {
        for (let i = 0; i < this.spots.length; i++)
            this.spots[i].controls.delete = true;
    };
}

function Controls(pat, rad, vol, col)
{
    this.pattern = pat;
    this.radius = rad;
    this.volume = vol;
    this.color = col;
    this.mute = false;
    this.delete = false;

    this.gui = new dat.GUI({autoPlace: false});
    this.gui.add(this, "pattern");
    this.gui.addColor(this, "color");
    this.gui.add(this, "radius", 3, 20);
    this.gui.add(this, "volume", -50, 0);
    this.gui.add(this, "mute");
    this.gui.add(this, "delete");

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
    this.init = function(xpos, ypos, rad, pat)
    {
        if (xpos == undefined)
            xpos = 0;
        if (ypos == undefined)
            ypos = 0;
        if (rad == undefined)
            rad = 10;
        if (pat == undefined)
            pat = "";

        this.position = {
            x: xpos,
            y: ypos
        };
        this.radius = rad;

        this.pattern = pat;
        this.lastPattern = this.pattern;
        this.color = 0x0000FF;
        this.delete = false;

        this.synth = new Tone.SimpleSynth().toMaster();
        this.synth.volume.value = -25;
        this.synth.oscillator.sync();

        this.calcTempo();
        this.calcPitch();

        this.controls = new Controls(this.pattern, this.radius, this.synth.volume.value, this.color);

        this.start();
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
        this.lastPattern = this.pattern;
        this.pattern = this.controls.pattern;
        this.radius = this.controls.radius;
        this.synth.volume.value = this.controls.volume;
        this.color = this.controls.color;
        this.delete = this.controls.delete;

        this.calcTempo();
        this.calcPitch();

        this.synth.setNote(this.pitch);

        if (this.delete)
            this.dispose();
    };

    this.start = function()
    {
        this.enabled = true;

        if (this.pattern == "")
            this.synth.triggerAttack(this.pitch);
        else
            this.synth.triggerAttackRelease(this.pitch, this.pattern);
    };

    this.stop = function()
    {
        this.enabled = false;
        this.synth.triggerRelease();
    };

    this.play = function()
    {
        this.stop();
        this.enabled = true;

        let s = this.synth;
        let evs = this.createEvents();
        let e = new Tone.Part(function(time, chord)
        {
            s.triggerAttackRelease(chord, "8n", time);
        }, evs).start();
    };

    this.createEvents = function()
    {
        let parts = this.parsePattern();
        let evs = [];
        let m = 0;
        let q = 0;
        let s = 0;

        function add(mm, qq, ss)
        {
            m += mm;

            s += ss;

            while (s >= 5)
            {
                s -= 4;
                q += 1;
            }

            q += qq;

            while (q >= 5)
            {
                q -= 4;
                m += 1;
            }
        };

        for (let i = 0; i < parts.length; i++)
        {
            let type = parts[i][parts[i].length - 1];
            let num = parseInt(parts[i].substr(0, parts[i].length - 1));
            let value = this.pitch;

            if (i != 0)
            {
                switch (num)
                {
                    case 1:
                        add(1, 0, 0);
                        break;
                    case 2:
                        add(0, 2, 0);
                        break;
                    case 4:
                        add(0, 1, 0);
                        break;
                    case 8:
                        add(0, 0, 2);
                        break;
                    case 16:
                        add(0, 0, 1);
                        break;
                }

                if (type == "r")
                    continue;
            }

            let time = m + ":" + q;

            if (s != 0)
                time += ":" + s;

            evs.push([time, value]);
        }

        //for (let i = 0; i < evs.length; i++)
            //console.log(evs[i]);

        return evs;
    };

    this.parsePattern = function()
    {
        let pat = [];
        let index = 0;

        for (let i = 0; i < this.pattern.length; i++)
        {
            if (this.pattern[i] == "r" || this.pattern[i] == "n")
            {
                let len = i - index + 1;
                pat.push(this.pattern.substr(index, len));
                index = i + 1;
            }
        }

        return pat;
    };

    this.dispose = function()
    {
        this.stop();
        this.controls.remove();
        this.synth.dispose();
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
