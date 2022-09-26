class Game {
    started = false;
    particles = [];
    entities = [];
    player = null;

    constructor(ticks) {
        this.ticks = ticks;
        this.Interval = 1000 / this.ticks;
        this.IntervalID = undefined;
    }

    move_player(key = null) {
        if (key === null) return;

        switch (key) {
            case Input.up:
                this.player.input(Vector.up);
                break;
            case Input.down:
                this.player.input(Vector.down);
                break;
            case Input.left:
                this.player.input(Vector.left);
                break;
            case Input.right:
                this.player.input(Vector.right);
                break;
        }
    }

    update_interval() {
        this.Interval = 1000 / this.ticks;
        this.reset_interval();
    }
    
    reset_interval() {
        clearInterval(this.IntervalID);
        this.start_interval(this.Interval);
    }

    random_start() {
        this.particles.forEach(particle => {
            const position = new Vector(
                Utilities.random(50, canvas_width - 50),
                Utilities.random(50, canvas_height - 50)
            );
            particle.position = position;
        });
    }

    update_ticks(ticks) {
        this.ticks = ticks;
        this.update_interval();
    }

    start_game() {
        this.create_particles(100, "blue");
        this.create_particles(100, "white");
        this.create_particles(100, "yellow");
        this.entities.push(this.create_entity("Enemy", "red"));
        this.player = this.create_player("Player", "green");
        
        if (this.IntervalID === undefined) {
            this.start_interval(this.Interval);
        }
    }

    create_player(name = "Player", color) {
        return new Player(name, new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        ), color);
    }

    create_entity(name = "Enemy", color) {
        return new Entity(name, new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        ), color);
    }

    create_particles(amount, color) {
        for (let i = 0; i < amount; i++) {
            var particle = this.create_particle(color);
            this.particles.push(particle);
        }
    }

    create_particle(color) {
        return new Particle(new Vector(
            Utilities.random(50, canvas_width - 50),
            Utilities.random(50, canvas_height - 50)
        ), color);
    }

    start_interval(time) {
        this.IntervalID = setInterval(() => {
            this.draw_background();

            // Game logic goes here
            if (this.particles.length > 0) {
                this.particles.forEach(particle => {
                    particle.update();
                });
            }

            if (this.entities.length > 0) {
                this.entities.forEach(entity => {
                    entity.update();
                });
            }
            if (this.player !== null) {
                this.player.update();
                this.player.check_collision(
                    this.particles.length > 0 ? this.particles : null,
                    this.entities.length > 0 ? this.entities : null
                );
            }
        }, time);

        if (this.IntervalID !== undefined) {
            this.started = true;
        }
    }

    draw_background() {
        const gradient = context.createLinearGradient(0, 0, 0, canvas_height);
        gradient.addColorStop(0, "black");
        gradient.addColorStop(1, "black");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas_width, canvas_height);
    }
}