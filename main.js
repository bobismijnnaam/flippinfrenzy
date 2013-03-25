// Core vars
var canvas;
var stage;
var game;

// State vars
var state;
var stateTime;
var STATE_GAME = 0;
var STATE_MENU = 1;
var STATE_LVL = 2;
var STATE_UROCK = 3;
var STATE_GIVENUP = 4;

// Graphics
var imgCrate;
var displayCrate;
var displaySpring;

// Level vars
var lvl;
var lvlDelay = 2000;

// Game vars
var crates;
var springs;
var crateRollTime = 1000;
var crateWaitTime = 1200;
var crateFlySpeed = 75;
var crateMaxFallTime = 2000;
var springBounceTime = 1000;

// Crate vars
var CRATE_BEGIN = 0; // Staat nog goed
var CRATE_FALLING = 7; // Vallend naar beneden
var CRATE_ROLL1 = 1; // Eerste keer rollen
var CRATE_HALF = 2; // Op z'n zij
var CRATE_ROLL2 = 3; // Tweede keer rollen
var CRATE_PAUSE = 5 // Wachtend op de veer
var CRATE_FLY = 6; // Wegvliegend
var CRATE_DONE = 4; // Ondersteboven. Kapot/geplet

// Spring vars
var SPRING_BOUNCE = 0; // Aan het stuiteren
var SPRING_DONE = 1; // Klaar

function init() {
	game = new Object();
	
	canvas = document.getElementById("c");
	stage = new createjs.Stage(canvas);
	stage.enableMouseOver(10);
	
	drawBackground();

	// Crate Preparations
	imgCrate = new Image();
	imgCrate.src = "crate.png";
	
	/*	
	this.img = new createjs.Bitmap(imgCrate);
	this.img.regX = this.img.regY = 150;
	this.img.x = 150 + Math.floor((490 - size * scale * 2) * Math.random());
	this.img.y = Math.floor(f * 240) + 240;
	this.img.scaleX = this.img.scaleY = scale; 
	*/
	displayCrate = new createjs.Bitmap(imgCrate);
	displayCrate.regX = displayCrate.regY = 150;
	
	
	game.bStart = new makeButton("Start", "50px Tahoma", "#000000", 320, 100, stage, function() {
		resetStage();
		lvl = 1;
		displayLvl();
		game.startMsgAdded = false;
		crates = [];
		
		state = STATE_LVL;
		stateTime = Date.now();
	});
	
	// Generate spring
	var spring = new createjs.Shape();
	spring.graphics.beginStroke("black").setStrokeStyle(4).moveTo(50, 0);
	spring.graphics.lineTo(0, 0);
	for (var i = 0; i < 5; i++) {
		spring.graphics.lineTo(50, (i+1) * 20);
		spring.graphics.lineTo(0, (i+1) * 20);
	}
	spring.graphics.endStroke();
	spring.rotation = 180;
	spring.regX = 25;
	displaySpring = spring.clone();
	
	// Add menu text
	var line1 = new createjs.Text("We're not obeying dormantly...", "30px Tahoma", "#000000");
	line1.textAlign = "center";
	line1.x = 320;
	line1.y = 260;
	
	var line2 = new createjs.Text("Click those boxes and", "50px Tahoma", "#700000");
	line2.textAlign = "center";
	line2.x = 320;
	line2.y = 300;	
	
	var line3 = new createjs.Text("SCREW THE SYSTEM!", "bold 60px Tahoma", "#FF0000");
	line3.textAlign = "center";
	line3.x = 320;
	line3.y = 360;

	stage.addChild(line1, line2, line3);

	state = STATE_MENU;
	stateTime = Date.now();

	// Start game loop
	createjs.Ticker.addEventListener("tick", run);
}

function run() {
	switch (state) {
		case STATE_MENU:
			// Nothing to do here
			break;
		case STATE_GAME:
			// Checken wanneer ze allemaal omgerold zijn
			var count = 0;			

			// Update alle crates
			for (var i = 0; i < lvl; i++) {
				crates[i].update();
				if (crates[i].rolledOver) count++;				
			}

			if (count == lvl) {
				resetStage();
				
				var rockText = new createjs.Text("YOU ROCK", "bold 120px Tahoma", "#FF0000");
				rockText.textAlign = "center";
				rockText.x = 320;
				rockText.y = 150;
				stage.addChild(rockText);
				
				state = STATE_UROCK;
				stateTime = Date.now();
			}

			break;
		case STATE_LVL:
			var currTime = Date.now();
			
			if (currTime - stateTime > lvlDelay - 500 && !game.startMsgAdded) {
				var startMsg = new createjs.Text("FLIP 'EM!", "150px Tahoma", "#FF0000");
				startMsg.textAlign = "center";
				startMsg.x = 320;
				startMsg.y = 50;
				stage.addChild(startMsg);
				game.startMsgID = stage.getChildIndex(startMsg);
				
				game.startMsgAdded = true;
				
				for (var i = 0; i < lvl; i++) {
					crates.push(new makeCrate());
				}
				
				game.exitButton = new makeButton("Give up", "30px Tahoma", "#000000", 587, 440, stage, function() {
					resetStage();
					var failText = new createjs.Text("GAME OVER", "bold 100px Tahoma", "#000000");
					failText.textAlign = "center";
					failText.x = 320;
					failText.y = 140;
					stage.addChild(failText);

					state = STATE_GIVENUP;
					stateTime = null;
			
					var restartButton = new makeButton("Try again", "30px Tahoma", "#000000", 320, 400, stage, function() {
						resetStage();
						lvl = 1;
						displayLvl();
						game.startMsgAdded = false;
						crates = [];
						state = STATE_LVL;
						stateTime = Date.now();
					});
				});
			}
			
			if (currTime - stateTime > lvlDelay) {
				stage.removeChildAt(game.lvlTextID, game.startMsgID);
				
				state = STATE_GAME;
				stateTime = Date.now();
			}
			
			// Update alle crates
			if (game.startMsgAdded) {
				for (var i = 0; i < lvl; i++) {
					crates[i].update();
				}
			}
			break;
		case STATE_UROCK:
			var currTime = Date.now();
			
			if (currTime - stateTime > 500) {
				resetStage();
				lvl++;
				displayLvl();
				game.startMsgAdded = false;
				crates = [];
		
				state = STATE_LVL;
				stateTime = Date.now();
			}
			break;
		case STATE_GIVENUP:
			break;
	}
	
	stage.update();
}

function makeSpring(x, y, parent) {
	this.img = displaySpring.clone();
	this.img.x = x;
	this.img.y = y;
	this.globalScale = (y - 240) / 240 * 0.9 + 0.1;
	this.img.scaleY = 0;
	this.img.scaleX = this.globalScale;
	
	this.update = function() {
		switch (this.state) {
			case SPRING_BOUNCE:
				var currTime = Date.now();
				if (currTime - this.stateTime > springBounceTime) {
					this.state = SPRING_DONE;
					this.stateTime = null;
				} else {
					var d = (currTime - this.stateTime) / springBounceTime;
					d = easeElastic(d);
					this.img.scaleY = this.globalScale * d;
				}
				break;
			case SPRING_DONE:
				break;
		}
	}

	stage.addChildAt(this.img, stage.getChildIndex(parent));

	this.state = SPRING_BOUNCE;
	this.stateTime = Date.now();
}

function makeCrate() {
	// Size vars
	var f = Math.random();
	var scale = f * 0.9 + 0.1;
	var size = 150;
	
	// This object
	var that = this;

	// Location vars
	this.startY = Math.floor(Math.random() * 480 * -1) * f;
	this.endY = Math.floor(f * 240) + 240;
	this.fallDuration = Math.floor(Math.max(Math.random(), 0.25) * crateMaxFallTime);
	
	this.img = displayCrate.clone();
	this.img.x = 150 + Math.floor((490 - size * scale * 2) * Math.random());
	this.img.y = this.startY;
	this.img.endY = this.endY;
	this.img.scaleX = this.img.scaleY = scale; 

	this.rolledOver = false;
	
	var added = false;
	var a = stage.getNumChildren();
	
	if (a == 2) {
		stage.addChild(this.img);
	} else {
		for (var i = 3; i < a; i++) {
			if ((stage.getChildAt(i)).endY > this.endY) {
				stage.addChildAt(this.img, i);
				added = true;
				break;	
			}
		}
		
		if (!added) {
			stage.addChild(this.img);
		}
	}

	this.state = CRATE_FALLING;
	this.stateTime = Date.now();

	this.update = function() {
		switch (this.state) {
			case CRATE_FALLING:
				var currTime = Date.now();
				var d = (currTime - this.stateTime) / this.fallDuration;
				if (d > 1) {
					this.state = CRATE_BEGIN;
					this.stateTime = null;
					this.img.y = this.endY;
				} else {
					d = easeInCubic(d);
					this.img.y = this.startY * (1 - d) + this.endY * d;
				}
				break;
			case CRATE_BEGIN:
				break;
			case CRATE_ROLL1:
				var curTime = Date.now();
				var d = (curTime - this.stateTime) / crateRollTime;
				if (d > 1) {
					this.state = CRATE_HALF;
					this.stateTime = null;
					this.img.rotation = 90;
					this.img.regY = 0;
					this.img.x += 150 * this.img.scaleX;
				} else {
					d = easeOutInSmoothCubic(d);
					this.img.rotation = 90 * d;
				}
				break;
			case CRATE_HALF:
				break;
			case CRATE_ROLL2:
				var curTime = Date.now();
				var d = (curTime - this.stateTime) / crateRollTime;
				if (d > 1) {
					this.state = CRATE_PAUSE;
					this.stateTime = Date.now();
					this.img.rotation = 180;
					
				} else {
					d = easeOutInSmoothCubic(d);
					this.img.rotation = 90 + 90 * d;
				}
				break;
			case CRATE_PAUSE:
				var currTime = Date.now();
				var d = (currTime - this.stateTime) / crateWaitTime;
				if (d > 1) {
					this.state = CRATE_FLY;
					this.spring = new makeSpring(this.img.x + 75 * this.img.scaleX, this.img.y, this.img);
				}
				break;
			case CRATE_FLY:
				this.img.y -= crateFlySpeed * this.img.scaleX;
				if (this.img.y < 0) {
					this.state = CRATE_DONE;
					this.stateTime = null;
					stage.removeChild(this.img);
					this.rolledOver = true;
				}
				this.spring.update(); 
				break;
			case CRATE_DONE:
				this.spring.update();
				break; // Done
		}
	};

	this.img.addEventListener("click", function() {
		switch(that.state) {
			case CRATE_FALLING:
				break;
			case CRATE_BEGIN:
				that.state = CRATE_ROLL1;
				that.stateTime = Date.now();
				break;
			case CRATE_ROLL1:
				break;
			case CRATE_HALF:
				that.state = CRATE_ROLL2;
				that.stateTime = Date.now();
				break;
			case CRATE_ROLL2:
				break;
			case CRATE_DONE:
				break;
		}
	});
}

function displayLvl() {
	var lvlText = new createjs.Text("Level " + lvl, "50px Tahoma", "#000000");
	lvlText.textAlign = "center";
	lvlText.x = 320;
	lvlText.y = 20;
	stage.addChild(lvlText);
	game.lvlTextID = stage.getChildIndex(lvlText);
}

function resetStage() {
	stage.removeAllChildren();
	drawBackground();
}

function drawBackground() {
	var horizon;
	
	horizon = new createjs.Shape();
	horizon.graphics.beginStroke("#000000").moveTo(0, 240.5).lineTo(640, 240.5).endStroke();
	horizon.graphics.beginLinearGradientFill(["#000", "#FFF"], [0, 1], 0, 0, 0, 480).r(0, 240, 640, 280);
	stage.addChild(horizon);
}

function easeInCubic(t) {
	return t*t*t;	
}

function easeOutInCubic(t) {

	var ts= t*t;

	var tc=ts*t;

	return 4*tc + -6*ts + 3*t;

}

function easeElastic(t) {
	var ts=t*t;

	var tc=ts*t;

	return 56*tc*ts + -175*ts*ts + 200*tc + -100*ts + 20*t;

}

function easeOutInSmoothCubic(t) {
	var ts= t*t;

	var tc=ts*t;


	return -2*tc*ts + 6.2*ts*ts + -4.4*tc + -0.4*ts + 1.6*t;
}

function makeButton(caption, font, color, x, y, stageVar, action) {
	this.text = new createjs.Text(caption, font, color);
	this.text.x = x;
	this.text.y = y;
	
	var hit = new createjs.Shape();
	hit.graphics.f("#000").r(0, 0, this.text.getMeasuredWidth(), this.text.getMeasuredHeight());
	hit.x = this.text.getMeasuredWidth() * -0.5;
	this.text.hitArea = hit;
 	
 	this.text.textAlign = "center";
 	var that = this;
 	
	this.action = action;
	this.text.addEventListener("click", this.action);
	this.text.addEventListener("mouseover", function(e) {
		that.text.alpha = .5;
	});
	this.text.addEventListener("mouseout", function(e) {
		that.text.alpha = 1;
	})
	
	
	stageVar.addChild(this.text);
}