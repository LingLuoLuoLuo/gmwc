import { MGSClient } from './gs';
import { MCClient } from './coin';
import { sleep } from '../../utils/sleep';

export type MClientOptions = string | Partial<{ cookie: string; stoken: string; ua: string }>;

export class MClient {
  protected gsClient: MGSClient;
  protected coinClient?: MCClient;

  constructor(options: MClientOptions) {
    let { cookie, stoken, ua } =
      typeof options === 'string' ? { cookie: options, stoken: undefined, ua: undefined } : options;
    if (!cookie) throw new Error('cookie is required');
    if (ua) {
      const bbsUaReg = /miHoYoBBS\/[\d.]+$/;
      if (bbsUaReg.test(ua)) ua = ua.replace(bbsUaReg, 'miHoYoBBS/2.34.1');
      else ua = ua.replace(/ *$/, ' miHoYoBBS/2.34.1');
    }
    this.gsClient = new MGSClient(cookie, ua);
    if (stoken) this.coinClient = new MCClient(cookie, stoken, ua);
  }

  async gsSignIn() {
    const roles = await this.gsClient.getRoles();
    for (const role of roles) {
      await this.gsClient.signIn(role);
      await sleep(3000);
    }
  }

  async earnCoin() {
    if (!this.coinClient) return;
    await this.coinClient.doTasks();
  }
}
