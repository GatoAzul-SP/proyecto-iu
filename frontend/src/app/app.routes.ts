import { Routes } from "@angular/router";
import { Home } from "./home/home";
import { Login } from "./login/login";
import { Checkout } from "./checkout/checkout";
import { Payment } from "./payment/payment";
import { Factura } from "./factura/factura";
import { Profile } from "./profile/profile";
import { Lista } from "./lista/lista";

export const routes: Routes = [
	{ path: "",
	  component: Home },
	{ path: "login",
	  component: Login },
	{ path: "checkout",
	  component: Checkout },
	{ path: "payment",
	  component: Payment },
	{ path: "factura",
	  component: Factura },
	{ path: "profile",
	  component: Profile },
	{ path: "lista",
	  component: Lista }
];
