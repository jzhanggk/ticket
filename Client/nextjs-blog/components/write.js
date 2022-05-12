const config = require('../config.json');
const fs = require("fs");
config['my_private_key'] = 123
console.log(config['my_private_key'] )
fs.writeFile('./test.json', JSON.stringify(config), (err) => {
    if (err) console.log('Error writing file:', err);
})