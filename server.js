const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Catching Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXPECTION! 🤯 Shutting down....');
  console.log(err.name, err.message);
  process.exit(1); // shut down this application
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

// console.log(app.get('env')); // environment vairable
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port} ....`);
});

// unhandle rejection errors, like cannt link to database
// process.on('unhandledRejection', (err) => {
//   console.log('UNHANDLER REJECTION! 🤯 Shutting down....');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1); // shut down this application
//   });
// });

// console.log(x); // Uncaught Exceptions 最上面！
