import {db} from "../db/firestore";
import axios from 'axios';
import {Planet, StarWarsCharacter, Species} from "../interfaces";

function calculateAge(birthYear:string) {
  const battleOfYavinYear = 4;
  const currentYear = new Date().getFullYear();
 
  const numericBirthYear = parseInt(birthYear.replace("BBY", "")) + battleOfYavinYear;
 
  const age = currentYear - numericBirthYear;
 
  return age;
 }

async function getHomeworldDetails(url: string): Promise<Planet> {
  const response = await axios.get(url);
  return response.data;
}

async function getSpeciesDetails(urls: string[]): Promise<string[]> {
  let result:string[] = []
  urls.forEach(async url =>{
    const response = await axios.get(url);
    result.push(response.data.name);
  })
 
  return result;
}

async function findMatchingCharacters(searchName: string): Promise<{ name: string; matchPercentage: number }[]> {
    const charactersCollection = db.collection('characters');
  
    const searchCharacterSnapshot = await charactersCollection.where('name', '==', searchName).get();
  
    if (searchCharacterSnapshot.empty) {
      throw new Error('Character not found.');
    }
  
    const searchCharacter = searchCharacterSnapshot.docs[0].data() as StarWarsCharacter;
  
    const querySnapshot = await charactersCollection.where('name', '!=', searchName).get();
  
    const matchingCharacters: { name: string; homeworld: string; species: string[]; age: number; matchPercentage: number }[] = [];
  
    querySnapshot.forEach(async doc => {
      const characterData = doc.data() as StarWarsCharacter;
      const matchPercentage = calculateMatchPercentage(searchCharacter, characterData);
      // const planetResponse:Planet = await new Promise((resolve, reject) => {
      //   getHomeworldDetails(characterData.homeworld).then(response=>{
      //     resolve(response)
      //   });
      // });
      // console.log(planetResponse.name)
      // const planetName: string = planetResponse.name;

      matchingCharacters.push({
        name: characterData.name,
        homeworld: characterData.homeworld,
        species: characterData.species,
        age: calculateAge(characterData.birth_year),
        matchPercentage: matchPercentage
      });
    });
  
    matchingCharacters.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return matchingCharacters.slice(0, 5);
  }
  
  function calculateMatchPercentage(characterA: StarWarsCharacter, characterB: StarWarsCharacter): number {
    let totalPercentage = 0;
  
    if (characterA.species === characterB.species) {
      totalPercentage += 30;
    }
  
    if(characterA.birth_year != "unknown" && characterB.birth_year != "unknown"){
      const ageDifference = calculateAge(characterA.birth_year) - calculateAge(characterB.birth_year);
      if(ageDifference<100){
        totalPercentage += 5;
      }
    }
  
    if (characterA.homeworld === characterB.homeworld) {
      totalPercentage += 5;
    }
  
    if (characterA.eye_color === characterB.eye_color) {
      totalPercentage += 20;
    }
  
    const heightDifference = Math.abs(Number(characterA.height) - Number(characterB.height));
    if(heightDifference<100){
      totalPercentage += 17;
    }
  
    const massDifference = Math.abs(Number(characterA.mass) - Number(characterB.mass));
    if(massDifference<100){
      totalPercentage += 23;
    }
  
    return totalPercentage;
  }

export default findMatchingCharacters;