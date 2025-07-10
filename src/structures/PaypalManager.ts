import fetch from 'node-fetch';
export type PaypalMode = 'live' | 'sandbox';

const sandboxURL = `https://api-m.sandbox.paypal.com/v1`;
const liveURL = `https://api-m.paypal.com/v1`;

interface PaypalConfig {
   mode: PaypalMode;
   user: string;
   secret: string;
}

interface ProductData {
   id: string;
   name: string;
   description: string;
   type: string;
   category: string;
   image_url: string;
   home_url: string;
   create_time: string;
   update_time: string;
   links: [
      {
         href: string;
         rel: string;
         method: string;
      },
      {
         href: string;
         rel: string;
         method: string;
      },
   ];
}

export default class {
   config: PaypalConfig;
   baseUrl: string;
   paypalConfig: { user: string; secret: string };
   auth: string;
   constructor(
      paypalConfig: PaypalConfig = {
         user: process.env.PAYPAL_CLIENT,
         secret: process.env.PAYPAL_SECRET,
         mode: process.env.PAYPAL_MODE,
      },
   ) {
      this.config = paypalConfig;
      this.paypalConfig = {
         user: paypalConfig.user,
         secret: paypalConfig.secret,
      };
      this.baseUrl = this.config.mode == 'live' ? liveURL : sandboxURL;
      this.auth = Buffer.from(paypalConfig.user + ':' + paypalConfig.secret).toString('base64');
   }

   createProduct = (productData):Promise<ProductData> => {
      return new Promise((resolve, reject) => {
         fetch(`${this.baseUrl}/catalogs/products`, {
            method: 'POST',
            auth: this.auth,
            body: JSON.stringify(productData),
            json: true,
            headers: {
               Authorization: 'Basic ' + this.auth,
               'Content-Type': 'application/json',
            },
         })
            .then((response) => response.json())
            .then((data) => {
               resolve(data);
            })
            .catch((err) => reject(err));
      });
   };

   createBillingPlan = (planData) => {
      return new Promise((resolve, reject) => {
         fetch(`${this.baseUrl}/billing/plans`, {
            method: 'POST',
            auth: this.auth,
            body: JSON.stringify(planData),
            json: true,
            headers: {
               Authorization: 'Basic ' + this.auth,
               'Content-Type': 'application/json',
            },
         })
            .then((response) => response.json())
            .then((data) => {
               resolve(data);
            })
            .catch((err) => reject(err));
      });
   };
}
