#!/usr/bin/env python
# -*- coding: UTF-8 -*-
from flask import Flask
from flask import render_template
from recommender import app

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
