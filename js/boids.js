const flock = [];
let boidColor;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '0');
  canvas.style('position', 'fixed');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('pointer-events', 'none'); 
  
  for (let i = 0; i < 150; i++) {
    flock.push(new Boid());
  }
}

function draw() {
  clear(); 
  
  const isDark = document.body.classList.contains('dark');
  if (isDark) {
    boidColor = color(212, 163, 115, 80); 
  } else {
    boidColor = color(138, 90, 68, 60); 
  }

  for (let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Boid {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(1, 1.5));
    this.acceleration = createVector();
    this.maxForce = 0.03;
    this.maxSpeed = 1.5;
  }

  edges() {
    if (this.position.x > width + 20) this.position.x = -20;
    else if (this.position.x < -20) this.position.x = width + 20;
    if (this.position.y > height + 20) this.position.y = -20;
    else if (this.position.y < -20) this.position.y = height + 20;
  }

  align(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  separation(boids) {
    let perceptionRadius = 30;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perceptionRadius = 50;
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }
  
  avoidMouse() {
    let steering = createVector();
    let d = dist(this.position.x, this.position.y, mouseX, mouseY);
    if (d < 150) {
      let diff = p5.Vector.sub(this.position, createVector(mouseX, mouseY));
      diff.div(d);
      steering.add(diff);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce * 1.5);
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);
    let mouseAvoidance = this.avoidMouse();

    alignment.mult(1.0);
    cohesion.mult(1.0);
    separation.mult(1.5);
    mouseAvoidance.mult(2.0);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(mouseAvoidance);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }

  show() {
    let theta = this.velocity.heading() + radians(90);
    fill(boidColor);
    noStroke();
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    beginShape();
    vertex(0, -6);
    vertex(-4, 6);
    vertex(0, 3);
    vertex(4, 6);
    endShape(CLOSE);
    pop();
  }
}
