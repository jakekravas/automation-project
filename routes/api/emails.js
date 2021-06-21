const express = require('express');
const pdf = require('pdf-parse');
const fs = require('fs');
const { htmlToText } = require('html-to-text');
const { pdfMap, thermoFisherMap, excelMap } = require('../../mapping-.js');
require('dotenv').config();
const { Client } = require('pg');

const router = express.Router();

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

// @route      GET api/emails
// @desc       Get all emails
// @access     Public
router.post('/', async (req, res) => {
  try {
    
    // Note: is ship-to address in this case same as bill to (consignee)?
    console.log('Email received');
    // console.log(req.body);
    const emailBody = htmlToText(req.body.body);
    const attachments = req.body.attachments;
    const sender = req.body.from;
    console.log(sender);
    if (emailBody.includes('Thermo Fisher')) {
      console.log('USE THERMOFISHER');
      thermoFisherMap(emailBody);
    }
    console.log(req.body.attachments[0].contentType);

    for (let i = 0; i < attachments.length; i++) {
      if (attachments[i].contentType === 'application/pdf') {
        // Save pdf file
        await fs.writeFile('order.pdf', attachments[i].contentBytes, {encoding: 'base64'}, function(err) {
          if (err) console.log(err);
        });

        setTimeout(() => {
          const dataBuffer = fs.readFileSync('order.pdf');
          pdf(dataBuffer).then(function(data) {
            pdfMap(sender, data.text)
          })
        }, 1000);

      } else if (attachments[i].contentType === 'application/xls' || attachments[i].contentType === 'application/vnd.ms-excel') {
        // Save xls file
        await fs.writeFile('orders.xls', attachments[i].contentBytes, {encoding: 'base64'}, function(err) {
          if (err) console.log(err);
        });

        setTimeout(() => {
          excelMap(sender)
        }, 1000);
      }
    }

    res.json({ message: 'post done' });
  } catch (err) {
    console.log(err);
  }
});

// @route      GET api/emails
// @desc       Get all emails
// @access     Public
router.get('/', async (req, res) => {
  try {
    
    console.log('get route hit');

    res.json({ message: 'get done' });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;