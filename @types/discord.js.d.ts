export {};

declare module 'discord.js' {
  interface EmbedBuilder {
    addField(name: string, value: string, inline?: boolean): EmbedBuilder;
  }
}
