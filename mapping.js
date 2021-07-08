const { Client } = require('pg');
const xlsx = require('node-xlsx');
const PDFParser = require('pdf2json');
require('dotenv').config();

let pdfParser = new PDFParser;

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

const pdfMap = async (sender, text) => {

  pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );

  const insertRecord = async (columns, values) => {
    console.log(`
      INSERT INTO orders.orders (
        ${columns}
      )
      VALUES (
        ${values}
      )
    `);
    await pg.query(`
      INSERT INTO orders.orders (
        ${columns}
      )
      VALUES (
        ${values}
      )
    `)
    console.log('inserted order');
  }

  try {

    const parsePdf = async (pdfData) => {
      const res = pdfData.formImage;
      const pageOne = res.Pages[0].Texts;
      const pageTwo = res.Pages[1].Texts;
      // console.log(pageTwo[80].R[0].T.split('%20').join(' '))
    
      let shipperName
      let shipperAddressLine1
      let shipperAddressLine2
      let shipperAddressLine3
      let shipperAddressLine4
    
      let billToName
      let billToAddressLine1
      let billToAddressLine2
      let billToAddressLine3
      let billToAddressLine4
    
      let consigneeName
      let consigneeAddressLine1
      let consigneeAddressLine2
      let consigneeAddressLine3
      let consigneeAddressLine4
    
      let commodity;
      let consigneeRefNum;
      let bol;
      let scheduledArrivalConsignee; //same as requested delivery date
    
    
      // %20 = space
      // %2C = ,
      // %2F = /
    
      // First page of PDF
      for (let i = 0; i < pageOne.length; i++) {
        let x = pageOne[i].x
        let y = pageOne[i].y
    
        // SHIPPER
        if (x === 1.748 && y === 3.458) {
          shipperName = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 1.748 && y === 4.146) {
          shipperAddressLine1 = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 1.748 && y === 4.833) {
          shipperAddressLine2 = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 1.748 && y === 5.521) {
          shipperAddressLine3 = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 1.748 && y === 6.208) {
          shipperAddressLine4 = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
    
        // CONSIGNEE
        if (x === 1.077 && y === 13.14) {
          consigneeName = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 1.077 && y === 14.353) {
          consigneeAddressLine1 = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 1.077 && y === 15.228) {
          consigneeAddressLine2 = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',').split('%2F').join('/')
        }
        if (x === 1.077 && y === 16.103) {
          consigneeAddressLine3 = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 1.077 && y === 16.978) {
          consigneeAddressLine4 = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
    
        // MISC
        if (x === 5.563 && y === 32.438) {
          commodity = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 29.249 && y === 15.681999999999999) {
          consigneeRefNum = pageOne[i].R[0].T.split('%20').join(' ').split('%2C').join(',').split('%2F').join('/')
        }
      }
    
      // Second page of PDF
      for (let i = 0; i < pageTwo.length; i++) {
        let x = pageTwo[i].x
        let y = pageTwo[i].y
    
        // BILL TO
        if (x === 21.845 && y === 13.769) {
          billToName = pageTwo[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 21.845 && y === 14.779) {
          billToAddressLine1 = pageTwo[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 21.845 && y === 15.404) {
          billToAddressLine2 = pageTwo[i].R[0].T.split('%20').join(' ').split('%2C').join(',').split('%2F').join('/')
        }
        if (x === 21.845 && y === 16.029) {
          billToAddressLine3 = pageTwo[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 21.845 && y === 16.654) {
          billToAddressLine4 = pageTwo[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
    
        // MISC
        if (x === 28.685 && y === 18.452) {
          bol = pageTwo[i].R[0].T.split('%20').join(' ').split('%2C').join(',')
        }
        if (x === 10.235 && y === 20.278) {
          scheduledArrivalConsignee = pageTwo[i].R[0].T.split('%20').join(' ').split('%2C').join(',').split('%2F').join('/')
        }
      }
      
      const shipperAddress = `${shipperAddressLine1}, ${shipperAddressLine2}, ${shipperAddressLine3}, ${shipperAddressLine4}`;
      const consigneeAddress = `${consigneeAddressLine1}, ${consigneeAddressLine2}, ${consigneeAddressLine3}, ${consigneeAddressLine4}`
      const billToAddress = `${billToAddressLine1}, ${billToAddressLine2}, ${billToAddressLine3}, ${billToAddressLine4}`
      const currentDate = new Date().toISOString();

      let columns = `
        shipper_name,
        shipper_address,
        consignee_name,
        consignee_address,
        scheduled_arrival_consignee,
        consignee_reference,
        bol,
        commodity,
        bill_to_name,
        bill_to_address,
        email,
        is_duplicate,
        date_inserted
      `;

      const duplicateRes = await pg.query(`
        SELECT * FROM orders.orders
        WHERE bol ='${bol}'
      `)

      let mostRecentDuplicate;
      let changedColumns = '';

      // Check for duplicate bol #
      if (duplicateRes.rows.length === 0) {
        isDuplicate = false
      } else if (duplicateRes.rows.length > 0) {
        isDuplicate = true
        mostRecentDuplicate = duplicateRes.rows[duplicateRes.rows.length-1]
      }

      let values = `
        '${shipperName}',
        '${shipperAddress}',
        '${consigneeName}',
        '${consigneeAddress}',
        '${scheduledArrivalConsignee}',
        '${consigneeRefNum}',
        '${bol}',
        '${commodity}',
        '${billToName}',
        '${billToAddress}',
        '${sender}',
        '${isDuplicate}',
        '${currentDate}'
      `;

      // Check which columns have changed
      if (mostRecentDuplicate) {
        if (mostRecentDuplicate.shipper_name !== shipperName) changedColumns += 'shipper_name, '
        if (mostRecentDuplicate.shipper_address !== shipperAddress) changedColumns += 'shipper_address, '
        if (mostRecentDuplicate.consignee_name !== consigneeName) changedColumns += 'consignee_name, '
        if (mostRecentDuplicate.consignee_address !== consigneeAddress) changedColumns += 'consignee_address, '
        if (mostRecentDuplicate.scheduled_arrival_consignee !== scheduledArrivalConsignee) changedColumns += 'scheduled_arrival_consignee, '
        if (mostRecentDuplicate.consignee_reference !== consigneeRefNum) changedColumns += 'consignee_reference, '
        if (mostRecentDuplicate.bol !== bol) changedColumns += 'bol, '
        if (mostRecentDuplicate.commodity !== commodity) changedColumns += 'commodity, '
        if (mostRecentDuplicate.bill_to_name !== billToName) changedColumns += 'bill_to_name, '
        if (mostRecentDuplicate.bill_to_address !== billToAddress) changedColumns += 'bill_to_address, '
      }

      // Add changed columns to insert query
      if (changedColumns !== '') {
        changedColumns = changedColumns.slice(0,-2);
        values += `, '${changedColumns}'`
        columns += `, columns_changed`
      }

      insertRecord(columns, values)
    }

    if (text.includes('Ciner')) {

      onError = (err) => console.log(err);

      pdfParser.on("pdfParser_dataReady", pdfData => {
        parsePdf(pdfData)
      });

      function readFile(filename, onError) {
        pdfParser.loadPDF(filename)
      }
      
      readFile('order.pdf', onError );


      // OLD ONE
      // OLD ONE
      // OLD ONE
      // OLD ONE
      // console.log('USE CINER');
      // const textArr = text.split(/\r?\n/);
      // console.dir(textArr, {'maxArrayLength': null});
      // // console.log(textArr);
      // // console.dir(textArr, {'maxArrayLength': null});
  
      // const shipperName = textArr[2]
      // const shipperAddressLine1 = textArr[3]
      // const shipperAddressLine2 = textArr[4]
      // const shipperAddressLine3 = textArr[5]
      // const shipperAddress = `${shipperAddressLine1}, ${shipperAddressLine2}, ${shipperAddressLine3}`;
    
      // // Consignee is ship to
      // const consigneeName = textArr[113]
      // const consigneeAddressLine1 = textArr[114]
      // const consigneeAddressLine2 = textArr[115]
      // const consigneeAddressLine3 = textArr[116]
      // const consigneeAddress = `${consigneeAddressLine1}, ${consigneeAddressLine2}, ${consigneeAddressLine3}`
  
      // const billToName = textArr[112]
      // const billToAddressLine1 = textArr[107]
      // const billToAddressLine2 = textArr[108]
      // const billToAddressLine3 = textArr[109]
      // const billToAddress = `${billToAddressLine1}, ${billToAddressLine2}, ${billToAddressLine3}`
    
      // const consigneeRefNum = textArr[textArr.indexOf('Cust Po #:') + 1];
      // const bol = textArr[textArr.indexOf('Order #:') + 1];
      // const scheduledArrivalConsignee = textArr[69];
      // let isDuplicate;
  
      // let commodityConf = textArr[textArr.indexOf('Carrier:')-2].split(' ')[0].split('')
      // let indexOfCommStart;
      // const currentDate = new Date().toISOString();
  
      // for (let i = 0; i < commodityConf.length; i++) {
      //   if (commodityConf[i] === commodityConf[i].toUpperCase()) {
      //     indexOfCommStart = commodityConf.indexOf(commodityConf[i]);
      //   }
      // }
  
      // let x = commodityConf.join('')
      // let commodity = textArr[textArr.indexOf('Carrier:')-2].split(' ');
      // // Slicing first word of commodity so it doesn't contain extra first part
      // commodity[0] = x.slice(indexOfCommStart, commodityConf.length);
      // commodity = commodity.join(' ');

      // let columns = `shipper_name,
      //   shipper_address,
      //   consignee_name,
      //   consignee_address,
      //   scheduled_arrival_consignee,
      //   consignee_reference,
      //   bol,
      //   commodity,
      //   bill_to_name,
      //   bill_to_address,
      //   email,
      //   is_duplicate,
      //   date_inserted
      // `;
    
      // console.log('SHIPPER')
      // console.log(shipperName)
      // console.log(shipperAddressLine1)
      // console.log(shipperAddressLine2)
      // console.log(shipperAddressLine3)
  
      // console.log('\n')
      // console.log('CONSIGNEE (ship to)')
      // console.log(consigneeName)
      // console.log(consigneeAddressLine1)
      // console.log(consigneeAddressLine2)
      // console.log(consigneeAddressLine3)
    
      // console.log('\n')
      // console.log('BILLING')
      // console.log(billToName)
      // console.log(billToAddressLine1)
      // console.log(billToAddressLine2)
      // console.log(billToAddressLine3)
      
      // console.log('\n')
      // console.log('MISC')
      // console.log(consigneeRefNum)
      // console.log(bol)
          
    //   const duplicateRes = await pg.query(`
    //     SELECT * FROM orders.orders
    //     WHERE bol ='${bol}'
    //   `)

    //   let mostRecentDuplicate;
    //   let changedColumns = '';

    //   if (duplicateRes.rows.length === 0) {
    //     isDuplicate = false
    //   } else if (duplicateRes.rows.length > 0) {
    //     isDuplicate = true
    //     mostRecentDuplicate = duplicateRes.rows[duplicateRes.rows.length-1]
    //   }

    //   let values = `
    //     '${shipperName}',
    //     '${shipperAddress}',
    //     '${consigneeName}',
    //     '${consigneeAddress}',
    //     '${scheduledArrivalConsignee}',
    //     '${consigneeRefNum}',
    //     '${bol}',
    //     '${commodity}',
    //     '${billToName}',
    //     '${billToAddress}',
    //     '${sender}',
    //     '${isDuplicate}',
    //     '${currentDate}'
    //   `;

    // //   // Checking which columns have changed
    //   if (mostRecentDuplicate) {
    //     if (mostRecentDuplicate.shipper_name !== shipperName) changedColumns += 'shipper_name, '
    //     if (mostRecentDuplicate.shipper_address !== shipperAddress) changedColumns += 'shipper_address, '
    //     if (mostRecentDuplicate.consignee_name !== consigneeName) changedColumns += 'consignee_name, '
    //     if (mostRecentDuplicate.consignee_address !== consigneeAddress) changedColumns += 'consignee_address, '
    //     if (mostRecentDuplicate.scheduled_arrival_consignee !== scheduledArrivalConsignee) changedColumns += 'scheduled_arrival_consignee, '
    //     if (mostRecentDuplicate.consignee_reference !== consigneeRefNum) changedColumns += 'consignee_reference, '
    //     if (mostRecentDuplicate.bol !== bol) changedColumns += 'bol, '
    //     if (mostRecentDuplicate.commodity !== commodity) changedColumns += 'commodity, '
    //     if (mostRecentDuplicate.bill_to_name !== billToName) changedColumns += 'bill_to_name, '
    //     if (mostRecentDuplicate.bill_to_address !== billToAddress) changedColumns += 'bill_to_address, '
    //   }

    //   if (changedColumns !== '') {
    //     changedColumns = changedColumns.slice(0,-2);
    //     values += `, '${changedColumns}'`
    //     columns += `, columns_changed`
    //   }

    //   console.log(`
    //   INSERT INTO orders.orders (
    //     ${columns}
    //   )
    //   VALUES (
    //     ${values}
    //   )
    // `);

    //   await pg.query(`
    //     INSERT INTO orders.orders (
    //       ${columns}
    //     )
    //     VALUES (
    //       ${values}
    //     )
    //   `)

    } else if (text.includes('Genesis')) {
      console.log('USE GENESIS');
      const textArr = text.split(/\r?\n/);
      
      // console.dir(textArr, {'maxArrayLength': null});
      
      // Notes: consignee ref #
      
      const consigneeName = textArr[textArr.indexOf('Consignee')+1]
      const consigneeAddressLine1 = textArr[textArr.indexOf('Consignee')+2]
      const consigneeAddressLine2 = textArr[textArr.indexOf('Consignee')+3]
      const consigneeAddressLine3 = textArr[textArr.indexOf('Consignee')+4]
      const consigneeAddress = `${consigneeAddressLine1}, ${consigneeAddressLine2}, ${consigneeAddressLine3}`
      
      let shipperName = textArr[textArr.indexOf('Consignee')+5]
      shipperName = shipperName.slice(4, shipperName.length)
      
      const shipperAddressArr = textArr[textArr.indexOf('Consignee')+6].split(',')
      const shipperAddress1 = shipperAddressArr[0].slice(2, shipperAddressArr[0].length)
      const shipperAddress2 = `${shipperAddressArr[1].trim()}, ${shipperAddressArr[2].trim()}`
      const shipperAddress = `${shipperAddress1}, ${shipperAddress2}`
  
      const billToName = textArr[textArr.indexOf('This shipment is PREPAID, Remit Bill To:')+1].trim();
      const billToAddressLine1 = textArr[textArr.indexOf('This shipment is PREPAID, Remit Bill To:')+2].trim();
      const billToAddressLine2 = textArr[textArr.indexOf('This shipment is PREPAID, Remit Bill To:')+3].trim();
      const billToAddressLine3 = textArr[textArr.indexOf('This shipment is PREPAID, Remit Bill To:')+4].trim();
      const billToAddress = `${billToAddressLine1}, ${billToAddressLine2}, ${billToAddressLine3}`
      
      const product = textArr[4].split(',')[0].trim();
      const bol = text.split('Bill of Lading No.')[1].split(/\r?\n/)[0];
      const orderNumber = text.split('Shipper Order No.')[1].split('Customer')[0].trim()
      const poNum = billToAddressLine2;
      let isDuplicate;
      const currentDate = new Date().toISOString();
    
      console.log('Consignee:')
      console.log(consigneeName)
      console.log(consigneeAddressLine1)
      console.log(consigneeAddressLine2)
      console.log(consigneeAddressLine3)
      console.log('\n')
      console.log('Shipper:')
      console.log(shipperName)
      console.log(shipperAddress1)
      console.log(shipperAddress2)
      console.log('Product: ' + product)
      console.log('Order number: ' + orderNumber)
      console.log('BOL: ' + bol);

      const duplicateRes = await pg.query(`
        SELECT * FROM orders.orders
        WHERE bol = '${bol}'
      `)

      let mostRecentDuplicate;
      let changedColumns = '';
      
      if (duplicateRes.rows.length === 0) {
        isDuplicate = false
      } else if (duplicateRes.rows.length > 0) {
        isDuplicate = true
        mostRecentDuplicate = duplicateRes.rows[duplicateRes.rows.length-1]
      }
      
      let values = `
        '${shipperName}',
        '${shipperAddress}',
        '${consigneeName}',
        '${consigneeAddress}',
        '${bol}',
        '${poNum}',
        '${product}',
        '${billToName}',
        '${billToAddress}',
        '${sender}',
        '${isDuplicate}',
        '${currentDate}'
      `;

      let columns = `
        shipper_name,
        shipper_address,
        consignee_name,
        consignee_address,
        bol,
        po_num,
        product,
        bill_to_name,
        bill_to_address,
        email,
        is_duplicate,
        date_inserted
      `;

      if (duplicateRes.rows.length > 0) {
        // Checking which columns have changed
        if (mostRecentDuplicate.shipper_name !== shipperName) changedColumns += 'shipper_name, '
        if (mostRecentDuplicate.shipper_address !== shipperAddress) changedColumns += 'shipper_address, '
        if (mostRecentDuplicate.consignee_name !== consigneeName) changedColumns += 'consignee_name, '
        if (mostRecentDuplicate.consignee_address !== consigneeAddress) changedColumns += 'consignee_address, '
        if (mostRecentDuplicate.bol !== bol) changedColumns += 'bol, '
        if (mostRecentDuplicate.po_num !== poNum) changedColumns += 'po_num, '
        if (mostRecentDuplicate.product !== product) changedColumns += 'product, '
        if (mostRecentDuplicate.bill_to_name !== billToName) changedColumns += 'bill_to_name, '
        if (mostRecentDuplicate.bill_to_address !== billToAddress) changedColumns += 'bill_to_address, '
  
        if (changedColumns !== '') {
          changedColumns = changedColumns.slice(0,-2);
          values += `, '${changedColumns}'`
          columns += `, columns_changed`
        }
      }

      console.log(`
      INSERT INTO orders.orders (
        ${columns}
      )
      VALUES (
        ${values}
      )`);
      
      await pg.query(`
        INSERT INTO orders.orders (
          ${columns}
        )
        VALUES (
          ${values}
      )`)
    }
  } catch (err) {
    console.log(err);
  }
}

const thermoFisherMap = async emailBody => {
  const shipToAddressLine1 = emailBody.split('Thermo Fisher Location')[1].split(',')[0].trim();
  const shipToAddressLine2 = emailBody.split('Thermo Fisher Location')[1].split(',')[1].split('DELIVERY DATE')[0].trim();
  const shipToAddress = `${shipToAddressLine1}, ${shipToAddressLine2}`

  const emailBodyLines = emailBody.split(/\r?\n/);
  const shipperName = 'Thermo Fisher Scientific';
  const shipperAddressLine1 = emailBodyLines[emailBodyLines.indexOf(shipperName)+2].split('.')[0].trim() + '.';
  const shipperAddressLine2 = emailBodyLines[emailBodyLines.indexOf(shipperName)+2].split('.')[1].trim();
  const shipperAddress = `${shipperAddressLine1}, ${shipperAddressLine2}`

  const consRequestedDeliveryDate = emailBodyLines[emailBodyLines.indexOf('DELIVERY DATE')+2];
  const thermoFisherMaterialNum = emailBodyLines[emailBodyLines.indexOf('THERMO FISHER MATERIAL#')+2];
  const poNum = emailBodyLines[emailBodyLines.indexOf('PO# / Release#')+2];
  const railcarNum = emailBodyLines[emailBodyLines.indexOf('RAILCAR#')+2];
  const lotNum = emailBodyLines[emailBodyLines.indexOf('LOT#')+2];
  let lbs = emailBodyLines[emailBodyLines.indexOf('LBS')+2];
  lbs=lbs.replace(/\,/g,'')
  lbs=Number(lbs)

  try {
    await pg.query(`
      INSERT INTO orders.orders (
        shipper_name,
        shipper_address,
        consignee_address,
        scheduled_arrival_consignee,
        thermo_fisher_material_num,
        railcar_num,
        lot_num,
        pounds,
        po_num
      )
      VALUES (
        '${shipperName}',
        '${shipperAddress}',
        '${shipToAddress}',
        '${consRequestedDeliveryDate}',
        '${thermoFisherMaterialNum}',
        '${railcarNum}',
        '${lotNum}',
        ${lbs},
        '${poNum}'
      )
    `)
    console.log('Inserted order into database');
  } catch (err) {
    console.log(err);
    process.exit(1)
  }
}

const excelMap = async sender => {
  console.log('hit excel function');
  const workSheetsFromFile = xlsx.parse(`${__dirname}\\orders.xls`);

  let pgQuery = `INSERT INTO orders.orders(bol, consignee_name, destination, state, amt_order, f_mi, commodity, delivery_date_time, hauler, trl_num, po_num, email, is_duplicate, date_inserted) VALUES`;
  
  let orderCount = 0;

  const ordersRes = await pg.query(`
    SELECT bol FROM orders.orders
  `);
  const bolArr = ordersRes.rows.map(i => (i.bol));
  // console.log(bolArr);
  const currentDate = new Date().toISOString();


  // for (let i = 0; i < workSheetsFromFile.length; i++) {
  for (let i = 0; i < 3; i++) {
    console.log(i)
    let data = workSheetsFromFile[i].data

    for (let y = 0; y < data.length; y++) {
      let bol;
      let customer;
      let destination;
      let state;
      let amtOrder;
      let fMi;
      let product;
      let deliveryDateTime;
      let hauler;
      let trlNum;
      let poNum;
  
      let bolIndex
      let customerIndex
      let destinationIndex
      let stateIndex
      let amtOrderIndex
      let fMiIndex
      let productIndex
      let deliveryDateTimeIndex
      let haulerIndex
      let trlNumIndex
      let poNumIndex
  
      bolIndex = 1;
      customerIndex = 3;
      destinationIndex = 4;
      stateIndex = 5;
      amtOrderIndex = 6;
      fMiIndex = 7;
      productIndex = 8;
      deliveryDateTimeIndex = 9;
      haulerIndex = 11;
      trlNumIndex = 12;
      poNumIndex = 13;
  
      // if (y > 4 && y < data[y].length) {
      // if (y > 4) {
      if (y > 4 && data[y].length > 0) {
        if (data[y][bolIndex] !== undefined && data[y][bolIndex] !== '') {
          bol = data[y][bolIndex].substring(3);
          customer = data[y][customerIndex];
          destination = data[y][destinationIndex];
          state = data[y][stateIndex];
          amtOrder = data[y][amtOrderIndex];
          fMi = data[y][fMiIndex];
          product = data[y][productIndex];
          deliveryDateTime = data[y][deliveryDateTimeIndex];
          // deliveryTime = data[y][10];
          hauler = data[y][haulerIndex];
          trlNum = data[y][trlNumIndex];
          poNum = data[y][poNumIndex];

          let isDuplicate

          if (bolArr.indexOf(bol) === -1) {
            isDuplicate = false
          } else {
            isDuplicate = true
          }
  
          pgQuery += `(
            '${bol}',
            '${customer}',
            '${destination}',
            '${state}',
            '${amtOrder}',
            '${fMi}',
            '${product}',
            '${deliveryDateTime}',
            '${hauler}',
            '${trlNum}',
            '${poNum}',
            '${sender}',
            '${isDuplicate}',
            '${currentDate}'
          ),`
          orderCount++;
        }
      }
    }
  }
  
  pgQuery = pgQuery.slice(0,-1);
  // console.log(pgQuery)
  try {
    await pg.query(pgQuery)
    console.log(`Successfully ${orderCount} inserted records`)
  } catch (err) {
    console.log(err)
  }
}

module.exports = { excelMap, pdfMap, thermoFisherMap }