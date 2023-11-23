import axios from 'axios';
import { Request, Response, Router } from 'express';
import {db} from "../db/firestore";
import {Currency} from "../interfaces";

const router = Router();

router.post('/create/currencies', async (req: Request, res: Response) => {
 const options = {
    method: 'GET',
    url: process.env.CURRENCIES_API,
    headers: {
      'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
      'X-RapidAPI-Host': process.env.X_RAPID_API_HOST
    }
  };

  try {
    const response = await axios.request(options);
    const currencies = response.data.results;
    const currencyRef = db.collection("currencies");

    currencies.forEach(async (currency: Currency) => {
      await currencyRef.add(currency)
        .then((docRef) => {
          console.log("Currency added with ID: ", docRef.id);
        })
        .catch((error) => {
          console.error("Error adding currency: ", error);
        });
    });

    res.send(currencies);
  } catch (error) {
    res.send(error);
  }
});

export default router;