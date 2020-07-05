/*jshint esversion: 6 */
/*jshint esversion: 7 */
/*jshint esversion: 8 */
/* jshint -W097 */
/* jshint -W117 */
'use strict';

const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./user');
const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

// new Task({description:'     Qaunt   '}).save().then(()=>{
//     console.log(this);
// }).catch((error)=>{
//     console.log(error);
// });

// const updateAgeAndCount = async (id, age) => {
//     await User.findByIdAndUpdate(id, {
//         age
//     }, {
//         useFindAndModify: false
//     });
//     const count = await User.countDocuments({
//         age
//     });
//     return count;
// };

// updateAgeAndCount("5eedee3bc657dd60d4210622", 23).then((count) => {
//     console.log(count);
// }).catch(e => console.log(e));


// const deleteTaskAndCount = async id => {
//     await Task.findByIdAndDelete(id);
//     return await Task.countDocuments({
//         completed: false
//     });
// };
// deleteTaskAndCount("5ef09a9170002a5ba03863a4").then(count => {
//     console.log(count);
// }).catch(e => console.log(e));


module.exports = Task;