import {ActivityType} from 'discord.js';
export default [
   {
      text: process.env.WEB_DOMAIN,
      type: ActivityType.Custom
   },
   {
      text: "Shard #{shard} | Cluster #{cluster}",
      type: ActivityType.Custom
   },
]
