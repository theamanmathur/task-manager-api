/*jshint esversion: 6 */
/*jshint esversion: 7 */
/*jshint esversion: 8 */
/* jshint -W097 */
/* jshint -W117 */
'use strict';


require('./db/mongoose');
const express = require('express');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
// const User = require('./models/user');
// const Task = require('./models/task');

const app = express();
const port = process.env.PORT;

//using express middleware
// app.use((req, res, next) => {
//     res.status(503).send("Site is under maintenance.");
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`✔️ ✔️  server is up on port ${port}`);
});

