const express = require('express');
const atob = require('atob');
const fs = require('fs');

const router = express.Router();

// @route      GET api/emails
// @desc       Get all emails
// @access     Public
router.post('/', async (req, res) => {
  try {
    
    console.log('Email received');
    console.log(req.body);
    const base64 = req.body.contentBytes;
    // const orderPdf = atob(base64);

    // await fs.writeFile('order.pdf', orderPdf, 'utf-8', function(err) {
    //   if (err) console.log(err);
    // });
    // await fs.writeFileSync('order.pdf', base64, 'binary', function(err) {
    //   if (err) console.log(err);
    // });
    await fs.writeFile('order.pdf', base64, {encoding: 'base64'}, function(err) {
      if (err) console.log(err);
    });

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