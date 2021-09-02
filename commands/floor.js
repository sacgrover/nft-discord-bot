const Discord = require('discord.js');
const axios = require('axios')
const jsdom = require('jsdom')
const CacheService = require('../cache')
const fetch = require('node-fetch');
const { JSDOM } = jsdom;

const ttl = 60; //cache for 60 seconds;
const cache = new CacheService(ttl);

const sleep = async (delay) => await new Promise(r => setTimeout(r, delay))

const openseaUrl = `https://opensea.io/assets/${process.env.OPEN_SEA_COLLECTION_NAME}?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW`

// wait before downloading a page from OpenSea - so that we don't get rate limited
const getOS = async url => {
  const OS_INTERVAL = 500
  await sleep(OS_INTERVAL)
  const res = await axios.get(url)
  return res.data
}

const fetchFloor = async () => {
  let price = '';
 let url = `https://api.opensea.io/api/v1/collections?asset_owner=0xeF311E803235a5993C12341fAD2e8a5650Dc9c71&offset=0&limit=300`;
	let url1= 'https://opensea.io/collection/djenerates-clubbing-edition'
    let settings = { 
      method: "GET",
      headers: {
        "X-API-KEY": process.env.OPEN_SEA_API_KEY
      }
    };
    
    const response = await fetch(url, settings);
	if (response.ok) { 
		let json = await response.json();
		price = json[0].stats.floor_price;
		
	} else {
		throw new Error(`Couldn't retrieve floor`);
	}
	

  return {price, url1}
}

module.exports = {
	name: "floor",
	execute(message) {
    cache.get("FloorPrice", fetchFloor)
      .then((data) => {
        const embedMsg = new Discord.MessageEmbed()
          .setTitle(`The current floor price is ${data.price}Ξ`)
          .setURL(data.url)

          message.channel.send(embedMsg);
      })
      .catch(error => message.channel.send(error.message));
	},
};
