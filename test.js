const pdf = require('pdf-parse');
const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

const pg = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
})
try {
  pg.connect()
} catch (err) {
  // End process with failure
  console.log(err);
  console.log(1);
  process.exit(1);
}

const cinerPdfParse = async () => {

  // const dataBuffer = await fs.readFileSync('./order.pdf');
  // console.log('1');

  // try {
  //   pdf(dataBuffer).then(function(data){
  //     console.log(data.text);
  //   })
  // } catch (err) {
  //   console.log(err);
  // }
  // const s = new Date().toISOString()
  // console.log(s);
  let x = 'asdf';
  x = x.slice(0,-1)
  console.log(x);
}

cinerPdfParse()