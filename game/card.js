import Phaser from '../lib/phaser.js'

export default class Card extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "card").setInteractive();

        this.on('pointerover', pointer => {
            this.y -= 5;
        })

        this.on('pointerout', pointer => {
            this.y += 5;
        })
    }
}