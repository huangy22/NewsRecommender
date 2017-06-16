#!/usr/bin/env python
# -*- coding: UTF-8 -*-
from flask import Flask
app = Flask(__name__)
from recommender import views
