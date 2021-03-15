function randint(n){ return Math.round(Math.random()*n); }
function rand(n){ return Math.random()*n; }

class Stage {
	constructor(canvas){
		this.canvas = canvas;
	
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.player=null; // a special actor, the player
	
		// the logical width and height of the stage
		this.width=canvas.width;
		this.height=canvas.height;

		// Add the player to the center of the stage
		var velocity = new Pair(0,0);
		var radius = 18;
		var colour= 'rgba(0,0,0,1)';
		var position = new Pair(Math.floor(this.width/2), Math.floor(this.height/2));
		var aim_pos = new Pair(0, 0);
		var turret_pos = new Pair(Math.floor(this.width/2), Math.floor(this.height/2) - radius);
		var health = 10;
		var ammo = 10;
		var score = 0;
		this.addPlayer(new Player(this, position, velocity, colour, radius, 
									aim_pos, turret_pos, health, ammo, score));
		
		var num_opponents = 5;
		for (var i=0; i<num_opponents; i++){
			var colour= 'rgba(255,0,0,1)';
			
			var opponent_pos = new Pair(Math.floor((Math.random()*this.width)), 
										Math.floor((Math.random()*this.height))); 
			
			this.addActor(new Opponent(this, opponent_pos, velocity, colour, 
										radius, aim_pos, turret_pos, health, ammo, 
										score));
		}
		
	
		// Add in some Balls
		var total=20;
		while(total>0){
			var x=Math.floor((Math.random()*(this.width-200))); 
			var y=Math.floor((Math.random()*(this.height-200))); 
			if(this.getActor(x,y)===null){
				//var velocity = new Pair(rand(20), rand(20));
	
				var red=randint(255), green=randint(255), blue=randint(255);
				
				//Random integers in range code below from
				//https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
				var width = Math.floor(Math.random() * (200 - 5 + 1)) + 5;
				var height = Math.floor(Math.random() * (200 - 5 + 1)) + 5;
				
				//var alpha = Math.random();
				var colour= 'rgba('+red+','+green+','+blue+','+0.75+')';
				var position = new Pair(x,y);
				var health = 3;
				
				//var b = new Ball(this, position, velocity, colour, radius);
				var b = new Box(this, position, colour, width, height, health);
				this.addActor(b);
				total--;
			}
		}
	}

	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}

	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}

	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){
		for(var i=0;i<this.actors.length;i++){
			
			//If actor can take a step, do it 
			if (typeof this.actors[i].step == 'function'){
				
				var shouldStep = true;
				for(var j=0;j<this.actors.length;j++){
					
					if (!this.actors[i].shouldStep(this.actors[j])){
						shouldStep = false;
						if (this.actors[i].constructor.name == "Bullet" &&
							this.actors[j].constructor.name != "Box" &&
							this.actors[i].type != this.actors[j].constructor.name){
							
							if (this.actors[i].type == "Player") {
								this.player.score++;
							}
						}
						break;
					}
				}
					
				if(shouldStep){
					this.actors[i].step();
				}
			}
			
			//console.log("Step: " + stage.player.aim_pos);
			/*
			if (this.actors[i] == this.player) {
				stage.player.velocity=new Pair(0, 0);
			}
			*/
		}
	}

	draw(){
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		for(var i=0;i<this.actors.length;i++){

			//If Bullet, increase time by 1
			if ((this.actors[i].constructor.name) == "Bullet"){
				this.actors[i].time += 1;
				
				
				//If Bullet's time reaches or exceeds 450, delete it
				if (this.actors[i].time >= 450){
					this.removeActor(this.actors[i]);
				}
			}
			
			//If actor exists and has health, remove it if health is 0
			if (this.actors[i] && typeof this.actors[i].health == 'number'){
				if (this.actors[i].health <= 0){
					this.removeActor(this.actors[i]);
				}
			}
			
			//If actor exists, draw it
			if (this.actors[i]){
				this.actors[i].draw(context);
			}
			
			//console.log("Draw: " + stage.player.aim_pos);
		}
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i].x==x && this.actors[i].y==y){
				return this.actors[i];
			}
		}
		return null;
	}
	
	

} // End Class Stage

class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}
}

class Box {
	constructor(stage, position, colour, width, height, health){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.colour = colour;
		this.width = width;
		this.height = height;
		this.health = health;
	}
	
	toString(){
		return this.position.toString();
	}
	
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	draw(context){
		
		
		context.fillStyle = this.colour;
   		context.fillRect(this.x, this.y, this.width, this.height);  
		
		context.font = "15px Courier New";
		context.fillStyle = "black";
		context.textAlign = "center";
		context.fillText(this.health, this.x+this.width/2, this.y+this.height/2);
	}
}

class Ball {
	constructor(stage, position, velocity, colour, radius){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
	}
	
	headTo(position){
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.velocity.normalize();
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}
	
	shouldStep(object){
		if (object.constructor.name == "Box"){
			
			//If going inside Box
			if (this.position.x + this.velocity.x > object.position.x && 
				this.position.x + this.velocity.x < object.position.x + object.width &&
				this.position.y + this.velocity.y > object.position.y &&
				this.position.y + this.velocity.y < object.position.y + object.height){
				
				if (this.constructor.name == "Bullet"){
					object.health--;
					this.time = 450;
				
				//Actor is a Player or Opponent, pickup ammo capped at 10
				} else {
					
					//Ammo pickup based on box health, 10 max
					this.ammo += object.health;
					if (this.ammo > 10){
						this.ammo = 10;
					}
					
					object.health = 0;
				}
					
				
				return false;
			} 
			
			return true;
		
		
		//Else it is object extended from Ball: Bullet, Player, or Opponent
		} else {
						
			if (this != object){
				//If going inside object extended from Ball
				if (this.position.x + this.velocity.x > object.position.x - object.radius && 
					this.position.x + this.velocity.x < object.position.x + object.radius &&
					this.position.y + this.velocity.y > object.position.y - object.radius &&
					this.position.y + this.velocity.y < object.position.y + object.radius){
					
					
					if (this.constructor.name == "Bullet"){
						
						if (object.constructor.name == "Bullet"){
							
							if (this.type != object.type){
								object.time = 450;
							} else {
								return true;
							}
							
						//If bullet was not shot from object
						} else if (object.constructor.name != this.type){
							console.log(object.constructor.name);
							console.log(this.type);
							object.health--;
							this.time = 450;
						} else {
							return true;
						}
						
					
					}
						
					
					return false;
				} 
				
				return true;
			}
		}
		
		return true;
	}

	step(){
		
		
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;
		
		/*
		if (object.constructor.name == "Box"){
			if (this.position.x >= object.position.x && 
				this.position.x <= object.position.x + object.width &&
				this.position.y >= object.position.y &&
				this.position.y <= object.position.y + object.height){
				
				
			} else {
				this.position.x=this.position.x+this.velocity.x;
				this.position.y=this.position.y+this.velocity.y;
			}
		}
		*/
			
		
		/*
		if (object.constructor.name == "Bullet"){
			
			if(this.position.x<object.position.x){
				this.position.x=0;
				this.velocity.x=Math.abs(this.velocity.x);
			}
			if(this.position.x>this.stage.width){
				this.position.x=this.stage.width;
				this.velocity.x=-Math.abs(this.velocity.x);
			}
			if(this.position.y<0){
				this.position.y=0;
				this.velocity.y=Math.abs(this.velocity.y);
			}
			if(this.position.y>this.stage.height){
				this.position.y=this.stage.height;
				this.velocity.y=-Math.abs(this.velocity.y);
			}
		}
		*/
			
		// bounce off the walls
		if(this.position.x<0){
			this.position.x=0;
			this.velocity.x=Math.abs(this.velocity.x);
		}
		if(this.position.x>this.stage.width){
			this.position.x=this.stage.width;
			this.velocity.x=-Math.abs(this.velocity.x);
		}
		if(this.position.y<0){
			this.position.y=0;
			this.velocity.y=Math.abs(this.velocity.y);
		}
		if(this.position.y>this.stage.height){
			this.position.y=this.stage.height;
			this.velocity.y=-Math.abs(this.velocity.y);
		}
		this.intPosition();
		
	}
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	draw(context){
		
		
		context.fillStyle = this.colour;
   		//context.fillRect(this.x, this.y, this.radius,this.radius);
		
		
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();   
	}
}

class Player extends Ball {
	
	constructor(stage, position, velocity, colour, radius, aim_pos, turret_pos, health, ammo, score){
		
		super(stage, position, velocity, colour, radius);
		
		this.aim_pos = aim_pos;
		this.turret_pos = turret_pos;
		this.health = health;
		this.ammo = ammo;
		this.score = score;
	}
	
	draw(context){
		/*
		context.save();
		
		//context.translate(actor.position.x, actor.position.y);
		context.translate(this.x, this.y);
		context.rotate(80 * Math.PI / 180);
		*/
		
		//Set stroke, fill colors
		context.fillStyle = this.colour;
		context.strokeStyle = this.colour;
		
		//Draw turret
		//console.log(this.aim_pos);
		this.turret_pos.x=(this.aim_pos.x - this.x);
		this.turret_pos.y=(this.aim_pos.y - this.y);
		this.turret_pos.normalize();
		
		this.turret_pos.x = this.turret_pos.x * this.radius + this.x;
		this.turret_pos.y = this.turret_pos.y * this.radius + this.y;
		//console.log(this.turret_pos);
		
		//this.headTo(this.aim_pos).x * this.radius + this.x;
		//var turret_pos_y = this.headTo(this.aim_pos).y * this.radius + this.y;
		
		
		context.beginPath(); 
		context.arc(this.turret_pos.x, this.turret_pos.y, this.radius - 8, 0, 2 * Math.PI, false); 
		context.stroke();
		context.fill();
		
		//Draw main body
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();
		
		//Show player ammo
		context.font = "15px Courier New";
		context.fillStyle = "white";
		context.textAlign = "center";
		context.fillText(this.ammo, this.turret_pos.x, this.turret_pos.y +4);   
		
		//Show player health 
		context.font = "20px Courier New";
		context.fillStyle = "black";
		context.textAlign = "center";
		context.fillText(this.health, this.x, this.y+6);
		
		//Show player score
		context.font = "20px Courier New";
		context.textAlign = "left";
		context.fillText("Score: " + this.score, 10, 20);
		
		
		
		//context.restore();
	}
		
	
}

class Opponent extends Player {
	draw(context){
		
		//Set stroke, fill colors
		context.fillStyle = this.colour;
		context.strokeStyle = this.colour;
		
		//Draw turret
		context.beginPath(); 
		context.arc(this.x, this.y - this.radius, this.radius - 8, 0, 2 * Math.PI, false); 
		context.stroke();
		context.fill();
		
		//Draw main body
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke(); 
		
		//Show ammo
		context.font = "15px Courier New";
		context.fillStyle = "white";
		context.textAlign = "center";
		context.fillText(this.ammo, this.x, this.y - this.radius+4);
		
		//Show health 
		context.font = "20px Courier New";
		context.fillStyle = "black";
		context.textAlign = "center";
		context.fillText(this.health, this.x, this.y+6);
		
	}
	
}

class Bullet extends Ball {
	constructor(stage, position, velocity, colour, radius, time, type){
		super(stage, position, velocity, colour, radius);
		
		this.time = time;
		this.type = type;
	}
	
	draw(context){
		
		//Set stroke, fill colors
		context.fillStyle = this.colour;
		context.strokeStyle = "black";
		
		//Draw bullet
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();
		context.fill(); 
	}
	
}


