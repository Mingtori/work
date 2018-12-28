const request = require("request-promise-native");
const cheerio = require("cheerio");

class Data{
    constructor(realtime_word, related_words) {
        this.realtime_word = realtime_word;
        this.related_words = related_words;
    }
}

async function main(){
    const realtime_words = await getRealtimeWords();
    const promises = realtime_words.map(word => getRelatedWords(word));
    const datas = await Promise.all(promises);

    console.log(datas);
}

async function getRealtimeWords(){
    const url = "https://www.naver.com";
    const query = "div.ah_roll_area li.ah_item span.ah_k";

    const body = await request(url);
    const $ = cheerio.load(body);
    const selectors = $(query);
    const realtime_words = [];

    selectors.each((index, value) => {
        if(index === 10){
            return false;
        }
        let word = $(value).text();
        realtime_words.push(word);
    });

    return realtime_words;   
}

async function getRelatedWords(realtime_word){
    let url = "https://search.naver.com/search.naver?"
    + "where=nexearch&sm=tab_lve.allnow&ie=utf8&query="
    + encodeURI(realtime_word);
    let query = "ul._related_keyword_ul a";

    const body = await request(url);
    const related_words = [];
    const $ = cheerio.load(body);
    const selectors = $(query);

    selectors.each((index, value) => {
        let word = $(value).text();
        related_words.push(word);
    });
    
    return new Data(realtime_word, related_words);
}


main();