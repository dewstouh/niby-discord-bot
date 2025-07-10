import { NibyBinAPI } from '@dewstouh/nibybin-api';
import Client from '../structures/Client';
import GeneralUtils from '../structures/utils/General';
import LocaleUtils from './utils/LocaleUtils';
import PermissionUtils from './utils/Permissions';
import MessageUtils from './utils/Message';
import EconomyUtils from './utils/Economy';
import MusicUtils from './utils/Music';

export default class ClientUtils {
   perms: PermissionUtils;
   general: GeneralUtils;
   message: MessageUtils;
   locale: typeof LocaleUtils;
   client: Client;
   nibybin: NibyBinAPI;
   economy: EconomyUtils;
   music: MusicUtils;
   constructor(client: Client) {
      this.client = client;

      this.locale = LocaleUtils;
      this.general = new GeneralUtils(this.client);
      this.message = new MessageUtils(this.client);
      this.perms = new PermissionUtils(this.client);
      this.economy = new EconomyUtils(this.client);
      this.music = new MusicUtils(this.client);
      this.nibybin = new NibyBinAPI(process.env.NIBYBIN_TOKEN);
   }
}
