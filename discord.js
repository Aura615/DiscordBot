const Discord = require('discord.js');
const { token } = require('./token.json');
const client = new Discord.Client();
const fs = require('fs');
const {languageUnderStanding} = require("./LUISService.js");
const voteEmoji = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
let voteid = 0;
let choice_num = 0;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('music | 輸入"功能介紹"會顯示所有指令', { type: 'LISTENING' });
});

client.on('message', msg => {
    if (msg.content === '功能介紹') {
        msg.channel.send('輸入 小貝貝(自我介紹)\n'
                        +'想要開啟投票時\n輸入 投票 XXXX\n輸入 選項1 XXXX\n輸入 選項2 XXXX(選項最多可以到10)\n輸入 開始投票\n輸入 結束投票\n'
                        +'輸入 Hey小貝貝 任何你想說的話(會用LUIS做語意判斷)');
    }

    if (msg.content === '小貝貝') {
        msg.channel.send('故事叫作醜八怪小貝貝\n'
                        +'從前有個醜八怪小貝貝\n'
                        +'他好醜喔\n'
                        +'醜到大家都死光光了');
        msg.reply('說完了:laughing:');
    }

    if(msg.content.startsWith('投票')) {
        let str = msg.content.replace('投票', '').trim();
        fs.writeFile('data/question.txt', str , function (err) {
            if (err){
                console.log(err);
            }
            else{
                console.log('投票新增成功');
                msg.reply('投票新增成功');
            }
        });
    }

    if(msg.content.startsWith('選項')) {
        let str = msg.content.replace('選項', '').trim();
        let vote_content = str.split(/\s/);
        let vote_num = vote_content[0];
        fs.writeFile('data/choice_' + vote_num + '.txt', vote_content.slice(1).toString() , function (err) {
            if (err){
                console.log(err);
            }
            else{
                console.log('選項' + vote_num + '新增成功');
                msg.reply('選項' + vote_num + '新增成功');
                choice_num++;
                console.log('目前有'+ choice_num + '選項')
            }
        });
    }

    if(msg.content === '開始投票') {
        let question = fs.readFileSync('data/question.txt',{encoding:'utf8', flag:'r'});
        console.log(question);
        let choice = '';
        for(let i = 1; i <= choice_num; i++){
            choice = choice + i + '. ' + fs.readFileSync('data/choice_' + i + '.txt',{encoding:'utf8', flag:'r'}) + '\n';
        }
        console.log(choice);
        (async () => {
            const sentMessage = await msg.channel.send(question + '\n' + choice);
            voteid = sentMessage.id;
            for(let i = 1; i <= choice_num; i++){
                fs.writeFile('data/' + voteid + '_' + i + '.txt', '0' , function (err) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        console.log('創建投票成功');
                    }
                });
                sentMessage.react(voteEmoji[i]);
            }
        })();
        /*msg.channel.send(question + '\n' + choice).then(function(sent) {
            for(let i = 1; i <= choice_num; i++){
                fs.writeFile('data/' + sent.id + '_' + i + '.txt', '0' , function (err) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        console.log('創建選項成功');
                    }
                });
            }
            voteid = sent.id;
        });
        await sentMessage.react("👍");*/
    }

    if(msg.content === '結束投票') {
        let result = '';
        for(let i = 1; i <= choice_num; i++){
            let data = fs.readFileSync('data/' + voteid + '_' + i + '.txt');
            result = result + i + '. ' + (parseInt(data)-1) + '\n';
            console.log(i + '. ' + (parseInt(data)-1));
            fs.unlink('data/' + voteid + '_' + i + '.txt', function () {
                console.log('已經刪除檔案');
            });
            fs.unlink('data/choice_' + i + '.txt', function () {
                console.log('已經刪除檔案');
            });
        }
        fs.unlink('data/question.txt', function () {
            console.log('已經刪除檔案');
        });
        msg.channel.send(result);
        voteid = 0;
        choice_num = 0;
    }

    if(msg.content.startsWith('Hey小貝貝')) {
        let str = msg.content.replace('Hey小貝貝', '').trim();
        (async() => {
            const LUISPrediction = await languageUnderStanding(str);
            const topIntent = LUISPrediction.prediction.topIntent;
            switch(topIntent) {
                case '開啟投票':
                    msg.reply('沒問題，請輸入問題和選項，輸入方式如下:\n投票 XXXX\n選項1 XXXX\n選項2 XXXX\n......\n開始投票');
                    break;
                case '吃飯':
                    let x1 = Math.floor(Math.random() * 5)+1;
                    console.log('吃飯');
                    switch (x1) {
                        case 1 :
                            msg.channel.send('你先別懶了\n'
                                            +'開門出去便利商店\n'
                                            +'買個我愛吃的草莓吐司就好');
                            break;
                        case 2 :
                            msg.channel.send('麥當勞啦!!!!\n'
                                            +'垃圾食物好吃');
                            break;
                        case 3 :
                            var num = Math.floor(Math.random() * 20)+1
                            msg.channel.send('打開foodpanda\n'
                                            +'選擇美食外送\n'
                                            +'往下滑 從所有餐廳裡面\n'
                                            +'由上往下選第' + num + '家店 直接選上人氣精選了啦');
                            break;
                        case 4 :
                            msg.channel.send('不覺得鹹酥雞是個好選擇嗎?');
                            msg.channel.send('什麼??太油??\n'
                                            +'有差嗎?反正都這麼胖了❤');
                            break;
                        default:
                            msg.channel.send('去星巴克買個咖啡加甜點');
                            msg.channel.send('記得多買個吉胃福適錠');
                    }
                    break;
                case '無聊建議':
                    console.log('無聊建議');
                    let x2 = Math.floor(Math.random() * 5)+1;
                    switch (x2) {
                        case 1 :
                            msg.channel.send('無聊喔');
                            msg.channel.send('點下面網址保證有聊\n'
                                            +'https://youtu.be/dQw4w9WgXcQ');
                            break;
                        case 2 :
                            msg.channel.send('你跟我說這個有用嗎?\n'
                                            +'你以為我可以陪你聊天?\n'
                                            +'我又不是妹子');
                            msg.channel.send('看你可憐給你私藏的好貨\n'
                                            +'1727682');
                            break;
                        case 3 :
                            msg.channel.send('我無聊的時候都在看別人做菜\n'
                                            +'看一看我就變大廚了');
                            msg.channel.send('你要不要也試試看');
                            break;
                        case 4 :
                            msg.channel.send('484很久沒有靜下來看天空了\n'
                                            +'趁你無聊沒事做\n'
                                            +'看看天空享受一下生活');
                            break;
                        default:
                            msg.channel.send('還沒晚上7.\n'
                                            +'你等晚上7.貝克開台');
                            msg.channel.send('網址也給你\n'
                                            +'https://www.twitch.tv/slrabbit99');
                    }
                    break;
                case '笑話':
                    console.log('笑話');
                    let x3 = Math.floor(Math.random() * 5)+1;
                    switch (x3) {
                        case 1 :
                            msg.channel.send('先進船的人會先說什麼?');
                            msg.channel.send('會說online');
                            msg.channel.send('因為仙境傳說online');
                            break;
                        case 2 :
                            msg.channel.send('軟糖難過的時候會變成甚麼樣子?');
                            msg.channel.send('QQ軟糖');
                            break;
                        case 3 :
                            msg.channel.send('有一天小明打電話給電話客服');
                            msg.channel.send('客服：很高興為您服務');
                            msg.channel.send('小明：你高興的太早了');
                            msg.channel.send('於是小明就把電話掛掉了');
                            break;
                        case 4 :
                            msg.channel.send('衛生紙是白色的');
                            msg.channel.send('那用過的衛生紙是什麼顏色?');
                            msg.channel.send('垃圾');
                            break;
                        default:
                            msg.channel.send('你知道清廷為甚麼會滅亡嗎?');
                            msg.channel.send('被青蛙吃掉');
                    }
                    break;
                case '遊戲推薦':
                    console.log('遊戲推薦');
                    let x4 = Math.floor(Math.random() * 10)+1;
                    switch (x4) {
                        case 1 :
                            msg.channel.send('吃雞沒人在玩了\n'
                                            +'所以打把Apex吧');
                            break;
                        case 2 :
                            msg.channel.send('我知道沒人在玩\n'
                                            +'但是小貝貝我要推薦\n'
                                            +'Rust好玩 內容豐富有趣 刺激又好玩');
                            break;
                        case 3 :
                            msg.channel.send('大大大優惠');
                            msg.channel.send('貓咪大戰爭6周年');
                            msg.channel.send('大 大 大 大優惠');
                            msg.channel.send('有好東西給妳喔');
                            msg.channel.send('貓咪大戰爭~~~');
                            break;
                        case 4 :
                            msg.channel.send('好玩遊戲每天玩');
                            msg.channel.send('我不知道你在想什麼');
                            msg.channel.send('但是我想的是BBRTAN');
                            break;
                        case 5 :
                            msg.channel.send('麻將會打嗎?');
                            msg.channel.send('三缺一阿兄弟');
                            msg.channel.send('不管台麻日麻都行啦~~');
                            break;
                        case 6 :
                            msg.channel.send('minecraft');
                            msg.channel.send('會玩嗎??');
                            msg.channel.send('正常版玩完了還有模組可以玩');
                            break;
                        case 7 :
                            msg.channel.send('有switch嗎?');
                            msg.channel.send('如果有可以玩個健身環');
                            msg.channel.send('順便運動');
                            break;
                        case 8 :
                            msg.channel.send('槍火重生');
                            msg.channel.send('沒聽過吧!!!!');
                            msg.channel.send('好玩，小貝貝推薦');
                            break;
                        case 9 :
                            msg.channel.send('嗯......');
                            msg.channel.send('嗯......');
                            msg.channel.send('法環吧');
                            break;
                        default:
                            msg.channel.send('打LoL 爐石二選一');
                            msg.channel.send('小孩子才選擇 給我兩個一起玩');
                    }
                    break;
                case '音樂推薦':
                    console.log('音樂推薦');
                    let x5 = Math.floor(Math.random() * 43)+1;
                    switch (x5) {
                        case 1 :
                            msg.channel.send('中文歌-->MAYDAY五月天 [龍捲風 Tornado] feat.周杰倫\n'
                                            +'https://youtu.be/MYJVm7MRlog');
                            break;
                        case 2 :
                            msg.channel.send('中文歌-->李榮浩 Ronghao Li - 年少有為 If I Were Young\n'
                                            +'https://youtu.be/Dnj5Tcpev0Q');
                            break;
                        case 3 :
                            msg.channel.send('中文歌-->Mayday五月天 [後來的我們 Here, After, Us]\n'
                                            +'https://youtu.be/pd3eV-SG23E');
                            break;
                        case 4 :
                            msg.channel.send('中文歌-->盧廣仲 Crowd Lu 【刻在我心底的名字 Your Name Engraved Herein】\n'
                                            +'https://youtu.be/m78lJuzftcc');
                            break;
                        case 5 :
                            msg.channel.send('中文歌-->MAYDAY五月天 [笑忘歌 The Song of Laughter and Forgetting]\n'
                                            +'https://youtu.be/WIBFnmY2YrA');
                            break;
                        case 6 :
                            msg.channel.send('中文歌-->周杰倫 Jay Chou【告白氣球 Love Confession】\n'
                                            +'https://youtu.be/bu7nU9Mhpyo');
                            break;
                        case 7 :
                            msg.channel.send('中文歌-->周杰倫 Jay Chou【說好不哭 Won\'t Cry】\n'
                                            +'https://youtu.be/HK7SPnGSxLM');
                            break;
                        case 8 :
                            msg.channel.send('中文歌-->周杰倫 Jay Chou【等你下課 Waiting For You】\n'
                                            +'https://youtu.be/kfXdP7nZIiE');
                            break;
                        case 9 :
                            msg.channel.send('中文歌-->韋禮安 WeiBird《如果可以 Red Scarf》\n'
                                            +'https://youtu.be/8MG--WuNW1Y');
                            break;
                        case 10 :
                            msg.channel.send('中文歌-->Eric周興哲《你不屬於我 You Don\'t Belong to Me》\n'
                                            +'https://youtu.be/6O_Zx9St9ik');
                            break;
                        case 11 :
                            msg.channel.send('中文歌-->林宥嘉 Yoga Lin [兜圈 Detour]\n'
                                            +'https://youtu.be/Mqr-kjvXsk8');
                            break;
                        case 12 :
                            msg.channel.send('中文歌-->哈林庾澄慶【缺口】\n'
                                            +'https://youtu.be/hjXrL7CuAvc');
                            break;
                        case 13 :
                            msg.channel.send('中文歌-->Eric周興哲《以後別做朋友 The Distance of Love》\n'
                                            +'https://youtu.be/Ew4VvF0DPMc');
                            break;
                        case 14 :
                            msg.channel.send('中文歌-->Eric周興哲《你，好不好？ How Have You Been?》\n'
                                            +'https://youtu.be/wSBXfzgqHtE');
                            break;
                        case 15 :
                            msg.channel.send('中文歌-->《小幸運》by 田馥甄\n'
                                            +'https://youtu.be/Kg-mW8SyNVg');
                            break;
                        case 16 :
                            msg.channel.send('中文歌-->林俊傑 JJ Lin - 可惜沒如果 If Only\n'
                                            +'https://youtu.be/vsBf_0gDxSM');
                            break;
                        case 17 :
                            msg.channel.send('中文歌-->Eric周興哲《怎麼了 What\'s Wrong》\n'
                                            +'https://youtu.be/Y2ge3KrdeWs');
                            break;
                        case 18 :
                            msg.channel.send('中文歌-->F.I.R. [ 星火 Spark ]\n'
                                            +'https://youtu.be/3mEeKAdXAo4');
                            break;
                        case 19 :
                            msg.channel.send('中文歌-->G.E.M.鄧紫棋【句號 Full Stop】\n'
                                            +'https://youtu.be/7XlqcS6B7WA');
                            break;
                        case 20 :
                            msg.channel.send('中文歌-->李芷婷Nasi《你聽聽就好Never Mind》\n'
                                            +'https://youtu.be/mf5tsbcTy4E');
                            break;
                        case 21 :
                            msg.channel.send('英文歌-->經典曲不暴雷\n'
                                            +'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=bb3ac506c70041ff');
                            break;
                        case 22 :
                            msg.channel.send('勉強算英文歌-->很嫌在聽\n'
                                            +'https://youtu.be/IEPv31_E__4');
                            break;
                        case 23 :
                            msg.channel.send('英文歌-->My Life Is Going On(紙房子主題曲)\n'
                                            +'https://open.spotify.com/track/5ZEQjTroORCu6uWvZrdeNc?si=54cc658a502a42fc');
                            break;
                        case 24 :
                            msg.channel.send('英文歌精選-->Justin Bieber-Peaches\n'
                                            +'https://www.youtube.com/watch?v=tQ0yjYUFKAE');
                            break;
                        case 25 :
                            msg.channel.send('英文歌精選-->Maroon 5 - Memories\n'
                                            +'https://www.youtube.com/watch?v=SlPhMPnQ58k');
                            break;
                        case 26 :
                            msg.channel.send('英文歌精選-->Ed Sheeran - Shivers\n'
                                            +'https://www.youtube.com/watch?v=Il0S8BoucSA');
                            break;
                        case 27 :
                            msg.channel.send('英文歌精選-->Maroon 5 - Payphone\n'
                                            +'https://www.youtube.com/watch?v=KRaWnd3LJfs');
                            break;
                        case 28 :
                            msg.channel.send('英文歌精選-->The Weeknd - Save Your Tears\n'
                                            +'https://www.youtube.com/watch?v=XXYlFuWEuKI');
                            break;
                        case 29 :
                            msg.channel.send('英文歌精選-->Ed Sheeran - Shape of You\n'
                                            +'https://www.youtube.com/watch?v=JGwWNGJdvx8');
                            break;
                        case 30 :
                            msg.channel.send('英文歌精選-->DJ Snake - Let Me Love You\n'
                                            +'https://www.youtube.com/watch?v=euCqAq6BRa4');
                            break;
                        case 31 :
                            msg.channel.send('英文歌精選-->Alan Walker - Faded\n'
                                            +'https://www.youtube.com/watch?v=60ItHLz5WEA');
                            break;
                        case 32 :
                            msg.channel.send('英文歌精選-->Imagine Dragons - Bad Liar\n'
                                            +'https://www.youtube.com/watch?v=I-QfPUz1es8');
                            break;
                        case 33 :
                            msg.channel.send('英文歌精選-->Maroon 5 - Sugar\n'
                                            +'https://www.youtube.com/watch?v=09R8_2nJtjg');
                            break;
                        case 34 :
                            msg.channel.send('英文歌精選-->The Kid LAROI, Justin Bieber - STAY\n'
                                            +'https://www.youtube.com/watch?v=kTJczUoc26U');
                            break;
                        case 35 :
                            msg.channel.send('英文歌精選-->OneRepublic - Counting Stars\n'
                                            +'https://www.youtube.com/watch?v=hT_nvWreIhg');
                            break;
                        case 36 :
                            msg.channel.send('英文歌精選-->BoyWithUke - Understand\n'
                                            +'https://www.youtube.com/watch?v=T2fjQrsKbAM');
                            break;
                        case 37 :
                            msg.channel.send('英文歌精選-->Ed Sheeran - Afterglow\n'
                                            +'https://www.youtube.com/watch?v=_NGQfFCFUn4');
                            break;
                        case 38 :
                            msg.channel.send('英文歌精選-->Calum Scott - You Are The Reason\n'
                                            +'https://www.youtube.com/watch?v=ShZ978fBl6Y');
                            break;
                        case 39 :
                            msg.channel.send('英文歌精選-->James Arthur - Say You Won\'t Let Go\n'
                                            +'https://www.youtube.com/watch?v=0yW7w8F2TVA');
                            break;
                        case 40 :
                            msg.channel.send('英文歌-->Shallow\n'
                                            +'https://open.spotify.com/track/2VxeLyX666F8uXCJ0dZF8B?si=3ca8af87a5c24ec6%27');
                            break;
                        case 41 :
                            msg.channel.send('英文歌-->Lada Gaga - Before I Cry\n'
                                            +'https://youtu.be/OFBP7-3yun4');
                            break;
                        case 42 :
                            msg.channel.send('英文歌-->Post Malone, Swae Lee - Sunflower\n'
                                            +'https://youtu.be/ApXoWvfEYVU');
                            break;
                        case 43 :
                            msg.channel.send('英文歌-->經典曲2\n'
                                            +'https://open.spotify.com/track/1ORkFlSSZwpReXTUXfMI0i?si=22cf3f9ce61e4af9');
                            break;
                        case 44 :
                            msg.channel.send('日文歌-->殘酷天使\n'
                                            +'https://open.spotify.com/track/0k7VEAnMUGpDbl806YuwXq?si=c339d5573df44c28');
                            break;
                        case 45 :
                            msg.channel.send('日語歌精選-->YOASOBI-怪物\n'
                                            +'https://www.youtube.com/watch?v=dy90tA3TT1c');
                            break;
                        case 46 :
                            msg.channel.send('日語歌精選-->Ado-心という名の不可解\n'
                                            +'https://www.youtube.com/watch?v=BMb5IetESGE&list=PLaxauk3chSWgwI1W0yo5Bv9GAn1O1cwKB&index=6');
                            break;
                        case 47 :
                            msg.channel.send('日語歌精選-->EGOIST-名前のない怪物\n'
                                            +'https://www.youtube.com/watch?v=qiX5DI--8bg');
                            break;
                        case 48 :
                            msg.channel.send('日語歌精選-->Aimer-残響散歌\n'
                                            +'https://www.youtube.com/watch?v=tLQLa6lM3Us');
                            break;
                        case 49 :
                            msg.channel.send('日語歌精選-->米津玄師-馬と鹿\n'
                                            +'https://www.youtube.com/watch?v=ptnYBctoexk');
                            break;
                        case 50 :
                            msg.channel.send('日語歌精選-->米津玄師-灰色と青\n'
                                            +'https://www.youtube.com/watch?v=gJX2iy6nhHc');
                            break;
                        case 51 :
                            msg.channel.send('日語歌精選-->LiSA-明け星\n'
                                            +'https://www.youtube.com/watch?v=yGcm81aaTHg&list=PL3oW2tjiIxvR7G-KlC-r14_2CkPnxMwZt&index=14');
                            break;
                        case 52 :
                            msg.channel.send('日語歌精選-->Official髭男dism-I LOVE…\n'
                                            +'https://www.youtube.com/watch?v=bt8wNQJaKAk&list=PL3oW2tjiIxvR7G-KlC-r14_2CkPnxMwZt&index=37');
                            break;
                        case 53 :
                            msg.channel.send('日語歌精選-->Eve-心予報\n'
                                            +'https://www.youtube.com/watch?v=dJf4wCdLU18&list=PL3oW2tjiIxvR7G-KlC-r14_2CkPnxMwZt&index=67');
                            break;
                        case 54 :
                            msg.channel.send('日語歌精選-->King Gnu-白日\n'
                                            +'https://www.youtube.com/watch?v=ony539T074w&list=PLUchfRwifqMAgrxZ9pEPa6zZyKBYscO_Y&index=36');
                            break;
                        case 55 :
                            msg.channel.send('日語歌精選-->Eve-廻廻奇譚\n'
                                            +'https://www.youtube.com/watch?v=ijXeGqSRNJc&list=RDMM&index=18');
                            break;
                        case 56 :
                            msg.channel.send('日語歌精選-->ReoNa -ANIMA-Naked Style.-\n'
                                            +'https://www.youtube.com/watch?v=nS7wL7et4lY&list=RDMM&index=38');
                            break;
                        case 57 :
                            msg.channel.send('日語歌精選-->藤川千愛-きみの名前\n'
                                            +'https://www.youtube.com/watch?v=6su62xI2x2Q&list=RDMM&index=48');
                            break;
                        case 58 :
                            msg.channel.send('語歌精選-->Ado-踊\n'
                                            +'https://www.youtube.com/watch?v=YnSW8ian29w&list=PLaxauk3chSWgwI1W0yo5Bv9GAn1O1cwKB&index=10');
                            break;
                        case 59 :
                            msg.channel.send('日語歌精選-->YOASOBI-ミスター\n'
                                            +'https://www.youtube.com/watch?v=2-c0DFt6vK4');
                            break;
                        case 60 :
                            msg.channel.send('日語歌精選-->Eve-擬劇論\n'
                                            +'https://www.youtube.com/watch?v=jJzw1h5CR-I');
                            break;
                        case 61 :
                            msg.channel.send('日語歌精選-->Official髭男dism - Pretender\n'
                                            +'https://www.youtube.com/watch?v=TQ8WlA2GXbk');
                            break;
                        case 62 :
                            msg.channel.send('日語歌精選-->ONE OK ROCK -完全感覚Dreamer\n'
                                            +'https://www.youtube.com/watch?v=xGbxsiBZGPI');
                            break;
                        case 63 :
                            msg.channel.send('日文歌\n'
                                            +'https://open.spotify.com/track/6MCjmGYlw6mQVWRFVgBRvB?si=0aaa287ff43c49d6');
                        case 64 :
                            msg.channel.send('韓文歌-->CHEN XPunch  - Everytime\n'
                                            +'https://youtu.be/fTc5tuEn6_U');
                            break;
                        case 65 :
                            msg.channel.send('韓文歌-->Gaho-Start\n'
                                            +'https://youtu.be/O0StKlRHVeE');
                            break;
                        case 66 :
                            msg.channel.send('韓文歌-->BLACKPINK - How You Like That\n'
                                            +'https://youtu.be/ioNng23DkIM');
                            break;
                        case 67 :
                            msg.channel.send('韓文歌-->IU - eight\n'
                                            +'https://youtu.be/TgOu00Mf3kI');
                            break;
                        case 68 :
                            msg.channel.send('韓文歌-->IU - BBIBBI\n'
                                            +'https://youtu.be/nM0xDI5R50E');
                            break;
                        case 69 :
                            msg.channel.send('韓文歌-->Sondia, 빈센트블루 - 그렇게 넌 나의 비밀이 되었고\n'
                                            +'https://www.youtube.com/watch?v=kHzXOk_Gu1A');
                            break;
                        case 70 :
                            msg.channel.send('韓文歌-->MOVNING(모브닝) _ Sun Shower(여우비)\n'
                                            +'https://www.youtube.com/watch?v=wbBbKBT8GkM');
                            break;
                        case 71 :
                            msg.channel.send('韓文歌-->지효 (JIHYO) (TWICE) - Stardust love song\n'
                                            +'https://www.youtube.com/watch?v=oVN5jiwby1A');
                            break;
                        case 72 :
                            msg.channel.send('韓文歌-->Standing Egg(스탠딩 에그) - Prettiest One(너만 예뻐) \n'
                                            +'https://www.youtube.com/watch?v=Rcy2SAn5Ggs');
                            break;
                        case 73 :
                            msg.channel.send('韓文歌-->찬열, 펀치 (CHANYEOL, PUNCH) - Stay With Me\n'
                                            +'https://youtu.be/pcKR0LPwoYs');
                            break;
                        case 74 :
                            msg.channel.send('古典樂-->貝多芬第七號交響曲\n'
                                            +'https://open.spotify.com/track/1hnHNChGvLe123toNenS7K?si=9401c80843d141b9');
                            break;
                        case 75 :
                            msg.channel.send('俄文歌-->Rauf & Faik - колыбельная\n'
                                            +'https://youtu.be/oewANcF6hVY');
                            break;
                        case 76 :
                            msg.channel.send('西班牙文-->Luis Fonsi - Despacito\n'
                                            +'https://youtu.be/kJQP7kiw5Fk');
                            break;
                        case 77 :
                            msg.channel.send('印度神曲-->Tunak Tunak Tun - Daler Mehndi|Official\n'
                                            +'https://youtu.be/vTIIMJ9tUc8');
                            break;
                        default:
                            msg.channel.send('Bella ciao(紙房子配樂)\n'
                                            +'https://open.spotify.com/track/3lWzVNe1yFZlkeBBzUuZYu?si=d7fed52b42104343');
                    }
                    break;
                case '中文歌曲':
                    console.log('中文歌曲');
                    let x6 = Math.floor(Math.random() * 20)+1;
                    switch (x6) {
                        case 1 :
                            msg.channel.send('中文歌-->MAYDAY五月天 [龍捲風 Tornado] feat.周杰倫\n'
                                            +'https://youtu.be/MYJVm7MRlog');
                            break;
                        case 2 :
                            msg.channel.send('中文歌-->李榮浩 Ronghao Li - 年少有為 If I Were Young\n'
                                            +'https://youtu.be/Dnj5Tcpev0Q');
                            break;
                        case 3 :
                            msg.channel.send('中文歌-->Mayday五月天 [後來的我們 Here, After, Us]\n'
                                            +'https://youtu.be/pd3eV-SG23E');
                            break;
                        case 4 :
                            msg.channel.send('中文歌-->盧廣仲 Crowd Lu 【刻在我心底的名字 Your Name Engraved Herein】\n'
                                            +'https://youtu.be/m78lJuzftcc');
                            break;
                        case 5 :
                            msg.channel.send('中文歌-->MAYDAY五月天 [笑忘歌 The Song of Laughter and Forgetting]\n'
                                            +'https://youtu.be/WIBFnmY2YrA');
                            break;
                        case 6 :
                            msg.channel.send('中文歌-->周杰倫 Jay Chou【告白氣球 Love Confession】\n'
                                            +'https://youtu.be/bu7nU9Mhpyo');
                            break;
                        case 7 :
                            msg.channel.send('中文歌-->周杰倫 Jay Chou【說好不哭 Won\'t Cry】\n'
                                            +'https://youtu.be/HK7SPnGSxLM');
                            break;
                        case 8 :
                            msg.channel.send('中文歌-->周杰倫 Jay Chou【等你下課 Waiting For You】\n'
                                            +'https://youtu.be/kfXdP7nZIiE');
                            break;
                        case 9 :
                            msg.channel.send('中文歌-->韋禮安 WeiBird《如果可以 Red Scarf》\n'
                                            +'https://youtu.be/8MG--WuNW1Y');
                            break;
                        case 10 :
                            msg.channel.send('中文歌-->Eric周興哲《你不屬於我 You Don\'t Belong to Me》\n'
                                            +'https://youtu.be/6O_Zx9St9ik');
                            break;
                        case 11 :
                            msg.channel.send('中文歌-->林宥嘉 Yoga Lin [兜圈 Detour]\n'
                                            +'https://youtu.be/Mqr-kjvXsk8');
                            break;
                        case 12 :
                            msg.channel.send('中文歌-->哈林庾澄慶【缺口】\n'
                                            +'https://youtu.be/hjXrL7CuAvc');
                            break;
                        case 13 :
                            msg.channel.send('中文歌-->Eric周興哲《以後別做朋友 The Distance of Love》\n'
                                            +'https://youtu.be/Ew4VvF0DPMc');
                            break;
                        case 14 :
                            msg.channel.send('中文歌-->Eric周興哲《你，好不好？ How Have You Been?》\n'
                                            +'https://youtu.be/wSBXfzgqHtE');
                            break;
                        case 15 :
                            msg.channel.send('中文歌-->《小幸運》by 田馥甄\n'
                                            +'https://youtu.be/Kg-mW8SyNVg');
                            break;
                        case 16 :
                            msg.channel.send('中文歌-->林俊傑 JJ Lin - 可惜沒如果 If Only\n'
                                            +'https://youtu.be/vsBf_0gDxSM');
                            break;
                        case 17 :
                            msg.channel.send('中文歌-->Eric周興哲《怎麼了 What\'s Wrong》\n'
                                            +'https://youtu.be/Y2ge3KrdeWs');
                            break;
                        case 18 :
                            msg.channel.send('中文歌-->F.I.R. [ 星火 Spark ]\n'
                                            +'https://youtu.be/3mEeKAdXAo4');
                            break;
                        case 19 :
                            msg.channel.send('中文歌-->G.E.M.鄧紫棋【句號 Full Stop】\n'
                                            +'https://youtu.be/7XlqcS6B7WA');
                            break;
                        default:
                            msg.channel.send('中文歌-->李芷婷Nasi《你聽聽就好Never Mind》\n'
                                            +'https://youtu.be/mf5tsbcTy4E');
                    }
                    break;
                case '英文歌曲':
                    console.log('英文歌曲');
                    let x7 = Math.floor(Math.random() * 23)+1;
                    switch (x7) {
                        case 1 :
                            msg.channel.send('英文歌-->經典曲不暴雷\n'
                                            +'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=bb3ac506c70041ff');
                            break;
                        case 2 :
                            msg.channel.send('勉強算英文歌-->很嫌在聽\n'
                                            +'https://youtu.be/IEPv31_E__4');
                            break;
                        case 3 :
                            msg.channel.send('英文歌-->My Life Is Going On(紙房子主題曲)\n'
                                            +'https://open.spotify.com/track/5ZEQjTroORCu6uWvZrdeNc?si=54cc658a502a42fc');
                            break;
                        case 4 :
                            msg.channel.send('英文歌精選-->Justin Bieber-Peaches\n'
                                            +'https://www.youtube.com/watch?v=tQ0yjYUFKAE');
                            break;
                        case 5 :
                            msg.channel.send('英文歌精選-->Maroon 5 - Memories\n'
                                            +'https://www.youtube.com/watch?v=SlPhMPnQ58k');
                            break;
                        case 6 :
                            msg.channel.send('英文歌精選-->Ed Sheeran - Shivers\n'
                                            +'https://www.youtube.com/watch?v=Il0S8BoucSA');
                            break;
                        case 7 :
                            msg.channel.send('英文歌精選-->Maroon 5 - Payphone\n'
                                            +'https://www.youtube.com/watch?v=KRaWnd3LJfs');
                            break;
                        case 8 :
                            msg.channel.send('英文歌精選-->The Weeknd - Save Your Tears\n'
                                            +'https://www.youtube.com/watch?v=XXYlFuWEuKI');
                            break;
                        case 9 :
                            msg.channel.send('英文歌精選-->Ed Sheeran - Shape of You\n'
                                            +'https://www.youtube.com/watch?v=JGwWNGJdvx8');
                            break;
                        case 10 :
                            msg.channel.send('英文歌精選-->DJ Snake - Let Me Love You\n'
                                            +'https://www.youtube.com/watch?v=euCqAq6BRa4');
                            break;
                        case 11 :
                            msg.channel.send('英文歌精選-->Alan Walker - Faded\n'
                                            +'https://www.youtube.com/watch?v=60ItHLz5WEA');
                            break;
                        case 12 :
                            msg.channel.send('英文歌精選-->Imagine Dragons - Bad Liar\n'
                                            +'https://www.youtube.com/watch?v=I-QfPUz1es8');
                            break;
                        case 13 :
                            msg.channel.send('英文歌精選-->Maroon 5 - Sugar\n'
                                            +'https://www.youtube.com/watch?v=09R8_2nJtjg');
                            break;
                        case 14 :
                            msg.channel.send('英文歌精選-->The Kid LAROI, Justin Bieber - STAY\n'
                                            +'https://www.youtube.com/watch?v=kTJczUoc26U');
                            break;
                        case 15 :
                            msg.channel.send('英文歌精選-->OneRepublic - Counting Stars\n'
                                            +'https://www.youtube.com/watch?v=hT_nvWreIhg');
                            break;
                        case 16 :
                            msg.channel.send('英文歌精選-->BoyWithUke - Understand\n'
                                            +'https://www.youtube.com/watch?v=T2fjQrsKbAM');
                            break;
                        case 17 :
                            msg.channel.send('英文歌精選-->Ed Sheeran - Afterglow\n'
                                            +'https://www.youtube.com/watch?v=_NGQfFCFUn4');
                            break;
                        case 18 :
                            msg.channel.send('英文歌精選-->Calum Scott - You Are The Reason\n'
                                            +'https://www.youtube.com/watch?v=ShZ978fBl6Y');
                            break;
                        case 19 :
                            msg.channel.send('英文歌精選-->James Arthur - Say You Won\'t Let Go\n'
                                            +'https://www.youtube.com/watch?v=0yW7w8F2TVA');
                            break;
                        case 20 :
                            msg.channel.send('英文歌-->Shallow\n'
                                            +'https://open.spotify.com/track/2VxeLyX666F8uXCJ0dZF8B?si=3ca8af87a5c24ec6%27');
                            break;
                        case 21 :
                            msg.channel.send('英文歌-->Lada Gaga - Before I Cry\n'
                                            +'https://youtu.be/OFBP7-3yun4');
                            break;
                        case 22 :
                            msg.channel.send('英文歌-->Post Malone, Swae Lee - Sunflower\n'
                                            +'https://youtu.be/ApXoWvfEYVU');
                            break;
                        default:
                            msg.channel.send('英文歌-->經典曲2\n'
                                            +'https://open.spotify.com/track/1ORkFlSSZwpReXTUXfMI0i?si=22cf3f9ce61e4af9');
                    }
                    break;
                case '日文歌曲':
                    console.log('日文歌曲');
                    let x8 = Math.floor(Math.random() * 20)+1;
                    switch (x8) {
                        case 1 :
                            msg.channel.send('日文歌-->殘酷天使\n'
                                            +'https://open.spotify.com/track/0k7VEAnMUGpDbl806YuwXq?si=c339d5573df44c28');
                            break;
                        case 2 :
                            msg.channel.send('日語歌精選-->YOASOBI-怪物\n'
                                            +'https://www.youtube.com/watch?v=dy90tA3TT1c');
                            break;
                        case 3 :
                            msg.channel.send('日語歌精選-->Ado-心という名の不可解\n'
                                            +'https://www.youtube.com/watch?v=BMb5IetESGE&list=PLaxauk3chSWgwI1W0yo5Bv9GAn1O1cwKB&index=6');
                            break;
                        case 4 :
                            msg.channel.send('日語歌精選-->EGOIST-名前のない怪物\n'
                                            +'https://www.youtube.com/watch?v=qiX5DI--8bg');
                            break;
                        case 5 :
                            msg.channel.send('日語歌精選-->Aimer-残響散歌\n'
                                            +'https://www.youtube.com/watch?v=tLQLa6lM3Us');
                            break;
                        case 6 :
                            msg.channel.send('日語歌精選-->米津玄師-馬と鹿\n'
                                            +'https://www.youtube.com/watch?v=ptnYBctoexk');
                            break;
                        case 7 :
                            msg.channel.send('日語歌精選-->米津玄師-灰色と青\n'
                                            +'https://www.youtube.com/watch?v=gJX2iy6nhHc');
                            break;
                        case 8 :
                            msg.channel.send('日語歌精選-->LiSA-明け星\n'
                                            +'https://www.youtube.com/watch?v=yGcm81aaTHg&list=PL3oW2tjiIxvR7G-KlC-r14_2CkPnxMwZt&index=14');
                            break;
                        case 9 :
                            msg.channel.send('日語歌精選-->Official髭男dism-I LOVE…\n'
                                            +'https://www.youtube.com/watch?v=bt8wNQJaKAk&list=PL3oW2tjiIxvR7G-KlC-r14_2CkPnxMwZt&index=37');
                            break;
                        case 10 :
                            msg.channel.send('日語歌精選-->Eve-心予報\n'
                                            +'https://www.youtube.com/watch?v=dJf4wCdLU18&list=PL3oW2tjiIxvR7G-KlC-r14_2CkPnxMwZt&index=67');
                            break;
                        case 11 :
                            msg.channel.send('日語歌精選-->King Gnu-白日\n'
                                            +'https://www.youtube.com/watch?v=ony539T074w&list=PLUchfRwifqMAgrxZ9pEPa6zZyKBYscO_Y&index=36');
                            break;
                        case 12 :
                            msg.channel.send('日語歌精選-->Eve-廻廻奇譚\n'
                                            +'https://www.youtube.com/watch?v=ijXeGqSRNJc&list=RDMM&index=18');
                            break;
                        case 13 :
                            msg.channel.send('日語歌精選-->ReoNa -ANIMA-Naked Style.-\n'
                                            +'https://www.youtube.com/watch?v=nS7wL7et4lY&list=RDMM&index=38');
                            break;
                        case 14 :
                            msg.channel.send('日語歌精選-->藤川千愛-きみの名前\n'
                                            +'https://www.youtube.com/watch?v=6su62xI2x2Q&list=RDMM&index=48');
                            break;
                        case 15 :
                            msg.channel.send('語歌精選-->Ado-踊\n'
                                            +'https://www.youtube.com/watch?v=YnSW8ian29w&list=PLaxauk3chSWgwI1W0yo5Bv9GAn1O1cwKB&index=10');
                            break;
                        case 16 :
                            msg.channel.send('日語歌精選-->YOASOBI-ミスター\n'
                                            +'https://www.youtube.com/watch?v=2-c0DFt6vK4');
                            break;
                        case 17 :
                            msg.channel.send('日語歌精選-->Eve-擬劇論\n'
                                            +'https://www.youtube.com/watch?v=jJzw1h5CR-I');
                            break;
                        case 18 :
                            msg.channel.send('日語歌精選-->Official髭男dism - Pretender\n'
                                            +'https://www.youtube.com/watch?v=TQ8WlA2GXbk');
                            break;
                        case 19 :
                            msg.channel.send('日語歌精選-->ONE OK ROCK -完全感覚Dreamer\n'
                                            +'https://www.youtube.com/watch?v=xGbxsiBZGPI');
                            break;
                        default:
                            msg.channel.send('日文歌\n'
                                            +'https://open.spotify.com/track/6MCjmGYlw6mQVWRFVgBRvB?si=0aaa287ff43c49d6');
                    }
                    break;
                case '韓文歌曲':
                    console.log('韓文歌曲');
                    let x9 = Math.floor(Math.random() * 10)+1;
                    switch (x9) {
                        case 1 :
                            msg.channel.send('韓文歌-->CHEN XPunch  - Everytime\n'
                                            +'https://youtu.be/fTc5tuEn6_U');
                            break;
                        case 2 :
                            msg.channel.send('韓文歌-->Gaho-Start\n'
                                            +'https://youtu.be/O0StKlRHVeE');
                            break;
                        case 3 :
                            msg.channel.send('韓文歌-->BLACKPINK - How You Like That\n'
                                            +'https://youtu.be/ioNng23DkIM');
                            break;
                        case 4 :
                            msg.channel.send('韓文歌-->IU - eight\n'
                                            +'https://youtu.be/TgOu00Mf3kI');
                            break;
                        case 5 :
                            msg.channel.send('韓文歌-->IU - BBIBBI\n'
                                            +'https://youtu.be/nM0xDI5R50E');
                            break;
                        case 6 :
                            msg.channel.send('韓文歌-->Sondia, 빈센트블루 - 그렇게 넌 나의 비밀이 되었고\n'
                                            +'https://www.youtube.com/watch?v=kHzXOk_Gu1A');
                            break;
                        case 7 :
                            msg.channel.send('韓文歌-->MOVNING(모브닝) _ Sun Shower(여우비)\n'
                                            +'https://www.youtube.com/watch?v=wbBbKBT8GkM');
                            break;
                        case 8 :
                            msg.channel.send('韓文歌-->지효 (JIHYO) (TWICE) - Stardust love song\n'
                                            +'https://www.youtube.com/watch?v=oVN5jiwby1A');
                            break;
                        case 9 :
                            msg.channel.send('韓文歌-->Standing Egg(스탠딩 에그) - Prettiest One(너만 예뻐) \n'
                                            +'https://www.youtube.com/watch?v=Rcy2SAn5Ggs');
                            break;
                        default:
                            msg.channel.send('韓文歌-->찬열, 펀치 (CHANYEOL, PUNCH) - Stay With Me\n'
                                            +'https://youtu.be/pcKR0LPwoYs');
                    }
                    break;
                case '西洋歌曲':
                    console.log('西洋歌曲');
                    let x10 = Math.floor(Math.random() * 5)+1;
                    switch (x10) {
                        case 1 :
                            msg.channel.send('古典樂-->貝多芬第七號交響曲\n'
                                            +'https://open.spotify.com/track/1hnHNChGvLe123toNenS7K?si=9401c80843d141b9');
                            break;
                        case 2 :
                            msg.channel.send('俄文歌-->Rauf & Faik - колыбельная\n'
                                            +'https://youtu.be/oewANcF6hVY');
                            break;
                        case 3 :
                            msg.channel.send('西班牙文-->Luis Fonsi - Despacito\n'
                                            +'https://youtu.be/kJQP7kiw5Fk');
                            break;
                        case 4 :
                            msg.channel.send('印度神曲-->Tunak Tunak Tun - Daler Mehndi|Official\n'
                                            +'https://youtu.be/vTIIMJ9tUc8');
                            break;
                        default:
                            msg.channel.send('Bella ciao(紙房子配樂)\n'
                                            +'https://open.spotify.com/track/3lWzVNe1yFZlkeBBzUuZYu?si=d7fed52b42104343');
                    }
                    break;
                case '髒話':
                    console.log('髒話');
                    let x11 = Math.floor(Math.random() * 6)+1;
                    switch (x11) {
                        case 1 :
                            msg.channel.send('罵人是不對的 但罵機器人沒毛病');
                            break;
                        case 2 :
                            msg.channel.send('任何人工智慧都敵不過閣下這款自然傻瓜');
                            break;
                        case 3 :
                            msg.channel.send('聽你說話 一種智商上的優勝感油然而生!');
                            break;
                        case 4 :
                            msg.channel.send('你不要說話好嗎？ 你一說話就把你的智商暴露了');
                            break;
                        case 5 :
                            msg.channel.send('你要不要聽一聽你到底在供三小');
                            break;
                        default:
                            msg.channel.send('別認為你是狗就可以亂咬人');
                    }
                    break;
                case '心靈雞湯':
                    console.log('心靈雞湯');
                    let x12 = Math.floor(Math.random() * 12)+1;
                    switch (x12) {
                        case 1 :
                            msg.channel.send('想法本身並不重要，重要的是採取行動，使實際的想法成真。');
                            break;
                        case 2 :
                            msg.channel.send('你的時間有限，所以不要浪費時間活在別人的生活里。\n'
                                            +'應該要怎樣生活，每個人都有自己的想法，\n'
                                            +'人生苦短，所以我們應該過屬於自己的人生，要讓自己獲得開心快樂。');
                            break;
                        case 3 :
                            msg.channel.send('既然選擇這一條路，就不要惦記另一條路的風景。');
                            break;
                        case 4 :
                            msg.channel.send('珍惜你的願景及夢想，因為它們來自你的靈魂，是你最終成就的藍圖。');
                            break;
                        case 5 :
                            msg.channel.send('往事是用來回憶的，不是用來傷感和欺騙的，人不是為了生氣而活著。');
                            break;
                        case 6 :
                            msg.channel.send('不論你在什麼時候結束，重要的是結束之後就不要悔恨。');
                            break;
                        case 7 :
                            msg.channel.send('魚與熊掌不可兼得，但是單身和窮可以。');
                            break;
                        case 8 :
                            msg.channel.send('當你覺得又丑又窮的時候，不要悲傷，至少你的判斷還是正確的。');
                            break;
                        case 9 :
                            msg.channel.send('我追逐自己的夢想，別人說我幼稚可笑，但我堅持了下來。\n'
                                            +'最後發現，原來我還真是幼稚可笑。');
                            break;
                        case 10 :
                            msg.channel.send('要好好活下去，因為每天都有新的打擊。');
                            break;
                        case 11 :
                            msg.channel.send('比一個人吃火鍋更寂寞的是，一個人沒有錢吃火鍋。');
                            break;
                        default:
                            msg.channel.send('努力不一定會成功，但是不努力會很輕鬆。');
                    }
                    break;
                case '功能介紹':
                    console.log('功能介紹');
                    msg.channel.send('功能介紹');
                    break;
                case '打招呼':
                    console.log('打招呼');
                    msg.channel.send('天線寶寶說你好');
                    break;
                default:
                    console.log('None');
                    msg.channel.send('都是我作者的錯 我聽不懂你的意思:cry:');
            }
        })();
    }

    // msg.channel.send("????").then(function (message) {
    //     message.react("👍")
    //     message.react("👎")
    // });
});

client.on('messageReactionAdd', (reaction) => {
    if (reaction.message.id === voteid && voteid != 0) {
        console.log('有人投票');
        switch (reaction.emoji.name) {
            case '1️⃣':
                console.log('選擇1');
                fs.readFile('data/' + voteid + '_1.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_1.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
            case '2️⃣':
                console.log('選擇2');
                fs.readFile('data/' + voteid + '_2.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_2.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
            case '3️⃣':
                console.log('選擇3');
                fs.readFile('data/' + voteid + '_3.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_3.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
            case '4️⃣':
                console.log('選擇4');
                fs.readFile('data/' + voteid + '_4.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_4.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
            case '5️⃣':
                console.log('選擇5');
                fs.readFile('data/' + voteid + '_5.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_5.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
            case '6️⃣':
                console.log('選擇6');
                fs.readFile('data/' + voteid + '_6.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_6.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
            case '7️⃣':
                console.log('選擇7');
                fs.readFile('data/' + voteid + '_7.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_7.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
            case '8️⃣':
                console.log('選擇8');
                fs.readFile('data/' + voteid + '_8.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_8.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
            case '9️⃣':
                console.log('選擇9');
                fs.readFile('data/' + voteid + '_9.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_9.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
            case '🔟':
                console.log('選擇10');
                fs.readFile('data/' + voteid + '_10.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_10.txt' , String(parseInt(data) + 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('投票成功');
                            }
                        })
                    }
                });
                break;
        }
    }
});

client.on('messageReactionRemove', (reaction) => {
    if (reaction.message.id === voteid && voteid != 0) {
        switch (reaction.emoji.name) {
            case '1️⃣':
                console.log('選擇1');
                fs.readFile('data/' + voteid + '_1.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_1.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
            case '2️⃣':
                console.log('選擇2');
                fs.readFile('data/' + voteid + '_2.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_2.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
            case '3️⃣':
                console.log('選擇3');
                fs.readFile('data/' + voteid + '_3.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_3.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
            case '4️⃣':
                console.log('選擇4');
                fs.readFile('data/' + voteid + '_4.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_4.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
            case '5️⃣':
                console.log('選擇5');
                fs.readFile('data/' + voteid + '_5.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_5.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
            case '6️⃣':
                console.log('選擇6');
                fs.readFile('data/' + voteid + '_6.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_6.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
            case '7️⃣':
                console.log('選擇7');
                fs.readFile('data/' + voteid + '_7.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_7.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
            case '8️⃣':
                console.log('選擇8');
                fs.readFile('data/' + voteid + '_8.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_8.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
            case '9️⃣':
                console.log('選擇9');
                fs.readFile('data/' + voteid + '_9.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_9.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
            case '🔟':
                console.log('選擇10');
                fs.readFile('data/' + voteid + '_10.txt' , function (err, data) {
                    if (err){
                        console.log(err);
                    }
                    else{
                        fs.writeFile('data/' + voteid + '_10.txt' , String(parseInt(data) - 1) , function (err) {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log('取消成功');
                            }
                        })
                    }
                });
                break;
        }
    }
});

client.login(token);