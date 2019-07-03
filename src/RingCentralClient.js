import RingCentral from 'ringcentral';

class RingCentralClient {
  constructor(sdk) {
    this._sdk = sdk;
    this._platform = sdk.platform();
  }

  async checkLogin() {
    const result = await this._platform.loggedIn();
    return result;
  }

  async gotologinPage() {
    const loginUrl = this._platform.loginUrl();
    window.location.assign(loginUrl);
  }

  async loginFromCodeQuery() {
    const loginOptions = this._platform.parseLoginRedirect(window.location.search);
    if (loginOptions.code) {
      await this._platform.login(loginOptions);
      return true;
    }
    return false;
  }

  async logout() {
    this._sdk.platform().logout();
  }

  async createSubscription(filters = []) {
    const cacheKey = 'subscribeKey';
    const subscription = this._sdk.createSubscription();
    const cachedSubscriptionData = this._sdk.cache().getItem(cacheKey);
    if (cachedSubscriptionData) {
      try {
        subscription.setSubscription(cachedSubscriptionData); 
      } catch (e) {
        console.error('Cannot set subscription data', e);
      }
    } else {
      subscription.setEventFilters(filters);
    }
    this._subscription = subscription;
    subscription.on([subscription.events.subscribeSuccess, subscription.events.renewSuccess], () => {
      this._sdk.cache().setItem(cacheKey, subscription.subscription());
    });
    try {
      await subscription.register();
    } catch (e) {
      console.error('Cannot register subscription', e);
    }
    return subscription;
  }

  async loadPresences() {
    const response = await this._platform.get('/account/~/presence?detailedTelephonyState=true');
    const data = response.json();
    return data.records;
  }

  async superviseCall(call, extensionNumber) {
    const devicesResponse = await this._platform.get('/account/~/extension/~/device');
    const devices = devicesResponse.json().records;
    const device = devices.filter(d => d.status === 'Online' && d.computerName === 'LMXMN141')[0];
    if (!device) {
      return;
    }
    await this._platform.post(`/account/~/telephony/sessions/${call.telephonySessionId}/supervise`, {
      mode: 'Listen',
      extensionNumber,
      deviceId: device.id
    });
  }

  async endCall(call) {
    await this._platform.delete(`/account/~/telephony/sessions/${call.telephonySessionId}`);
  }

  get subscription() {
    return this._subscription;
  }

  get platform() {
    return this._platform;
  }

  get ownerId() {
    return this._platform.auth().data().owner_id;
  }
}

export default RingCentralClient;
