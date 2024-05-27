import 'dotenv/config';
import mongoose from 'mongoose';
const username = process.env.MONGODB_ADMINUSERNAME;
const password = process.env.MONGODB_ADMINPASSWORD;
const uri = `mongodb://${username}:${password}@localhost:27017/moody`;
mongoose.set('debug', true); // Enable Mongoose debug mode
mongoose
  .connect(uri, {
    // @ts-expect-error no method to fix at this time
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => console.error(err));

export default mongoose; // Export the mongoose connection object
