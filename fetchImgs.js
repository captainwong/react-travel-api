const fs = require('fs');
const http = require('https');
const productCollections = require('./routes/productCollections.json');
const touristRoutes = require('./routes/touristRoutes.json');
const touristRouteDetails = require('./routes/touristRouteDetails.json');
const parse = require('node-html-parser').parse;

const download = (url, path) => {
    return fetch(url)
        .then((res) => {
            return res.arrayBuffer();
        })
        .then((buf) => {
            fs.writeFile(path, Buffer.from(buf, 'binary'), (err) => {
                if (err) throw err;
                console.log(url, path);
            })
        }).catch(e => {
            console.log('error downloading ' + url, e);
        });
}

async function fetchImgs() {
    let urls = [];
    productCollections.map((i) => {
        i.touristRoutes.map((j) => {
            j.touristRoutePictures.map((k) => {
                urls.push(k.url);
            })
        })
    })

    touristRoutes.map((i) => {
        i.touristRoutePictures.map((j) => {
            urls.push(j.url);
        })
    })

    touristRouteDetails.map((i) => {
        i.touristRoutePictures.map((j) => {
            urls.push(j.url);
        })

        const root = parse(i.features);
        root.querySelectorAll('img').forEach((img) => {
            urls.push(img.getAttribute('src'));
        })
    })

    console.log('urls.length=', urls.length);
    let uniqueUrls = [];
    urls.forEach((i) => {
        if (i.startsWith('//')) { // imgs in features has no protocol
            i = 'http:' + i;
        }
        if (i.endsWith('.jp')) { // some urls are *.jp, fix them
            i += 'g';
        }
        if (uniqueUrls.indexOf(i) === -1) {            
            uniqueUrls.push(i);
        }
    })
    console.log('uniqueUrls.length=', uniqueUrls.length);
    
    //uniqueUrls = uniqueUrls.slice(0, 2);

    let imgMap = {};
    let imgId = 0;
    let ds = [];
    uniqueUrls.forEach((url) => {
        const path = `./images/${imgId}.jpg`;
        imgMap[url] = imgId++;
        ds.push(download(url, path));
    });

    await Promise.all(ds)
        .then(() => {
            fs.writeFileSync('./images/imgmap.json', JSON.stringify(imgMap, null, '  '));
        })
        .catch(e => {
            console.log(e);
        });
}

fetchImgs();
    
const test = async () => {
    // const path = `./images/0.jpg`;
    // const data = fs.readFileSync(path);
    // const base64 = Buffer.from(data, 'binary').toString('base64');
    // console.log(base64.slice(0, 100));

    // const res = await fetch('https://z3.ax1x.com/2020/12/15/rMlEid.jpg');
    // const buf = await res.arrayBuffer();
    // await fs.writeFile('./out.jpg', Buffer.from(buf), (err) => {
    //     if (err) throw err;
    // });
};

//test();


// let imgCache = {};

// function img2base64(url) {
//     if (imgCache.hasOwnProperty(url)) {
//         return imgCache[url];
//     }
//     if (imgmap.hasOwnProperty(url)) {
//         const jpg = path.resolve(__dirname, `../images/${imgmap[url]}.jpg`);        
//         const data = fs.readFileSync(jpg);
//         const base64 = 'data:image/jpeg;base64, ' + Buffer.from(data, 'binary').toString('base64');        
//         imgCache[url] = base64;
//         return base64;
//     }
//     return url;
// }

// function convertImg2Base64(json) {
//     if (Array.isArray(json)) {
//         json.map((i) => {
//             if (i.touristRoutes) {
//                 i.touristRoutes.map((j) => {
//                     j.touristRoutePictures.map((k) => {
//                         k.url = img2base64(k.url);
//                     })
//                 })
//             } else if (i.touristRoutePictures) {
//                 i.touristRoutePictures.map((k) => {
//                     k.url = img2base64(k.url);
//                 })
//             }
//         })
//     } else if (json.touristRoutePictures) {
//         json.touristRoutePictures.map((k) => {
//             k.url = img2base64(k.url);
//         })
//     }
//     return json;
// }

// //console.log(convertImg2Base64(routes)[0].touristRoutePictures);

const details = "<div class=\"bd\"><p style=\"text-align:center\"><strong><span style=\"color:#ffffff;font-size:24px\"><a href=\"http://vacations.ctrip.com/tour/detail/p19441039s2.html\" target=\"_blank\"></a></span></strong><strong style=\"color:rgb(192, 0, 0)\"><span style=\"font-size:24px\">【2020自营一价包升级款：埃及五星尼罗河游轮+红海度假+古文明探索12日内陆飞机精品团】</span></strong></p><p style=\"text-align:center\"><span style=\"color:rgb(192, 0, 0)\"><strong><span style=\"color:rgb(192, 0, 0);font-size:14px\"><strong style=\"color:rgb(34, 34, 34);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;font-size:14px;text-align:center;white-space:normal;position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);font-size:24px;position:static;height:auto\">【25人封顶小团|增加底比斯古都停留|赠特色项目|行程更舒适】</span></strong></span></strong></span></p><p style=\"text-align:center\"><span style=\"color:rgb(0, 0, 0)\"><span style=\"font-size:14px;background-color:rgb(255, 255, 255)\">*畅销好评多年,超6000人出游超好评</span><span style=\"font-size:14px;background-color:rgb(255, 255, 255)\">！线路可以模仿,品质无法同比,图片可以抄袭,点评无法仿造*</span></span><br></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);text-align:center;font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><br></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【升级说明】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">2020年明星产品再次升级，一生只去一次的埃及不能只看表面，食住行游娱之外更重要的就是中文导游专业讲解，我们多年合作的优质中文导游队伍一定让您不虚此行！</span></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><strong style=\"float:none;position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">冬季重磅升级·跟团游玩出新花样</span></strong></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【人数封顶】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">整团人数25位封顶，告别拥挤超级大团！</span></span><span style=\"color:rgb(192, 0, 0);position:static;height:auto\"><br>☆【住卢克索】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">卢克索尼罗河畔住宿1晚，底比斯古都私属时光！</span></span></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【超长游览】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">埃及历史博物馆超长游览3小时,不留遗憾！</span></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【特色项目】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">乘马车晨游底比斯古都，你会懂为什么那么多电影大片偏爱卢克索！</span></span><span style=\"color:rgb(192, 0, 0);position:static;height:auto\"><br>☆【特别安排】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">学画象形文字，制作一幅属于自己的纸草画！（每人赠送1张）</span></span></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【巴士升级】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">16位游客以上团队直接升级奔驰品牌巴士！没有什么比行驶安全更重要！</span></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><strong style=\"float:none;position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">&nbsp;经典内飞版尼罗河游轮旅行 七大神庙+五大景区</span></strong></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【特色主题】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">尼罗河游轮穿越千年文明+浪漫红海度假+古文明探索!<br><span style=\"color:rgb(255, 0, 0);position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【五大景区】</span><span style=\"color:rgb(0, 0, 0);position:static;height:auto\">开罗+阿斯旺+卢克索+红海+亚历山大真正全景环游！</span></span><br></span></span><span style=\"color:rgb(255, 0, 0);position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【七大神庙】</span><span style=\"color:rgb(0, 0, 0);position:static;height:auto\">六大经典神庙入内(两游轮专享)+可选阿布辛贝神庙！<br><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【重要景点】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">金字塔+狮身人面像+埃及博物馆一个都不能少！</span></span></span></span></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\"><span style=\"color:rgb(255, 0, 0);position:static;height:auto\"><span style=\"color:rgb(0, 0, 0);position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\"><span style=\"color:rgb(0, 0, 0);position:static;height:auto\"><span style=\"color:rgb(192, 0, 0)\">☆【游轮住宿】</span><span style=\"position:static;height:auto\">尼罗河游轮3晚连住,常年合作品质游轮(河景房标准间)！</span><br></span></span></span></span></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【红海度假】</span><span style=\"color:rgb(0, 0, 0);position:static;height:auto\">红海海滨指定卓越度假村3晚连住,真正度假之旅！</span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\"><span style=\"color:rgb(255, 0, 0);position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【升级内飞】</span><span style=\"color:rgb(0, 0, 0);position:static;height:auto\">升级一段内陆飞机,不乘不能洗澡的夜火车！</span></span><br></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\"><strong style=\"color:rgb(34, 34, 34);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;font-size:14px;white-space:normal;position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">&nbsp;省心预订放心出行&nbsp;包含超千元签证小费等必含费用</span></strong></span></p><p><span style=\"font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;font-size:14px;background-color:rgb(255, 255, 255);color:rgb(192, 0, 0);position:static;height:auto\">☆【便捷签证】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">跟团办理落地签,无需护照原件无需提交材料!</span></span><br><span style=\"font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;font-size:14px;background-color:rgb(255, 255, 255);color:rgb(192, 0, 0);position:static;height:auto\">☆【包含小费】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">含价值900元司导服务小费+尼罗河游轮服务费!<br><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【省心含餐】<span style=\"color:rgb(0, 0, 0);position:static;height:auto\">含埃及境内全程正餐,无自理餐安排,省心放心！</span></span></span></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\"><span style=\"color:rgb(255, 0, 0);position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【安全保障】</span><span style=\"color:rgb(0, 0, 0);position:static;height:auto\">多年</span></span>合作当地知名地接社+优质持证导游队伍！</span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\"><span style=\"color:rgb(192, 0, 0);position:static;height:auto\">☆【服务设备】</span>车载WIFI满足上网需求！</span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\"><br></span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\">特别说明：为了丰富行程体验,即日起将赠送尼罗河风帆船项目更改为赠送卢克索乘马车晨游底比斯古都，变更不再单独通知。</span></p><p style=\"margin-top:0px;margin-bottom:0px;padding:0px;color:rgb(34, 34, 34);font-size:14px;white-space:normal;background-color:rgb(255, 255, 255);font-family:Arial, &quot;Lucida Grande&quot;, Verdana, &quot;Microsoft YaHei&quot;, hei;float:none;position:static;height:auto\"><span style=\"position:static;height:auto\"></span></p><p><img imageid=\"21313898\" src=\"//dimg04.c-ctrip.com/images/30050o000000f6rizD972.jpg\" data-src=\"//dimg04.c-ctrip.com/images/30050o000000f6rizD972.jpg\" title=\"A-NEW.jpg\" imageauthorize=\"21313898图片有效-有效期\" style=\"opacity: 1;\"> &nbsp; <br></p></div>";


function testDom() {
    const root = parse(details);

    //console.log(root.structure);

    root.querySelectorAll('img').forEach((img) => {
        //console.log(img); 
        console.log(img.getAttribute('src'));
        console.log(img.getAttribute('data-src'));
        img.removeAttribute('data-src');
        console.log(img.parentNode.toString());
    })
}











