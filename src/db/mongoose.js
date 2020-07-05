/*jshint esversion: 6 */
/*jshint esversion: 7 */
/*jshint esversion: 8 */
/* jshint -W097 */
/* jshint -W117 */
'use strict';

const mongoose = require('mongoose');


const connectionURL = process.env.MONGODB_URL;

mongoose.connect(connectionURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});


/** Create a mongodb connection by
 * killing the previous mongodb process (maybe by killing any one showing on the task manager)
 * and then running the following command on the command line 
 * mongod --dbpath="C:\mongodb-data"
 * note: make sure that the "path" environment variable contains the path to mongod.exe i.e. the BIN directory of mongodb installation.
 */