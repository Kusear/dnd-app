import Phaser from "phaser";
import { useEffect, useRef } from "react";

class Example extends Phaser.Scene {
  texture: Phaser.Textures.CanvasTexture;

  create() {
    this.texture = this.textures.createCanvas("gradient", 16, 256);

    //  We can access the underlying Canvas context like this:
    const grd = this.texture.context.createLinearGradient(0, 0, 0, 256);

    grd.addColorStop(0, "#8ED6FF");
    grd.addColorStop(1, "#004CB3");

    this.texture.context.fillStyle = grd;
    this.texture.context.fillRect(0, 0, 16, 256);

    //  Call this if running under WebGL, or you'll see nothing change
    this.texture.refresh();

    //  Add a bunch of images that all use the same texture
    for (let i = 0; i < 64; i++) {
      const image = this.add.image(8 + i * 16, 0, "gradient");

      this.tweens.add({
        targets: image,
        y: 650,
        duration: 2000,
        ease: "Quad.easeInOut",
        delay: i * 62.5,
        yoyo: true,
        repeat: -1,
      });
    }

    this.time.addEvent({
      delay: 4000,
      callback: this.updateTexture,
      callbackScope: this,
      loop: true,
    });
  }

  updateTexture() {
    const grd = this.texture.context.createLinearGradient(0, 0, 0, 256);

    grd.addColorStop(0, this.generateHexColor());
    grd.addColorStop(1, this.generateHexColor());

    this.texture.context.fillStyle = grd;
    this.texture.context.fillRect(0, 0, 16, 256);

    //  Call this if running under WebGL, or you'll see nothing change
    this.texture.refresh();
  }

  generateHexColor() {
    return `#${(((0.5 + 0.5 * Math.random()) * 0xffffff) << 0).toString(16)}`;
  }

  //   preload() {
  //     // this.load.setBaseURL("https://cdn.phaserfiles.com/v385");
  //     // this.load.image("brush", "assets/particles/sparkle1.png");
  //     // this.load.image("grass", "assets/textures/grass.png");
  //     // this.load.image("bg", "assets/pics/turkey-1985086.jpg");
  //   }

  //   create() {
  //     // this.add.image(0, 0, "bg").setOrigin(0);

  //     const texture = this.textures.createCanvas("canvastexture", 100, 100);

  //     // const grass = this.textures
  //     //   .get("grass")
  //     //   .getSourceImage() as HTMLImageElement;
  //     // const brush = this.textures
  //     //   .get("brush")
  //     //   .getSourceImage() as HTMLImageElement;

  //     // texture.draw(0, 0, grass);
  //     // texture.draw(512, 0, grass);
  //     // texture.draw(0, 512, grass);
  //     // texture.draw(512, 512, grass);

  //     //  Set the global composite op:
  //     texture.context.globalCompositeOperation = "destination-out";

  //     // //  Now anything drawn to the canvas will use this op
  //     // texture.draw(0, 0, brush);
  //     // texture.draw(150, 90, brush);
  //     // texture.draw(300, 140, brush);

  //     //  Finally, display the Canvas Texture by adding it to an Image
  //     this.add.image(0, 0, "canvastexture").setOrigin(0);
  //   }
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: document.getElementById("id-game-area")?.offsetWidth,
  height: document.getElementById("id-game-area")?.offsetHeight,
  backgroundColor: "#2d2d88",
  scene: Example,
};

// document.addEventListener("DOMContentLoaded", () => {
//   const game = new Phaser.Game(config);
// });

// const game = new Phaser.Game(config);

export function GameComponent() {
  //   const gameRef = useRef<Phaser.Game>(null);

  useEffect(() => {
    const game = new Phaser.Game(config);
  }, [config]);

  return <div id="phaser-example"></div>;
}
