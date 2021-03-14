var stage=null;
var view = null;
var interval=null;
var credentials={ "username": "", "password":"" };
const SPEED = 3;
function setupGame(){
	stage=new Stage(document.getElementById('stage'));

	// https://javascript.info/keyboard-events
	document.addEventListener('click', shootByMouse);
	document.addEventListener('keydown', actionByKey);
	
	document.addEventListener('keyup', stopMoving);
	//document.addEventListener('mousemove', aimByMouse);
	
}
function startGame(){
	interval=setInterval(function(){ stage.step(); stage.draw();}, 20);
}
function pauseGame(){
	clearInterval(interval);
	interval=null;
	
	var context = stage.canvas.getContext('2d');
	context.fillStyle = 'rgba(0,0,0,0.5)';
	context.fillRect(0, 0, stage.width, stage.height);
	
	context.font = "30px Courier New";
	context.fillStyle = "white";
	context.textAlign = "center";
	context.fillText("Paused", stage.width/2, stage.height/2);
	context.fillText("Press 'p' to resume", stage.width/2, stage.height/2 + 30);
	
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
		if (interval == null){
			startGame();
		} else {
			pauseGame();
		}
	}
		
}


function stopMoving(event){
	stage.player.velocity=new Pair(0,0);
}


function aimByMouse(event){
	stage.angle += 10;
}


function shootByMouse(event){
	console.log(getMousePos(event).x + " " + getMousePos(event).y);
	
	//If paused, do not shoot
	if (interval){
		//If player has ammo, shoot a bullet, decrease ammo count
		if (stage.player.ammo > 0){
			stage.addActor(new Bullet(stage, new Pair(stage.player.position.x,
										stage.player.position.y - stage.player.radius - 5), 
										new Pair(0, 0), 'rgba(0,255,0,1)', 3, 0, "Player"));
		
			stage.getActor(stage.player.position.x, 
							stage.player.position.y - stage.player.radius - 5).headTo(getMousePos(event));
			
			stage.player.ammo--;
		}
	}
	
	//stage.addActor(new Bullet(stage, getMousePos(event), new Pair(0, 0), 'rgba(0,0,0,1)', 7));
	//Player(stage, getMousePos(event), new Pair(0, 0), 'rgba(0,0,0,1)', 20));
}

function login(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        /* $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data)); */

        	$("#ui_login").hide();
        	$("#ui_play").show();

		setupGame();
		startGame();

        /* }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        }); */
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
        $("#ui_login").show();
        $("#ui_play").hide();
});

