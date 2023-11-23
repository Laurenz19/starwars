import axios from 'axios';
import { Request, Response, Router } from 'express';
import {db} from "../db/firestore";
import  findMatchingCharacters from '../services/matchingCharacters';
import {StarWarsCharacter} from "../interfaces";

const router = Router();

async function fetchAllData(url:string) {
  let allData:StarWarsCharacter[] = [];
  let nextPageUrl:string = url;
 
  while (nextPageUrl) {
    const response = await axios.get(nextPageUrl);
    allData = allData.concat(response.data.results);
    nextPageUrl = response.data.next;
  }
 
  return allData;
 }
 

router.get('/characters', async (req: Request, res: Response) => {
  try{
    const characterRef = db.collection("characters");
    const response = await characterRef.get();
    let characters:StarWarsCharacter[] = [];
    response.forEach(doc=>{
      characters.push(doc.data() as StarWarsCharacter);
    })
    res.send(characters);
  }catch(error){
    res.send(error);
  }
});

router.get('/characters/:name', async (req: Request, res: Response) => {
  try{
    const searchName: string = req.params.name;

    if (!searchName) {
      console.error('Veuillez fournir un nom de personnage à rechercher.');
    } else {
      const response = await findMatchingCharacters(searchName)
      res.send(response)
    }
  }catch(error){
    res.send(error);
  }
});

router.post('/create/characters', async (req: Request, res: Response) => {
  const api:string = `${process.env.SWAPI_URL}/people`;
 
   try {
     fetchAllData(api).then(allData => {
      console.log(allData);
     }).catch(error => {
      console.error(error);
     });
     const characters:StarWarsCharacter[] = await fetchAllData(api);
     const characterRef = db.collection("characters");

    characters.forEach(async (character: StarWarsCharacter) => {
      await characterRef.add(character)
        .then((docRef) => {
          console.log("Character added with ID: ", docRef.id);
        })
        .catch((error) => {
          console.error("Error adding currency: ", error);
        });
    });
 
     res.send(characters);
   } catch (error) {
     res.send(error);
   }
 });


export default router;