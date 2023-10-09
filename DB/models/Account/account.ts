import { Schema, model } from 'mongoose';
import { IAccount } from '../../Builders/Interfaces/IAccount';

const accountschema = new Schema<IAccount>({
login: String,
password: String,
authorization: String
});


module.exports = model<IAccount>("account", accountschema)
