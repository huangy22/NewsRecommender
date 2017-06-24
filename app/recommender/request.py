#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import numpy as np
import re
from time import sleep
import operator
import pickle
import random

from pymongo import MongoClient
from wordcloud import WordCloud, STOPWORDS

client = MongoClient()
db = client.twitter

def get_articles_for_group(size=10, group=-1):
    articles = []
    article_list = db.group_articles.find_one({"id": group})["articles"]
    i = 0
    titles = set()
    for article_id in article_list:
        if i == size*2:
            break
        article = db.rec_articles.find_one({"id": article_id})
        if article and len(article["summary"])>100 and article["title"] not in titles:
            entry = {}
	    titles.add(article["title"])
            entry["title"] = article["title"]
            entry["url"] = article["url"]["url"]
            entry["source"] = article["source"]["name"]
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
    user_active = db.active_users.find_one({"handle": name})
    user_not_active = db.user_merge.find_one({"handle": name})
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

def save_articles(articles):
    pickle.dump(articles, open('./articles.pkl', 'wb'))

def to_full_vec(group_topics, num_topics):
    topic_vec = [0 for j in range(num_topics)]
    for prob in group_topics:
        topic_vec[prob[0]] = prob[1]
    return topic_vec

def get_word_frequency(num_topics, lda_topics, topic_vec):
    dict_words = {}
    for i in range(num_topics):
        for word in lda_topics[i].split(":")[1].split(" "):
            if word in dict_words:
                dict_words[word] += topic_vec[i]
            else:
                dict_words[word] = topic_vec[i]

    stopwords = set(STOPWORDS)
    stopwords.add("new")
    stopwords.add("time")
    stopwords.add("main")
    stopwords.add("continue")
    stopwords.add("please")
    stopwords.add("president")
    stopwords.add("advertisement")
    stopwords.add("first")
    for word in stopwords:
        if word in dict_words:
            dict_words.pop(word, None)
    return dict_words

def collect_words():
    num_topics = 20
    dict_words = {}
    tot_topic_vec = np.zeros(num_topics)
    for group in range(6):
        group_topics = pickle.load(open('./group_lda_bow_topics.pkl', 'rb'))
        lda_topics = pickle.load(open('./pub_lda_bow_topics.pkl','rb'))
        topic_vec = to_full_vec(group_topics[group], num_topics)
        tot_topic_vec += np.array(topic_vec)
        dict_words[group] = get_word_frequency(num_topics, lda_topics, topic_vec)

    tot_topic_vec/= 6.0
    dict_words[-1] = get_word_frequency(num_topics, lda_topics, tot_topic_vec)
    pickle.dump(dict_words, open('./word_frequency.pkl', 'wb'))

def get_words(group):
    return pickle.load(open('./word_frequency.pkl', 'rb'))[group]

def get_recommendations(name):
    group = predict_user_group(name)
    articles = get_articles_for_group(size=10, group=group)
    #save_articles(articles)
    #articles = pickle.load(open('./articles.pkl', 'rb'))
    words = get_words(group)
    return {"articles": articles, "words": words, "group": group}
