const path = require("path")
const dotenv = require("dotenv")
const {MailtrapClient} = require("mailtrap")

dotenv.config({
    path: ".env"
})

console.log(process.env.MAILTRAP_TOKEN)

const mailtrapClient = new MailtrapClient({
    token: process.env.MAILTRAP_TOKEN
})


const sender = {
    email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
}

module.exports = {mailtrapClient, sender}