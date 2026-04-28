import { Routes } from "@angular/router";
import { Home } from "./home/home";
import { Login } from "./login/login";
import { Checkout } from "./checkout/checkout";
import { Payment } from "./payment/payment";
import { Factura } from "./factura/factura";
import { Profile } from "./profile/profile";
import { Lista } from "./lista/lista";
import { delayGuard } from "./loader/delay.guard";

export const routes: Routes = [
	{ path: "",
	  component: Home, canActivate: [delayGuard] },
	{ path: "login",
	  component: Login, canActivate: [delayGuard] },
	{ path: "checkout",
	  component: Checkout, canActivate: [delayGuard] },
	{ path: "payment",
	  component: Payment, canActivate: [delayGuard] },
	{ path: "factura",
	  component: Factura, canActivate: [delayGuard] },
	{ path: "profile",
	  component: Profile, canActivate: [delayGuard] },
	{ path: "lista",
	  component: Lista, canActivate: [delayGuard] }
];
