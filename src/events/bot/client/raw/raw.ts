import Client from "../../../../structures/Client";

export default (client: Client, raw) => {
   client.lavalink.sendRawData(raw);
}
