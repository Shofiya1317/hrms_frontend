// src/types/country-state-city.d.ts
declare module 'country-state-city' {
  export interface ICountry {
    id: number;
    name: string;
    isoCode: string;
    phonecode: string;
    currency: string;
    flag: string;
  }

  export interface IState {
    id: number;
    name: string;
    isoCode: string;
    countryCode: string;
    latitude?: string;
    longitude?: string;
  }

  export interface ICity {
    id: number;
    name: string;
    countryCode: string;
    stateCode: string;
    latitude?: string;
    longitude?: string;
  }

  export class Country {
    static getAllCountries(): ICountry[];
  }

  export class State {
    static getStatesOfCountry(countryCode: string): IState[];
  }

  export class City {
    static getCitiesOfState(countryCode: string, stateCode: string): ICity[];
  }
}