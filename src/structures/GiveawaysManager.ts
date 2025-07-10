import { GiveawaysManager } from 'discord-giveaways';
import giveawaySchema from '../database/schemas/GiveawaySchema';
import { ColorResolvable } from 'discord.js';
import Client from './Client';
export default class extends GiveawaysManager{
        constructor(client:Client, options = {
            default: {
                botsCanWin: false,
                embedColor: process.env.DEFAULT_COLOR as ColorResolvable,
                embedColorEnd: process.env.ERROR_COLOR as ColorResolvable,
                reaction: client.allemojis.giveaway
            }
        }) {
            super(client, options);
        }
        // This function is called when the manager needs to get all giveaways which are stored in the database.
        async getAllGiveaways() {
            // Get all giveaways from the database. We fetch all documents by passing an empty condition.
            return await giveawaySchema.find().lean().exec();
        }
    
        // This function is called when a giveaway needs to be saved in the database.
        async saveGiveaway(messageId, giveawayData) {
            // Add the new giveaway to the database
            await giveawaySchema.create(giveawayData);
            // Don't forget to return something!
            return true;
        }
    
        // This function is called when a giveaway needs to be edited in the database.
        async editGiveaway(messageId, giveawayData) {
            // Find by messageId and update it
            await giveawaySchema.updateOne({ messageId }, giveawayData).exec();
            // Don't forget to return something!
            return true;
        }
    
        // This function is called when a giveaway needs to be deleted from the database.
        async deleteGiveaway(messageId) {
            // Find by messageId and delete it
            await giveawaySchema.deleteOne({ messageId }).exec();
            // Don't forget to return something!
            return true;
        }
}