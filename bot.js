const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const sharp = require('sharp')
const request = require('request')
const schedule = require('node-schedule')
const EventEmitter = require('events')

/**
 * ThisPersonDoesNotExist Class
 *
 * @class ThisPersonDoesNotExist
 * @extends {EventEmitter}
 */
class ThisPersonDoesNotExist extends EventEmitter {

    constructor(options) {
        super();
        this.options = {
            // thing: 'thing' in options ? options.thing : null
        }
    }

    /**
     * Get the image in base64
     *
     * @param {string} body buffer
     * @param {string} mimType type
     * @param {number} width default 128
     * @param {number} height default 128
     * @returns {string} resizedBase64
     * @memberof ThisPersonDoesNotExist
     */
    async getBase64(body, mimType, width, height) {
        let resizedImageBuffer = await sharp(body)
            .resize(width, height)
            .toBuffer();
        let resizedImageData = resizedImageBuffer.toString('base64');
        let resizedBase64 = `data:${mimType};base64,${resizedImageData}`;
        return resizedBase64;
    }

    /**
     * Create the image locally and return an object with the details
     *
     * @param {string} body buffer
     * @param {string} path path
     * @param {number} width default 128
     * @param {number} height default 128
     * @returns {object} 
     * @memberof ThisPersonDoesNotExist
     */
    async getImagePath(body, path, width, height) {
        let name = `image.jpeg`;
        let ImagePath = await sharp(body)
            .resize(width, height)
            .toFile(`${path}/${name}`);
        return Object.assign(ImagePath, {
            name
        })
    }

    /**
     * Get the image remotely
     *
     * @returns {Object}
     * @memberof ThisPersonDoesNotExist
     */
    async getRemoteImage(websitePath) {
        return new Promise((resolve, reject) => {
            request.get({
                url: websitePath,
                encoding: null
            }, (error, response, body) => {
                if (error) return reject(error);
                try {
                    if (response.statusCode == 200) {
                        let img = new Buffer(body, 'base64');
                        let mimType = response.headers["content-type"];
                        resolve({
                            img,
                            mimType
                        });
                    } else {
                        throw error;
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
    /**
     * Obtain a image
     *
     * @param {Object} options {
     *         width,
     *         height,
     *         type,
     *         path
     *     }
     * @returns {Object}
     * @memberof ThisPersonDoesNotExist
     */
    async getImage({
        width,
        height,
        type,
        path,
        websitePath
    }) {

        width = width || 128;
        height = height || 128;
        type = type || 'file';
        path = path || '.';

        try {

            let {
                img,
                mimType
            } = await this.getRemoteImage(websitePath);

            if (img && mimType) {

                let response;

                switch (type) {
                    case 'base64':
                        response = await this.getBase64(img, mimType, width, height);
                        break;

                    case 'file':
                        response = await this.getImagePath(img, path, width, height);
                        break;

                    default:
                        break;
                }

                return {
                    status: true,
                    data: response
                };
            } else {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cron Job
     *
     * @param {Object} options {
     *         time,
     *         width,
     *         height,
     *         type,
     *         path
     *     }
     * @returns {Event} created
     * @memberof ThisPersonDoesNotExist
     */
    cron({
        time,
        width,
        height,
        type,
        path
    }) {
        schedule.scheduleJob(time, async () => {
            let res = await this.getImage({
                width,
                height,
                type,
                path
            });
            this.emit('created', res);
        });
    }

    /**
     * Generate random name
     *
     * @param {*} length
     * @returns {string} text
     * @memberof ThisPersonDoesNotExist
     */
    getId(length) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

}

function sendImage(message, filePath, text){
    message.channel.send(text, {
        files: [
            filePath
        ]
    });
}

const dnte = new ThisPersonDoesNotExist();
const mateText = "Here's your person:"
const waifuText = "Here's your anime:"
const fursonaText = "Here's your fursona you degenerate:"
fd = "./friends/"
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '[ping') {
    msg.reply('pong');
  }
  if(msg.content === '[findmyperson') {
    console.log(msg.author)
    dnte.getImage({
      width: 256, // width of the image (default 128)
      height: 256, // high of the image (default 128)
      type: 'file',  // Type of file to generate (file or base64) (default file)
      path: 'avatars', // Path to save (Applies to type file) (default .)
      websitePath: 'https://thispersondoesnotexist.com/image'
    }).then(res  => {
      console.log('result->', res);
      msg.channel.send("Here's your mate", {
        file: "./avatars/" + res.data.name.toString() // Or replace with FileOptions object
      });
    }).catch(err  => {
      console.log('error->', err);
      msg.channel.send("Couldn't find you a mate.")
    });
    
  }
  if(msg.content === '[findmyanime') {
    rndNum = Math.round((Math.random() * 100000))
    sendImage(msg,"https://www.thiswaifudoesnotexist.net/example-" + rndNum.toString() + ".jpg",waifuText);

  }
  if(msg.content === "[findmyfursona"){
    rndNum = Math.round((Math.random() * 90000)) + 10000
    sendImage(msg,"https://thisfursonadoesnotexist.com/v2/jpgs/seed" + rndNum + ".jpg", fursonaText)
  }
  if(msg.content == "[findmyrental"){
    sendImage(msg, "https://thisrentaldoesnotexist.com/img-new/hero.jpg", "Here's something you can't afford:")
  }
  if(msg.content == "[findmyvase"){
    rndNum = Math.round((Math.random() * 10000)) + 1
    sendImage(msg, "http://thisvesseldoesnotexist.s3-website-us-west-2.amazonaws.com/public/v2/fakes/00" + rndNum.toString() + ".jpg", "Here's your vase:")
  }
  if(msg.content == "[findmypony"){
      rndNum = Math.round((Math.random() * 99999))
      sendImage(msg, "https://thisponydoesnotexist.net/v1/w2x-redo/jpgs/seed" + rndNum.toString() + ".jpg", "Here's your pony:")
  }
  if(msg.content == "[findmyart"){
    dnte.getImage({
        width: 128, // width of the image (default 128)
        height: 128, // high of the image (default 128)
        type: 'file',  // Type of file to generate (file or base64) (default file)
        path: 'avatars', // Path to save (Applies to type file) (default .)
        websitePath: 'https://thisartworkdoesnotexist.com'
      }).then(res  => {
        console.log('result->', res);
        msg.channel.send("Here's your art", {
          file: "./avatars/" + res.data.name.toString() // Or replace with FileOptions object
        });
      }).catch(err  => {
        console.log('error->', err);
        msg.channel.send("Couldn't find you a art :(")
      });
  }
  if(msg.content == "[findmyhorse"){
    dnte.getImage({
        width: 256, // width of the image (default 128)
        height: 256, // high of the image (default 128)
        type: 'file',  // Type of file to generate (file or base64) (default file)
        path: 'avatars', // Path to save (Applies to type file) (default .)
        websitePath: 'https://thishorsedoesnotexist.com'
      }).then(res  => {
        console.log('result->', res);
        msg.channel.send("Here's your horse", {
          file: "./avatars/" + res.data.name.toString() // Or replace with FileOptions object
        });
      }).catch(err  => {
        console.log('error->', err);
        msg.channel.send("Couldn't find you a horse :(")
      });
  }
  if(msg.content == "[findmycat"){
    dnte.getImage({
        width: 256, // width of the image (default 128)
        height: 256, // high of the image (default 128)
        type: 'file',  // Type of file to generate (file or base64) (default file)
        path: 'avatars', // Path to save (Applies to type file) (default .)
        websitePath: 'https://thiscatdoesnotexist.com'
      }).then(res  => {
        console.log('result->', res);
        msg.channel.send("Here's your cat", {
          file: "./avatars/" + res.data.name.toString() // Or replace with FileOptions object
        });
      }).catch(err  => {
        console.log('error->', err);
        msg.channel.send("Couldn't find you a cat :(")
      });
    //sendImage(msg,"https://thiscatdoesnotexist.com/", "Here's your cat:")
  }
  if(msg.content === '[help'){
    msg.channel.send("Commands: [findmyart, [findmyhorse, [findmyperson, [findmyanime, [findmyfursona, [findmyvase, [findmypony, [findmyrental, [findmycat")
  }
});

client.login(auth.token);
