// pong-game.ts

export class PongGame {
    private ballX: number;
    private ballY: number;
    private ballRadius: number;
    private speedX: number;
    private speedY: number;
    private paddleHeight: number;
    private paddleWidth: number;
    private paddleY: number[];
    private score: { creator: number; joiner: number };
    private width: number;
    private height: number;
    private scoreLimit: number;
    private creatorId: string;
    private joinerId: string;
    // add a property for tracking whether a user forfeited, and if so, which user
    private quit: string;


    constructor(settings: any, creator: string, joiner: string) {
        this.width = settings.width;
        this.height = settings.height;
        this.paddleHeight = settings.paddleHeight;
        this.paddleWidth = settings.paddleWidth;
        this.ballRadius = settings.ballRadius;
        this.speedX = settings.speedX;
        this.speedY = settings.speedY;
        this.scoreLimit = settings.scoreLimit;
        this.creatorId = creator;
        this.joinerId = joiner;

        // Initialize game state
        this.ballX = this.width / 2;
        this.ballY = this.height / 2;
        this.paddleY = [this.height / 2, this.height / 2];
        this.score = { creator: 0, joiner: 0 };

        this.quit = '';
    }

    // set joiner id
    setJoinerId(joiner: string) {
        this.joinerId = joiner;
    }

    // set forfeited
    setQuit(quit: string) {
        this.quit = quit;
    }

    // set score
    setScore(score: { creator: number; joiner: number }) {
        this.score = score;
    }

    // Method to update paddle position
    updatePaddle(playerIndex: number, newY: number) {
        // Ensure paddle remains within the canvas bounds
        this.paddleY[playerIndex] = Math.max(
            Math.min(newY, this.height - this.paddleHeight / 2),
            this.paddleHeight / 2
        );
    }

    update() {
        // Update ball position
        this.ballX += this.speedX;
        this.ballY += this.speedY;

        // Handle ball collisions with walls
        if (this.ballY - this.ballRadius < 0 || this.ballY + this.ballRadius > this.height) {
            this.speedY = -this.speedY;
        }

        // Collision with left paddle
        if (
            this.ballX - this.ballRadius < 10 + this.paddleHeight &&
            this.ballY > this.paddleY[0] - this.paddleWidth / 2 &&
            this.ballY < this.paddleY[0] + this.paddleWidth / 2
        ) {
            this.speedX = -this.speedX;
            // Adjust ball position so it's outside the paddle
            this.ballX = 10 + this.paddleHeight + this.ballRadius;
        }

        // Collision with right paddle
        if (
            this.ballX + this.ballRadius > this.width - this.paddleHeight - 10 &&
            this.ballY > this.paddleY[1] - this.paddleWidth / 2 &&
            this.ballY < this.paddleY[1] + this.paddleWidth / 2
        ) {
            this.speedX = -this.speedX;
            // Adjust ball position so it's outside the paddle
            this.ballX = this.width - this.paddleHeight - 10 - this.ballRadius;
        }

        // Scoring logic
        if (this.ballX - this.ballRadius < 0) {
            this.score.joiner++;
            this.resetBall();
        } else if (this.ballX + this.ballRadius > this.width) {
            this.score.creator++;
            this.resetBall();
        }

        // Check if the game has ended
        if (this.score.creator >= this.scoreLimit || this.score.joiner >= this.scoreLimit) {
            return this.handleGameOver();
        }

        // More collision logic and paddle movement will be added here
        return null;
    }

    // update() {
    //     // Update ball position
    //     this.ballX += this.speedX;
    //     this.ballY += this.speedY;

    //     // Handle ball collisions with top and bottom walls
    //     if (this.ballY - this.ballRadius < 0 || this.ballY + this.ballRadius > this.height) {
    //         this.speedY = -this.speedY;
    //     }

    //     // Collision with left paddle (player)
    //     if (this.ballX - this.ballRadius < this.paddleHeight + 10) {
    //         // log ballY and paddleY[0]
    //         console.log(`ballY: ${this.ballY}, paddleY[0]: ${this.paddleY[0]}`)
    //         console.log("possible collision with left paddle")
    //         if (
    //             this.ballY > this.paddleY[0] - this.paddleWidth / 2 &&
    //             this.ballY < this.paddleY[0] + this.paddleWidth / 2
    //         ) {
    //             console.log("collision with left paddle")
    //             this.speedX = -this.speedX;
    //         } else if (this.ballX - this.ballRadius < 0) {
    //             // Ball passed the left paddle, update score for joiner
    //             this.score.joiner++;
    //             this.resetBall();
    //         }
    //     }

    //     // Collision with right paddle (opponent)
    //     if (this.ballX + this.ballRadius > this.width - this.paddleHeight) {
    //         if (
    //             this.ballY > this.paddleY[1] - this.paddleWidth / 2 &&
    //             this.ballY < this.paddleY[1] + this.paddleWidth / 2
    //         ) {
    //             this.speedX = -this.speedX;
    //         } else if (this.ballX + this.ballRadius > this.width) {
    //             // Ball passed the right paddle, update score for creator
    //             this.score.creator++;
    //             this.resetBall();
    //         }
    //     }

    //     // Check if the game has ended
    //     if (this.score.creator >= this.scoreLimit || this.score.joiner >= this.scoreLimit) {
    //         return this.handleGameOver();
    //     }

    //     // More collision logic and paddle movement will be added here
    //     return null;
    // }


    // Method to handle game over
    private handleGameOver() {
        // Determine the winner
        const winner = this.score.creator > this.score.joiner ? this.creatorId : this.joinerId;

        // Perform any cleanup or state reset needed
        // Reset scores, ball position, etc.
        // this.score.creator = 0;
        // this.score.joiner = 0;
        // may need to reset scores in the future
        this.resetBall();

        return winner;
    }

    // Method to reset the ball to the center
    private resetBall() {
        this.ballX = this.width / 2;
        this.ballY = this.height / 2;
        this.speedX = -this.speedX; // Change ball direction
    }

    getState() {
        // Return the current game state
        return {
            ballX: this.ballX,
            ballY: this.ballY,
            paddleY: this.paddleY,
            score: this.score,
            creatorId: this.creatorId,
            joinerId: this.joinerId,
            quit: this.quit,
            scoreLimit: this.scoreLimit
            // Add more properties as needed
        };
    }

    // Method to handle game state updates from client (e.g., paddle movements)
    handleClientUpdate(clientId: string, data: any) {
        // Determine which player (creator or joiner) sent the update
        const playerIndex = clientId === this.creatorId ? 0 : 1;

        // Update the paddle position based on the client's data
        if (data.paddleY !== undefined) {
            this.updatePaddle(playerIndex, data.paddleY);
        }

        // You can add more handling here if clients can send other types of updates
    }

}
