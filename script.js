window.onload = function () {
  // Fonction principale : lance le jeu et gère son évolution

  const sizeDesktop = window.matchMedia( '(min-width : 992px)' );

  // Media query handler function 
  // (vérifie si l'écran a une largeur minimale de 992px inclus pour lancer le jeu)
  function mqHandler(e) {
    if (!sizeDesktop.matches) {
      const canvas = document.querySelector('canvas');
      canvas.remove();
    } else {
      const canvasWidth = 900;
      const canvasHeight = 500;
      const blockSize = 30;
      const widthInBlocks = canvasWidth / blockSize;
      const heightInBlocks = canvasHeight / blockSize;
      const delay = 250;
      let context;
      let snakee;
      let applee;
      let score;
      let timeout;
    
      class Snake {
        // Fonction constructeur d'un serpent
        constructor(body, direction) {
          this.body = body;
          this.direction = direction;
          this.ateApple = false;
        }
    
        draw() {
          // dessine l'ensemble du serpent selon les coordonnées contenues dans body
          context.save();
          context.fillStyle = "#33cc33";
          for (let i = 0; i < this.body.length; i++) {
            drawBlock(context, this.body[i]);
          }
          context.restore();
        }
        
        advance() {
          // attribue une nextPosition au body, pour pouvoir ensuite faire avancer le serpent
          let nextPosition = this.body[0].slice(); // COPIER le bloc [x1,y1]
          switch (this.direction) {
            // analyse la direction de déplacement actuelle, en déduit la position n+1 et l'attribue au body
            case "left":
              nextPosition[0] -= 1; //nextPosition[0] = x1
              break;
            case "right":
              nextPosition[0] += 1; //
              break;
            case "up":
              nextPosition[1] -= 1; //nextPosition[1] = y1
              break;
            case "down":
              nextPosition[1] += 1;
              break;
            default:
              throw "Invalid direction";
          }
          this.body.unshift(nextPosition);
          if (!this.ateApple) this.body.pop();
          else this.ateApple = false;
        }
    
        setDirection(newDirection) {
          // change la direction du serpent, selon la flèche du clavier enfoncée par l'utilisateur
          let allowedDirections;
          switch (this.direction) {
            case "left":
            case "right":
              allowedDirections = ["up", "down"];
              break;
            case "up":
            case "down":
              allowedDirections = ["left", "right"];
              break;
            default:
              throw "Invalid direction";
          }
          if (allowedDirections.indexOf(newDirection) > -1) {
            // je ne veux changer la direction que si la direction saisie est permise
            this.direction = newDirection;
          }
        }
    
        checkCollision() {
          // vérifie si le serpent entre en collision avec le mur ou lui-même
          let wallCollision = false;
          let snakeCollision = false;
          const head = this.body[0];
          const rest = this.body.slice(1);
          const snakeX = head[0];
          const snakeY = head[1];
          const minX = 0;
          const minY = 0;
          const maxX = widthInBlocks - 1;
          const maxY = heightInBlocks - 1;
          const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
          const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
          if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
            wallCollision = true;
          }
          for (let i = 0; i < rest.length; i++) {
            if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
              snakeCollision = true;
            }
          }
          return wallCollision || snakeCollision;
        }
    
        isEatingApple(appleToEat) {
          // vérifie si le serpent "mange" (= touche) la pomme 
          const head = this.body[0];
          if (
            head[0] === appleToEat.position[0] &&
            head[1] === appleToEat.position[1]
          )
            return true;
          else return false;
        }
      }
    
      class Apple {
        // Fonction constructeur d'une pomme  
        constructor (position) {
          this.position = position;
        }
    
        draw() {
          // dessine la pomme (= cercle) à l'écran, selon sa position
          context.save();
          context.fillStyle = "#ff0000";
          context.beginPath();
          const radius = blockSize / 2;
          const x = this.position[0] * blockSize + radius; // abscisse du centre du cercle
          const y = this.position[1] * blockSize + radius; // ordonnée du centre du cercle
          context.arc(x, y, radius, 0, Math.PI * 2, true);
          context.fill();
          context.restore();
        }
    
        setNewPosition() {
          // redessine la pomme en la déplaçant à une position aléatoire
          const newX = Math.round(Math.random() * (widthInBlocks - 1));
          const newY = Math.round(Math.random() * (heightInBlocks - 1));
          this.position = [newX, newY];
        }
    
        isOnSnake(snakeToCheck) {
          // vérifie que la pomme ne se trouve pas sur le serpent
          let isOnSnake = false;
          for (let i = 0; i < snakeToCheck.body.length; i++) {
            if (
              this.position[0] === snakeToCheck.body[i][0] &&
              this.position[1] === snakeToCheck.body[i][1]
            ) {
              isOnSnake = true;
            }
          }
          return isOnSnake;
        }
      }
    
      function init() {
        // Initialise le jeu : crée le canvas, le contexte et le serpent initial
        const canvas = document.createElement("canvas"); // = cadre
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid grey";
        canvas.style.margin = "30px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas);
        context = canvas.getContext("2d"); // = toile
        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
      }
      
      function refreshCanvas() {
        // Déplace le serpent (efface le contexte puis redessine le serpent à sa position),
        // et la pomme si le serpent l'a mangée
        snakee.advance();
        if (snakee.checkCollision()) {
          gameOver();
        } else {
          if (snakee.isEatingApple(applee)) {
            score++;
            snakee.ateApple = true;
            do {
              applee.setNewPosition();
            } while (applee.isOnSnake(snakee));
          }
          context.clearRect(0, 0, canvasWidth, canvasHeight);
          drawScore();
          snakee.draw();
          applee.draw();
          timeout = setTimeout(refreshCanvas, delay);
        }
      }
    
      function gameOver() {
        // Dessine un écran de fin de partie
        context.save();
        context.font = "bold 70px sans-serif";
        context.fillStyle = "#000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.strokeStyle = "white"; // couleur du contour
        context.lineWidth = 5; // épaisseur du contour
        const centreX = canvasWidth / 2;
        const centreY = canvasHeight / 2;
        context.strokeText("Game Over", centreX, centreY - 180); // remplissage du contour
        context.fillText("Game Over", centreX, centreY - 180);
        context.font = "bold 30px sans-serif";
        context.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        context.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        context.restore();
      }
    
      function restart() {
        // Réinitialise les éléments nécessaires pour rejouer une partie
        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
      }
    
      function drawScore() {
        // Dessine le score au centre de l'écran
        context.save();
        context.font = "bold 200px sans-serif";
        context.fillStyle = "#bbb"; // grey
        context.textAlign = "center";
        context.textBaseline = "middle";
        const centreX = canvasWidth / 2;
        const centreY = canvasHeight / 2;
        context.fillText(score.toString(), centreX, centreY);
        context.restore();
      }
    
      function drawBlock(context, position) {
        // Dessine un bloc sur le contexte en fonction de sa position
        const x = position[0] * blockSize;
        const y = position[1] * blockSize;
        context.fillRect(x, y, blockSize, blockSize);
      }
      
      init();
    
      document.onkeydown = function handleKeydown(e) {
        // Analyse le clic de l’utilisateur, et définit la direction correspondante à passer au serpent
        const key = e.key;
        let newDirection;
        switch (key) {
          case "ArrowLeft":
            newDirection = "left";
            break;
          case "ArrowRight":
            newDirection = "right";
            break;
          case "ArrowUp":
            newDirection = "up";
            break;
          case "ArrowDown":
            newDirection = "down";
            break;
          case " ": // touche espace
            restart();
            return;
          default:
            return;
        }
        snakee.setDirection(newDirection);
      }
    }
  }
  mqHandler();
  sizeDesktop.addEventListener('change', mqHandler);
}


  
