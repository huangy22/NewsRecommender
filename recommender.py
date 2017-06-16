#!/usr/bin/env python
# -*- coding: UTF-8 -*-
from sklearn import cluster
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances

import pandas as pd
import numpy as np
import re
from time import sleep
import operator
import pickle
import random

from pymongo import MongoClient

client = MongoClient()
db = client.twitter

def get_articles_for_group(size=10, group=-1):
    articles = []
    article_list = db.group_articles.find_one({"id": group})["articles"]
    i = 0
    for article_id in article_list:
        if i == size*2:
            break
        article = db.rec_articles.find_one({"id": article_id})
        if article:
            entry = {}
            entry["title"] = article["title"]
            entry["text"] = article["text"]
            entry["summary"] = article["summary"]
            entry["keywords"] = article["keywords"]
            entry["authors"] = article["authors"]
            entry["images"] = article["images"]
            entry["top_image"] = article["top_image"]
            entry["movies"] = article["movies"]
            articles.append(entry)
            i += 1
    return random.sample(articles, size)


def majority_vote(labels):
    votes = {}
    for i in labels:
        if i in votes:
            votes[i] += 1
        else:
            votes[i] = 1
    if len(votes)>0:
        return max(votes.iteritems(), key=operator.itemgetter(1))[0]
    else:
        return 5

def predict_user_group(name, validate=False):
    user_active = db.active_users.find_one({"name": name})
    user_not_active = db.user_merge.find_one({"name": name})
    if not validate and user_active:
        return user_active["label"]
    elif user_not_active:
        labels = []
        for retweet in user_not_active["tweet_ids"]:
            article = db.articles.find_one({"id": retweet})
            if article and "label" in article:
                labels.append(article["label"])
        return majority_vote(labels)
    else:
        return -1

def get_recommendations(name):
    group = predict_user_group(name)
    return get_articles_for_group(size=10, group=group)

articles = get_recommendations("Kun Chen")
print articles
