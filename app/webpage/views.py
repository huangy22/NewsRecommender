from webpage import app

from flask import render_template, redirect, url_for
from flask import request


@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")


# @app.route('/about')
# def about():
#     return render_template("about.html")


@app.route('/visual')
def how():
    return render_template("visual.html")


@app.route('/results')
def results():
  
    twitter_user = '',''
    comfort_text = ''
    articles = []
   
    twitter_user = request.args.get('twitter_handle')    
  
    if twitter_user is None: twitter_user = ''
    elif comfort_level is None: comfort_level = ''
  
    flag = 0
    if len(twitter_user) == 0: 
        flag = 1
    
    if flag == 1:
        message = 'Please enter your Twitter name and try again.'
        return render_template("results.html", articles=articles, twitter_user=twitter_user)  

    twitter_user = twitter_user.replace('@','')
  
    articles = get_recommendations(twitter_user)

    # if len(message) == 0:
    #     for i in range(len(recs)):
    #         articles.append(dict(publication=recs['publication'].iloc[i],title=recs['title'].iloc[i],content=recs['content'].iloc[i][0:240],url=recs['url'].iloc[i]))  
  
    return render_template("results.html", articles=articles, twitter_user=twitter_user)
