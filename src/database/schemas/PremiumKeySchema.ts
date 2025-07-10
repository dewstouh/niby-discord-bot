import { Schema, model } from 'mongoose';

const schema = new Schema({
   key: { type: String, required: true, unique: true },
   expiration: { type: Number, required: true},
   type: { type: String, default: "user" }
});

export default model('premium-keys', schema);
