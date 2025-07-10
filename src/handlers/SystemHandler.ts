import Client from '../structures/Client';

export function ExecuteSystems(client:Client, eventName, guildData, userData, ...params) {
    const systems = client.systems.filter(s => s.EVENT === eventName);
    if(systems.size >= 1){
        systems.map((s) => {
            try {
                return s.execute(client, guildData, userData, ...params);
            } catch(e){
                console.error(`Ha ocurrido un error al ejecutar el sistema ${s.NAME}`, e)
            }
        })
    }
}
