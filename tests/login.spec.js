import { test, expect} from '@playwright/test';
const { default: loginSauceAction } = require('../tests/pmo/Object/loginSauceAction');



test('login pakai pmo', async ({ page }) => {
  const objLogin = new loginSauceAction(page);
  await objLogin.goto();
  await objLogin.loginSauce();
  await objLogin.addToCartSauce();
  await objLogin.checkoutSauce();
  await objLogin.fillCheckoutForm();
  await objLogin.finishCheckout();
  await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');

});
