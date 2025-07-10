import Client from '../Client';

import {
   PermissionFlagsBits,
   PermissionsBitField,
   Channel,
   GuildMember,
   GuildChannel,
   Collection,
   Role,
   PermissionOverwrites,
} from 'discord.js';
('discord.js');
export default class PermissionUtils {
   client: Client;
   constructor(client) {
      this.client = client;
   }

   // PERMISSIONS
   getChannelOverwrites(me: GuildMember | null, channel: GuildChannel, providedRoles: Collection<string, Role>) {
      if (!me) return [];
      const roles = providedRoles ?? me.roles.cache;
      const roleOverwrites: PermissionOverwrites[] = [];
      let memberOverwrites: PermissionOverwrites | undefined;
      let everyoneOverwrites: PermissionOverwrites | undefined;
      const overWrites = [...(channel.permissionOverwrites?.cache?.values?.() || [])];
      if (overWrites.length) {
         for (const overwrite of overWrites) {
            if (overwrite.id === channel.guild?.id) {
               everyoneOverwrites = overwrite;
            } else if (roles.has(overwrite.id)) {
               roleOverwrites.push(overwrite);
            } else if (overwrite.id === me.id) {
               memberOverwrites = overwrite;
            }
         }
      }
      return {
         everyone: everyoneOverwrites,
         roles: roleOverwrites,
         member: memberOverwrites,
      };
   }

   /**
    * if == true | allowed   ---   if === false | denied
    * @param {import("discord.js").Channel} channel
    * @param  {...any} perms
    * @returns {boolean}
    */
   checkPermOverwrites(channel: Channel, ...perms) {
      const permissions = this.returnOverwrites(channel);
      if (typeof permissions === 'boolean') return permissions;
      // if his permission is denied
      return permissions.has(perms);
   }

   /**
    * @param {import("discord.js").Channel} channel
    * @returns {import("discord.js").PermissionsBitField} permissions
    */
   returnOverwrites(channel): PermissionsBitField | boolean {
      const { me } = channel.guild?.members || ({} as GuildMember);
      if (me!.permissions?.has(PermissionFlagsBits.Administrator)) return true;

      const roles = me!.roles.cache;

      let permissions = new PermissionsBitField(roles?.map((role) => role.permissions));
      const overwrites = channel?.overwritesFor?.(me, true, roles) || this.getChannelOverwrites(me, channel, roles);

      if (overwrites.everyone?.deny) permissions = permissions.remove(overwrites.everyone?.deny);
      if (overwrites.everyone?.allow) permissions = permissions.add(overwrites.everyone?.allow);
      if (overwrites.roles.length > 0) permissions = permissions.remove(overwrites.roles.map((role) => role.deny));
      if (overwrites.roles.length > 0) permissions = permissions.add(overwrites.roles.map((role) => role.allow));
      if (overwrites.member?.deny) permissions = permissions.remove(overwrites.member?.deny);
      if (overwrites.member?.allow) permissions = permissions.add(overwrites.member?.allow);
      return permissions;
   }

   /**
    * @param {import("discord.js").Channel} channel
    * @param {bigint[]} PermissionFlagsBitsProvided
    * @returns {boolean} permissions
    */
   checkPerms(channel, ...PermissionFlagsBitsProvided): boolean {
      if (channel?.guild?.members?.me?.permissions?.has(PermissionFlagsBits.Administrator)) return true;
      if (channel?.guild?.members?.me) return this.checkPermOverwrites(channel, [...PermissionFlagsBitsProvided.flat()]);
      return channel?.permissionsFor?.(this.client.user!.id)?.has?.([...PermissionFlagsBitsProvided.flat()]);
   }
   /**
    * if == true | allowed   ---   if === false | denied
    * @param {import("discord.js").Channel} channel
    * @param  {...any} perms
    * @returns {string[]}
    */
   missingPermOverwrites(channel, ...perms) {
      const permissions = this.returnOverwrites(channel);
      if (typeof permissions === 'boolean') return [];
      return permissions.missing(perms);
   }
   /**
    * @param {import("discord.js").Channel} channel
    * @param {bigint[]} PermissionFlagsBitsProvided
    * @returns {import("discord.js").PermissionsBitField} permissions
    */
   getMissingPerms(channel, ...PermissionFlagsBitsProvided) {
      if (channel?.guild?.members?.me?.permissions?.has(PermissionFlagsBits.Administrator)) return [];
      if (channel?.guild?.members?.me) return this.missingPermOverwrites(channel, [...PermissionFlagsBitsProvided.flat()]);
      return channel?.permissionsFor?.(this.client.user!.id)?.missing?.([...PermissionFlagsBitsProvided.flat()]);
   }
}
