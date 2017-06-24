//find the n-th occurance of pat in str
function nthIndex(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}

//get,set,delete cookie
function getCookie(w){
	cName = "";
	pCOOKIES = new Array();
	pCOOKIES = document.cookie.split('; ');
	for(bb = 0; bb < pCOOKIES.length; bb++){
		NmeVal  = new Array();
		NmeVal  = pCOOKIES[bb].split('=');
		if(NmeVal[0] == w){
			cName = unescape(NmeVal[1]);
		}
	}
	return cName;
}

function setCookie(name, value, expires, path, domain, secure){
	cookieStr = name + "=" + escape(value) + "; ";
	if(expires){
		expires = setExpiration(expires);
		cookieStr += "expires=" + expires + "; ";
	}
	if(path){
		cookieStr += "path=" + path + "; ";
	}
	if(domain){
		cookieStr += "domain=" + domain + "; ";
	}
	if(secure){
		cookieStr += "secure; ";
	}

	document.cookie = cookieStr;
}
function setExpiration(cookieLife){
    var today = new Date();
    var expr = new Date(today.getTime() + cookieLife * 24 * 60 * 60 * 1000);
    return  expr.toGMTString();
}
//delete cookie: setCookie('cookieName', '', -1);

function update(user_name)
{
  // var grid=document.getElementsByClassName("grid-wrap")[0].getElementsByTagName("li")
  // var slide=document.getElementsByClassName("slideshow")[0].getElementsByTagName("li")
  console.log("Get user_name: "+user_name)
  if(user_name=="") user_name="none"
  document.cookie="user="+user_name
  if(user_name!="none"){
    input=document.getElementById("twittertxt");
    input.textContent="Hello @"+user_name+", welcome back! "
    box=document.getElementById("twitter");
    box.placeholder="or reset my twitter account ...";
  }
  var grid=document.getElementById("grid")
  var grid_list=document.getElementsByClassName("grid-li")
  var slide=document.getElementById("slide")
  var slide_list=document.getElementsByClassName("slide-li")
  var news
  $.get("/get_news/"+user_name, function(data) {
    ret=$.parseJSON(data)
    if(ret==undefined){
      window.alert("Failed to obtain news list!")
      return
    }
    console.log(ret)
    news=ret["articles"];
    words=ret["words"];
    group=parseInt(ret["group"]);
    delete words[""];
    var value;
    var max=0.0
    Object.keys(words).forEach(function(key) {
      if(words[key]>max) max=words[key]
    });
    console.log(wordlist);

    wordcloud=document.getElementsByClassName("wordcloud");
    for(i=0;i<wordcloud.length;i++){
      if(group>=0){
        info="According to your retweeting history, here are some topics you might be interested:"
      }else{
        info="It seems that you haven't retweeted news lately. Start exploring with those topics:"
      }
      var figcaption = document.createElement("figcaption");
      figcaption.innerHTML="<p>"+info+"</p>";

      var title = document.createElement("div");
      title.innerHTML="<h3 class='grid_title'>Topics Picked For You</h3>"

      wordcloud[i].appendChild(title);
      wordcloud[i].appendChild(figcaption);
    }

    var wordlist=[];
    Object.keys(words).forEach(function(key) {
        value = words[key];
        if(value>0){
          console.log(key,value, Math.sqrt(value/max)*40)
          wordlist.push({"text":key, "size":Math.sqrt(value/max)*40})
        }
    });

    d3.wordcloud()
        .size([400, 200])
        .selector('#wordcloud1')
        .scale("sqrt")
        .onwordclick(function(d, i) {
          if (d.href) { window.location = d.href; }
        })
        // .fill(d3.scale.ordinal().range(["#884400", "#448800", "#888800", "#444400"]))
        .words(wordlist)
        .start();
    console.log(wordlist);

    var wordlist=[];
    Object.keys(words).forEach(function(key) {
        value = words[key];
        if(value>0){
          console.log(key,value, Math.sqrt(value/max)*70)
          wordlist.push({"text":key, "size":Math.sqrt(value/max)*70})
        }
    });
    d3.wordcloud()
        .size([600, 600])
        .selector('#wordcloud2')
        .scale("sqrt")
        .onwordclick(function(d, i) {
          if (d.href) { window.location = d.href; }
        })
        // .fill(d3.scale.ordinal().range(["#884400", "#448800", "#888800", "#444400"]))
        .words(wordlist)
        // .spiral("rectangular")
        .start();
        // .words(wordlist)
        // .words([{text: 'word', size: 5}, {text: 'cloud', size: 15}])

    for(i=0;i<news.length;i++){
      //generate li node for grid
      // var entry = document.createElement('li');
      var figure = document.createElement("figure");
      var image = document.createElement("img");

      image.src=news[i]["top_image"]
      image.alt="top image"
      var figcaption = document.createElement("figcaption");
      length=news[i]["summary"].length
      index=nthIndex(news[i]["summary"],".",2) //index of the end of n-th sentence
      if(index<=0) index=length
      figcaption.innerHTML="<p>Original source: <a href="+news[i]["url"]+"> "+news[i]["source"]+"</a></p>\n<p>"+news[i]["summary"].slice(0,index+1)+" ...</p>"
      //figcaption.innerHTML="<p>"+news[i]["summary"].slice(0,index+1)+" ...</p>"

      var title = document.createElement("div");
      title.innerHTML="<h3 class='grid_title'>"+news[i]["title"]+"</h3>"

      figure.appendChild(title);
      figure.appendChild(image);
      figure.appendChild(figcaption);
      grid_list[i].appendChild(figure);

      //generate li node for summary
      var entry = document.createElement('li');
      var figure = document.createElement("figure");
      var image = document.createElement("img");

      image.src=news[i]["top_image"]
      image.alt="top image"

      var figcaption = document.createElement("figcaption");
      // +news[i]["text"]+"</p>"
      figcaption.innerHTML="<h3>"+news[i]["title"]+"</h3>\n"+"<p>Original source: <a href="+news[i]["url"]+"> "+news[i]["source"]+"</a></p>\n<p>"+news[i]["summary"].slice(0,index+1)+" ...</p>"

      var body = document.createElement("div");
      body.innerHTML="<br /><p>"+news[i]["text"]+"</p>"

      figure.appendChild(figcaption);
      figure.appendChild(image);
      figure.appendChild(body);
      slide_list[i].appendChild(figure);
      // location.reload();

      new CBPGridGallery(document.getElementById('grid-gallery'));
    }
  })
}
