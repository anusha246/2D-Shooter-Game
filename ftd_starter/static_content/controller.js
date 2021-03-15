var stage=null;
var view = null;
var interval=null;
var credentials={ "username": "", "password":"" };
var pausedGame = false;
const SPEED = 3;

function setupGame(){
	stage=new Stage(document.getElementById('stage'));

	// https://javascript.info/keyboard-events
	//document.addEventListener('show', aimByMouse);
	document.addEventListener('mousemove', aimByMouse);
	document.addEventListener('click', shootByMouse);
	
	document.addEventListener('keydown', actionByKey);
	document.addEventListener('keyup', stopMoving);
	
	
}
function startGame(){
	animate();
}
function animate() {
	stage.step();
	stage.draw();
	if (pausedGame) { pauseGame(); }
	else { 	requestAnimationFrame(animate);	}
}
function pauseGame(){
	console.log('here');
	//stage.pauseGame(pausedGame);
	var context = stage.canvas.getContext('2d');
	context.fillStyle = 'rgba(0,0,0,0.5)';
	context.fillRect(0, 0, stage.width, stage.height);
	
	context.font = "30px Courier New";
	context.fillStyle = "white";
	context.textAlign = "center";
	context.fillText("Paused", stage.width/2, stage.height/2);
	context.fillText("Press 'p' to resume", stage.width/2, stage.height/2 + 30);
	window.cancelAnimationFrame(animate);
	
}

//Function code used from 
//https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
function getMousePos(event) {
    var rect = stage.canvas.getBoundingClientRect();
    return new Pair(
					(event.clientX - rect.left) / (rect.right - rect.left) * stage.canvas.width,
					(event.clientY - rect.top) / (rect.bottom - rect.top) * stage.canvas.height);
}
function actionByKey(event){

	var key = event.key;
	var moveMap = { 
		'a': new Pair(-SPEED,0),
		's': new Pair(0,SPEED),
		'd': new Pair(SPEED,0),
		'w': new Pair(0,-SPEED)
	};
	if(key in moveMap){
		stage.player.velocity=moveMap[key];
	} else if (key=='p'){
		pausedGame = (!pausedGame);
		if (pausedGame != false){
			pauseGame();
		} else {
			startGame();
		}
	}
		
}

function stopMoving(event){
	stage.player.velocity=new Pair(0,0);
}

function aimByMouse(event){
	//console.log(getMousePos(event).x + " " + getMousePos(event).y);
	stage.player.aim_pos = getMousePos(event);
}

function shootByMouse(event){
	
	var mouse_pos = getMousePos(event);
	console.log(mouse_pos.x + " " + mouse_pos.y);
	console.log(stage.player.turret_pos);
	console.log("bye");

	//If unpaused and click within canvas
	if (mouse_pos.x>=0 && mouse_pos.x<=stage.width &&
		mouse_pos.y>=0 && mouse_pos.y<=stage.height){
		console.log("hi");
		//If player has ammo, shoot a bullet from turret, decrease ammo count
		if (stage.player.ammo > 0){
			
			var bullet_pos_x = stage.player.turret_pos.x;
			var bullet_pos_y = stage.player.turret_pos.y + 1;
			
			stage.addActor(new Bullet(stage, new Pair(bullet_pos_x, bullet_pos_y), 
										new Pair(0, 0), 'rgba(0,255,0,1)', 3, 0, "Player"));
										
			console.log(new Pair(bullet_pos_x, bullet_pos_y));
		
			stage.getActor(Math.round(bullet_pos_x), 
							Math.round(bullet_pos_y)).headTo(mouse_pos);
			
			stage.player.ammo--;
		}
	}
	
	//stage.addActor(new Bullet(stage, mouse_pos, new Pair(0, 0), 'rgba(0,0,0,1)', 7));
	//Player(stage, mouse_pos, new Pair(0, 0), 'rgba(0,0,0,1)', 20));
}

function login(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data)); 

        	$("#ui_login").hide();
        	$("#ui_play").show();

		setupGame();
		startGame();

        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        }); 
}
function register() {
	console.log("register clicked");
	$("#ui_login").hide();
	$("#ui_register").show();
	$("#registerSubmit").hide();
}
function createAccount() {
	$("#ui_login").show();
	$("#ui_register").hide();
	$("#registerSubmit").show();
}
// Using the /api/auth/test route, must send authorization header
function test(){
        $.ajax({
                method: "GET",
                url: "/api/auth/test",
                data: {},
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

$(function(){
        // Setup all events here and display the appropriate UI
        $("#loginSubmit").on('click',function(){ login(); });
		$("#registerSubmit").on('click',function(){ register(); });
		$("#createUserSubmit").on('click',function(){ createAccount(); });
        $("#ui_login").show();
		$("#ui_register").hide();
        $("#ui_play").hide();
});

