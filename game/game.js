// Start Configuration
const style = { color: "#000", fontSize: 24, fontStyle: "bold" }
const headerStyle = { color: "#000", fontSize: 40, fontStyle: "bold" }
const gameTaskHeaderStyle = {color: "#000", fontSize: 24, fontStyle: "bold" }
const buttonStyle = { color: "white", fontSize: 20, fontStyle: "bold" }

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    dom: {
        createContainer: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
// End Configuration

var game = new Phaser.Game(config);

var currentUserId;
var currentMiniGame;
var currentResultDialog;
var avatarDialog;
var mainMenuDialog;
var leaderboardSelectionDialog;
var leaderboardDialog;
var levelSelectionDialog;
var inGameMenuDialog;
var greetDialogElement;

var winSound;
var loseSound;
var buttonClickSound;
var dropSound;
var isSoundOn = true;

// Start MainLoop
function preload ()
{
    this.load.image("background", "./assets/cells.png");
    this.load.image("card", "./assets/card.png");
    this.load.image("oddZone", "./assets/oddZone.png");
    this.load.image("evenZone", "./assets/evenZone.png");
    this.load.image("restartButton", "./assets/restart.png");
    this.load.image("turnOffSoundButton", "./assets/turnOffSound.png");
    this.load.image("turnOnSoundButton", "./assets/turnOnSound.png");
    this.load.image("exitButton", "./assets/exit.png");
	this.load.image('buttonGeneral', './assets/buttonGeneral2.png');
    this.load.image('buttonHighlighted', 'assets/buttonHighlighted2.png');
    this.load.image("gameTitle", "./assets/gameTitle.png");

	this.load.image('avatar1', './assets/avatar1.png');
	this.load.image('avatar2', './assets/avatar2.png');
	this.load.image('avatar3', './assets/avatar3.png');

    this.load.audio('win', './assets/win.wav');
    this.load.audio("lose", "./assets/lose.wav");
    this.load.audio("buttonClick", "./assets/buttonClick.wav");
    this.load.audio("drop", "./assets/drop.wav");
}

function create ()
{
    let background = this.add.image(400, 300, "background");
    this.events.on("gameEnded", onGameEnded, this);

    winSound = this.sound.add("win");
    loseSound = this.sound.add("lose");
    buttonClickSound = this.sound.add("buttonClick");
    dropSound = this.sound.add("drop");

    this.input.on('pointerdown', function(pointer) {
        buttonClickSound.stop();
        buttonClickSound.play();
    });

    showGreetDialog(this);
}

function update (time, delta)
{
    if (currentMiniGame != null) {
        currentMiniGame.update(delta);
    }
}

function onGameEnded(isWin, totalPoints, gameDuration, scene) 
{
    hideInGameMenu();
    let gameDurationSeconds = Math.floor(gameDuration / 1000);
    if (isWin) {
        showWinDialog(scene, totalPoints);
        saveMiniGameProgress(currentMiniGame.id, currentUserId, totalPoints);
        saveUserProgress(currentUserId, currentMiniGame.id, totalPoints);
    } else {
        showLoseDialog(scene, totalPoints);
    }
    console.log(`game ended. id=${currentMiniGame.id}, win=${isWin}, duration=${gameDurationSeconds}`);
}

function startMiniGame(miniGameId, scene)
{
    if (currentMiniGame != null) {
        currentMiniGame.hide();
    }
    if (miniGameId == NumberOrderGame.sId) {
        currentMiniGame = new NumberOrderGame(scene, 5, 50);
    }
    else if (miniGameId == SwapOrderGame.sId) {
        currentMiniGame = new SwapOrderGame(scene, 5, 50);
    }
    else if(miniGameId == TwoAreasGame.sId) {
        currentMiniGame = new TwoAreasGame(scene, 8, 50);
    }
    currentMiniGame.start();
    showInGameMenu(scene);
}

function saveMiniGameProgress(miniGameId, userId, progress)
{
    if (localStorage.getItem(miniGameId) == null) {
        let userProgress = {};
        userProgress[userId] = progress;
        localStorage.setItem(miniGameId, JSON.stringify(userProgress));
        return;
    }

    let loadedInfo = loadMiniGameProgress(miniGameId);
    let currentRecord = loadedInfo[userId];
    if (currentRecord == null || progress > currentRecord) {
        loadedInfo[userId] = progress;
        localStorage.setItem(miniGameId, JSON.stringify(loadedInfo));
        console.log(`New record saved. userId=${userId}, previousRecord=${currentRecord}, newRecord=${progress}`);        
    }
}

function loadMiniGameProgress(miniGameId)
{
    let localStorageInfo = localStorage.getItem(miniGameId);
    if (localStorageInfo == null) {
        return null;
    }
    let loadedInfo = JSON.parse(localStorageInfo);
    console.log(`MiniGame info loaded. miniGameId=${miniGameId}, loadedInfo=${localStorage.getItem(miniGameId)}`);
    return loadedInfo;
}

function saveUser(userId, avatarId)
{
    let userData = loadUserData(userId);
    if (userData == null) {
        userData = {};
    }
    userData["avatar"] = avatarId;
    save(userId, userData);
    console.log(`New user has been saved. userId=${userId}, avatarId=${avatarId}`);
}

function saveUserProgress(userId, miniGameId, progress)
{
    console.log(`${localStorage.getItem(userId)}`);
    let gameResults = loadUserData(userId);
    if (localStorage.getItem(userId)[miniGameId] == null) {
        gameResults[miniGameId] = progress;
        save(userId, gameResults);
        return;
    }

    if (progress <= gameResults[miniGameId]) {
        return;
    }
    gameResults[miniGameId] = progress;
    save(userId, gameResults);
}

function loadUserData(userId)
{
    let localStorageInfo = localStorage.getItem(userId);
    if (localStorageInfo == null) {
        return null;
    }
    let loadedInfo = JSON.parse(localStorageInfo);
    console.log(`User info loaded. userId=${userId}, loadedInfo=${localStorageInfo}`);
    return loadedInfo;
}

function save(userId, data)
{
    localStorage.setItem(userId, JSON.stringify(data));
    console.log(`Saved. userId=${userId}, saveInfo=${JSON.stringify(data)}`);
}

function showGreetDialog(scene)
{
    let gameTitleImg = scene.add.image(400, 200, "gameTitle");
    greetDialogElement = document.getElementById("login");
    greetDialogElement.style = `position: absolute; top: ${350}px; left: ${config.width / 3}px; display: block;`;

    let userIdInputFieldElement = document.getElementById("username");

    let userIdSubmitButtonElement = document.getElementById("loginButton");
    userIdSubmitButtonElement.onclick = function() {
        if (userIdInputFieldElement.value == "") {
            return;
        }
        currentUserId = userIdInputFieldElement.value;
        greetDialogElement.style.display = "none";
        gameTitleImg.destroy();

        if (loadUserData(currentUserId) != null) {
            showMainMenu(scene);
        } else {
            showAvatarDialog(scene);
        }
    };
}

function showAvatarDialog(scene)
{
    const commandText = scene.add.text(190, 100, "Выбери себе аватар", headerStyle);

    const firstAvatarButton = scene.add.image(200, 300, "avatar1")
        .setDisplaySize(150, 150)
        .setInteractive();

    firstAvatarButton.on("pointerdown", pointer => {
        saveUser(currentUserId, "avatar1");
        hideAvatarDialog();
        showMainMenu(scene);
    });
    firstAvatarButton.on("pointerover", pointer => {
        firstAvatarButton.y -= 5;
    })

    firstAvatarButton.on("pointerout", pointer => {
        firstAvatarButton.y += 5;
    })

    const secondAvatarButton = scene.add.image(400, 300, "avatar2")
        .setDisplaySize(150, 150)
        .setInteractive();

    secondAvatarButton.on("pointerdown", pointer => {
        saveUser(currentUserId, "avatar2");
        hideAvatarDialog();
        showMainMenu(scene);
    });
    secondAvatarButton.on("pointerover", pointer => {
        secondAvatarButton.y -= 5;
    })

    secondAvatarButton.on("pointerout", pointer => {
        secondAvatarButton.y += 5;
    })

    const thirdAvatarButton = scene.add.image(600, 300, "avatar3")
        .setDisplaySize(150, 150)
        .setInteractive();

    thirdAvatarButton.on("pointerdown", pointer => {
        saveUser(currentUserId, "avatar3");
        hideAvatarDialog();
        showMainMenu(scene);
    });
    thirdAvatarButton.on("pointerover", pointer => {
        thirdAvatarButton.y -= 5;
    })

    thirdAvatarButton.on("pointerout", pointer => {
        thirdAvatarButton.y += 5;
    })

    avatarDialog = scene.add.container(0, 0, [commandText, firstAvatarButton, secondAvatarButton, thirdAvatarButton]);
}

function hideAvatarDialog()
{
    if (avatarDialog == null) {
        console.warn("Trying to hide AvatarDialog which is null.")
        return;
    }
    avatarDialog.destroy();
}

function showMainMenu(scene)
{
    const greetingsText = scene.add.text(400, 110, `Привет, ${currentUserId}!`, headerStyle)
        .setOrigin(0.5);
    
    const avatarButton = scene.add.image(400, 200, loadUserData(currentUserId)["avatar"])
        .setDisplaySize(100, 100)
        .setInteractive();

    avatarButton.on("pointerdown", pointer => {
        hideMainMenu();
        showAvatarDialog(scene);
    })

    avatarButton.on("pointerover", pointer => {
        avatarButton.y -= 5;
    })

    avatarButton.on("pointerout", pointer => {
        avatarButton.y += 5;
    })

    // Play button
    const playButton = new Button(scene, 0, 0);

    const playButtonText = scene.add.text(playButton.x, playButton.y, 'Играть', buttonStyle)
        .setOrigin(0.5);

    playButton.on("pointerdown", pointer => {
        hideMainMenu();
        showLevelSelectionMenu(scene);
    })

    let playButtonContainer = scene.add.container(400, 300, [playButton, playButtonText]);


    // Leaderboard button
    const leaderboardButton = new Button(scene, 0, 0);

    leaderboardButton.on("pointerdown", pointer => {
        hideMainMenu();
        showLeaderboardSelectionMenu(scene);
    });

    const leaderboardButtonText = scene.add.text(leaderboardButton.x, leaderboardButton.y, 'Лидеры', buttonStyle)
        .setOrigin(0.5);

    let leaderboardButtonContainer = scene.add.container(playButtonContainer.x, playButtonContainer.y + playButton.displayHeight + 10, [leaderboardButton, leaderboardButtonText]);

    // ChangePlayer button
    const changePlayerButton = new Button(scene, 0, 0);

    const changePlayerButtonText = scene.add.text(changePlayerButton.x, changePlayerButton.y, 'Выйти', buttonStyle)
    .setOrigin(0.5);

    changePlayerButton.on("pointerdown", pointer => {
        hideMainMenu();
        showGreetDialog(scene);
    });

    let changePlayerButtonContainer = scene.add.container(leaderboardButtonContainer.x, leaderboardButtonContainer.y + leaderboardButton.displayHeight + 10, [changePlayerButton, changePlayerButtonText]);

    mainMenuDialog = scene.add.container(0, 0, [greetingsText, avatarButton, playButtonContainer, leaderboardButtonContainer, changePlayerButtonContainer]);
}

function hideMainMenu()
{
    if (mainMenuDialog == null) {
        console.warn("Trying to hide MainMenuDialog which is null.")
        return;
    }
    mainMenuDialog.destroy();
}

function showLeaderboardDialog(scene, minigameId)
{
    let leaderboardElements = [];

    let gameTitleText = scene.add.text(400, 150, getMinigameName(minigameId), headerStyle).setOrigin(0.5);
    leaderboardElements.push(gameTitleText);

    let miniGameProgress = loadMiniGameProgress(minigameId);
    if (miniGameProgress != null) {
        let recordsDict = sortDictionaryByValue(miniGameProgress);

        let i = 0;
        for (const [key, value] of Object.entries(recordsDict)) {
            if (i == 3) {
                break;
            }
            leaderboardElements.push(scene.add.image(350, 360 + (i - (recordsDict.length > 3 ? 3 : recordsDict.length)) * 50, loadUserData(value[0])["avatar"]).setOrigin(0.5).setDisplaySize(35, 35));
            leaderboardElements.push(scene.add.text(300, 347 + (i - (recordsDict.length > 3 ? 3 : recordsDict.length)) * 50, `${i + 1}.   ${value[0]}: ${value[1]}`, style));
            i++;
        }
    }
    else {
        leaderboardElements.push(scene.add.text(310, 250, "Рекордов нет", style));
    }
    
    // Back button
    const backButton = new Button(scene, 0, 0);

    backButton.on("pointerdown", pointer => {
        hideLeaderboardDialog();
        showLeaderboardSelectionMenu(scene);
    });

    const backButtonText = scene.add.text(backButton.x, backButton.y, 'Назад', buttonStyle)
    .setOrigin(0.5);

    let backButtonContainer = scene.add.container(400, 370, [backButton, backButtonText]);
    leaderboardElements.push(backButtonContainer);

    leaderboardDialog = scene.add.container(0, 0, leaderboardElements);
}

function hideLeaderboardDialog()
{
    if (leaderboardDialog == null) {
        console.warn("Trying to hide LeaderboardDialog which is null.")
        return;
    }
    leaderboardDialog.destroy();
}

function showLeaderboardSelectionMenu(scene)
{
    const greetingsText = scene.add.text(400, 150, `Лидеры`, headerStyle)
        .setOrigin(0.5);


    // 1-я игра
    const numbersOrderGameButton = new Button(scene, 0, 0);

    numbersOrderGameButton.on("pointerdown", pointer => {
        hideLeaderboardSelectionMenu();
        showLeaderboardDialog(scene, NumberOrderGame.sId);
    });
    
    const numbersOrderGameButtonText = scene.add.text(numbersOrderGameButton.x, numbersOrderGameButton.y, 'Клик', buttonStyle)
        .setOrigin(0.5);
    
    let numberOrderGameButtonContainer = scene.add.container(400, 250, [numbersOrderGameButton, numbersOrderGameButtonText]);


    // 2-я игра
    const swapOrderGameButton = new Button(scene, 0, 0);

    swapOrderGameButton.on("pointerdown", pointer => {
        hideLeaderboardSelectionMenu();
        showLeaderboardDialog(scene, SwapOrderGame.sId);
    });

    const swapOrderGameButtonText = scene.add.text(swapOrderGameButton.x, swapOrderGameButton.y, 'Смена мест', buttonStyle)
        .setOrigin(0.5);

    let swapOrderGameButtonContainer = scene.add.container(numberOrderGameButtonContainer.x, numberOrderGameButtonContainer.y + numbersOrderGameButton.displayHeight + 10, [swapOrderGameButton, swapOrderGameButtonText]);

    // 3-я игра
    const twoAreasGameButton = new Button(scene, 0, 0);
    
    twoAreasGameButton.on("pointerdown", pointer => {
        hideLeaderboardSelectionMenu();
        showLeaderboardDialog(scene, TwoAreasGame.sId);
    });

    const twoAreasGameButtonText = scene.add.text(twoAreasGameButton.x, twoAreasGameButton.y, 'Тетради', buttonStyle)
        .setOrigin(0.5);
    
    let twoAreasGameButtonContainer = scene.add.container(swapOrderGameButtonContainer.x, swapOrderGameButtonContainer.y + swapOrderGameButton.displayHeight + 10, [twoAreasGameButton, twoAreasGameButtonText]);

    // Главное меню
    const backButton = new Button(scene, 0, 0);

    backButton.on("pointerdown", pointer => {
        hideLevelSelectionMenu();
        showMainMenu(scene);
    });

    const backButtonText = scene.add.text(backButton.x, backButton.y, 'Назад', buttonStyle)
    .setOrigin(0.5);

    let backButtonContainer = scene.add.container(swapOrderGameButtonContainer.x, twoAreasGameButtonContainer.y + twoAreasGameButton.displayHeight + 10, [backButton, backButtonText]);

    levelSelectionDialog = scene.add.container(0, 0, [greetingsText, numberOrderGameButtonContainer, swapOrderGameButtonContainer, twoAreasGameButtonContainer, backButtonContainer]);
}

function hideLeaderboardSelectionMenu()
{
    if (levelSelectionDialog == null) {
        console.warn("Trying to hide LevelSelectionDialog which is null.")
        return;
    }
    levelSelectionDialog.destroy();
}

function showLevelSelectionMenu(scene)
{
    const greetingsText = scene.add.text(400, 150, `Выберите уровень`, headerStyle)
        .setOrigin(0.5);


    // 1-я игра
    const numbersOrderGameButton = new Button(scene, 0, 0);

    numbersOrderGameButton.on("pointerdown", pointer => {
        hideLevelSelectionMenu();
        startMiniGame(NumberOrderGame.sId, scene);
    });
    
    const numbersOrderGameButtonText = scene.add.text(numbersOrderGameButton.x, numbersOrderGameButton.y, 'Клик', buttonStyle)
        .setOrigin(0.5);
    
    let numberOrderGameButtonContainer = scene.add.container(400, 250, [numbersOrderGameButton, numbersOrderGameButtonText]);


    // 2-я игра
    if (loadMiniGameProgress(NumberOrderGame.sId) != null && loadMiniGameProgress(NumberOrderGame.sId)[currentUserId] != null) {
        var swapOrderGameButton = new Button(scene, 0, 0);

        swapOrderGameButton.on("pointerdown", pointer => {
            hideLevelSelectionMenu();
            startMiniGame(SwapOrderGame.sId, scene);
        });

        var swapOrderGameButtonText = scene.add.text(swapOrderGameButton.x, swapOrderGameButton.y, 'Смена мест', buttonStyle)
            .setOrigin(0.5);

        var swapOrderGameButtonContainer = scene.add.container(numberOrderGameButtonContainer.x, numberOrderGameButtonContainer.y + numbersOrderGameButton.displayHeight + 10, [swapOrderGameButton, swapOrderGameButtonText]);
    }
    
    // 3-я игра
    if (loadMiniGameProgress(SwapOrderGame.sId) != null && loadMiniGameProgress(SwapOrderGame.sId)[currentUserId] != null) {
        var twoAreasGameButton = new Button(scene, 0, 0);
    
        twoAreasGameButton.on("pointerdown", pointer => {
            hideLevelSelectionMenu();
            startMiniGame(TwoAreasGame.sId, scene);
        });

        var twoAreasGameButtonText = scene.add.text(twoAreasGameButton.x, twoAreasGameButton.y, 'Тетради', buttonStyle)
            .setOrigin(0.5);
        
        var twoAreasGameButtonContainer = scene.add.container(swapOrderGameButtonContainer.x, swapOrderGameButtonContainer.y + swapOrderGameButton.displayHeight + 10, [twoAreasGameButton, twoAreasGameButtonText]);
    }

    // Главное меню
    const backButton = new Button(scene, 0, 0);

    backButton.on("pointerdown", pointer => {
        hideLevelSelectionMenu();
        showMainMenu(scene);
    });

    const backButtonText = scene.add.text(backButton.x, backButton.y, 'Назад', buttonStyle)
    .setOrigin(0.5);

    let lastContainerInColumn;
    if (twoAreasGameButtonContainer != null) {
        lastContainerInColumn = twoAreasGameButtonContainer;
    }
    else if (swapOrderGameButtonContainer != null) {
        lastContainerInColumn = swapOrderGameButtonContainer;
    } 
    else {
        lastContainerInColumn = numberOrderGameButtonContainer;
    }
    
    let backButtonContainer = scene.add.container(numberOrderGameButtonContainer.x, lastContainerInColumn.y + backButton.displayHeight + 10, [backButton, backButtonText]);

    if (swapOrderGameButtonContainer == null) {
        levelSelectionDialog = scene.add.container(0, 0, [greetingsText, numberOrderGameButtonContainer, backButtonContainer]);
        return;
    }
    if (twoAreasGameButtonContainer == null) {
        levelSelectionDialog = scene.add.container(0, 0, [greetingsText, numberOrderGameButtonContainer, swapOrderGameButtonContainer, backButtonContainer]);
        return;
    }
    levelSelectionDialog = scene.add.container(0, 0, [greetingsText, numberOrderGameButtonContainer, swapOrderGameButtonContainer, twoAreasGameButtonContainer, backButtonContainer]);
}

function hideLevelSelectionMenu()
{
    if (levelSelectionDialog == null) {
        console.warn("Trying to hide LevelSelectionDialog which is null.")
        return;
    }
    levelSelectionDialog.destroy();
}

function showInGameMenu(scene)
{
    let width = config.width;
    let height = config.height;

    // Replay button
    const replayButton = scene.add.image(0, 0, 'restartButton')
        .setDisplaySize(40, 40)
        .setInteractive();

    replayButton.on("pointerdown", pointer => {
        hideInGameMenu();
        startMiniGame(currentMiniGame.id, scene);
    })

    let replayButtonContainer = scene.add.container(width * 0.835, height * 0.05, replayButton);


    // Sound button
    const soundButton = scene.add.image(0, 0, isSoundOn ? "turnOffSoundButton" : "turnOnSoundButton")
        .setDisplaySize(40, 40)
        .setInteractive();

    soundButton.on("pointerdown", pointer => {
        isSoundOn = !isSoundOn;
        scene.sound.setMute(!isSoundOn);
        soundButton.setTexture(isSoundOn ? "turnOffSoundButton" : "turnOnSoundButton");
    });

    let soundButtonContainer = scene.add.container(replayButtonContainer.x + replayButton.displayWidth + 10, replayButtonContainer.y, soundButton);

    // Exit button
    const exitButton = scene.add.image(0, 0, 'exitButton')
        .setDisplaySize(40, 40)
        .setInteractive();
    
    exitButton.on("pointerdown", pointer => {
        hideInGameMenu();
        currentMiniGame.stop(false);
    })
    
    let exitButtonContainer = scene.add.container(soundButtonContainer.x + soundButton.displayWidth + 10, soundButtonContainer.y, exitButton);

    inGameMenuDialog = scene.add.container(0, 0, [replayButtonContainer, soundButtonContainer, exitButtonContainer]);
}

function hideInGameMenu()
{
    if (inGameMenuDialog == null) {
        console.warn("Trying to hide InGameDialog which is null.")
        return;
    }
    inGameMenuDialog.destroy();
}

function showWinDialog(scene, score) 
{
    winSound.play();
    let titleText = scene.add.text(0, 0, "Победа!", headerStyle)
                                .setScrollFactor(0)
                                .setOrigin(0.5, 0);
    let userRecordText;
    if (loadUserData(currentUserId) == null ||loadUserData(currentUserId)[currentMiniGame.id] == null ) {
        userRecordText = scene.add.text(0, 60, "У вас еще нет рекорда", style)
                                .setScrollFactor(0)
                                .setOrigin(0.5, 0);    
    } else {
        userRecordText = scene.add.text(0, 60, `Ваш рекорд: ${loadUserData(currentUserId)[currentMiniGame.id]} очков`, style)
                                .setScrollFactor(0)
                                .setOrigin(0.5, 0);    
    }
                            
    let resultText = scene.add.text(0, 110, `Ваш результат: ${score} очков`, style)
                                .setScrollFactor(0)
                                .setOrigin(0.5, 0);

    let nextButton = new Button(scene, 0, 0);
    let nextButtonText = scene.add.text(nextButton.x, nextButton.y, 'Следующий', buttonStyle)
        .setOrigin(0.5);
    let nextButtonContainer = scene.add.container(0, 190, [nextButton, nextButtonText]);
    nextButton.on("pointerdown", pointer => {
        currentResultDialog.destroy();

        if (currentMiniGame.id == NumberOrderGame.sId) {
            startMiniGame(SwapOrderGame.sId, scene);
        }
        else if (currentMiniGame.id == SwapOrderGame.sId) {
            startMiniGame(TwoAreasGame.sId, scene);
        }
        else {
            startMiniGame(NumberOrderGame.sId, scene);
        }
    });

    let mainMenuButton = new Button(scene, 0, 0);
    let mainMenuButtonText = scene.add.text(mainMenuButton.x, mainMenuButton.y, 'Главная', buttonStyle)
        .setOrigin(0.5);
    let mainMenuButtonContainer = scene.add.container(0, 260, [mainMenuButton, mainMenuButtonText]);
    mainMenuButton.on("pointerdown", pointer => {
        currentResultDialog.destroy();
        showMainMenu(scene);
    });
    
    currentResultDialog = scene.add.container(400, 200, [titleText/* , gameRecordText */, userRecordText, resultText, nextButtonContainer, mainMenuButtonContainer]);
}

function showLoseDialog(scene, score) 
{
    loseSound.play();
    let titleText = scene.add.text(0, 0, "Поражение :(", headerStyle)
                                .setScrollFactor(0)
                                .setOrigin(0.5, 0);
    let resultText = scene.add.text(0, 60, `Ваш результат: ${score}`, style)
                                .setScrollFactor(0)
                                .setOrigin(0.5, 0);

    let tryAgainButton = new Button(scene, 0, 0);

    let tryAgainButtonText = scene.add.text(tryAgainButton.x, tryAgainButton.y, 'Еще раз', buttonStyle)
        .setOrigin(0.5);
    let tryAgainButtonContainer = scene.add.container(0, 140, [tryAgainButton, tryAgainButtonText]);
    tryAgainButton.on("pointerdown", pointer => {
        currentResultDialog.destroy();
        startMiniGame(currentMiniGame.id, scene);
    });

    let mainMenuButton = new Button(scene, 0, 0);
    let mainMenuButtonText = scene.add.text(mainMenuButton.x, mainMenuButton.y, 'Главная', buttonStyle)
        .setOrigin(0.5);
    let mainMenuButtonContainer = scene.add.container(0, 210, [mainMenuButton, mainMenuButtonText]);
    mainMenuButton.on("pointerdown", pointer => {
        currentResultDialog.destroy();
        showMainMenu(scene);
    });

    currentResultDialog = scene.add.container(400, 200, [titleText, resultText, tryAgainButtonContainer, mainMenuButtonContainer]);
}
// End MainLoop

// Start Card
class Card extends Phaser.GameObjects.Sprite 
{
    cScale;
    number;
    isInteractive = true;

    constructor(scene, x, y, scale, number) 
    {
        super(scene, x, y, "card");
        this.cScale = scale;
        this.setScale(scale);
        this.number = number;
    }
}

Phaser.GameObjects.GameObjectFactory.register("cm_card", function (x, y, scale, number, isDraggable) 
{
	let card = new Card(this.scene, 0, 0, scale, number)
    let numberText = this.scene.add.text(0, 0, number, style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0.5);
    numberText.depth = 1;


    let container = this.scene.add.container(x, y, [ card,  numberText]);
    container.setSize(card.width * card.cScale, card.height * card.cScale);
    container.setInteractive();

    

    container.on("pointerover", pointer => {
        if (!card.isInteractive) {
            return;
        }
        card.y -= 5;
        numberText.y -=5;
    })

    container.on("pointerout", pointer => {
        if (!card.isInteractive) {
            return;
        }
        card.y += 5;
        numberText.y +=5;
    })

    if (isDraggable) {
        this.scene.input.setDraggable(container);

        this.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });
    }

    return container;
})
// End Card

class BaseGame
{
    timerText;
    pointsCounterText;

    totalTime;
    elapsedTime;

    isStarted;
    isEnded;

    constructor(scene, totalTime) {
        this.scene = scene;
        this.totalTime = totalTime * 1000;
        this.elapsedTime = 0;
    }

    createTimer(timerPositionY) {
        this.timerText = this.scene.add.text(280, timerPositionY, "", style);
    }

    createPointsCounter() {
        this.pointsCounterText = this.scene.add.text(20, 20, "", style);
    }

    updateTimer(deltaTime) {
        this.elapsedTime += deltaTime;
        this.timerText.setText(`Осталось: ${Math.ceil((this.totalTime - this.elapsedTime) / 1000)} сек.`);
    }

    updatePointsCounter(totalPoints) {
        this.pointsCounterText.setText(`Очки: ${totalPoints}`);
    }

    hideTimer() {
        this.timerText.visible = false;
    }

    hidePointsCounter() {
        this.pointsCounterText.visible = false;
    }

    isTimerEnded() {
        return this.totalTime - this.elapsedTime <= 0;
    }
}

class NumberOrderGame extends BaseGame 
{
    static sName = "Клик";
    static sId = "numberOrder";
    id = "numberOrder";

    questionText;
    cards;

    numbersToAnswerArray = [];

    goodMovePoints = 100;
    badMovePoints = -50;
    totalPoints;

    constructor(scene, cardsCount, totalTime) {
        super(scene, totalTime);
        this.cardsCount = cardsCount;
        this.totalPoints = 0;
    }

    start() {
        this.cards = this.generateCards();
        this.questionText = this.scene.add.text(400, 130, "Выберите числа в порядке возрастания", gameTaskHeaderStyle)
            .setScrollFactor(0)
            .setOrigin(0.5, 0);

        this.createTimer(170);
        this.createPointsCounter();
        this.isStarted = true;
    }

    stop(isWin) {
        this.hide();
        this.isEnded = true;
        this.scene.events.emit("gameEnded", isWin, this.totalPoints, this.elapsedTime, this.scene);
    }

    update(deltaTime) {
        if (!this.isStarted || this.isEnded) {
            return;
        }
        if (this.numbersToAnswerArray.length == 0) {
            this.stop(true);
            return;
        }
        if (this.isTimerEnded()) {
            this.stop(false);
            return;
        }
        this.updateTimer(deltaTime);
        this.updatePointsCounter(this.totalPoints);
    }

    generateCards() {
        let generatedCards = [];
        for (let i = 0; i < this.cardsCount; i++) {
            let cardNumber;
            do {
                cardNumber = randomRange(0, 100);
            } while(this.numbersToAnswerArray.includes(cardNumber));
            const spaceBetweenCards = 100;
            let card = this.scene.add.cm_card((400 - spaceBetweenCards / 2 * (this.cardsCount - 1)) + spaceBetweenCards * i, 350, 0.07, cardNumber, false);
            card.on("pointerdown", pointer => {
                this.makeMove(card);
            })

            generatedCards.push(card);
            this.numbersToAnswerArray.push(cardNumber);
        }

        this.numbersToAnswerArray.sort(function(a, b) {
            return a - b;
        });

        return generatedCards;
    }

    makeMove(card) {
        if (card.list[0].number != this.numbersToAnswerArray[0]) {
            this.totalPoints += this.badMovePoints;
            return;
        }
        this.totalPoints += this.goodMovePoints;
        card.visible = false;
        this.numbersToAnswerArray.shift();
    }

    hide() {
        this.questionText.visible = false;
        this.hideTimer();
        this.hidePointsCounter();
        this.cards.forEach(card => {
            card.visible = false;
        });
    }
}

class SwapOrderGame extends BaseGame
{
    static sName = "Смена мест";
    static sId = "swapOrder";
    id = "swapOrder";

    questionText;
    cards;

    numbersToAnswerArray = []

    firstCardSelected;
    secondCardSelected;

    goodMovePoints = 700;
    totalPoints;

    constructor(scene, cardsCount, totalTime) {
        super(scene, totalTime);
        this.cardsCount = cardsCount;
        this.totalPoints = 0;
    }

    start() {
        this.cards = this.generateCards();
        this.questionText = this.scene.add.text(400, 130, "Расположите числа в порядке возрастания", gameTaskHeaderStyle)
            .setScrollFactor(0)
            .setOrigin(0.5, 0);
        this.createTimer(170);

        this.isStarted = true;
    }

    stop(isWin) {
        this.hide();
        this.isEnded = true;
        this.scene.events.emit("gameEnded", isWin, this.totalPoints, this.elapsedTime, this.scene);
    }

    update(deltaTime) {
        if (!this.isStarted || this.isEnded) {
            return;
        }
        if (this.checkWin()) {
            this.totalPoints += this.goodMovePoints;
            this.stop(true);
            return;
        }
        if (this.isTimerEnded()) {
            this.stop(false);
            return;
        }
        // Если выбраны обе карты, поменять их местами и очистить переменные
        if (this.firstCardSelected != null && this.secondCardSelected != null) {
            let tempX = this.firstCardSelected.x;
            this.firstCardSelected.x = this.secondCardSelected.x;      
            this.secondCardSelected.x = tempX;

            let firstCardNumberIndex =  this.numbersToAnswerArray.indexOf(this.firstCardSelected.list[0].number);
            let secondCardNumberIndex =  this.numbersToAnswerArray.indexOf(this.secondCardSelected.list[0].number);
            this.numbersToAnswerArray[firstCardNumberIndex] = this.secondCardSelected.list[0].number;
            this.numbersToAnswerArray[secondCardNumberIndex] = this.firstCardSelected.list[0].number;

            this.firstCardSelected = null;
            this.secondCardSelected = null;
        }

        this.updateTimer(deltaTime);      
    }

    generateCards() {
        let generatedCards = [];
        for (let i = 0; i < this.cardsCount; i++) {
            let cardNumber;
            do {
                cardNumber = randomRange(0, 100);
            } while(this.numbersToAnswerArray.includes(cardNumber));
            const spaceBetweenCards = 100;
            let card = this.scene.add.cm_card((400 - spaceBetweenCards / 2 * (this.cardsCount - 1)) + spaceBetweenCards * i, 350, 0.07, cardNumber, false);
            card.on("pointerdown", pointer => {
                this.makeMove(card);
            })

            generatedCards.push(card);
            this.numbersToAnswerArray.push(cardNumber);
        }

        return generatedCards;
    }

    makeMove(card) {
        if (this.firstCardSelected != null && this.firstCardSelected == card) {
            this.firstCardSelected = null;
            console.log("Cancel first card selection");
            return;
        } 
        if (this.firstCardSelected == null) {
            this.firstCardSelected = card;
            console.log("Select first card");
            return;
        }
        if (this.secondCardSelected == null) {
            this.secondCardSelected = card;
            console.log("Select second card");
        }
    }

    checkWin() {
        for (let i = 0; i < this.numbersToAnswerArray.length; i++) {
            if (i + 1 == this.numbersToAnswerArray.length) {
                break;
            }
            if (this.numbersToAnswerArray[i] > this.numbersToAnswerArray[i + 1]) {
                return false;
            }
        }
        return true;
    }

    hide() {
        this.questionText.visible = false;
        this.cards.forEach(card => {
            card.visible = false;
        });
        this.hideTimer();
    }
}

class Zone extends Phaser.GameObjects.Sprite 
{
    cScale = 0.15;
    isOdd;

    constructor(scene, x, y, isOdd) 
    {
        let zoneSpriteName = isOdd ? "oddZone" : "evenZone";
        super(scene, x, y, zoneSpriteName);
        this.setScale(this.cScale);
        this.isOdd = isOdd;
    }
}

Phaser.GameObjects.GameObjectFactory.register("cm_zone", function (x, y, isOdd) 
{
	let zone = new Zone(this.scene, 0, 0, isOdd)

    let container = this.scene.add.container(x, y, zone);
    container.setSize(zone.width * zone.cScale, zone.height * zone.cScale);

    return container;
})

class TwoAreasGame extends BaseGame
{
    static sName = "Тетради";
    static sId = "twoAreas";
    id = "twoAreas";

    questionText;
    cards;
    
    evenZone;
    oddZone;

    numbersToAnswerArray = []

    goodMovePoints = 200;
    badMovePoints = -100;
    totalPoints;

    constructor(scene, cardsCount, totalTime) {
        super(scene, totalTime);
        this.cardsCount = cardsCount;
        this.totalPoints = 0;
    }

    start() {
        this.generateZones();
        this.cards = this.generateCards();
        this.questionText = this.scene.add.text(400, 50, "Поместите четные числа в левую зону,\n      а нечетные - в правую.", gameTaskHeaderStyle)
            .setScrollFactor(0)
            .setOrigin(0.5, 0);
        this.createTimer(100);
        this.createPointsCounter();

        this.isStarted = true;
    }

    stop(isWin) {
        this.hide();
        this.isEnded = true;
        this.scene.events.emit("gameEnded", isWin, this.totalPoints, this.elapsedTime, this.scene);
    }

    update(deltaTime) {
        if (!this.isStarted || this.isEnded) {
            return;
        }
        if (this.numbersToAnswerArray.length == 0) {
            this.stop(true);
            return;
        }
        if (this.isTimerEnded()) {
            this.stop(false);
            return;
        }
        this.updateTimer(deltaTime);
        this.updatePointsCounter(this.totalPoints);
    }

    generateZones() {
        this.evenZone = this.scene.add.cm_zone(160, 300, false);
        this.oddZone = this.scene.add.cm_zone(640, 300, true);
    }

    generateCards() {
        let generatedCards = [];
        for (let i = 0; i < this.cardsCount; i++) {
            let cardNumber;
            do {
                cardNumber = randomRange(0, 100);
            } while(this.numbersToAnswerArray.includes(cardNumber));
            const spaceBetweenCards = 70;
            let card = this.scene.add.cm_card((400 - spaceBetweenCards / 2 * (this.cardsCount - 1)) + spaceBetweenCards * i, 535, 0.04, cardNumber, true);
            card.on("pointerdown", pointer => {
                this.cards.forEach(savedCard => {
                    savedCard.depth = 0;
                });
                card.depth = 100;
            })
            card.on("pointerup", pointer => {
                this.makeMove(card);
            })

            generatedCards.push(card);
            this.numbersToAnswerArray.push(cardNumber);
        }

        return generatedCards;
    }

    makeMove(card) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(card.getBounds(), this.evenZone.getBounds())) {
            if (card.list[0].number % 2 != 0) {
                this.totalPoints += this.badMovePoints;
                return;
            }
        }
        else if (Phaser.Geom.Intersects.RectangleToRectangle(card.getBounds(), this.oddZone.getBounds())) {
            if (card.list[0].number % 2 == 0) {
                this.totalPoints += this.badMovePoints;
                return;
            }
        }
        this.totalPoints += this.goodMovePoints;
        this.scene.input.setDraggable(card, false);
        card.list[0].isInteractive = false;
        dropSound.play();
        this.numbersToAnswerArray.shift();
    }

    hide() {
        this.questionText.visible = false;
        this.cards.forEach(card => {
            card.visible = false;
        });
        this.evenZone.visible = false;
        this.oddZone.visible = false;
        this.hideTimer();
        this.hidePointsCounter();
    }
}

function getMinigameName(minigameId) {
    if (minigameId == NumberOrderGame.sId) {
        return NumberOrderGame.sName;
    }
    else if (minigameId == SwapOrderGame.sId) {
        return SwapOrderGame.sName;
    }
    else if (minigameId == TwoAreasGame.sId) {
        return TwoAreasGame.sName;
    }
}

function randomRange(min, max) {  
    return Math.floor(Math.random() * (max - min) + min)
}

function sortDictionaryByValue(dict) {
    var items = Object.keys(dict).map((key) => { return [key, dict[key]] });
    items.sort((first, second) => { return second[1] - first[1] });
    return items.map((e) => { return e });
}

class Button extends Phaser.GameObjects.Image {
    constructor(scene, x, y, texture, frame) {
        texture = "buttonGeneral";
        super(scene, x, y, texture, frame);
        this.setDisplaySize(260, 50);
        this.setInteractive();

        this.on("pointerover", pointer => {
            this.setTexture("buttonHighlighted");
        })

        this.on("pointerout", pointer => {
            this.setTexture("buttonGeneral");
        })
        
        scene.add.existing(this);
    }
}