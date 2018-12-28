const request = require("request");
const cheerio = require("cheerio");
/* 

    안뇽 마틴
    승인해줘요

*/
// Review: function 말고 Class를 쓰는걸 추천합니다.
class Data {
    constructor(realtime_word, related_words){
        this.realtime_word = realtime_word;
        this.related_words = related_words;
    }
}

function main(){
    get_realtime_words().then(realtime_words => {
        // Review: forEach 안에서 하는게 함수를 부르고 그 결과를 담는 것 뿐이면 map을 쓰는게 보기 더 좋지 않을까요?
        const promises = realtime_words.map(word => get_related_words(word));
        return Promise.all(promises);
    }).then(result => console.log(result));  // Review: 여기서 Promise.all을 하기보다는 return promises에서 처음부터 return promise.all 해서 return 하는 게 보기도 이쁘고 좋겠죠?

}

// Review: 함수 이름도 snake case를 씁시다
function get_realtime_words(){
    // Review: url과 query는 왜 const가 아닌가요?
    const url = "https://www.naver.com";
    const query = "div.ah_roll_area li.ah_item span.ah_k";
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            const realtime_words = [];
            const $ = cheerio.load(body);
            const selectors = $(query);
            selectors.each((index, value) => {
                // Review: == 보다 === 을 씁시다
                if(index === 10){
                    return false;
                }
                let word = $(value).text();
                realtime_words.push(word);
            });
            resolve(realtime_words);
        });
    });
 }

function get_related_words(realtime_word){
    const url = "https://search.naver.com/search.naver?"
            + "where=nexearch&sm=tab_lve.allnow&ie=utf8&query="
            + encodeURI(realtime_word);
    const query = "ul._related_keyword_ul a";
    return new Promise((resolve, reject) =>{
        request(url, (error, response, body) => {
            const related_words = [];
            const $ = cheerio.load(body);
            const selectors = $(query);
            selectors.each(function() {
                let word = $(this).text();
                related_words.push(word);
            });
            resolve(new Data(realtime_word, related_words));
        });
    });
}

main();