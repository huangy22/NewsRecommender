#!/usr/bin/env python
# -*- coding: UTF-8 -*-
from flask import Flask
from flask import render_template
from recommender import app
from flask import request
from pymongo import MongoClient
import json,pickle
import os
from request import *

client = MongoClient()
db = client.twitter

APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top

@app.route('/')
@app.route('/news/')
def news():
    return render_template('news.html')

@app.route('/how/')
def how():
    return render_template('how.html')

@app.route('/about/')
def about():
    return render_template('about.html')

@app.route('/get_news/<user_name>', methods=["GET"])
def get_news(user_name=None):
    # rdef get_recommendations(name):
    data = get_recommendations(user_name)
    # return articles
    return json.dumps(data)

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
