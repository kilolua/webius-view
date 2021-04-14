const fs = require('fs');
const path = require('path');

const getNextScreens = (str)=>{
  let re = new RegExp(`scr.nextScreen[\\S\\s]*\?\\)`, 'g');
  let tmpStr = str.match(re);
  let resArr = []
  if (!!tmpStr) {
    tmpStr.forEach((item, i, arr)  => {
      let re = new RegExp(`\\([\\S\\s]*\?(,|\\))`, 'g');
      let res = item.match(re);
      res.forEach((item2)  => {
        resArr.push(item2.substr(1, item2.length - 2));
      })
    })
    resArr = Array.from(new Set(resArr))
    // console.log(resArr)
    return resArr
  }
  else
    return []

}

const generateNodesJson = (data) => {
  let nodes = []
  let x = 0
  let y = 0
  console.log(typeof data)
  for (let key in data){
    x += 100;
    y += 100;
    nodes.push(
      {
        id: key,
        // you can also pass a React component as a label
        data: { label: key },
        position: { x: x, y: y}
      }
    )
  }
  for (let key in data){
    data[key].forEach((item)=>{
      nodes.push(
        { id: `e${key}-${item}`, source: key, target: item }
      )
    })
  }
  return nodes
}

const getFuncName = function(data){
  let tmp = data.substr(data.indexOf("initScreens"), data.length);
  let resOBJ = {};
  let result = tmp.match(/\S+\s=/g);
  result = result.map(function(name) {
    return name.substr(0, name.length-2);
  });
  result = result.filter(item=>item !== "start" && item !== "msg_err")
  let resData = [];
  result.forEach((item, i, arr) => {
    let re = new RegExp(`${item} = function[\\S\\s]*\?(scr.render|return;)`, 'g');
    let tmpStr = data.match(re);
    //console.log(tmpStr)

    resData.push(tmpStr);
  });
  // console.log(resData[1][0]);
  for (let i = 0;i<resData.length;i++) {
    if (!!resData[i] && !!resData[i][0]) {
      let tmpArr = getNextScreens(resData[i][0])
      tmpArr = tmpArr.filter((v,i) => result.indexOf(v) !== -1)
      resOBJ[result[i]] = tmpArr
    }
  }
  return resOBJ
}
const getScreenJson = () => {
  let curFilename = path.join(__dirname, "Script.js");
  const data = fs.readFileSync(curFilename,{encoding:'utf8', flag:'r'});
  let res = getFuncName(data)
  res = generateNodesJson(res)
  return res
  //console.log(data)
}

module.exports.getScreenJson = getScreenJson
